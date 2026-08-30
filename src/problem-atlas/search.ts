import type { DifficultyLevel, VerificationStatus } from "../domain/types";
import type { KnowledgeStatus, ProblemCard } from "../domain/problemAtlas";

export interface ProblemSearchFilters {
  domain?: string;
  difficulty?: DifficultyLevel;
  verificationStatus?: VerificationStatus;
  knowledgeStatus?: KnowledgeStatus;
}

export interface ProblemSearchHit {
  card: ProblemCard;
  score: number;
  reasons: string[];
}

export interface ProblemSearchResults {
  hits: ProblemSearchHit[];
  suggestions: string[];
  query: string;
}

export function normalizeQuery(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s\p{P}\p{S}]+/gu, "")
    .slice(0, 200);
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  const current = new Array<number>(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j += 1) previous[j] = current[j];
  }
  return previous[b.length]!;
}

function scoreField(query: string, rawField: string, reason: string, weight: number): { score: number; reason?: string } {
  const field = normalizeQuery(rawField);
  if (!field) return { score: 0 };
  if (field === query) return { score: weight, reason: `${reason}（完全匹配）` };
  if (field.includes(query)) return { score: weight * 0.85, reason: `${reason}（包含匹配）` };
  if (query.length >= 3 && field.includes(query.slice(0, Math.max(2, query.length - 1)))) {
    return { score: weight * 0.7, reason: `${reason}（部分匹配）` };
  }
  return { score: 0 };
}

function fuzzyScore(query: string, rawField: string, reason: string): { score: number; reason?: string } {
  const field = normalizeQuery(rawField);
  if (!field || query.length < 3) return { score: 0 };
  const tolerance = query.length <= 4 ? 1 : Math.floor(query.length / 3);
  const window = field.slice(0, query.length + tolerance + 1);
  const distance = levenshtein(query, window);
  if (distance > tolerance) return { score: 0 };
  const ratio = 1 - distance / Math.max(query.length, window.length, 1);
  return { score: 0.4 + 0.3 * ratio, reason: `${reason}（模糊匹配）` };
}

export function matchProblemCard(query: string, card: ProblemCard): { score: number; reasons: string[] } {
  const normalized = normalizeQuery(query);
  if (normalized.length < 2) return { score: 0, reasons: [] };
  const candidates: Array<{ score: number; reason: string }> = [];
  const push = (result: { score: number; reason?: string }, minimum = 0.4) => {
    if (result.score > 0 && result.reason) candidates.push({ score: result.score, reason: result.reason });
  };
  push(scoreField(normalized, card.titleCn, "中文标题", 3), 0);
  push(scoreField(normalized, card.titleEn, "英文标题", 2.9), 0);
  for (const alias of card.aliases) push(scoreField(normalized, alias, "别名", 2.6), 0);
  for (const keyword of card.keywords) push(scoreField(normalized, keyword, "关键词", 1.6), 0);
  push(scoreField(normalized, `${card.domain} ${card.subdomain}`, "领域", 1.2), 0);
  if (candidates.length === 0) {
    for (const field of [card.titleCn, card.titleEn, ...card.aliases, ...card.keywords]) {
      push(fuzzyScore(normalized, field, "文本"), 0);
    }
  }
  if (candidates.length === 0) return { score: 0, reasons: [] };
  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0]!;
  return { score: Number(best.score.toFixed(3)), reasons: candidates.filter((item) => item.score >= best.score * 0.9).map((item) => item.reason) };
}

export function searchProblemCards(
  query: string,
  cards: ProblemCard[],
  filters: ProblemSearchFilters = {},
): ProblemSearchResults {
  const normalized = normalizeQuery(query);
  const hits: ProblemSearchHit[] = [];
  for (const card of cards) {
    if (filters.domain && card.domain !== filters.domain) continue;
    if (filters.difficulty && card.difficulty !== filters.difficulty) continue;
    if (filters.verificationStatus && card.verificationStatus !== filters.verificationStatus) continue;
    if (filters.knowledgeStatus && card.knowledgeStatus !== filters.knowledgeStatus) continue;
    const match = matchProblemCard(normalized, card);
    if (match.score > 0) hits.push({ card, score: match.score, reasons: match.reasons });
  }
  hits.sort((a, b) => b.score - a.score || a.card.id.localeCompare(b.card.id));
  const suggestions = relatedConceptSuggestions(normalized, cards, hits);
  return { hits, suggestions, query: normalized };
}

export function relatedConceptSuggestions(query: string, cards: ProblemCard[], hits: ProblemSearchHit[] = [], limit = 4): string[] {
  const seen = new Set<string>();
  const suggestions: string[] = [];
  const push = (value: string) => {
    const normalized = value.trim();
    if (normalized.length < 2 || seen.has(normalized)) return;
    seen.add(normalized);
    suggestions.push(normalized);
  };
  for (const hit of hits) {
    for (const keyword of hit.card.keywords) push(keyword);
    for (const alias of hit.card.aliases) push(alias);
  }
  if (suggestions.length < limit) {
    const normalized = normalizeQuery(query);
    for (const card of cards) {
      for (const keyword of card.keywords) {
        if (normalizeQuery(keyword).includes(normalized) || normalized.includes(normalizeQuery(keyword).slice(0, 4))) push(keyword);
      }
    }
  }
  if (suggestions.length === 0) for (const card of cards.slice(0, 4)) push(card.domain);
  return suggestions.slice(0, limit);
}

export function problemDomains(cards: ProblemCard[]): string[] {
  return [...new Set(cards.map((card) => card.domain))].sort();
}
