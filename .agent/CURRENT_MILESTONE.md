# Current Milestone — M012 Experimental Protocol Lab

## Outcome

Build a Chinese-first Experimental Protocol Lab that trains experimental reasoning, controls, replication, QC, troubleshooting, quantification, statistical units and claim boundaries. It must not become a step-by-step SOP encyclopedia.

## Deliverable

- A top-level **实验方法（Protocol Lab）** workspace.
- Structured protocol data model and safe local persistence.
- 34 curriculum topics defined in `PROTOCOL_CURRICULUM.md`.
- At least 20 reasoning, 15 troubleshooting, 15 control/replication and 10 AI wet-lab audit cases.
- Human-first answer locking, staged feedback, misconception/review integration and project transfer.
- Today, Review, Skill Map, AI Audit, Projects and global-search integration.
- Deterministic protocol schema/provenance/duplicate/scientific-state validator and engineering tests.

## Constraints

- All generated scientific content remains `pending` until Codex review.
- No universal volumes/times, clinical instructions, device control or unqualified manufacturer-specific parameters.
- OpenCode performs implementation without any Git command. Codex owns Git and diff review.
- Existing dirty localization work must be preserved. Packaging is prohibited before Codex `ACCEPT`.

## Acceptance sequence

OpenCode implementation → automated QA/content audit → Codex diff/scientific review → OpenCode patch → regression → Codex acceptance. Release is a separate milestone.
