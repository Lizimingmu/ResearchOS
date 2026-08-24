# M013 — Research Problem Atlas Specification

## Product boundary

“科研常见问题库” is a top-level, Chinese-first diagnostic-learning workspace. It is not a FAQ, free-chat answer box, search-engine substitute, or source of automatically verified truth.

Core reasoning loop:

```text
Observation → Candidate causes → Missing information → Discriminating evidence
→ Updated ranking → Failure layer → Next check → Implication → Claim boundary
```

## Normalized domain model

### ProblemCard

- `id`, `schemaVersion`, `domain`, `subdomain`
- `titleCn`, `titleEn`, `aliases[]`, `keywords[]`
- `difficulty`, `importance`, `frequency`
- `observation`, `context`, `whyItMatters`
- `candidateCauseIds[]`, `diagnosticPathId`, `redFlags[]`
- `commonWrongActions[]`, `recommendedReasoning[]`
- `statisticalImplication?`, `experimentalImplication?`, `bioinformaticsImplication?`
- `claimBoundary`, `reviewerImplication`
- `transferCaseIds[]`, `misconceptionTags[]`
- `relatedMethodIds[]`, `relatedProtocolIds[]`, `relatedPatternIds[]`
- `evidenceClaimIds[]`
- `contentOrigin`, `verificationStatus`, `verifiedAt?`
- `knowledgeStatus`: current | superseded | deprecated | emerging

### DiagnosticCause

`id`, `problemId`, bilingual label, mechanism, initial rank, affected layer, supporting/contradicting evidence IDs, uncertainty note and evidence claims.

### DiagnosticCheck

`id`, `problemId`, question, information supplied, discriminates cause IDs, expected update, cost/availability category, sequence prerequisites and evidence claims. Do not expose a numerical “information value” score without a validated model.

### DiagnosticPath

Ordered nodes and branches. Each node contains available evidence, required learner judgment, permitted next checks, locked answer, feedback gate and stop condition. New evidence updates ranks; it does not overwrite prior responses.

### DiagnosticEvidence

Observation/evidence item with source type, result, scope, affected causes, diagnostic direction, sequence order and EvidenceClaim link. It is case evidence, distinct from bibliographic evidence.

### ProblemTrainingCase

Mode, prompt, context, answer schema, rubric, confidence, misconception tags, far-transfer family, related problem and content/verification status.

### DiagnosticSession

User-owned mutable progress: revealed evidence, ranked causes, selected missing information, localized failure layer, locked responses, confidence and timestamps. Canonical ProblemCards remain immutable seed/source content.

## Training modes

1. **快速定位（Quick Diagnosis）** — choose likely failure category/layer.
2. **鉴别诊断（Differential Diagnosis）** — rank causes as most likely/possible/unlikely/largely excluded with rationale.
3. **序贯排查（Sequential Troubleshooting）** — reveal one evidence item, lock an updated ranking, then continue.
4. **缺失信息（Missing Information）** — select the most discriminating next information and explain why.
5. **错误定位（Error Localization）** — sample → experiment → quantification → statistics → interpretation.
6. **结论边界（Claim Boundary）** — choose the maximal supported conclusion and evidence needed for a stronger claim.
7. **审稿诊断（Reviewer Diagnosis）** — identify the most consequential problem and proportionate severity.
8. **AI 解释审核（AI Audit Variant）** — 合理 / 需要核查 / 错误, followed by senior review.

All feedback appears only after answer lock. Sequential mode preserves each intermediate belief update for calibration review.

## Search entry — “我遇到了什么问题？”

Not a chat box. Search indexes Chinese/English titles, abbreviations, aliases, keywords, related concepts and normalized scientific terms.

Required behavior:

- case-insensitive English and normalized Chinese matching;
- abbreviation and alias expansion;
- token/prefix matching plus deterministic fuzzy fallback;
- ranking by exact alias/title, then related concept, then fuzzy text;
- filters for domain, difficulty, verification and knowledge status;
- pending/emerging/deprecated badges visible in results;
- no LLM-generated answer when no match; offer related concepts and a structured “unmatched query” record.

## Cross-workspace links

Problem Atlas owns failure-mode reasoning. Protocol Lab owns experimental-design literacy; Method Lab owns concepts; Review owns delayed retrieval. Link by stable IDs without duplicating source text.

Today may schedule at most one new Problem task in a normal daily queue and must not displace due Review. Wrong + high confidence creates a misconception and later far-transfer variant across domains (for example cells → spatial spots → organoid wells → pathology ROIs).

Skill Map evidence dimensions: Troubleshooting, Failure-mode Recognition, Scientific Diagnosis, Evidence Discrimination and Claim Calibration. Scores use accuracy, information-choice quality, confidence calibration, transfer and misconception resolution—not view counts.

## Initial content boundary

This milestone uses only a small demo set transformed from existing evidence-backed concepts: pseudoreplication/statistical unit, biological versus technical replication, data leakage and internal versus external validation. Transformations remain pending until Codex review even when the underlying source is verified. No internet scraping or bulk AI-generated atlas.

## Coverage matrix for future source packs

Wet Lab ~40; Experimental Design ~30; Statistics/Study Design ~40; Bioinformatics ~25; Single-cell ~30; Spatial ~20; Proteomics/Multi-omics ~20; Paper/Reviewer ~30; Figure ~20; AI Research Oversight ~30. These are planning targets, not M013 seed quotas.

## Acceptance

Structured storage, deterministic search, eight modes, source-first links, version badges, review/misconception/Today/Skill integration, transactional import, validators and tests. No scientific item is self-verified and no release packaging occurs.

