# M015 Resumable OpenCode Execution Runbook

_Single-entry, segmented implementation protocol for unattended background work_

> Status: superseded on 2026-08-26 by user instruction. Codex now executes the same S0-S7 boundaries directly; the OpenCode watchdog must not be started.

---

## 🎯 Objective

Implement M015 Personal Content Studio and curated Obsidian collaboration in bounded, resumable segments. The canonical specification is .agent/M015_PERSONAL_CONTENT_STUDIO_PLAN.md.

This runbook does not authorize M014-02R foreground verification, real Obsidian vault access, Git push, or packaging. It authorizes local Git checkpoint commits only under the protocol below. All overnight work is background-only.

## 🔒 Overnight boundaries

- Read and obey AGENTS.md, TESTING_POLICY.md, PRODUCT_CONSTITUTION.md, and SCIENTIFIC_GATES.md.
- Do not launch ResearchOS, Tauri dev, the installer, Obsidian, a browser window, or any visible application.
- Do not control mouse, keyboard, focus, DPI, displays, windows, clipboard, or user processes.
- Do not discover, scan, read, or write a real Obsidian vault.
- Obsidian tests use only the exact fake-vault path in M015_RUN_STATE.json.
- Do not use production data, credentials, PDFs, or personal files.
- Do not push, fetch, pull, reset, clean, rebase, merge, amend, package a release, change v0.11.0 release binaries, resume M012, or touch the quarantined 166 cards.
- Git is limited to status/diff/log, creation of the named M015 branch in run state, explicit staging, and one new local commit after each passing segment.
- Do not create or promote scientific content. Fixtures are synthetic and pending.
- Do not use force, silent overwrite, destructive reset, recursive deletion, or path traversal.
- Keep existing M014 work intact.

## 🔄 Resume protocol

Start once from the user's normal PowerShell environment:

~~~powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\start-m015-overnight.ps1
~~~

The starter detaches a hidden watchdog. Progress is authoritative in `.agent/M015_RUN_STATE.json`; operational logs are under `.agent/m015-run-logs/`. A live lock prevents duplicate workers; a stale lock whose recorded PID no longer exists is removed safely on restart.

~~~mermaid
flowchart LR
    accTitle: Resumable Segment Protocol
    accDescr: OpenCode reads the checkpoint, resumes the first unfinished segment, validates it, and either advances safely or stops with a failure report.

    start([📄 Read state]) --> select[📋 Select unfinished]
    select --> mark[✏️ Mark in progress]
    mark --> implement[🔧 Implement segment]
    implement --> test[🧪 Run focused gates]
    test --> passed{🔍 Gates pass?}
    passed -->|No| fail[⚠️ Record failure]
    fail --> stop([🛑 Stop run])
    passed -->|Yes| complete[✅ Mark completed]
    complete --> remaining{📋 Work remains?}
    remaining -->|Yes| select
    remaining -->|No| done([✅ Await Codex])

    classDef process fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e3a5f
    classDef decision fill:#fef9c3,stroke:#ca8a04,stroke-width:2px,color:#713f12
    classDef success fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d
    classDef danger fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#7f1d1d

    class start,select,mark,implement,test process
    class passed,remaining decision
    class complete,done success
    class fail,stop danger
~~~

The watchdog starts one fresh OpenCode process per segment attempt. At every process start:

1. Read .agent/M015_RUN_STATE.json and validate its schema and segment IDs.
2. Select the first segment not marked completed.
3. If it is in_progress, increment attempts, inspect its report and current files, then resume instead of restarting blindly.
4. If it is failed, understand the recorded failure before resuming only that segment.
5. Before edits, atomically set the segment to in_progress, set runStatus to running, and update timestamps.
6. After focused acceptance passes, write the segment report, stage only the intended files, create the segment's local checkpoint commit, record its hash, then atomically mark completed. If recording the hash requires a final state-only commit, include it in the same commit by writing the intended hash as `pending_commit` first, commit, then replace it with the actual hash and amend is forbidden; instead record the actual hash in the next segment's opening state update and in the report. The authoritative segment hash is the commit containing that segment report.
7. On failure, record command, error, and remaining work; mark failed; set runStatus to stopped_on_failure; stop immediately.
8. After S7 passes, set runStatus to awaiting_codex_review and stop.

Completed segments are immutable unless a later segment exposes a direct regression. Reopen only the affected dependency and record why.

## Git checkpoint protocol

S0 is the only dirty-start exception. The repository currently contains the completed but uncommitted M013/M014/v0.11.0 work plus M015 control files. S0 must:

1. Capture `git status --short`, `git diff --stat`, the current branch, and HEAD in the preflight artifact.
2. Confirm `.tmp`, logs, SQLite files, release executables, credentials, and personal data are ignored or unstaged.
3. Create or switch to `codex/m015-personal-content-studio` without discarding changes.
4. Complete S0 acceptance, then create one local baseline commit named `chore: checkpoint v0.11.0 before M015` containing the intended current project state and S0 controls.
5. Record that hash as `git.baselineCommit` and the S0 authoritative commit in its report at the opening of S1. Do not amend S0.

For S1-S7, a segment may start only when the preceding authoritative checkpoint exists. Before editing, record status. After tests pass:

- inspect `git diff` and `git diff --check`;
- stage paths explicitly, never `git add -A` or `git add .`;
- reject secrets, personal paths, real-vault material, executables, databases, logs, and unrelated files;
- commit once using `feat(m015): complete Sx <short-name>` (S7 may use `chore(m015): complete final gate`);
- write the resulting hash into the next segment's opening checkpoint and both adjacent reports as applicable.

Never auto-push. Never rewrite history. On a commit failure, leave the segment incomplete, record the exact state, and stop that attempt.

The watchdog may retry the same incomplete segment up to three times. It must stop when the run reaches `awaiting_codex_review`, the retry budget is exhausted, a safety stop is recorded, or no checkpoint progress occurs across three launches.

The watchdog uses OpenCode unattended approval mode. Project `opencode.json` therefore acts as the hard Git boundary: broad Git is denied, and only the exact local checkpoint command families are allowed. External-directory tool access is denied. The prompt and run state remain additional policy layers, not substitutes for this configuration.

## 📝 Segment reports

Write concise reports under .agent/m015-segments/S0.md through S7.md with:

- status and timestamps
- files read and changed
- implemented behavior
- focused verification
- failures and remaining risks
- next segment

Do not paste full logs. Store deterministic JSON artifacts under artifacts/m015 and reference them.

## 🧩 Segment definitions

### S0 — Preflight and invariant capture

- Validate control files and current M014/M015 state.
- Record version, state schema, SQLite user version, expected dirty files, and quarantined-corpus counts.
- Create artifacts/m015/preflight.json and the exact project-local fake-vault root.
- Establish the local M015 branch and the pre-M015 baseline checkpoint; change no product behavior.

Acceptance: handoff validator passes; preflight is deterministic except timestamp; no real-vault path appears anywhere.

### S1 — Unified content contract and review-pack export

- Define supported kinds, stable content key, revision, hash, dependency, provenance, and review-status contracts.
- Build a read-only effective inventory over built-in content.
- Export selected content and dependency closure as manifest.json, content.json, REVIEW_COPY.md, SCIENTIFIC_CHANGESET.md, and dependencies.json.
- Add schema, hash, duplicate, dependency, missing-evidence, and provenance validation.
- Change no scientific text or verification status.

Acceptance: deterministic output; disclosed dependency closure; unknown IDs, cycles, duplicates, and unsafe paths fail; focused audit passes.

### S2 — Personal overlay, lifecycle, and migrations

- Add versioned personal overlay entities and safe migrations for draft, pending, active, and archive.
- Resolve effective content as immutable base plus explicit overlay.
- Keep drafts and archived items out of learning, Today, Review, search, and publishing.
- Preserve app upgrade, backup/restore, and M014 data compatibility.
- Create conflicts when base and overlay hashes diverge.

Acceptance: old fixtures migrate without loss; base is never overwritten; drafts cannot leak; backups preserve overlay/history/conflicts.

### S3 — Versioned patch import, history, and rollback

- Define patch packs with target ID, base revision/hash, changes, reason, evidence changes, reviewer, and proposed status.
- Implement total validation, field diff, impact preview, optimistic locking, atomic apply, revision history, supersession/deprecation, and rollback.
- Preserve historical learning references.
- Keep scientific patches pending until the applicable gate.

Acceptance: stale/invalid/partial failures cause zero writes; apply retains old revision; rollback is auditable; repeat apply is idempotent; no self-promotion.

### S4 — Chinese-first content workbench

- Add 内容库, 草稿, 待审核, 发布箱, 版本历史, and 冲突 views.
- Support templates, duplicate, edit, filter, review export, patch preview/apply, history, rollback, archive, and explicit activation.
- Show origin, status, revision, evidence gaps, dependency impact, and pending warnings.
- Add no scientific seed content.

Acceptance: component and DOM tests cover lifecycle and zero accidental activation; Chinese localization and keyboard checks pass without foreground UI.

### S5 — Curated Obsidian publisher

- Configure only a dedicated subfolder; connection validation is read-only.
- Implement outbox, exact file preview, 20-note default limit, confirmation token, atomic writes, managed blocks, frontmatter identity, idempotency, rename tracking, and conflicts.
- Embed sources and claims by default; separate source notes are opt-in.
- Exclude learning records, raw AI output, logs, drafts, and temporary artifacts.
- Enforce resolved-path containment, symlink/junction escape rejection, Unicode/case collision checks, and no .obsidian access.

Acceptance: connect/scan/preview/cancel/conflict cause byte-identical fake-vault snapshots; confirmed publish writes only previewed paths; unchanged republish writes nothing; manual sections are preserved.

### S6 — Optional Obsidian review round trip

- Export finite _Review/batch-id sets only after explicit confirmation.
- Read back only the exact batch manifest after an explicit check action.
- Convert annotations or managed edits into pending patch candidates and dry-run diffs.
- Never auto-merge, verify, publish, watch, clean, or delete.

Acceptance: deterministic finite batch; unrelated files are not read; checking feedback writes nothing; suggestions remain pending; managed edits become conflicts.

### S7 — Full regression and handoff

- Run typecheck and all frontend, source-pack, Problem Atlas, staging, content, localization, performance, startup, seed, handoff, M015 content, patch, migration, backup, and fake-vault gates.
- Run Rust checks only if configured dependencies are available without network retry loops; otherwise report NOT RUN.
- Search for unstable selectors, unsafe paths, real vault strings, watchers, automatic publish calls, status promotion, and corpus changes.
- Update IMPLEMENTATION_REPORT and only actual scientific changes in SCIENTIFIC_CHANGESET.
- Produce artifacts/m015/final-gate.json.

Acceptance: all available background gates pass; no real vault or foreground access; 166 cards remain quarantined; no science generated/promoted; report uses four testing categories; stop for Codex.

## 🛑 Stop conditions

Stop safely instead of asking the sleeping user when:

- real Obsidian data, foreground permission, Git operations outside the checkpoint protocol, packaging, network credentials, or unspecified scientific judgment is required;
- architecture or scientific status contradicts the plan;
- migration cannot preserve data;
- Windows path containment cannot be proven;
- a gate would need disabling;
- one focused repair attempt does not resolve a repeated failure.
