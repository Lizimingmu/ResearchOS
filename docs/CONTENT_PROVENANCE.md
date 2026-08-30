# ResearchOS content provenance and evidence policy

*Rules that separate sources, claims, instructional status, imports, and optional AI critique.*

---

## 🏷️ Required metadata

Every instructional entity has a stable ID, `contentOrigin`, `verificationStatus`, difficulty, misconception tags, and source IDs where a claim depends on evidence. Evidence sources include title, year, source tier/type, identifiers or official URL, bounded core-evidence text, verification date, and `verificationScope`.

Origins are `verified_seed`, `verified_external`, `human_authored`, `ai_generated`, or `imported`. Verification states are `verified`, `pending`, and `rejected`. Instructional readiness is separate: a scientifically verified method may remain a `draft` and is then excluded from scheduling.

## 📚 Evidence tiers

| Tier | Use |
|---|---|
| A | Primary benchmark or empirical study directly supporting a technical claim |
| B | Methods paper, reporting guideline, or authoritative appraisal framework |
| C | Example paper for analysis practice, not general guidance by itself |
| D | Local/imported context that may shape a prompt but is not verified evidence |

Reporting checklists such as STROBE, PRISMA, and TRIPOD are transparency frameworks—not numerical risk-of-bias or study-quality scores. Current TRIPOD+AI scope is registered separately from the foundational 2015 TRIPOD record.[^tripod]

## ✅ Verification scopes

- `identifier`: the DOI/PMID/URL resolves to the described bibliographic record.
- `claim`: the bounded instructional statement was checked against the source's reported design/results/scope.

Identifier success alone never upgrades an unsupported claim. The content gate resolves all source foreign keys, blocks duplicate IDs/titles/DOIs/PMIDs, enforces required fields, and prohibits AI self-verification.

## 🤖 AI and imported material

Optional provider output is a labeled critique shown after a human answer is locked. Exact JSON parsing rejects malformed responses. Provider output cannot edit seed sources, mark itself verified, or become a review answer key.

Imported notes, papers, and project context remain local user material. v0.10.1 has no automatic promotion workflow. A future promotion mechanism would require reviewer identity, review date, supporting sources, a claim-level rationale, and an auditable state transition.

## 📊 v0.10.1 provenance outcome

The shipped inventory contains 133 verified-seed and 153 verified-external records, with zero AI-generated verified records. All 286 records pass the verification-state gate; four method drafts are deliberately excluded from practice pending instructional expansion. Full audit evidence is in `CONTENT_AUDIT.md` and `SCIENTIFIC_REVIEW.md`.

No copyrighted PDF or licensed full text is bundled. Example papers contain public metadata only.

[^tripod]: [TRIPOD+AI scope](https://www.tripod-statement.org/scope/)
