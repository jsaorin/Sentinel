# Drift Protocol — 2026-04-01 Multisig Compromise (Durable Nonce Attack)

Reference document for the Drift Security Council compromise that drained ~$285M from Drift Protocol on Solana mainnet. Used as a real-world example case for Sentinel's threat model: durable nonce abuse against multisig signers.

## TL;DR

The attacker created Solana **durable nonce accounts** funded out of their own wallet, declaring two Drift Security Council signers as the `nonceAuthority`. They then phished those signers into signing Squads multisig proposals that used the durable nonce as their blockhash. Because durable nonce transactions never expire, the attacker held the signed proposals for **9 days**, then submitted them in two consecutive slots to take over the protocol's admin key. Two-of-five signature threshold, zero timelock, zero out-of-band confirmation — that's all it took.

## Key on-chain entities

| Role | Address |
| --- | --- |
| Drift Security Council multisig (Squads) | `2LW6PSEjp81xSEttWwXDB6Etb1eKdhYPbFEojYbyhx88` |
| Multisig vault (vault_index 0) | `AiLGdNitMjv8n5HMS7HAdV2kaeJZZFd4jdfn5xp1PKrW` |
| Drift V2 program | `dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH` |
| Squads program | `SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf` |
| **Attacker — funder of both nonce accounts** | **`FMJnBkVpHj5JzN7w4XFysCwY931CYSYk1DsXzqNi7YPF`** |
| **Attacker — recipient of admin (set via `updateAdmin`)** | **`H7PiGqqUaanBovwKgEtreJbKmQe6dbq6VTrw6guy7ZgL`** |

## The two durable nonce accounts

Each nonce account holds 80 bytes (`SystemProgram::CreateAccount` with size 80, `space=80`, `lamports=1447680` rent-exempt) and is initialized via `SystemProgram::InitializeNonceAccount(nonceAuthority)`. The attacker paid the rent and set the **authority** to a Drift signer they had successfully phished.

### Nonce #1 — pre-migration set

| Field | Value |
| --- | --- |
| Nonce account | `7s7s6saC5LHZoLyBXLM3pCjpWaA7meyQdP8NiH9ktAeC` |
| `nonceAuthority` | `39JyWrdbVdRqjzw9yyEjxNtTbTKcTPLdtdCgbz7C7Aq8` (Drift signer) |
| Funder / `feePayer` of init | `FMJnBkVpHj5JzN7w4XFysCwY931CYSYk1DsXzqNi7YPF` (attacker) |
| Init signers | `[FMJnBkVp…, 7s7s6saC…]` (funder + the new account itself) |
| Init signature | `LJuBqSWpfW6GSgWi2v64B6czZfd618ZXxPLBTQt2tSgF4hHCUgfYvUuAMxeSmfL4FnS8Wt9cKNaSK9YNke7kTz1` |
| Init blockTime | `2026-03-24T01:22:06Z` (slot `408444056`) |

### Nonce #2 — post-migration set

The Drift Security Council migrated to a 2-of-5 configuration on 2026-03-26 (Squads migration tx `9zJGhyotEes1Ni5i4Qki5zUjApWhvWcr5rxJfiLhVGtnDuVzn9eFy1XzvtrZaj8r2SZYRmMQGftGQvDS1o2pPwE`). Five days after their first nonce was already in place, the attacker created a second one targeting a signer of the **new** set, indicating they were monitoring on-chain governance changes in real time.

| Field | Value |
| --- | --- |
| Nonce account | `EmYEryTDXtuVCxrjNqJXbiwr4hfiJajd4g5P58vvhQnc` |
| `nonceAuthority` | `6UJbu9ut5VAsFYQFgPEa5xPfoyF5bB5oi4EknFPvu924` (Drift signer, post-migration) |
| Funder / `feePayer` of init | `FMJnBkVpHj5JzN7w4XFysCwY931CYSYk1DsXzqNi7YPF` (attacker) |
| Init signers | `[FMJnBkVp…, EmYEryTD…]` (funder + the new account itself) |
| Init signature | `59yWWZjnLeu3WP6Dqj4NW21NWHhdNwkToCbypdNrAHKmhk5C37ZDUygbuDVPSN2XqYzME88k6Ss3sBKGdrmrWrX3` |
| Init blockTime | `2026-03-31T02:35:49Z` (slot `409999217`) |

> Note on the "March 23" / "March 30" dates referenced in public reporting: the actual on-chain blockTimes are `2026-03-24T01:22:06Z` and `2026-03-31T02:35:49Z` UTC. Those two timestamps are roughly the late-evening hours of March 23 / March 30 in US-Pacific.

## The attack — two transactions, four slots apart

On `2026-04-01` at `16:05:18Z`, ~1 minute after Drift ran a legitimate test withdrawal from its insurance fund, the attacker submitted the two pre-signed durable-nonce transactions back-to-back. Both were signed by the respective `nonceAuthority` (the phished Drift signer); the attacker did not need to sign them at submission time — durable nonce transactions are valid as long as the nonce hasn't been advanced since signing.

### Tx 1 — Create + approve admin transfer proposal

| Field | Value |
| --- | --- |
| Signature | `2HvMSgDEfKhNryYZKhjowrBY55rUx5MWtcWkG9hqxZCFBaTiahPwfynP1dxBSRk9s5UTVc8LFeS4Btvkm9pc2C4H` |
| BlockTime / slot | `2026-04-01T16:05:18Z` |
| `feePayer` / signer | `39JyWrdbVdRqjzw9yyEjxNtTbTKcTPLdtdCgbz7C7Aq8` (Drift signer) |
| Instruction 0 | `system::advanceNonce` — nonceAccount=`7s7s6saC…`, nonceAuthority=`39JyWrdb…` |
| Instructions 1-3 | Three calls to Squads program `SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf` (proposal create + vote + something the multisig accepted as admin transfer) |

### Tx 2 — Approve + execute

| Field | Value |
| --- | --- |
| Signature | `4BKBmAJn6TdsENij7CsVbyMVLJU1tX27nfrMM1zgKv1bs2KJy6Am2NqdA3nJm4g9C6eC64UAf5sNs974ygB9RsN1` |
| BlockTime / slot | `2026-04-01T16:05:19Z` (one slot after Tx 1) |
| `feePayer` / signer | `6UJbu9ut5VAsFYQFgPEa5xPfoyF5bB5oi4EknFPvu924` (Drift signer) |
| Instruction 0 | `system::advanceNonce` — nonceAccount=`EmYEryTD…`, nonceAuthority=`6UJbu9ut…` |
| Instructions 1-2 | Two Squads calls completing the proposal approval + immediate execution (zero timelock) |

The execution was a Drift `updateAdmin(newAdmin = H7PiGqqUaanBovwKgEtreJbKmQe6dbq6VTrw6guy7ZgL)` instruction — the same address now persisted in our database as `proposal_index=7, action=updateAdmin, params.admin=H7PiGqqUaanBovwKgEtreJbKmQe6dbq6VTrw6guy7ZgL`.

## Why durable nonces enabled this

A regular Solana transaction is anchored to a recent blockhash and expires within ~150 slots (~60 s). Durable nonce transactions instead use a `Nonce` value stored in a dedicated account (the nonce account), and remain valid **until the nonce is advanced** — which only the `nonceAuthority` can do. So:

1. Attacker creates the nonce account, declares the victim signer as `nonceAuthority`. **The victim signer never sees this and does not sign it.**
2. Attacker phishes the signer into signing a transaction that uses that nonce account as its blockhash (typical phishing UI: "approve this Squads vote"). The transaction includes an `advanceNonce` instruction so it's a valid Solana tx.
3. Because the nonce never expires, the attacker holds the signed bytes off-chain.
4. When the attacker is ready, they broadcast the tx. The signer's signature, generated days or weeks earlier, validates as if it were freshly produced.

Crucially: even after the signer "rotates" their hot wallet, **the signed transaction remains valid as long as the nonce account exists and the original signer's pubkey is still authorized in the multisig at submission time**. There is no client-side mechanism to revoke a signature once issued.

## Detection signals (for Sentinel)

Every step of this attack leaves an unmistakable on-chain footprint, fully visible to a passive observer:

1. **Nonce account where `nonceAuthority` is a known multisig signer, but the funder is _not_ that signer.** This is the smoking gun. A legitimate user creating a nonce for themselves would normally fund it themselves. Detection: index every `SystemProgram::InitializeNonceAccount` and flag when `nonceAuthority` is a tracked signer and the tx fee_payer is a different address.
2. **Squads multisig transactions whose `recentBlockhash` resolves to a `system::advanceNonce` instruction in position 0.** Any production governance transaction that uses a durable nonce should be considered suspect by default — durable nonces have almost no legitimate governance use case.
3. **Time gap between signature production (off-chain) and tx landing.** Not directly observable, but `advanceNonce → propose → approve → execute` all in two consecutive slots, with the nonce account having only 2 lifetime sigs (init + this tx), is a strong indicator that a long-held pre-signed tx was just released.
4. **Multisig sensitive instructions (`updateAdmin`, `updatePerpMarketImfFactor`, `transferOwnership`, etc.) executed with a 2-of-N threshold and no timelock.** Sentinel's scoring engine already flags `CRITICAL_THRESHOLD_*` and `LOW_SIGNER_COUNT`; this case should reinforce why those scores need to escalate to alerts when combined with admin-class actions.

## What we have in our DB right now

For multisig `2LW6PSEjp81xSEttWwXDB6Etb1eKdhYPbFEojYbyhx88` (registered post-mortem on 2026-04-29):

- 9 proposals ingested. `proposal_index=7` is the malicious `updateAdmin` to `H7PiGqq…`.
- 2 `proposal_instruction` rows on Drift program with `is_known=false, action=Unknown, discriminator=e4d0bff6a93abdd5`. That discriminator decodes to `adminWithdrawFromInsuranceFundVault` — declared in Drift's repo IDL but **not** in the on-chain anchored IDL (which has 241 instructions vs. the repo's 249). Those two unknowns are the test withdrawals from the insurance fund that immediately preceded the attack proposals.
- Multisig health score: 20/100. Warnings: `CRITICAL_THRESHOLD_ONE` (after migration), `CONCENTRATED_SIGNER` (×2), `LOW_SIGNER_COUNT`. The scoring engine already correctly identified the structural weakness.

## Sources

- BlockSec — [Drift Protocol Incident: Multisig Governance Compromise via Durable Nonce Exploitation](https://blocksec.com/blog/drift-protocol-incident-multisig-governance-compromise-via-durable-nonce-exploitation)
- Chainalysis — [Drift Protocol Hack: How Privileged Access Led to a $285M Loss](https://www.chainalysis.com/blog/lessons-from-the-drift-hack/)
- QuillAudits — [Drift Protocol $285M Multisig Exploit (Explained)](https://www.quillaudits.com/blog/hack-analysis/drift-protocol-multisig-exploit)
- Four Pillars — [Reflections on the Drift Protocol Exploit](https://4pillars.io/en/issues/reflections-on-the-drift-protocol-exploit)
- Cyfrin — [Drift Protocol's $285M Hack: Why Transaction Legibility Is the Fix](https://www.cyfrin.io/blog/drift-hack-learnings)
- Hypernative — [The Drift Exploit: When Privileged Access Has No Limits](https://www.hypernative.io/blog/the-drift-exploit-when-privileged-access-has-no-limits)
