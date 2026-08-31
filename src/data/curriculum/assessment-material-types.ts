import type { AssessmentTaskContract, StagedAssessmentAssetV1 } from "../../domain/curriculum";

export type AssessmentActionKey = "decision" | "key_check" | "boundary" | "change_mind";

export interface MaterializedAssessmentRole {
  diseaseAreaCn: string;
  studyDesignCn: string;
  dataModalityCn: string;
  scenarioCn: string;
  stimulusFormat: StagedAssessmentAssetV1["stimulus"]["format"];
  factsCn: [string, string, string, ...string[]];
  decisionCn: string;
  keyCheckCn: string;
  maximumBoundaryCn: string;
  changeMindCn: string;
  requiredActionKeys: AssessmentActionKey[];
  evidenceFactIndexByAction: Record<AssessmentActionKey, number>;
  evidenceFactIndicesByAction?: Partial<Record<AssessmentActionKey, number[]>>;
  taskContract?: AssessmentTaskContract;
  plausibleDistractorsCn: [
    { labelCn: string; whyWrongCn: string; whenMayHoldCn: string },
    { labelCn: string; whyWrongCn: string; whenMayHoldCn: string },
  ];
  representationPurposeCn: string;
}

export interface MaterializedLessonAssessments {
  apply: MaterializedAssessmentRole;
  remediation: MaterializedAssessmentRole;
  review: MaterializedAssessmentRole;
}

export type AssessmentRole = StagedAssessmentAssetV1["role"];
