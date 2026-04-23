# Sentinel API

Reference for the REST API consumed by the Sentinel frontend. Keep this document in sync with [`packages/common/src/dto`](../packages/common/src/dto) — those DTOs are the authoritative contract.

- [Overview](#overview)
- [Endpoints](#endpoints)
  - [POST /multisigs](#post-multisigs)
  - [GET /multisigs](#get-multisigs)
  - [GET /multisigs/:address](#get-multisigsaddress)
  - [GET /multisigs/:address/signers](#get-multisigsaddresssigners)
  - [GET /multisigs/:address/proposals](#get-multisigsaddressproposals)
  - [GET /proposals](#get-proposals)
    - [Curl examples](#curl-examples)
    - [Frontend usage (TypeScript)](#frontend-usage-typescript)
    - [Common UI patterns](#common-ui-patterns)
  - [GET /proposals/:proposalId](#get-proposalsproposalid)
- [DTOs](#dtos)
- [Enumerations](#enumerations)
- [Derived values on the frontend](#derived-values-on-the-frontend)
- [Scoring reference](#scoring-reference)
- [Pipeline timing (why some fields may be null)](#pipeline-timing-why-some-fields-may-be-null)

---

## Overview

- **Base URL (local):** `http://localhost:3000/api/v1`
- **Content-Type:** `application/json` for every request and response body.
- **Authentication:** none (hackathon scope).
- **Response envelope:** every successful response is wrapped as:
  ```json
  { "message": "success", "data": <payload> }
  ```
  Unwrap `data` before rendering. The examples below show only the `data` payload unless stated otherwise.
- **Errors:** HTTP status + a JSON body with at least `message`. Common cases:
  - `400 Bad Request` — invalid body (Zod validation failed). Body also includes `errors` array with field paths.
  - `404 Not Found` — resource does not exist (e.g. unknown multisig address or proposal id). Raised as `ResourceNotFoundError`.
  - `500 Internal Server Error` — unhandled error; body exposes a generic message.
- **Date format:** all timestamps are ISO 8601 strings in UTC (e.g. `2026-04-18T16:46:44.641Z`). Parse with `new Date(...)` on the client.
- **Nullable fields:** fields marked as nullable in the DTO section may arrive as `null` — never `undefined`. The frontend must handle `null` explicitly (especially for scoring and AI fields, which are computed asynchronously after `POST /multisigs`).

---

## Endpoints

### `POST /multisigs`

Register a multisig address for Sentinel to monitor. Triggers an asynchronous analyze pipeline (on-chain sync → decode → scoring → AI enrichment) via the reactor.

- **Request body:** [`CreateMultisigSchema`](../apps/api/src/presentation/multisigs/dtos/CreateMultisigParams.ts)
  ```json
  {
    "address": "2p657xuiZRvCjAHyYJQ21C4jdJtXQu4hQn4ZwwTkcAoU",
    "label": "Treasury multisig"
  }
  ```
  - `address` **(required)**: valid Solana base58 public key.
  - `label` *(optional)*: free-form string, up to 255 chars.
- **Response `201 Created`:** [`MultisigDto`](#multisigdto) with the freshly-created record. Because analysis is async, most fields are placeholders initially:
  ```json
  {
    "id": "76d50039-c025-46e1-95a0-e73edf905499",
    "address": "2p657xuiZRvCjAHyYJQ21C4jdJtXQu4hQn4ZwwTkcAoU",
    "label": null,
    "threshold": null,
    "configAuthority": null,
    "totalSigners": 0,
    "vaults": [],
    "healthScore": null,
    "createdAt": "2026-04-18T16:46:44.641Z"
  }
  ```
- **Idempotency:** calling with an already-registered address is a no-op — the existing record is returned with `201` but no new analyze event is emitted.
- **Polling strategy:** after creating, the client can poll `GET /multisigs/:address` every few seconds until `threshold` and `healthScore` are populated (usually < 5 s on a well-connected machine).

---

### `GET /multisigs`

Lightweight list of every multisig Sentinel is monitoring. Designed for the `/multisigs` page in the frontend.

- **Path params:** none.
- **Query params:** none.
- **Response `200 OK`:** array of [`MultisigListItemDto`](#multisiglistitemdto), ordered by `createdAt` descending.
- **Example:**
  ```json
  [
    {
      "id": "76d50039-c025-46e1-95a0-e73edf905499",
      "address": "2p657xuiZRvCjAHyYJQ21C4jdJtXQu4hQn4ZwwTkcAoU",
      "label": null,
      "threshold": 1,
      "totalSigners": 2,
      "healthScore": 20,
      "activeProposals": 0,
      "lastActivity": "2026-04-10T23:36:24.000Z",
      "createdAt": "2026-04-18T16:46:44.641Z"
    }
  ]
  ```

---

### `GET /multisigs/:address`

Full detail of a single multisig, including the computed health score and AI summary.

- **Path params:** `address` — Solana address registered previously.
- **Response `200 OK`:** [`MultisigDto`](#multisigdto).
- **Response `404 Not Found`:** if the multisig has never been registered.
- **Example:**
  ```json
  {
    "id": "76d50039-c025-46e1-95a0-e73edf905499",
    "address": "2p657xuiZRvCjAHyYJQ21C4jdJtXQu4hQn4ZwwTkcAoU",
    "label": null,
    "threshold": 1,
    "configAuthority": null,
    "totalSigners": 2,
    "vaults": [
      { "vaultIndex": 0, "pda": "5yQkbvJk64Zx76jEk6UZsPMxJdR4oquKDbbsXEmbnoyT" }
    ],
    "healthScore": {
      "overall": 20,
      "breakdown": {
        "threshold": 0,
        "configAuthority": 100,
        "signerConcentration": 10,
        "signerCount": 30
      },
      "warnings": [
        {
          "code": "CRITICAL_THRESHOLD_ONE",
          "message": "Threshold = 1: any signer can execute transactions alone. This multisig provides no additional protection over a single-signer wallet"
        },
        {
          "code": "CONCENTRATED_SIGNER",
          "message": "Signer d7A3xgXuC18zHpRNFgUKeuuQbRTe1dbpiyGBz3HDhAc holds all permissions (initiate+vote+execute). Consider separating roles"
        },
        {
          "code": "LOW_SIGNER_COUNT",
          "message": "Only 2 signer(s). Minimum of 3 recommended"
        }
      ],
      "aiSummary": "This multisig has a low security posture due to its threshold of 1, allowing any signer to execute transactions alone. The concentration of power among its 2 signers, with both holding all permissions, further increases the risk.",
      "calculatedAt": "2026-04-18T16:46:46.188Z"
    },
    "createdAt": "2026-04-18T16:46:44.641Z"
  }
  ```

---

### `GET /multisigs/:address/signers`

Signers of a multisig with their permission bits decoded.

- **Path params:** `address`.
- **Response `200 OK`:** array of [`SignerDto`](#signerdto).
- **Example:**
  ```json
  [
    {
      "id": "b2c9...",
      "address": "d7A3xgXuC18zHpRNFgUKeuuQbRTe1dbpiyGBz3HDhAc",
      "permissions": {
        "mask": 7,
        "initiate": true,
        "vote": true,
        "execute": true
      }
    }
  ]
  ```

---

### `GET /multisigs/:address/proposals`

Paginated list of proposals under a multisig, each carrying its deterministic risk score and a short text summary. Use this endpoint for the proposals table on the multisig detail page. For the full detail of a single proposal (flags, AI analysis, decoded instructions) call [`GET /proposals/:proposalId`](#get-proposalsproposalid).

- **Path params:** `address`.
- **Query params:**
  - `page` *(optional, default `1`)*: 1-based page number. Must be a positive integer.
  - `pageSize` *(optional, default `20`, max `100`)*: number of items per page. Must be a positive integer.
  - Invalid values respond with `422 Unprocessable Entity` (Zod validation via `QueryValidator`).
- **Response `200 OK`:** object with `proposals` (array of [`ProposalDto`](#proposaldto), ordered by `proposalIndex` **descending** — newest first) and `pagination` metadata.
- **Example (unwrapped `data`):**
  ```json
  {
    "proposals": [
      {
        "id": "df4de64a-a22f-453d-9b81-60872ccb1cf3",
        "proposalIndex": 1,
        "transactionIndex": 1,
        "pda": "GZuxJf68WxNB8nrx5bmNNAsDcV8gUE8r4tP7nu9qTr9v",
        "transactionPda": "5YnJPq5aSKWy9En73vaQ8Vc7QpqUWtyEtDT2mAYZyhA1",
        "status": "APPROVED",
        "creator": "d7A3xgXuC18zHpRNFgUKeuuQbRTe1dbpiyGBz3HDhAc",
        "createdAt": "2026-04-10T23:36:24.000Z",
        "executedAt": null,
        "riskScore": 20,
        "summary": "1 instruction(s) — flags: first-time action",
        "instructions": [
          {
            "instructionIndex": 0,
            "programId": "11111111111111111111111111111111",
            "data": "AgAAAKCGAQAAAAAA",
            "accounts": [
              "5yQkbvJk64Zx76jEk6UZsPMxJdR4oquKDbbsXEmbnoyT",
              "d7A3xgXuC18zHpRNFgUKeuuQbRTe1dbpiyGBz3HDhAc"
            ]
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 137,
      "totalPages": 7
    }
  }
  ```
- **Pagination object:**

  | Field | Type | Description |
  |---|---|---|
  | `page` | `number` | Current page returned (echoes the query param after defaults/validation). |
  | `pageSize` | `number` | Items per page returned (echoes the query param after defaults/validation). |
  | `total` | `number` | Total number of proposals for this multisig across all pages. |
  | `totalPages` | `number` | `ceil(total / pageSize)`, minimum `1` even when `total` is `0`. |

---

### `GET /proposals`

Paginated feed of proposals across **all** registered multisigs. Designed for the home-screen "latest proposals" view. Each item is a lightweight summary (no instructions) with risk score, deterministic summary and the parent multisig context so the UI can render which multisig the proposal belongs to without an extra fetch. For the full proposal payload (decoded instructions, AI analysis, signers) call [`GET /proposals/:proposalId`](#get-proposalsproposalid).

- **Path params:** none.
- **Query params:**
  - `page` *(optional, default `1`)*: 1-based page number. Must be a positive integer.
  - `pageSize` *(optional, default `20`, max `100`)*: number of items per page. Must be a positive integer.
  - `sortBy` *(optional, default `createdAt`)*: one of `createdAt` | `executedAt`. Always sorted descending. When sorting by `executedAt`, non-executed proposals (`executedAt = null`) appear at the end (`NULLS LAST`).
  - `status` *(optional)*: filter by [`ProposalStatus`](#proposalstatus) value (e.g. `ACTIVE`, `APPROVED`, `EXECUTED`, `REJECTED`, `DRAFT`, `CANCELLED`). Case-sensitive.
  - Invalid values respond with `422 Unprocessable Entity` (Zod validation via `QueryValidator`).
- **Response `200 OK`:** object with `proposals` (array of [`ProposalListItemDto`](#proposallistitemdto)) and `pagination` metadata (same shape as [GET /multisigs/:address/proposals](#get-multisigsaddressproposals)).
- **Example (unwrapped `data`):**
  ```json
  {
    "proposals": [
      {
        "id": "df4de64a-a22f-453d-9b81-60872ccb1cf3",
        "proposalIndex": 1,
        "transactionIndex": 1,
        "pda": "GZuxJf68WxNB8nrx5bmNNAsDcV8gUE8r4tP7nu9qTr9v",
        "transactionPda": "5YnJPq5aSKWy9En73vaQ8Vc7QpqUWtyEtDT2mAYZyhA1",
        "status": "APPROVED",
        "creator": "d7A3xgXuC18zHpRNFgUKeuuQbRTe1dbpiyGBz3HDhAc",
        "createdAt": "2026-04-10T23:36:24.000Z",
        "executedAt": null,
        "riskScore": 20,
        "summary": "1 instruction(s) — flags: first-time action",
        "multisig": {
          "address": "2p657xuiZRvCjAHyYJQ21C4jdJtXQu4hQn4ZwwTkcAoU",
          "label": "Treasury multisig"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 312,
      "totalPages": 16
    }
  }
  ```

#### Curl examples

```bash
# 1) First page, default order (createdAt desc), default size (20)
curl "http://localhost:3000/api/v1/proposals"

# 2) Second page of 50 items
curl "http://localhost:3000/api/v1/proposals?page=2&pageSize=50"

# 3) Only ACTIVE proposals (pending signatures)
curl "http://localhost:3000/api/v1/proposals?status=ACTIVE"

# 4) Most recently executed proposals across all multisigs
curl "http://localhost:3000/api/v1/proposals?sortBy=executedAt&status=EXECUTED"
```

Every successful response is wrapped in `{ "message": "success", "data": { proposals, pagination } }`. Always unwrap `data` before rendering (same rule as every other endpoint — see [Overview](#overview)).

#### Frontend usage (TypeScript)

Minimal client using `fetch`. The example reuses the shared DTO types from `@sentinel/common/dtos` so the frontend stays type-safe without redefining shapes.

```ts
import type { ProposalListItemDto } from "@sentinel/common/dtos";

type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type ProposalsFeedResponse = {
  message: "success";
  data: {
    proposals: ProposalListItemDto[];
    pagination: PaginationMeta;
  };
};

type FetchProposalsFeedParams = {
  page?: number;
  pageSize?: number;
  sortBy?: "createdAt" | "executedAt";
  status?: "DRAFT" | "ACTIVE" | "APPROVED" | "REJECTED" | "EXECUTED" | "CANCELLED";
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api/v1";

export async function fetchProposalsFeed(
  params: FetchProposalsFeedParams = {},
): Promise<{ proposals: ProposalListItemDto[]; pagination: PaginationMeta }> {
  const qs = new URLSearchParams();
  if (params.page !== undefined) qs.set("page", String(params.page));
  if (params.pageSize !== undefined) qs.set("pageSize", String(params.pageSize));
  if (params.sortBy) qs.set("sortBy", params.sortBy);
  if (params.status) qs.set("status", params.status);

  const res = await fetch(`${API_BASE}/proposals?${qs.toString()}`);
  if (!res.ok) {
    // 422 = invalid query params (Zod), 500 = server error
    throw new Error(`Failed to load proposals feed: ${res.status}`);
  }

  const body = (await res.json()) as ProposalsFeedResponse;
  return body.data; // already typed as { proposals, pagination }
}
```

Usage from a React Server Component or client component:

```tsx
// app/page.tsx (server component) — home screen feed
import { fetchProposalsFeed } from "@/lib/api/proposals";

export default async function HomePage() {
  const { proposals, pagination } = await fetchProposalsFeed({
    page: 1,
    pageSize: 20,
    sortBy: "createdAt",
  });

  return (
    <section>
      <h1>Latest proposals ({pagination.total})</h1>
      <ul>
        {proposals.map((p) => (
          <li key={p.id}>
            <strong>#{p.proposalIndex}</strong> on{" "}
            <a href={`/multisig/${p.multisig.address}`}>
              {p.multisig.label ?? p.multisig.address.slice(0, 8)}
            </a>{" "}
            — {p.status}
            {p.riskScore !== null ? ` · risk ${p.riskScore}` : " · scoring…"}
            {p.summary && <p>{p.summary}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
```

#### Common UI patterns

- **Home "latest proposals" list (default):** call with no query params. You get newest-first across all multisigs, 20 per page.
- **Pagination controls:** use `pagination.totalPages` and `pagination.page` to render `< 1 / 16 >` controls. For a "Next" button, increment `page` and refetch. Hide it when `page >= totalPages`.
- **Status tabs (e.g. `Pending | Approved | Executed`):** map each tab to a `status` query param (`ACTIVE`, `APPROVED`, `EXECUTED`). Reset to `page=1` when the tab changes — the total changes with the filter.
- **"Recently executed" feed:** `sortBy=executedAt&status=EXECUTED`. Because `EXECUTED` proposals always have `executedAt` set, the `NULLS LAST` behavior is irrelevant here.
- **Risk banner on home:** the `riskScore` field may be `null` temporarily while the scoring pipeline is still processing the proposal. Render a subtle "Scoring…" placeholder instead of `0`, and poll every few seconds if the row is fresh. See [Pipeline timing](#pipeline-timing-why-some-fields-may-be-null).
- **Deep link to a proposal:** each item's `id` is the UUID accepted by [`GET /proposals/:proposalId`](#get-proposalsproposalid). `multisig.address` is the path for [`GET /multisigs/:address`](#get-multisigsaddress).
- **Polling:** safe to poll the first page every 15–30 s for a live feed effect. The endpoint is cheap (indexed `multisigId` lookups, batched queries).
- **422 handling:** if the client sends an invalid value (e.g. `page=-1`, `pageSize=500`, `status=FOO`), the API responds with `422` and a body like `{ "message": "Query validation failed", "errors": ["pageSize: Number must be less than or equal to 100"] }`. Display these `errors` as form-level feedback.

---

### `GET /proposals/:proposalId`

Full detail of a proposal: multisig context, scoring (deterministic + flags), AI analysis + recommendation, signers (with per-multisig activity), and decoded instructions.

- **Path params:** `proposalId` — UUID returned by [`GET /multisigs/:address/proposals`](#get-multisigsaddressproposals).
- **Response `200 OK`:** [`ProposalDetailDto`](#proposaldetaildto).
- **Response `404 Not Found`:** if the proposal id is unknown.
- **Example (abbreviated):**
  ```json
  {
    "id": "df4de64a-a22f-453d-9b81-60872ccb1cf3",
    "proposalIndex": 1,
    "transactionIndex": 1,
    "status": "APPROVED",
    "creator": "d7A3xgXuC18zHpRNFgUKeuuQbRTe1dbpiyGBz3HDhAc",
    "createdAt": "2026-04-10T23:36:24.000Z",
    "executedAt": null,
    "multisig": {
      "address": "2p657xuiZRvCjAHyYJQ21C4jdJtXQu4hQn4ZwwTkcAoU",
      "label": null,
      "threshold": 1,
      "totalSigners": 2
    },
    "scoring": {
      "riskScore": 20,
      "flags": [
        {
          "type": "FIRST_TIME_ACTION",
          "severity": "HIGH",
          "points": 20,
          "detail": "First time this multisig executes: System Program::Transfer"
        }
      ],
      "summary": "1 instruction(s) — flags: first-time action",
      "calculatedAt": "2026-04-18T16:46:46.215Z"
    },
    "ai": {
      "analysis": "This proposal transfers 100000 lamports to a known destination, which is a first-time action for this multisig. The high risk score is due to the FIRST_TIME_ACTION flag, indicating a novel action that may require additional verification. However, the transfer itself appears routine.",
      "recommendation": "VERIFY"
    },
    "signers": [
      {
        "address": "d7A3xgXuC18zHpRNFgUKeuuQbRTe1dbpiyGBz3HDhAc",
        "permissions": { "mask": 7, "initiate": true, "vote": true, "execute": true },
        "totalProposalsInMultisig": 1
      }
    ],
    "instructions": [
      {
        "instructionIndex": 0,
        "programId": "11111111111111111111111111111111",
        "programName": "System Program",
        "action": "Transfer",
        "params": { "lamports": "100000" },
        "accounts": [
          { "label": "source", "address": "5yQkbvJk64Zx76jEk6UZsPMxJdR4oquKDbbsXEmbnoyT" },
          { "label": "destination", "address": "d7A3xgXuC18zHpRNFgUKeuuQbRTe1dbpiyGBz3HDhAc" }
        ],
        "rawData": "AgAAAKCGAQAAAAAA",
        "isKnown": true
      }
    ]
  }
  ```

---

## DTOs

Every field below is **always present** in the response. Nullable fields are marked explicitly with `| null`; they are never omitted.

### `MultisigDto`

Source: [`packages/common/src/dto/MultisigDto.ts`](../packages/common/src/dto/MultisigDto.ts).

| Field | Type | Description |
|---|---|---|
| `id` | `string` (uuid) | Sentinel-side identifier. Use this when referring to the multisig internally. |
| `address` | `string` | Solana base58 address of the multisig. The user-facing identifier. |
| `label` | `string \| null` | Optional human name the user assigned on `POST /multisigs`. |
| `threshold` | `number \| null` | Minimum approvals needed to execute (Squads v4 `threshold`). `null` until the first analyze completes. |
| `configAuthority` | `string \| null` | External address that can modify the multisig config without going through the quorum. `null` is the safe case (no backdoor). |
| `totalSigners` | `number` | Count of signers currently registered for the multisig. `0` until analyze completes. |
| `vaults` | `Array<{ vaultIndex: number; pda: string }>` | Treasury vaults of the multisig. Today only the default (`vaultIndex: 0`) is tracked. |
| `healthScore` | [`MultisigScoreDto`](#multisigscoredto) `\| null` | Computed health score + warnings + AI summary. `null` until the scoring pipeline has run for the first time. |
| `createdAt` | `string` (ISO 8601) | When Sentinel registered the multisig. |

### `MultisigListItemDto`

Source: [`packages/common/src/dto/MultisigListItemDto.ts`](../packages/common/src/dto/MultisigListItemDto.ts). Used by `GET /multisigs` for a compact listing.

| Field | Type | Description |
|---|---|---|
| `id` | `string` (uuid) | Sentinel id. |
| `address` | `string` | Solana base58 address. |
| `label` | `string \| null` | Optional human name. |
| `threshold` | `number \| null` | Minimum approvals needed. `null` until analysis completes. |
| `totalSigners` | `number` | Number of signers. |
| `healthScore` | `number \| null` | Overall health score **0–100**. `null` until the scoring pipeline has run. Higher is safer. |
| `activeProposals` | `number` | Count of proposals currently in status `ACTIVE`. |
| `lastActivity` | `string \| null` (ISO 8601) | `createdAt` of the most recent proposal, or `null` if there are no proposals yet. |
| `createdAt` | `string` (ISO 8601) | When Sentinel registered the multisig. |

### `MultisigScoreDto`

Source: [`packages/common/src/dto/MultisigScoreDto.ts`](../packages/common/src/dto/MultisigScoreDto.ts).

| Field | Type | Description |
|---|---|---|
| `overall` | `number` | Health score on a **0–100** scale after applying weights and security caps. Higher is safer. See [Scoring reference](#scoring-reference). |
| `breakdown.threshold` | `number` | Sub-score 0–100 for how demanding the quorum is (`threshold/totalSigners` ratio). |
| `breakdown.configAuthority` | `number` | Sub-score 0–100: `100` if no external config authority is set, `20` otherwise. |
| `breakdown.signerConcentration` | `number` | Sub-score 0–100: how separated the permissions are across signers. `100` = every signer has limited permissions; lower values mean some signers hold all roles at once. |
| `breakdown.signerCount` | `number` | Sub-score 0–100: `100` if ≥ 5 signers, tapering down to `0` for a single signer. |
| `warnings` | [`MultisigWarningDto[]`](#multisigwarningdto) | Human-readable warnings explaining specific weaknesses. Same wording regardless of the frontend language (English). |
| `aiSummary` | `string \| null` | Natural-language paragraph written by the AI (Groq `llama-3.3-70b-versatile`). `null` if the AI call has not run yet or failed (graceful degradation). |
| `calculatedAt` | `string` (ISO 8601) | When this score row was last recomputed. |

### `MultisigWarningDto`

Source: [`packages/common/src/dto/MultisigWarningDto.ts`](../packages/common/src/dto/MultisigWarningDto.ts).

| Field | Type | Description |
|---|---|---|
| `code` | `string` | Stable identifier for the warning. Use this to decide UI icon/color. See [MultisigWarningCode](#multisigwarningcode). |
| `message` | `string` | Human-readable explanation. Safe to render directly. |

### `SignerDto`

Source: [`packages/common/src/dto/SignerDto.ts`](../packages/common/src/dto/SignerDto.ts). Used by `GET /multisigs/:address/signers`.

| Field | Type | Description |
|---|---|---|
| `id` | `string` (uuid) | Sentinel id. |
| `address` | `string` | Solana base58 address of the signer. |
| `permissions.mask` | `number` | Raw Squads v4 permission mask (bitfield). |
| `permissions.initiate` | `boolean` | Derived from `mask & 1` — can this signer create proposals. |
| `permissions.vote` | `boolean` | Derived from `mask & 2` — can this signer approve/reject proposals. |
| `permissions.execute` | `boolean` | Derived from `mask & 4` — can this signer execute an approved proposal. |

### `ProposalDto`

Source: [`packages/common/src/dto/ProposalDto.ts`](../packages/common/src/dto/ProposalDto.ts). Used by `GET /multisigs/:address/proposals` for the table view.

| Field | Type | Description |
|---|---|---|
| `id` | `string` (uuid) | Sentinel id. Use it to call `GET /proposals/:proposalId`. |
| `proposalIndex` | `number` | Ordinal index inside the multisig (the visible number such as `#47`). |
| `transactionIndex` | `number` | Squads v4 internal index of the vault transaction associated with the proposal. |
| `pda` | `string` | Program-derived address of the proposal account on-chain. |
| `transactionPda` | `string` | PDA of the underlying vault transaction. |
| `status` | `string` | Lifecycle state. See [ProposalStatus](#proposalstatus). |
| `creator` | `string \| null` | Address that created the proposal on-chain (may be `null` for older proposals). |
| `createdAt` | `string` (ISO 8601) | When the proposal was created on-chain. |
| `executedAt` | `string \| null` (ISO 8601) | When it was executed, or `null` if not executed yet. |
| `riskScore` | `number \| null` | Risk on a **0–100** scale (higher is riskier). `null` until the scoring pipeline processed the proposal. |
| `summary` | `string \| null` | Short deterministic summary auto-generated from the flags (e.g. `"2 instruction(s) — flags: authority transfer, durable nonce"`). Not the AI analysis — see [`ProposalDetailDto`](#proposaldetaildto) for that. `null` until scored. |
| `instructions` | `Array<{ instructionIndex, programId, data, accounts }>` | Raw instruction payloads as they arrived on-chain. Use the detail endpoint to get decoded versions. |

### `ProposalListItemDto`

Source: [`packages/common/src/dto/ProposalListItemDto.ts`](../packages/common/src/dto/ProposalListItemDto.ts). Used by `GET /proposals` for the cross-multisig feed.

Lightweight listing shape (no `instructions`) plus a `multisig` object that identifies the parent multisig. All fields are **always present**. When the user clicks a row, load the full payload with [`GET /proposals/:proposalId`](#get-proposalsproposalid).

| Field | Type | Description |
|---|---|---|
| `id` | `string` (uuid) | Sentinel id. Use it to call `GET /proposals/:proposalId`. |
| `proposalIndex` | `number` | Ordinal index inside the multisig (may repeat across multisigs — it is relative, not global). |
| `transactionIndex` | `number` | Squads v4 internal vault-transaction index. |
| `pda` | `string` | Program-derived address of the proposal account on-chain. |
| `transactionPda` | `string` | PDA of the underlying vault transaction. |
| `status` | `string` | Lifecycle state. See [ProposalStatus](#proposalstatus). |
| `creator` | `string \| null` | Address that created the proposal on-chain. May be `null` for older proposals. |
| `createdAt` | `string` (ISO 8601) | When the proposal was created on-chain. |
| `executedAt` | `string \| null` (ISO 8601) | When it was executed, or `null` if not executed yet. |
| `riskScore` | `number \| null` | Risk on a **0–100** scale (higher is riskier). `null` until the scoring pipeline processed the proposal. |
| `summary` | `string \| null` | Short deterministic summary from the flags (same source as `ProposalDto.summary`). `null` until scored. |
| `multisig.address` | `string` | Solana base58 address of the parent multisig. Use it to navigate to `GET /multisigs/:address`. |
| `multisig.label` | `string \| null` | Optional human name the user assigned on `POST /multisigs`. |

### `ProposalDetailDto`

Source: [`packages/common/src/dto/ProposalDetailDto.ts`](../packages/common/src/dto/ProposalDetailDto.ts). Returned by `GET /proposals/:proposalId`.

| Field | Type | Description |
|---|---|---|
| `id` | `string` (uuid) | Proposal id. |
| `proposalIndex` | `number` | Ordinal index inside the multisig. |
| `transactionIndex` | `number` | Squads v4 vault-tx index. |
| `status` | `string` | See [ProposalStatus](#proposalstatus). |
| `creator` | `string \| null` | Creator address, may be `null`. |
| `createdAt` | `string` (ISO 8601) | Creation timestamp on-chain. |
| `executedAt` | `string \| null` (ISO 8601) | Execution timestamp, or `null`. |
| `multisig.address` | `string` | Host multisig Solana address. |
| `multisig.label` | `string \| null` | Host multisig human name. |
| `multisig.threshold` | `number \| null` | Host multisig threshold. |
| `multisig.totalSigners` | `number` | Host multisig signer count. |
| `scoring` | `object \| null` | Deterministic scoring. `null` until the scoring pipeline ran. |
| `scoring.riskScore` | `number` | 0–100 risk. |
| `scoring.flags` | [`ProposalFlagDto[]`](#proposalflagdto) | Detected risk flags (may be empty). |
| `scoring.summary` | `string` | Deterministic short summary (same as `ProposalDto.summary`). |
| `scoring.calculatedAt` | `string` (ISO 8601) | Last recomputation timestamp. |
| `ai` | `object \| null` | AI enrichment. `null` if the AI call has not run yet or failed. |
| `ai.analysis` | `string` | Natural-language paragraph explaining what the proposal does and why the risk score is what it is. |
| `ai.recommendation` | `string` | See [Recommendation](#recommendation). |
| `signers` | [`ProposalSignerDto[]`](#proposalsignerdto) | Signers of the host multisig, each carrying historical activity. |
| `instructions` | [`DecodedInstructionDto[]`](#decodedinstructiondto) | Decoded (and raw) instructions of the proposal, ordered by `instructionIndex`. |

### `ProposalFlagDto`

Source: [`packages/common/src/dto/ProposalFlagDto.ts`](../packages/common/src/dto/ProposalFlagDto.ts).

| Field | Type | Description |
|---|---|---|
| `type` | `string` | Flag identifier. See [ProposalFlagType](#proposalflagtype). |
| `severity` | `string` | Recommended UI prominence. See [ProposalFlagSeverity](#proposalflagseverity). |
| `points` | `number` | How many points this flag adds to the proposal's `riskScore`. Use it for debugging or to show "why is this rated X". See [Scoring reference](#scoring-reference). |
| `detail` | `string` | Human-readable, proposal-specific message. Safe to render. |

### `ProposalSignerDto`

Source: [`packages/common/src/dto/ProposalSignerDto.ts`](../packages/common/src/dto/ProposalSignerDto.ts). Returned inside `ProposalDetailDto.signers` — **different shape** from `SignerDto` because it carries extra context.

| Field | Type | Description |
|---|---|---|
| `address` | `string` | Solana address. |
| `permissions.mask` | `number` | Raw permission mask. |
| `permissions.initiate` | `boolean` | Derived from `mask & 1`. |
| `permissions.vote` | `boolean` | Derived from `mask & 2`. |
| `permissions.execute` | `boolean` | Derived from `mask & 4`. |
| `totalProposalsInMultisig` | `number` | How many proposals this multisig has in total (same value for every signer entry). Useful to show the signer's activity context in the UI. |

### `DecodedInstructionDto`

Source: [`packages/common/src/dto/DecodedInstructionDto.ts`](../packages/common/src/dto/DecodedInstructionDto.ts).

| Field | Type | Description |
|---|---|---|
| `instructionIndex` | `number` | Order of the instruction inside the proposal. |
| `programId` | `string` | Solana program address the instruction targets. |
| `programName` | `string` | Human name when Sentinel knows the program (e.g. `"System Program"`, `"BPF Upgradeable Loader"`). Falls back to `"Unknown Program"`. |
| `action` | `string` | Named action within the program (e.g. `"Transfer"`, `"SetAuthority"`, `"Upgrade"`). Falls back to `"Unknown"`. |
| `params` | `Record<string, string>` | Parsed arguments, already stringified. For numeric values we always use string to avoid JS `Number` precision issues (e.g. `{ "lamports": "100000" }`). Shape depends on the action; see the examples in [`packages/infrastructure/src/services/decoder/InstructionParser.ts`](../packages/infrastructure/src/services/decoder/InstructionParser.ts) for the full catalog. |
| `accounts` | `Array<{ address: string; label: string }>` | Ordered list of accounts referenced by the instruction. `label` is a role name like `"source"`, `"destination"`, `"authority"`; unlabeled accounts get `account_0`, `account_1`, … |
| `rawData` | `string` | Base64-encoded instruction data as received on-chain. Useful for debugging or advanced views. |
| `isKnown` | `boolean` | `true` if Sentinel fully decoded the program + action; `false` if the program is unknown or the action could not be parsed. When `false`, `programName`/`action` fall back to defaults but `rawData` is still usable. |

---

## Enumerations

### `ProposalStatus`

Returned in `ProposalDto.status` and `ProposalDetailDto.status`. Uppercase string.

| Value | Meaning |
|---|---|
| `DRAFT` | Proposal created on-chain but not yet open for voting. |
| `ACTIVE` | Open for signer votes. This is the "pending action" state. |
| `APPROVED` | Enough approvals to execute; waiting for execution. |
| `REJECTED` | Rejected via votes. |
| `EXECUTED` | Execution completed on-chain. |
| `CANCELLED` | Cancelled before execution. |

### `ProposalFlagType`

Returned in `ProposalFlagDto.type`.

| Value | Severity | Points | Trigger |
|---|---|---|---|
| `DURABLE_NONCE` | `HIGH` | +30 | `AdvanceNonceAccount` instruction detected — proposal can be executed outside the usual time window. |
| `AUTHORITY_TRANSFER` | `CRITICAL` | +40 | `SetAuthority` on BPF Upgradeable Loader — program ownership transfer. |
| `UPGRADE_PROGRAM` | `CRITICAL` | +35 | `Upgrade` on BPF Upgradeable Loader. |
| `LARGE_TRANSFER` | `MEDIUM` | +15 | Aggregate System Program transfers above 100 SOL. |
| `UNKNOWN_PROGRAM` | `MEDIUM` | +10 | Any instruction the decoder could not resolve (Sentinel cannot inspect the action). |
| `MULTI_INSTRUCTION` | `LOW` | +5 | More than 3 instructions in one proposal. |
| `FIRST_TIME_ACTION` | `HIGH` | +20 | The `programName::action` combination has never been executed by this multisig before. |

`riskScore = min(100, sum(points))`.

### `ProposalFlagSeverity`

Returned in `ProposalFlagDto.severity`. Useful for UI styling.

| Value | Typical UI |
|---|---|
| `LOW` | Informational / blue chip. |
| `MEDIUM` | Yellow chip. |
| `HIGH` | Orange chip. |
| `CRITICAL` | Red chip / alert icon. |

### `MultisigWarningCode`

Returned in `MultisigWarningDto.code`. Stable identifiers so the frontend can map to icons.

| Code | Raised when |
|---|---|
| `CRITICAL_THRESHOLD_ONE` | `threshold = 1` with more than one signer — any signer can execute alone. |
| `LOW_THRESHOLD` | `threshold / totalSigners ≤ 0.5` (without being the `CRITICAL_THRESHOLD_ONE` case). |
| `EXTERNAL_CONFIG_AUTHORITY` | `configAuthority !== null`. |
| `CONCENTRATED_SIGNER` | At least one signer holds `initiate + vote + execute` (mask = 7). Emitted once per concentrated signer. |
| `LOW_SIGNER_COUNT` | `totalSigners < 3` (but ≥ 1). |

### `Recommendation`

Returned in `ProposalDetailDto.ai.recommendation` when the AI enrichment succeeded.

| Value | Meaning |
|---|---|
| `SIGN` | Proposal appears safe and in line with the multisig's history. |
| `VERIFY` | Not obviously malicious but has features worth reviewing (novel action, medium flags, etc.). |
| `DO_NOT_SIGN` | Critical risk detected — do not sign without off-chain verification. |

---

## Derived values on the frontend

The backend intentionally does **not** expose a `riskLevel` (category) for proposals. The frontend is expected to derive it from `riskScore` using this mapping — keep it in a shared utility so it stays consistent with backend scoring bands:

| `riskScore` | `riskLevel` (suggested UI) |
|---|---|
| `0–20` | `SAFE` |
| `21–40` | `LOW` |
| `41–60` | `MEDIUM` |
| `61–80` | `HIGH` |
| `81–100` | `CRITICAL` |

A similar mapping can be used for the multisig `healthScore.overall` if the UI needs a single-word badge.

---

## Scoring reference

### Multisig health score

Weighted average of the four breakdown sub-scores, then capped by security guardrails:

| Sub-score | Weight | Rule |
|---|---|---|
| `threshold` | 40% | `1.0 → 100`, `0.66 → 80`, `0.5 → 60`, `0.4 → 40`, `0.33 → 30`, `< 0.33 → 20`. Hard `0` when `threshold = 1` (the critical case). |
| `configAuthority` | 25% | `null → 100`, otherwise `20`. |
| `signerConcentration` | 20% | `100 − ratio × 90` where `ratio = concentrated / total` (concentrated = signer has initiate + vote + execute). |
| `signerCount` | 15% | `≥ 5 → 100`, `4 → 80`, `3 → 60`, `2 → 30`, `1 → 0`. |

**Security caps (applied after the weighted average):**
- `threshold = 1` and `signerCount > 1` → `overall ≤ 20`.
- `signerCount = 1` → `overall ≤ 15`.

Source: [`packages/infrastructure/src/services/scoring/MultisigHealthScorer.ts`](../packages/infrastructure/src/services/scoring/MultisigHealthScorer.ts).

### Proposal risk score

Sum of the points in `scoring.flags`, capped at 100. The flag catalogue and triggers are in [`packages/infrastructure/src/services/scoring/FlagDetectors.ts`](../packages/infrastructure/src/services/scoring/FlagDetectors.ts). See [ProposalFlagType](#proposalflagtype) for the summary table.

---

## Pipeline timing (why some fields may be null)

`POST /multisigs` returns in milliseconds with almost every field blank. The real data is filled asynchronously:

1. An integration event `multisig.created` is published to RabbitMQ.
2. The **reactor** consumes it and runs `AnalyzeMultisigCommandHandler` — fetches on-chain data, decodes instructions, computes deterministic scores, and persists them.
3. Two follow-up events (`multisig.scored`, `proposal.scored`) trigger AI enrichment against Groq. On success, `aiSummary` and `ai.analysis`/`ai.recommendation` are filled. On failure (rate limit, network, provider down), the deterministic scores remain intact and the AI fields stay `null` — **never surface an error to the user from a missing AI field**.

Practical implications for the frontend:

- Right after `POST /multisigs`, the subsequent `GET` will return most fields as `null`. Poll until `threshold` and `healthScore` are populated (typical latency < 5 s on a healthy pipeline).
- `aiSummary` / `ai` can stay `null` permanently if the AI provider is unreachable. The UI should show a fallback (e.g. `"Analysis unavailable"`) instead of assuming failure of the whole response.
- The deterministic summary (`scoring.summary`) is always available once scoring completes, independently of the AI.
