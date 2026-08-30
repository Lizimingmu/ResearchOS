# ResearchOS learning engine — M018.1

## Canonical content and assets

`learningContentRegistry` provides stable content identity, type, capabilities, prerequisites, thread, project relevance, rationale, time estimate, lifecycle, verification, provenance and Apply/remediation/review references. Today, Learn, Guide links and Progress consume this registry. A deterministic audit rejects drift, unknown mappings, missing or reused role assets, unverified active content and prohibited public strings.

Guide, Concept Lesson, Method Lesson, Case Lab and Studio keep explicit contracts. `PracticeAssetV1` remains the immutable standardized-practice boundary, not a universal prose or workflow schema.

## Persisted transition

```text
Learn → Explain → Apply
                    ├─ pass → independent_once → due +3 days → unfamiliar review → retained
                    └─ fail → targeted explanation → different remediation Apply
```

`LearningContentProgressV1` persists phase, Explain completion, Apply start, remediation need/attempt and timestamps. Learn/Explain change exposure only. `submitArchitecturePractice` validates the asset binding, hash, role, lock, confidence and no-hint policy, scores the response, emits a Kernel event and advances standardized competence. Review is illegal before its due time.

## Method and Case learning

The reusable Method renderer consumes explanation sections, an interaction contract, Apply/review asset references, capability mapping, persisted progress and feedback. Cox uses a structured audit plus reasoning and maximum defensible conclusion.

`ResearchCaseV1` reveals evidence sequentially. Each stage persists original reasoning and claim boundary, exposes expert calibration separately, optionally appends a learner update, then advances. The Decision Timeline never overwrites the original answer. A completed source/context resolves to one canonical Transfer Artifact.

## Evidence projection

Capability Progress projects from de-duplicated compatible Kernel events and learner states, then incorporates M018 content exposure from persisted progress. Apply/review events supply standardized evidence; Transfer Artifacts remain a separate axis and do not mutate competence. The corrected unit mapping uses `lu-biological-technical-replicate-v1`.

## Scheduling

The M018 curriculum layer schedules verified active registry entries over the compatible Kernel scheduler:

- Foundation Spine: prerequisite-ordered Concept learning.
- Project Overlay: at most one relevant Method/Case learning thread and only with consent.
- Due Review: one truly due Concept/Method or compatible Kernel retrieval.
- Routine: paper, Think Before AI and project-review work.

Hard prerequisites apply to both threads. Project relevance cannot create a third active thread or bypass the Foundation Spine. Successful transfer and reviews are emitted only when due.
