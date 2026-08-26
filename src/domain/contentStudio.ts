import type { ContentOrigin, VerificationStatus } from "./types";

export type ContentKind =
  | "evidence-source"
  | "evidence-claim"
  | "method"
  | "pattern"
  | "judgment-card"
  | "audit-case"
  | "problem-card";

export type ContentLifecycle = "draft" | "pending_review" | "active" | "archived" | "deprecated" | "superseded";
export type ScientificRisk = "LOW" | "MEDIUM" | "HIGH";
export type ContentOwner = "builtin" | "personal" | "overlay";

export interface PortableContentRecord {
  key: string;
  id: string;
  kind: ContentKind;
  title: string;
  owner: ContentOwner;
  revision: number;
  hash: string;
  contentOrigin: ContentOrigin;
  verificationStatus: VerificationStatus;
  risk: ScientificRisk;
  dependencyKeys: string[];
  payload: Record<string, unknown>;
}

export interface PersonalContentEntry {
  id: string;
  kind: ContentKind;
  title: string;
  lifecycle: ContentLifecycle;
  activeForLearning: boolean;
  revision: number;
  hash: string;
  baseKey?: string;
  baseRevision?: number;
  baseHash?: string;
  contentOrigin: "user" | "ai_generated";
  verificationStatus: VerificationStatus;
  risk: ScientificRisk;
  dependencyKeys: string[];
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ContentRevisionRecord {
  id: string;
  contentId: string;
  revision: number;
  hash: string;
  lifecycle: ContentLifecycle;
  payload: Record<string, unknown>;
  reason: string;
  reviewer?: string;
  createdAt: string;
  supersedesRevision?: number;
}

export interface ContentConflict {
  id: string;
  contentId: string;
  kind: "base_update" | "stale_patch" | "obsidian_managed_edit" | "path_collision";
  expectedHash?: string;
  actualHash?: string;
  detail: string;
  status: "open" | "resolved";
  createdAt: string;
  resolvedAt?: string;
}

export interface ContentPatchPack {
  patchSchemaVersion: 1;
  patchId: string;
  targetId: string;
  targetKind: ContentKind;
  baseRevision: number;
  baseHash: string;
  changes: Record<string, unknown>;
  reason: string;
  reviewer?: string;
  evidenceChanges?: string[];
  proposedLifecycle: Exclude<ContentLifecycle, "active"> | "active";
  proposedVerificationStatus: VerificationStatus;
  createdAt: string;
}

export interface ContentFieldDiff {
  field: string;
  before: unknown;
  after: unknown;
}

export interface ContentPatchPreview {
  valid: boolean;
  stale: boolean;
  errors: string[];
  targetId: string;
  currentRevision?: number;
  nextRevision?: number;
  fieldDiffs: ContentFieldDiff[];
  affectedDependencyKeys: string[];
}

export interface ReviewPack {
  manifest: {
    schemaVersion: 1;
    batchId: string;
    createdAt: string;
    selectedKeys: string[];
    includedKeys: string[];
    hashes: Record<string, string>;
  };
  content: PortableContentRecord[];
  dependencies: Record<string, string[]>;
  reviewCopy: string;
  scientificChangeset: string;
}

export interface ObsidianConnectionSettings {
  vaultRoot: string;
  dedicatedSubfolder: string;
  validatedAt?: string;
}

export interface ObsidianPublishItem {
  contentId: string;
  contentKind: ContentKind;
  revision: number;
  hash: string;
  title: string;
  relativePath: string;
  markdown: string;
}

export interface ObsidianPublishBatch {
  id: string;
  status: "draft" | "previewed" | "confirmed" | "applied" | "cancelled" | "conflict";
  items: ObsidianPublishItem[];
  confirmationToken?: string;
  createdAt: string;
  previewedAt?: string;
  appliedAt?: string;
}
