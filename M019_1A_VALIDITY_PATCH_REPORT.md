# M019.1a Validity Patch Report

1. **source override 是否彻底关闭？** 是。`authored.evidenceSourceIds` 不再替换 canonical mapping；渲染结果固定为 canonical links 加 authored-only supplemental links。确定性审计覆盖 288 节、549 条 canonical links，删除或降级 canonical source 会 FAIL；当前 0 error。

2. **哪些 source mappings 被修？** External Validity（STROBE methodology + PM external direct）；Orthogonal Validation（multiomics direct + STROBE methodology，两个同名章节均覆盖）；Technical versus Biological Validation（pseudorep + multiomics direct）；RNA Is Not Protein（multiomics + proteomics direct，batch supplemental）；Feature Selection（leakage + internal validation direct、TRIPOD-AI methodology，batch/STROBE supplemental）；Pathway and Program Interpretation（GSEA/CAMERA/ORA direct，batch/single-cell supplemental）；Pseudoreplication（pseudorep direct，single-cell/STROBE supplemental）；Pseudobulk（pseudobulk/DESeq2/edgeR direct，single-cell/STROBE/batch supplemental）；Cognitive Outsourcing 与 Think, AI Critique, Decide 保留 NIST methodology，并把无直接经验来源的认知/锚定效应表述收窄为治理性 synthesis/pending。

3. **strict blind 是否无 lesson/role 泄漏？** 是。`m019-1-strict-blind-assessment-packet.json` 含 183 个匿名 A-ID，只保留 scenario、stimulus、O-ID options 与 maximum selections；lesson、role、答案、distractor、rationale、feedback 和 scoring metadata 泄漏均为 0，且不生成相邻 answer-key 文件。

4. **assessment 是否不再固定四槽？** 是。schema 支持 3–7 facts、七类 task contract 和 `evidenceFactIndicesByAction: number[]`；当前已有 5-fact 实例和 multi-fact evidence mapping，单任务题不再要求四个 action 同时作答。

5. **有多少 assessment 使用不同 task contracts？** 183/183：61 个 `integrated_judgment`、61 个 `error_localization`、61 个 `claim_rewrite`，共 3 类实际实例化；其余四类 contract 已由 schema/renderer 支持但本轮未强行为课程新增实例。

6. **distractor 是否完成 near-miss 修订？** 是。183 个 assessment 的 366 个 authored distractors 均通过“每题至少一个可信 near-miss”检查；明显语气提示 0、题内重复 0。P/q 即证明、AI 完整即执行、同队列调阈值即外部验证等强提示已改为需结合 family、threshold、preprocessing 或验证设计判断的近失误选项。

7. **Guide redundancy 是否仍有 high-similarity flags？** 否。扩展审计同时覆盖 whyItMatters、intuition、preciseExplanation、misconception、boundary、example 与 full rendered body；exact 0、normalized 0、high-similarity 0、repeated-prefix 0。

8. **是否仍全部 pending？** 是。审计覆盖的 662 个生成 records 全部保持 `ai_generated + pending + pending_review`；generated active/verified = 0。

9. **下一步是否可以交给外部 reviewer 做 strict blind solve？** 可以，且应只交付 `artifacts/m019-1-strict-blind-assessment-packet.json`。typecheck、180 项 full tests、assessment、source linkage、strict blind、Guide redundancy、privacy、checkpoint inventory 与 `git diff --check` 均通过；Guide materialization 的旧 tier 字数/深度门禁仍有基线遗留 FAIL，本轮依照“禁止 Guide 大规模重写”未扩展处理，它不影响 assessment strict-blind packet 的匿名性与可解性，也不得被视为最终 activation 通过。
