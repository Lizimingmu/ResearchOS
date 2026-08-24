# OpenCode Handoff — M013-10 Staging Converter and Gate Hardening

## Role and boundary

Use **DeepSeek V4 Pro**. Execute M013-10 engineering work only. Do not generate or rewrite scientific content, import into the production database, promote any verification status, package, release, bump versions, run Git, or resume M012.

Read `AGENTS.md`, `.agent/SCIENTIFIC_GATES.md`, `.agent/PROBLEM_ATLAS_SPEC.md`, `.agent/SOURCE_INGESTION_SPEC.md`, `.agent/REVIEW_RESULT.md`, `.agent/SCIENTIFIC_CHANGESET.md`, `.agent/M013_SOURCE_PACK_DRY_RUN.md`, and `.agent/M013_SOURCE_METADATA_AUDIT.md`. Preserve the original ZIP and its contents unchanged.

## Required engineering work

### 1. Harden untrusted-input validation

- `validateSourcePack` and `dryRunSourcePack` must never throw for arbitrary legacy, malformed, oversized, or malicious JSON shapes.
- Return deterministic structured validation failures with locations/codes.
- Add regression coverage for missing arrays, wrong primitive/object types, malformed identifiers, oversize fields, collision-dependent claims, merged-state foreign keys, and rollback.

### 2. Add the minimal type/completeness contract

- Canonical `ProblemType`: `diagnostic | judgment | audit`.
- Staging may additionally use `unclassified`; it is never import-eligible.
- Do not infer `problemType` from titles, free text, tags, or the number of candidate causes. Legacy rows without an explicit reviewed classification remain `unclassified`.
- Report scientific completeness separately as `scientifically_complete | scientific_patch_required` (or an equivalent typed result). This reports completeness only; it is not verification or scientific approval.
- Keep incomplete legacy values absent/null in staging where the canonical production model cannot represent them safely. Do not invent defaults to make rows pass.

### 3. Keep the two gates independent

**Structural validation** checks safe parsing, schema/enums, identifiers, references, size/version constraints, collisions, and exception safety.

**Scientific completeness** checks only the declared type's required fields and reports missing items:

- `diagnostic`: requires a real differential with at least two referenced candidate explanations plus discriminating checks, reasoning and claim boundaries. Three useful candidates are preferred, but there is no global `>= 3` rule and no third cause may be fabricated.
- `judgment`: does not require candidate causes. Check the methodological issue/interpretation, answer or acceptable alternatives, repair, severity, transfer and evidence requirements defined in the specification.
- `audit`: does not require candidate causes. Check issue list/category, severity, fixability, missing information, corrected approach, boundary and evidence requirements defined in the specification.
- `unclassified`: always `scientific_patch_required` and `importEligible: false`.

A structurally valid staging document may dry-run successfully while remaining scientifically incomplete and import-ineligible. The apply path must reject every row/document with `scientific_patch_required` or `unclassified`.

### 4. Build a deterministic, auditable legacy-to-v3 staging converter

- Map only machine-deterministic fields: snake_case to camelCase, stable IDs, enums/aliases with explicit lookup tables, `contentOrigin: external_source_pack`, provenance identifiers, canonical source IDs, and updated foreign keys.
- Preserve supplied scientific text verbatim unless applying an exact Codex-approved patch already listed in `.agent/SCIENTIFIC_CHANGESET.md`.
- Canonicalize the six DOI collisions, six PMID collisions, and four normalized-title duplicates; disclose every merge/conflict.
- Never invent or infer scope, qualification, candidate causes, claim boundaries, recommended reasoning, severity, fixability, evidence support, or `problemType`.
- Never promote `pending`. Missing scientific fields stay missing and produce `scientific_patch_required` plus `importEligible: false`.

### 5. Produce staging reports

Create `.agent/M013_V3_STAGING_REPORT.md` and `.agent/M013_V3_STAGING_REPORT.json` containing exact counts for:

- rows by `problemType`, including `unclassified`;
- structural pass/reject and error codes;
- scientific completeness and missing-field reasons by type;
- source canonicalization, collisions and foreign-key rewrites;
- pending statuses;
- dry-run result and explicit `importEligible` result.

Update `.agent/IMPLEMENTATION_REPORT.md`. Update `.agent/SCIENTIFIC_CHANGESET.md` only with an engineering-status note stating that M013-10 added no new scientific claim/content and retained all candidate content as pending; do not overwrite or reinterpret existing Codex decisions.

## Verification and stop condition

Run typecheck/build, frontend tests, source-pack audit, Problem Atlas audit, content/localization/performance/startup gates, and `scripts/validate-agent-handoff.mjs` as applicable. The eight untouched original packs must return structured rejection without a crash. Converted staging must be structurally valid and collision-free in dry-run, while incomplete/unclassified scientific rows remain import-ineligible.

Do not call the apply importer. Stop after reports and automated QA, and return the implementation report for Codex review.

## Short execution prompt

```text
读取 AGENTS.md 和 .agent/OPENCODE_HANDOFF.md，执行当前 M013-10。仅做异常安全验证、legacy→v3 可审计 staging 转换、来源去重与双层 gate；不得推断 problemType，不得用全局“候选原因>=3”规则，不得补造任何科研字段。只 dry-run，不导入生产库，不提升 pending，不执行 Git，不打包。完成 QA 和报告后停止，返回 IMPLEMENTATION_REPORT。
```
