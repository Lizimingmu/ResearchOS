import assert from "node:assert/strict";
import { test } from "node:test";
import {
  isAssessmentCompetenceAllowed,
  isLessonPilotEligible,
  PILOT_SELECTED_TOPICS,
  DISAGREEMENT_ANONYMOUS_IDS,
  DISAGREEMENT_ASSET_IDS,
} from "../.build/data/pilot/pilotManifest.js";
import { createInitialState, useAppStore } from "../.build/state/store.js";
import { migratePersistedState } from "../.build/state/migrations.js";
import { applyLearningTransition, createLearnerUnitState } from "../.build/learning/learningKernelEngine.js";
import { learningUnits } from "../.build/data/learningUnits.js";
import { auditKnowledgeWorkspace } from "../.build/services/knowledge.js";

test("pilot eligibility: excludes all 26 disagreement assessments", () => {
  assert.equal(DISAGREEMENT_ANONYMOUS_IDS.length, 26);
  assert.equal(DISAGREEMENT_ASSET_IDS.length, 26);

  // Every single anonymous ID and asset ID in the disagreement set must be blocked
  for (const anonId of DISAGREEMENT_ANONYMOUS_IDS) {
    assert.equal(
      isAssessmentCompetenceAllowed(anonId),
      false,
      `Expected ${anonId} to be blocked from competence scoring`
    );
  }
  for (const assetId of DISAGREEMENT_ASSET_IDS) {
    assert.equal(
      isAssessmentCompetenceAllowed(assetId),
      false,
      `Expected ${assetId} to be blocked from competence scoring`
    );
  }

  // Known clean candidate assessments must be allowed
  assert.equal(isAssessmentCompetenceAllowed("A016"), true);
  assert.equal(isAssessmentCompetenceAllowed("A017"), true);
  assert.equal(isAssessmentCompetenceAllowed("A018"), true);
  assert.equal(isAssessmentCompetenceAllowed("staged-concept-statistical-unit-apply-v2"), true);
});

test("pilot eligibility: selected pilot topics only use eligible assessments", () => {
  assert.ok(
    PILOT_SELECTED_TOPICS.length >= 6 && PILOT_SELECTED_TOPICS.length <= 8,
    `Expected 6-8 pilot topics, got ${PILOT_SELECTED_TOPICS.length}`
  );

  const blockedAnonSet = new Set(DISAGREEMENT_ANONYMOUS_IDS);
  const blockedAssetSet = new Set(DISAGREEMENT_ASSET_IDS);

  for (const topic of PILOT_SELECTED_TOPICS) {
    assert.equal(topic.eligible, true, `${topic.lessonId} should be eligible`);
    assert.equal(topic.competenceScoringAllowed, true);
    assert.equal(isLessonPilotEligible(topic.lessonId), true);

    // Assert zero overlap with disagreement items
    for (const aId of topic.assessmentIds) {
      assert.equal(blockedAnonSet.has(aId), false, `${topic.lessonId} assessment ${aId} is in disagreement set`);
      assert.equal(isAssessmentCompetenceAllowed(aId), true);
    }
    for (const assetId of topic.assetIds) {
      assert.equal(blockedAssetSet.has(assetId), false, `${topic.lessonId} asset ${assetId} is in disagreement set`);
      assert.equal(isAssessmentCompetenceAllowed(assetId), true);
    }
  }
});

test("pilot safety: disputed assessment cannot create competence", () => {
  const disputedAssetId = "staged-concept-biological-technical-replicate-review-v3";
  assert.equal(isAssessmentCompetenceAllowed(disputedAssetId), false);

  const unit = learningUnits[0]; // statistical unit kernel unit
  const initial = createLearnerUnitState(unit, "2026-09-24T00:00:00Z", "learning");
  assert.equal(initial.competence.level, "unassessed");
  assert.equal(initial.competence.evidenceEventIds.length, 0);

  // Attempt transition with competenceScoringAllowed: false (as enforced for disputed items)
  const result = applyLearningTransition(unit, initial, {
    id: "evt-disputed-attempt",
    type: "challenge_attempt",
    mode: "challenge",
    occurredAt: "2026-09-24T01:00:00Z",
    outcome: "pass",
    score: 1.0,
    confidence: 3,
    hintsUsed: [],
    highConfidenceConceptualError: false,
    asset: { bindingId: "bind-mock", kind: "learning_practice", id: disputedAssetId, revision: 1, hash: "mock" },
    response: { selectedOptionIds: ["opt-1"] },
    competenceScoringAllowed: false,
  });

  // Level MUST NOT advance to independent_once
  assert.equal(
    result.state.competence.level,
    "unassessed",
    "Competence level must not advance when competenceScoringAllowed is false"
  );
  // Evidence events MUST NOT include the event ID
  assert.equal(result.state.competence.evidenceEventIds.length, 0);
  // Event must mark competenceEligible = false
  assert.equal(result.event.competenceEligible, false);
});

test("pilot feedback: records locally and persists across migration", () => {
  useAppStore.setState({ ...createInitialState(), hydrated: true, pilotFeedback: [] });

  useAppStore.getState().recordPilotFeedback({
    lessonId: "concept-statistical-unit-v1",
    difficulty: "just_right",
    issueTags: ["没有明显问题"],
    freeText: "概念讲得很透彻，ROI 分层非常清晰",
    lessonCompleted: true,
  });

  const state = useAppStore.getState();
  assert.equal(state.pilotFeedback.length, 1);
  const entry = state.pilotFeedback[0];
  assert.equal(entry.lessonId, "concept-statistical-unit-v1");
  assert.equal(entry.difficulty, "just_right");
  assert.deepEqual(entry.issueTags, ["没有明显问题"]);
  assert.equal(entry.freeText, "概念讲得很透彻，ROI 分层非常清晰");
  assert.equal(entry.lessonCompleted, true);
  assert.ok(entry.timestamp);
  assert.ok(entry.id);

  // Test migration persistence
  const migrated = migratePersistedState(state, createInitialState());
  assert.equal(migrated.pilotFeedback.length, 1);
  assert.equal(migrated.pilotFeedback[0].lessonId, "concept-statistical-unit-v1");
  assert.equal(migrated.pilotFeedback[0].freeText, "概念讲得很透彻，ROI 分层非常清晰");
});

test("pilot reload: resumes lesson progress seamlessly", () => {
  useAppStore.setState({ ...createInitialState(), hydrated: true });

  useAppStore.getState().setLearningContentPhase("concept-statistical-unit-v1", "explain", {
    explainCompleted: true,
  });
  useAppStore.getState().recordExplanationAttempt("concept-statistical-unit-v1");

  const state = useAppStore.getState();
  assert.equal(state.learningContentProgress["concept-statistical-unit-v1"].phase, "explain");
  assert.equal(state.explanationAttempts["concept-statistical-unit-v1"], true);

  // Simulate save and reload
  const migrated = migratePersistedState(state, createInitialState());
  assert.equal(migrated.learningContentProgress["concept-statistical-unit-v1"].phase, "explain");
  assert.equal(migrated.explanationAttempts["concept-statistical-unit-v1"], true);
});

test("pilot reset/new session: resets pilot state without deleting normal user data", () => {
  const initial = createInitialState();
  useAppStore.setState({
    ...initial,
    hydrated: true,
    pilotSessionId: "session-old",
    pilotFeedback: [
      {
        id: "fb-1",
        lessonId: "concept-statistical-unit-v1",
        timestamp: "2026-09-24T00:00:00Z",
        difficulty: "just_right",
        issueTags: ["没有明显问题"],
        freeText: "测试反馈",
        lessonCompleted: true,
      },
    ],
    explanationAttempts: { "concept-statistical-unit-v1": true },
  });

  const papersCountBefore = useAppStore.getState().papers.length;
  const projectsCountBefore = useAppStore.getState().projects.length;
  const knowledgeJsonBefore = JSON.stringify(useAppStore.getState().knowledgeWorkspace);

  // Reset pilot session
  useAppStore.getState().resetPilotSession();

  const stateAfter = useAppStore.getState();
  assert.notEqual(stateAfter.pilotSessionId, "session-old");
  assert.equal(stateAfter.pilotFeedback.length, 0);
  assert.deepEqual(stateAfter.explanationAttempts, {});

  // Normal user data MUST be strictly preserved
  assert.equal(stateAfter.papers.length, papersCountBefore);
  assert.equal(stateAfter.projects.length, projectsCountBefore);
  assert.equal(JSON.stringify(stateAfter.knowledgeWorkspace), knowledgeJsonBefore);
});

test("pilot safety: canonical Knowledge payload unchanged", () => {
  const state = createInitialState();
  const audit = auditKnowledgeWorkspace(state.knowledgeWorkspace);
  assert.equal(audit.ok, true, `Knowledge audit failed: ${audit.errors.join("; ")}`);
  assert.equal(audit.errors.length, 0);
  assert.equal(state.knowledgeWorkspace.units.length, 406);
  assert.equal(state.knowledgeWorkspace.learningBindings.length, 808);
  assert.equal(
    state.knowledgeWorkspace.learningBindings.filter((b) => !b.knowledgeRevisionBindings.length).length,
    0
  );
});
