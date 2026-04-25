# Realtime WebSocket — Frontend Integration Guide

This document describes how the frontend (`apps/web`) integrates with the realtime gateway exposed by `apps/api`. It covers the design philosophy, the connection protocol, the action catalog, and ready-to-paste TypeScript snippets for Next.js App Router.

## Table of contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Connection](#3-connection)
4. [Subscription model (rooms)](#4-subscription-model-rooms)
5. [Actions catalog](#5-actions-catalog)
6. [Setup for `apps/web`](#6-setup-for-appsweb)
7. [Why use the `@sentinel/common` registry](#7-why-use-the-sentinelcommon-registry)
8. [Adding a new action (back ↔ front workflow)](#8-adding-a-new-action-back--front-workflow)
9. [Reference: contract source files](#9-reference-contract-source-files)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Overview

The realtime channel exists to push state-change notifications to the browser without polling. It is intentionally minimal:

- **Thin payloads.** A WS message says "something changed for `<id>`". It does **not** carry the new state. The frontend re-fetches the relevant REST endpoint to pick up the fresh data.
- **Single source of truth.** Action names, room names, payload shapes, and the socket.io `EventsMap` are all defined once in `@sentinel/common/realtime`. Frontend and backend import from the same module — there is no parallel definition.
- **Rule of thumb.** Never hardcode strings like `"NEW_ANALYSIS_MULTISIG"` or `"multisig:" + id` in the frontend. Always go through `REALTIME_ACTIONS` and `REALTIME_ROOMS`.

This keeps the wire contract small, prevents drift between back and front, and lets TypeScript catch breaking changes at build time.

## 2. Architecture

```
┌─────────┐  ┌─────────┐         ┌─────────────────┐   socket.io  ┌─────────┐
│ watcher │  │ reactor │         │     apps/api    │              │  web    │
└────┬────┘  └────┬────┘         │ ┌─────────────┐ │◄────────────►│(browser)│
     │            │              │ │  Realtime   │ │              └─────────┘
     │ emit       │ emit         │ │  Gateway    │ │
     ▼            ▼              │ │ (socket.io  │ │
   ┌──────────────┐  pub/sub     │ │  + redis    │ │
   │    Redis     │◄─────────────┤►│   adapter)  │ │
   │  sentinel.   │              │ └─────────────┘ │
   │   realtime   │              │                 │
   └──────────────┘              └─────────────────┘
```

- **Backend handlers (`watcher`, `reactor`, `apps/api`)** call `IRealtimeService.emitToRoom(room, action, payload)`. The infrastructure adapter publishes the envelope on the Redis channel `sentinel.realtime`.
- **Redis pub/sub** decouples publishers from the gateway. Any process with Redis access can emit; no AMQP, no queues, no persistence.
- **The Realtime Gateway** in `apps/api` subscribes to `sentinel.realtime`, validates each envelope with Zod, and fans it out to socket.io clients. It uses `@socket.io/redis-adapter` so multiple API instances stay in sync.
- **The browser** connects with `socket.io-client`, joins one or more rooms, and receives only the events emitted to those rooms (plus broadcasts).

## 3. Connection

| Field | Value |
|---|---|
| URL (local) | `http://localhost:3000` |
| Path | `/ws` |
| Transport | `websocket` only (no HTTP long-polling) |
| Auth | None today (matches the public REST API). To be revisited. |
| Reconnect | Handled natively by socket.io — do not write retry logic. |

> **Note**: this is a socket.io endpoint, not a raw WebSocket. CLI tools like `wscat` will not work. Use `socket.io-client` (or any compatible socket.io client).

## 4. Subscription model (rooms)

A connected client receives **only** events for rooms it has joined (plus global broadcasts, which are rare). To start receiving updates for a resource, emit a `subscribe` event with the room name.

| Factory | Resulting room | Subscribe when |
|---|---|---|
| `REALTIME_ROOMS.watcherFeed()` | `"watcher:feed"` | Showing the agent activity feed (dashboard, watcher page) |
| `REALTIME_ROOMS.multisig(id)` | `"multisig:<id>"` | Viewing a multisig detail page |
| `REALTIME_ROOMS.proposal(id)` | `"proposal:<id>"` | Viewing a proposal detail page |

**Client protocol (typed by `RealtimeClientToServerEvents`):**

- `socket.emit("subscribe", room, ack?)` — server calls `socket.join(room)`. Optional `ack(ok: boolean)` callback confirms.
- `socket.emit("unsubscribe", room)` — server calls `socket.leave(room)`.

Subscribe on mount, unsubscribe on unmount. The hook in section 6 handles this.

## 5. Actions catalog

Every action delivers the **smallest payload sufficient to identify what changed**. The frontend re-fetches the corresponding REST endpoint to read the new state.

| Action | Payload | Room(s) | Recommended frontend behavior |
|---|---|---|---|
| `AGENT_MESSAGE` | `{ message: string }` | `watcher:feed` | Append `message` to the agent feed UI |
| `NEW_THREAT_SIGNAL` | `{ id: string }` | `watcher:feed` | Refetch `GET /threat-signals` |
| `NEW_ANALYSIS_PROPOSAL` | `{ proposalId: string }` | `proposal:<id>` and `multisig:<id>` | Refetch the proposal detail or the proposals list |
| `NEW_ANALYSIS_MULTISIG` | `{ multisigId: string }` | `multisig:<id>` | Refetch the multisig detail |

> Policy: **WS = trigger, REST = source of truth**. If you find yourself wanting more fields in the payload, add a REST endpoint instead and refetch.

## 6. Setup for `apps/web`

### 6.1 Dependencies

Add the following to `apps/web/package.json`:

```json
{
  "dependencies": {
    "@sentinel/common": "workspace:*",
    "socket.io-client": "^4.8.1"
  }
}
```

Run `pnpm install` from the repo root.

### 6.2 Type the client with the shared contract

```ts
// apps/web/src/lib/realtime.ts
import { io, type Socket } from "socket.io-client";
import type {
  RealtimeServerToClientEvents,
  RealtimeClientToServerEvents,
} from "@sentinel/common/realtime";

export type RealtimeSocket = Socket<
  RealtimeServerToClientEvents,
  RealtimeClientToServerEvents
>;

export function createRealtimeSocket(apiUrl: string): RealtimeSocket {
  return io(apiUrl, { path: "/ws", transports: ["websocket"] });
}
```

With this typing, `socket.on(action, handler)` knows exactly what payload `handler` will receive for each action, and `socket.emit("subscribe", room)` is checked against the server-accepted shape.

### 6.3 Generic hook for room subscription with cleanup

```ts
// apps/web/src/hooks/useRealtimeRoom.ts
"use client";
import { useEffect } from "react";
import { createRealtimeSocket, type RealtimeSocket } from "@/lib/realtime";
import type {
  RealtimeAction,
  RealtimePayloadMap,
} from "@sentinel/common/realtime";

export function useRealtimeRoom<A extends RealtimeAction>(
  room: string,
  action: A,
  handler: (data: RealtimePayloadMap[A]) => void,
) {
  useEffect(() => {
    const socket: RealtimeSocket = createRealtimeSocket(
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000",
    );
    socket.emit("subscribe", room);
    socket.on(action, handler as never);

    return () => {
      socket.emit("unsubscribe", room);
      socket.off(action, handler as never);
      socket.close();
    };
  }, [room, action, handler]);
}
```

For pages that listen to multiple actions on the same room, share a single socket between the `useEffect`s or extend this hook to accept an array.

### 6.4 Multisig detail page (live sync)

```ts
// apps/web/src/app/multisig/[address]/MultisigLiveSync.tsx
"use client";
import { useRealtimeRoom } from "@/hooks/useRealtimeRoom";
import { REALTIME_ACTIONS, REALTIME_ROOMS } from "@sentinel/common/realtime";

export function MultisigLiveSync({
  multisigId,
  onChange,
}: {
  multisigId: string;
  onChange: () => void;
}) {
  useRealtimeRoom(
    REALTIME_ROOMS.multisig(multisigId),
    REALTIME_ACTIONS.NEW_ANALYSIS_MULTISIG,
    () => onChange(), // payload only carries multisigId; refetch via REST
  );
  return null;
}
```

### 6.5 Watcher feed page

```ts
// apps/web/src/app/watcher/feed/useWatcherFeed.ts
"use client";
import { useRealtimeRoom } from "@/hooks/useRealtimeRoom";
import { REALTIME_ACTIONS, REALTIME_ROOMS } from "@sentinel/common/realtime";

export function useWatcherFeed(opts: {
  onAgentMessage: (msg: string) => void;
  onNewThreatSignal: () => void;
}) {
  useRealtimeRoom(
    REALTIME_ROOMS.watcherFeed(),
    REALTIME_ACTIONS.AGENT_MESSAGE,
    (data) => opts.onAgentMessage(data.message),
  );
  useRealtimeRoom(
    REALTIME_ROOMS.watcherFeed(),
    REALTIME_ACTIONS.NEW_THREAT_SIGNAL,
    () => opts.onNewThreatSignal(),
  );
}
```

## 7. Why use the `@sentinel/common` registry

- **Single source of truth.** If the backend renames an action or changes a payload shape, TypeScript breaks the frontend build. There is no way for the two sides to silently diverge.
- **Autocomplete.** `REALTIME_ACTIONS.<Tab>` lists every available action. The handler signature for `socket.on(action, …)` is narrowed to the matching payload via `RealtimePayloadMap`.
- **Type-safe rooms.** `REALTIME_ROOMS.multisig(id)` returns a literal-typed string. If we change the room format on the server, every caller updates by rebuilding `@sentinel/common`.
- **Rule.** Never write `"NEW_ANALYSIS_MULTISIG"` or `` `multisig:${id}` `` directly in the frontend. Always import from `@sentinel/common/realtime`.

## 8. Adding a new action (back ↔ front workflow)

When the backend introduces a new realtime event:

1. Backend: add the key to `REALTIME_ACTIONS` and the payload type to `RealtimePayloadMap` in [packages/common/src/realtime/actions.ts](../packages/common/src/realtime/actions.ts).
2. Backend: add the matching schema to the Zod discriminated union in [packages/common/src/realtime/schema.ts](../packages/common/src/realtime/schema.ts). The gateway validates every envelope against this schema and drops malformed ones.
3. Backend: emit from the handler with `realtime.emitToRoom(room, REALTIME_ACTIONS.<NEW>, payload)`.
4. Frontend: after `pnpm install` (workspace rebuilds `@sentinel/common`), the new action is available. Use `socket.on(REALTIME_ACTIONS.<NEW>, …)` — the handler argument is automatically typed.

No separate coordination is needed: the shared contract module is the meeting point.

## 9. Reference: contract source files

The contract lives in `@sentinel/common/realtime`. Read these files to see what is currently exposed:

- [packages/common/src/realtime/actions.ts](../packages/common/src/realtime/actions.ts) — `REALTIME_ACTIONS`, `RealtimeAction`, `RealtimePayloadMap`.
- [packages/common/src/realtime/rooms.ts](../packages/common/src/realtime/rooms.ts) — `REALTIME_ROOMS`, `REALTIME_REDIS_CHANNEL`.
- [packages/common/src/realtime/contract.ts](../packages/common/src/realtime/contract.ts) — `RealtimeMessage`, `RealtimeServerToClientEvents`, `RealtimeClientToServerEvents`.
- [packages/common/src/realtime/schema.ts](../packages/common/src/realtime/schema.ts) — Zod envelope used by the gateway.
- Gateway server (for context, not for direct consumption): [apps/api/src/realtime/RealtimeGateway.ts](../apps/api/src/realtime/RealtimeGateway.ts).

## 10. Troubleshooting

- **No events received.** Verify the room string passed to `subscribe` matches exactly the room emitted by the backend. Always build the room with `REALTIME_ROOMS.x()`, never with string concatenation.
- **`Connection refused` / handshake fails.** The API is not running, or the client is hitting a path other than `/ws`. Remember: this is socket.io, not raw WebSocket — `wscat` will not connect.
- **Each event fires twice.** Likely a duplicate `socket.on(action, …)` without a matching `socket.off` in cleanup. The hook in section 6.3 handles this; if you write your own, mirror its `useEffect` cleanup.
- **TypeScript error on `data` field.** The frontend has an outdated build of `@sentinel/common`. Run `pnpm build` from the repo root (or `pnpm --filter @sentinel/common build`) to refresh the workspace artifacts.
- **Events seem delayed in multi-instance setups.** Confirm Redis is reachable from every API instance and that all instances share the same `REDIS_HOST` / `REDIS_PORT` config. The `@socket.io/redis-adapter` requires a working pub/sub connection on every node.
