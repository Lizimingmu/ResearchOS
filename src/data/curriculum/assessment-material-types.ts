import type { StagedAssessmentAssetV1 } from "../../domain/curriculum";

export interface MaterializedAssessmentRole {
  diseaseAreaCn: string;
  studyDesignCn: string;
  dataModalityCn: string;
  scenarioCn: string;
  stimulusFormat: StagedAssessmentAssetV1["stimulus"]["format"];
  factsCn: [string, string, string, string];
  decisionCn: string;
  keyCheckCn: string;
  maximumBoundaryCn: string;
  changeMindCn: string;
  requiredActionKeys: Array<"decision" | "key_check" | "boundary" | "change_mind">;
  evidenceFactIndexByAction: Record<"decision" | "key_check" | "boundary" | "change_mind", 0 | 1 | 2 | 3>;
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
