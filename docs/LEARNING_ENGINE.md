# ResearchOS learning engine — M018

## Content types

`LearningContentType` discriminates `guide`, `concept_lesson`, `method_lesson`, `case_lab` and `studio_task`. Each has an explicit schema and renderer; Guide, explanations, Case stages and Studio artifacts are not forced into `PracticeAssetV1`.

## Concept transition

```text
Learn → Explain → Apply
                    ├─ pass → independent_once → delayed unfamiliar review
                    └─ fail → targeted remediation → second fresh Apply
```

Learn/Explain never create standardized competence. Standardized attempts retain versioned asset identity, locked response, confidence where required and role-distinct review surfaces. Guided failure remains `guided`; guided pass alone enters `independent_ready`. High-confidence conceptual failure records a misconception for explicit remediation.

## Method and Case learning

Method Lesson has its own question/input/logic/output/assumption/use/misuse/reviewer contract. `ResearchCaseV1` reveals evidence sequentially. `lockCaseStage` rejects overwrite and out-of-order submission, snapshots the case hash and persists `reasoningHistory`; completion renders a Decision Timeline.

## Evidence projection

Capability Progress is projected from source Learning Kernel events through an explicit unit-to-capability map. Event IDs are de-duplicated and not copied into synthetic skill evidence. Exposure is `not_studied | learning | core_completed`; standardized evidence is `none | independent_once | retained | multiple_context_retained`.

`TransferArtifactV1` stores a real paper/project/AI-audit/case application. It is displayed alongside standardized evidence but never mutates competence.

## Scheduling

At most two active threads remain. Prerequisites cannot be bypassed by Project Overlay. When `allowProjectRelevance=false`, project relevance is exactly zero and project content is not inspected. Review, far transfer and post-transfer maintenance appear only when `dueAt` is reached; successful transfer is not re-scheduled daily.

Top-level Review shows Learning Reviews from the same Kernel source used by Today, plus Other Practice Reviews from legacy workflows.
