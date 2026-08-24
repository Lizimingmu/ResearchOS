# OpenCode Handoff — M013-10 External Pack Remediation

## Execute

Patch the supplied M013 external candidate packs and importer gate only. Do not regenerate the scientific corpus, import into production, promote verification status, package, release, bump versions, resume M012, or run Git.

## Inputs

Read `.agent/REVIEW_RESULT.md`, `.agent/SCIENTIFIC_CHANGESET.md`, `.agent/M013_SOURCE_PACK_DRY_RUN.md`, `.agent/M013_SOURCE_METADATA_AUDIT.md`, and the archive's qualification registers. Preserve the original ZIP unchanged.

## Required work

1. Make `validateSourcePack` and `dryRunSourcePack` exception-safe for arbitrary JSON shapes; malformed/legacy fields must return deterministic structured errors, never throw `TypeError`.
2. Build a deterministic staging converter from the archive's snake_case/legacy shape to current v3 field names. Preserve scientific text verbatim, record every mapping, and reject unmappable rows. Do not invent authors, claims, causes, scopes or qualifications.
3. Add required `contentOrigin`/provenance fields without self-verification. Canonicalize six duplicated DOI/PMID sources across batches and update foreign keys; correct only metadata listed in the audit.
4. Produce two staged outputs: (a) sources/claims eligible for another scientific review, still pending; (b) quarantined ProblemCards/paths/rubrics. Do not bulk-pad the 166 cards with generic causes.
5. Extend audits for validator-crash safety, legacy-field rejection/conversion, cross-pack collisions, missing scope/qualification, empty provenance, missing claim boundaries and candidate-cause count.

## Acceptance and stop

All eight original packs must be safely rejected without a crash. Converted staging packs must pass schema validation and dry-run with zero conflicts, while every scientific item remains pending. Update `IMPLEMENTATION_REPORT.md`; do not overwrite `SCIENTIFIC_CHANGESET.md`. Stop for Codex re-review without calling the apply importer.

## Short prompt

```text
在 D:\Agents\ResearchOS 执行 M013-10。读取 .agent/OPENCODE_HANDOFF.md、REVIEW_RESULT.md、SCIENTIFIC_CHANGESET.md 和两个 M013 审计报告。修复 validator 对旧/恶意 JSON 的崩溃，建立保真、可审计的 legacy→v3 staging 转换，合并跨包重复来源并补齐机器可确定字段；不得生成新科研内容、导入生产库、提升 pending、Git 或打包。原始 8 包应安全返回结构化拒绝，转换包应通过 validator/dry-run 后停止等待 Codex 复审。
```
