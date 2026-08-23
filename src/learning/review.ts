import type { Confidence, ReviewItem } from "../domain/types";

const DAY = 86_400_000;
const clamp = (value: number, minimum: number, maximum: number) => Math.min(maximum, Math.max(minimum, value));

export interface ReviewOutcome {
  item: ReviewItem;
  nextDue: string;
  intervalDays: number;
  quality: "correct-high" | "correct-low" | "wrong-high" | "wrong-low";
}

/**
 * FSRS-compatible scheduling boundary. The state fields and output shape match
 * the information FSRS needs, while v0.9 uses a deterministic offline fallback.
 * A mature FSRS package can replace this function without migrating stored data.
 */
export function scheduleReview(
  current: ReviewItem,
  correctness: number,
  confidence: Confidence,
  reviewedAt = new Date(),
): ReviewOutcome {
  const correct = correctness >= 0.75;
  const highConfidence = confidence >= 3;
  const quality = correct
    ? (highConfidence ? "correct-high" : "correct-low")
    : (highConfidence ? "wrong-high" : "wrong-low");
  const difficultyDelta = correct ? (highConfidence ? -0.35 : -0.1) : (highConfidence ? 1.4 : 0.75);
  const difficulty = clamp(current.difficulty + difficultyDelta, 1, 10);
  let stability: number;
  let intervalDays: number;

  if (correct) {
    const confidenceFactor = highConfidence ? 1.18 : 0.88;
    stability = clamp(current.stability * (1.55 + (10 - difficulty) / 20) * confidenceFactor, 0.4, 3650);
    intervalDays = Math.max(2, Math.round(stability * (highConfidence ? 1.2 : 0.75)));
  } else {
    stability = clamp(current.stability * (highConfidence ? 0.28 : 0.42), 0.4, 3650);
    intervalDays = highConfidence ? 1 : 2;
  }

  const nextDueDate = new Date(reviewedAt.getTime() + intervalDays * DAY);
  const retrievability = clamp(Math.exp(-intervalDays / Math.max(stability, 0.4)), 0, 1);
  const item: ReviewItem = {
    ...current,
    difficulty,
    stability,
    retrievability,
    due: nextDueDate.toISOString(),
    lastReview: reviewedAt.toISOString(),
    lapses: current.lapses + (correct ? 0 : 1),
    lastResponseQuality: correctness,
    lastConfidence: confidence,
    dangerousMisconception: !correct && highConfidence,
  };
  return { item, nextDue: item.due, intervalDays, quality };
}

export function isReviewDue(item: ReviewItem, now = new Date()): boolean {
  return new Date(item.due).getTime() <= now.getTime();
}

export function createReviewItem(id: string, conceptId: string, conceptType: ReviewItem["conceptType"], prompt: string, now = new Date()): ReviewItem {
  return {
    id,
    conceptId,
    conceptType,
    prompt,
    difficulty: 5,
    stability: 1,
    retrievability: 1,
    due: now.toISOString(),
    lapses: 0,
    dangerousMisconception: false,
  };
}

