# Protocol Lab Curriculum and Rubric — M012

## Learning objective

On seeing any experiment, the learner should identify the scientific question, signal source, experimental and statistical units, replication hierarchy, diagnostic controls, critical variables, QC checkpoints, quantification path, alternative explanations and maximal defensible claim.

## Structured topic contract

Each topic contains purpose, principle/signal origin, workflow logic with “why this stage exists”, experimental unit, biological and technical replication, assay-specific controls, ranked variables, QC checkpoints, failure modes with distinguishing evidence, troubleshooting logic, quantification, statistical unit, allowed/forbidden claims, reviewer concerns and claim-level sources. Do not store it as one Markdown blob.

## First curriculum — 34 topics

### Experimental design foundation (12)

1. 实验单位（Experimental Unit）
2. 生物学重复（Biological Replicate）
3. 技术重复（Technical Replicate）
4. 阳性对照（Positive Control）
5. 阴性对照（Negative Control）
6. 溶剂对照（Vehicle Control）
7. 空白对照（Blank Control）
8. 随机化（Randomization）
9. 盲法（Blinding）
10. 批次效应（Batch Effect）
11. 技术变异（Technical Variability）
12. 生物学变异（Biological Variability）

### Molecular biology (5)

13. RNA 提取与质量控制
14. 逆转录（Reverse Transcription）
15. RT-qPCR 与引物设计
16. 蛋白提取、BCA 与 Western blot
17. ELISA 定量与动态范围

### Pathology (4)

18. FFPE、固定与 H&E
19. IHC 与抗原修复
20. 免疫荧光与多重免疫荧光（Multiplex IF）
21. 数字病理定量（Digital Pathology Quantification）

### Cell biology (5)

22. 细胞培养、计数与污染/QC
23. 细胞活力与 CCK-8/MTT 原理
24. 克隆形成实验（Colony Formation）
25. 凋亡与细胞周期检测
26. 迁移、侵袭与划痕实验

### Organoid and drug response (4)

27. 类器官建立与 QC
28. 类器官剂量–反应与 IC50
29. 药物组合矩阵及 Bliss/ZIP/Loewe
30. Live/Dead 染色与类器官定量

### Omics wet-lab literacy (4)

31. RNA-seq 前端：RNA 完整性、建库与测序深度
32. scRNA-seq 样本制备：解离、活率、双细胞、环境 RNA 与上样
33. 空间组学前端：固定、切片、组织质量、分割与空间分辨率
34. 蛋白质组前端：提取、酶解、LC-MS/MS、批次与缺失来源

## Training-mode rubrics

- **Before Protocol:** learner commits an answer before content; assess unit/control/claim misconception and confidence.
- **Protocol Audit:** each step is 合理/需要核查/存在问题; review explains risk, distinguishing evidence and repair.
- **Missing Control:** name the missing control and the failure it diagnoses; a control name without purpose is incomplete.
- **Failure Diagnosis:** rank multiple causes using observation + QC + context; reward discriminating next checks.
- **Sequential Troubleshooting:** reveal evidence one item at a time; require an updated hypothesis and next-best discriminator.
- **Experimental Unit:** separately label observation, technical replicate, biological replicate, experimental unit and statistical unit.
- **Claim Boundary:** select the maximal supported conclusion and identify evidence required for a stronger claim.
- **Design This Experiment:** require question/estimand, unit, controls, replication, randomization/blinding where relevant, readout/dynamic range, QC, statistical plan, complementary evidence and allowed claim.

## Priority exemplar acceptance

Western blot, RT-qPCR, IHC, Multiplex IF, cell viability, colony formation, apoptosis, migration/invasion, organoid drug response and scRNA sample preparation must each have a coherent topic plus at least one nontrivial training case. No case may treat images, wells or repeated measurements as independent patient-level n.

## Case production constraints

Cases must vary context and misconception, not merely swap assay names. Troubleshooting answers should usually contain multiple plausible causes, show what QC rules in/out, and identify the next most discriminating observation. All scientific seeds begin with `content_origin = ai_generated` and `verification_status = pending` unless an existing verified source and Codex gate explicitly justify otherwise.

