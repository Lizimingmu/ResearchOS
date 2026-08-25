# OpenCode Handoff — M013-11R2 Metadata-only Patch

Use **DeepSeek V4 Flash**. Read `AGENTS.md` and `.agent/REVIEW_RESULT.md`.

Perform only these changes:

1. In `src/data/problemAtlas.ts`, change `pa-src-altman-validation.pmid` from the incorrect `19401593` to the PubMed record for DOI `10.1136/bmj.b605`: **`19477892`**.
2. Regenerate `data/problem_atlas/source_pack.json` through the existing seed export; do not hand-edit generated data.
3. Correct the PMID in SC-DEMO-01 of `.agent/SCIENTIFIC_CHANGESET.md`.
4. Add a deterministic source-pack audit assertion that `10.1136/bmj.b605` maps to PMID `19477892`, so the mismatch cannot pass again.
5. Run full tests and all existing M013 gates; update `.agent/IMPLEMENTATION_REPORT.md` with this metadata-only result.

Keep the source and temporal EvidenceClaim pending. Do not change wording, engine/UI, external 166 cards, tutorial, versions or any other source metadata. Do not run Git or package. Stop for Codex sign-off.

```text
读取 AGENTS.md 和 .agent/OPENCODE_HANDOFF.md，使用 DeepSeek V4 Flash 执行 M013-11R2。只把 pa-src-altman-validation 的 PMID 从错误的 19401593 改为 19477892，重新导出 seed，修正 SC-DEMO-01，并增加 DOI 10.1136/bmj.b605 ↔ PMID 19477892 的确定性审计断言。跑全套 QA 后停止；不要改其他内容、不要 Git、不要打包。
```
