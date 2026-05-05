---
name: ec2-ops
description: Connect to the Sentinel production EC2, inspect deployed services, query public endpoints, read container logs, hot-patch issues, and ship fixes. Use whenever the user asks to check, debug, restart, query, or deploy something in production / EC2 / "el servidor" / "producción" / nip.io. Also use when verifying whether the latest commit is actually deployed.
---

# Sentinel EC2 Operations

This skill captures everything needed to operate the production EC2 the way the user expects: SSH in, inspect, verify, hot-patch on the box first, then commit from a worktree (never the user's primary working tree).

## 1. Connection facts

| Field | Value |
|---|---|
| Host (Elastic IP) | `98.94.161.141` |
| SSH user | `ec2-user` |
| SSH key | `~/.ssh/sentinel-key.pem` |
| Project path on EC2 | `/home/ec2-user/Sentinel` |
| Compose file | `docker/docker-compose.prod.yml` |
| Public host (TLS via Caddy + nip.io) | `98-94-161-141.nip.io` |
| API base | `https://98-94-161-141.nip.io/api/v1/` |
| Webhooks base | `https://98-94-161-141.nip.io/webhooks/api/v1/` |

Always use the nip.io hostname for HTTPS — the Caddy cert is issued for that exact host, not the raw IP. Use `curl -sk` if you want to skip strict cert validation when probing.

**Canonical SSH invocation** (use these exact flags so prompts don't block):

```bash
ssh -i ~/.ssh/sentinel-key.pem -o StrictHostKeyChecking=no -o ConnectTimeout=10 ec2-user@98.94.161.141 '<remote command>'
```

Wrap the remote command in single quotes, escape internal quotes with `\"`. For multi-step inspections, chain with `&&` and add `echo "===MARKER==="` separators so the output stays readable.

## 2. Container inventory

All services run via Docker Compose using `docker/docker-compose.prod.yml`. Container names are stable:

| Container | Service | Notes |
|---|---|---|
| `sentinel-api` | Express + Socket.IO API | Port 3000 internally, behind Caddy |
| `sentinel-webhooks` | Helius webhook receiver | Behind Caddy at `/webhooks` |
| `sentinel-reactor` | AMQP event consumer | No public port |
| `sentinel-watcher` | Telegram watcher | Publishes to Redis + RabbitMQ |
| `sentinel-postgres` | Postgres 17 | Internal only |
| `sentinel-redis` | Redis 7 | Internal only |
| `sentinel-rabbitmq` | RabbitMQ 3.13 | Internal only |
| `sentinel-caddy` | Reverse proxy + TLS | Ports 80, 443 |

## 3. Recipe library (copy-paste these)

### Check what's actually deployed
```bash
ssh -i ~/.ssh/sentinel-key.pem -o StrictHostKeyChecking=no ec2-user@98.94.161.141 \
  'cd /home/ec2-user/Sentinel && git log -1 --oneline && git status -s && git rev-parse HEAD'
```
Compare against `git rev-parse origin/main` locally (after `git fetch origin main`).

### Snapshot of all services
```bash
ssh -i ~/.ssh/sentinel-key.pem -o StrictHostKeyChecking=no ec2-user@98.94.161.141 \
  'cd /home/ec2-user/Sentinel && docker compose -f docker/docker-compose.prod.yml ps --format "{{.Name}}: {{.Status}}"'
```

### Tail logs of one service
```bash
ssh -i ~/.ssh/sentinel-key.pem -o StrictHostKeyChecking=no ec2-user@98.94.161.141 \
  'cd /home/ec2-user/Sentinel && docker compose -f docker/docker-compose.prod.yml logs --tail=40 <service>'
```
Replace `<service>` with `api`, `webhooks`, `reactor`, or `watcher` (the compose service name, not the container name — they differ).

### Restart a service
```bash
ssh -i ~/.ssh/sentinel-key.pem -o StrictHostKeyChecking=no ec2-user@98.94.161.141 \
  'cd /home/ec2-user/Sentinel && docker compose -f docker/docker-compose.prod.yml restart <service>'
```
Use `up -d <service>` instead if you changed compose env vars and need recreation.

### Run Prisma migrations (must be from `/app/packages/infrastructure`)
```bash
ssh -i ~/.ssh/sentinel-key.pem -o StrictHostKeyChecking=no ec2-user@98.94.161.141 \
  'cd /home/ec2-user/Sentinel && docker compose -f docker/docker-compose.prod.yml exec -T -w /app/packages/infrastructure api sh -c "./node_modules/.bin/prisma migrate deploy"'
```

### Probe public endpoints (no SSH needed)
```bash
curl -sk "https://98-94-161-141.nip.io/api/v1/proposals?page=1&pageSize=5" -w "\nHTTP %{http_code}\n"
curl -sk "https://98-94-161-141.nip.io/api/v1/threat-signals?page=1&pageSize=10" -w "\nHTTP %{http_code}\n"
curl -sk "https://98-94-161-141.nip.io/api/v1/multisigs?page=1&pageSize=10" -w "\nHTTP %{http_code}\n"
```

## 4. Hot-patch workflow ("test on EC2 first")

The user explicitly prefers: do not commit-push-test in loops; **prove the fix works on the box, then commit once**.

For **compose / env changes** (e.g. add `REDIS_HOST=redis` to a service):
1. Edit the file in a worktree (not the primary workspace — see §5).
2. `scp` the new compose file to EC2 as `.testing` next to the real one.
3. Back up the original (`cp X X.before-fix.bak`).
4. Move `.testing` over the real file.
5. `docker compose -f docker/docker-compose.prod.yml up -d <service>` to recreate it.
6. Tail logs to confirm clean startup.
7. Only after green, commit from the worktree and push.

For **TypeScript code fixes** (e.g. a Prisma query bug):
1. Containers run from `/app/packages/<pkg>/dist/**` — patched JS, not TS.
2. Use `docker exec sentinel-<service> sed -i.bak 's|...|...|' /app/packages/...js` to patch the compiled file.
3. `docker restart sentinel-<service>` and probe the affected endpoint.
4. Once green on EC2, write the equivalent TS fix in the worktree, commit, push.
5. The deploy workflow will rebuild the image and overwrite the hot-patch.

This trades a tiny bit of drift (hot-patched container vs source) for *fast confidence* before pushing.

For **Caddyfile changes** (volume-mounted, no image rebuild):
1. `docker compose up -d caddy` does NOT recreate the container when only the mounted file changed — the running Caddy keeps its old in-memory config.
2. `docker exec sentinel-caddy caddy reload --config /etc/caddy/Caddyfile` is unreliable in this image (the admin API may not bind correctly) — observed cases where it logs "adapted config to JSON" but never applies.
3. **Use `docker restart sentinel-caddy`** — that's the reliable way to pick up Caddyfile edits. ~3s downtime.
4. Verify the routing actually changed by `curl -sk -i https://98-94-161-141.nip.io/<new-path>` and looking at headers (`via: 1.1 Caddy` + Express headers = proxied to api; `server: Caddy` with `content-length: 8` "Sentinel" = catch-all).
5. Caddyfile gotcha: `handle /foo` matches ONLY the exact path. For prefix matching use `handle /foo*` (no slash) or `handle /foo/*` (forces trailing slash).

## 5. Commits & deploys

The user's primary workspace at `/Users/jesusangel/workspace/Sentinel` always has in-progress work. **Never edit, stash, checkout, or commit there.** For any production fix:

```bash
cd /Users/jesusangel/workspace/Sentinel
git fetch origin main
git worktree add ../Sentinel-fix-<topic> -B fix/<topic> origin/main
# edit, build, test in the worktree
cd ../Sentinel-fix-<topic>
git add <files> && git commit -m "fix(...): ..."
git push origin HEAD:main         # only if user OK'd direct-to-main
# OR
gh pr create                      # safer default — let user decide
```

Push to `main` triggers `.github/workflows/deploy.yml`:
- SSH to EC2 → `git pull` → `docker compose build` → `up -d` → `prisma migrate deploy`.
- Watch with `gh run watch <run-id> --exit-status`.
- Verify post-deploy via §3 recipes.

After the user confirms, clean up: `git worktree remove ../Sentinel-fix-<topic>` and optionally `git branch -D fix/<topic>`. **Ask first** — the user may want to inspect.

## 6. Known production gotchas

- **REDIS_HOST per service.** Every service in `docker-compose.prod.yml` that touches Redis needs `REDIS_HOST: redis` in its `environment:` block. If missing, the service crashloops on `127.0.0.1:6379 ECONNREFUSED`. Currently wired for: `api`, `reactor`, `watcher`. If you add a new Redis-using service, add it there too.
- **Webhook config seeds.** Wiping `public` schema deletes `webhook_config` rows; `CreateMultisigCommandHandler` then throws `No webhook configs found for type MULTISIG_ACTIVITY`. Re-seed via `pnpm --filter @sentinel/infrastructure db:seed` inside the api container, or insert manually:
  ```sql
  INSERT INTO webhook_config (id, helius_webhook_id, type, created_at, updated_at)
  VALUES (gen_random_uuid()::text, '7767df74-6405-4c10-9666-08fd5f732f3f', 'MULTISIG_ACTIVITY', NOW(), NOW());
  ```
- **Non-transactional multisig creation.** `CreateMultisigCommandHandler` persists the row before calling Helius. If Helius fails, the multisig row remains but the `multisig.created` outbox event is NOT published. Delete the orphan row before retrying.
- **Migrations CWD.** Prisma migrate must run with `-w /app/packages/infrastructure`; otherwise schema files are not found.
- **Vercel separate from EC2.** The Next.js web app deploys to Vercel via push-to-main. Build command on Vercel runs `pnpm build` from `apps/web`, which is configured to build `@sentinel/common` + `@sentinel/ui` first. Vercel build failures are a separate channel from EC2 — check both when troubleshooting a release.

## 7. Defaults when the user is vague

- "Check the EC2" / "is it deployed?" → §3 _Check what's actually deployed_ + container snapshot + a tail of `api` logs.
- "Are there X in prod?" → hit the relevant `https://98-94-161-141.nip.io/api/v1/<resource>` endpoint with `curl -sk`.
- "Logs are weird" → tail all four app services (`api`, `webhooks`, `reactor`, `watcher`) with `--tail=20` each, separated by `===<service>===` markers.
- "Fix X in prod" → hot-patch on EC2 first (§4), then worktree commit (§5).
- Always report findings concisely: what's deployed (sha), what's running, what's broken, what to do next.
