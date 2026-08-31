import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { authoredGuideContent } from "../.build/data/self-rescue-guide/content/index.js";
import { selfRescueGuideSections } from "../.build/data/self-rescue-guide/index.js";

const normalize = (value) => value.toLowerCase().replace(/[\s，。；：、“”‘’（）()\[\]【】\-—_/|0-9]/g, "");
const grams = (value, n = 4) => {
  const text = normalize(value);
  const result = new Set();
  for (let index = 0; index <= text.length - n; index += 1) result.add(text.slice(index, index + n));
  return result;
};
const dice = (left, right) => {
  const a = grams(left); const b = grams(right);
  if (!a.size || !b.size) return 0;
  let overlap = 0; for (const token of a) if (b.has(token)) overlap += 1;
  return (2 * overlap) / (a.size + b.size);
};
const renderedBodyByTopic = new Map(selfRescueGuideSections.map((section) => [`${section.chapterId}::${section.titleEn}`, section.bodyCn.join("\n")]));
const topicLabel = (item) => `${item.moduleId}::${item.titleEn}`;
const fields = (item) => ({
  whyItMatters: item.whyItMattersCn,
  intuition: item.intuitionCn,
  preciseExplanation: item.preciseExplanationCn.join(""),
  misconception: item.misconceptionCn.join(""),
  boundary: item.boundaryCn.join(""),
  example: JSON.stringify(item.biomedicalExample),
  fullRenderedBody: renderedBodyByTopic.get(topicLabel(item)) ?? "",
});
const exact = [];
const normalized = [];
const highSimilarity = [];
const repeatedPrefix = [];
const seenExact = new Map();
const seenNormalized = new Map();
const seenPrefix = new Map();

for (const item of authoredGuideContent) {
  for (const [field, text] of Object.entries(fields(item))) {
    const exactKey = `${field}:${text}`;
    const normKey = `${field}:${normalize(text)}`;
    const prefixKey = `${field}:${normalize(text).slice(0, 32)}`;
    if (seenExact.has(exactKey)) exact.push([seenExact.get(exactKey), topicLabel(item), field]); else seenExact.set(exactKey, topicLabel(item));
    if (seenNormalized.has(normKey)) normalized.push([seenNormalized.get(normKey), topicLabel(item), field]); else seenNormalized.set(normKey, topicLabel(item));
    if (prefixKey.length > field.length + 20 && seenPrefix.has(prefixKey)) repeatedPrefix.push([seenPrefix.get(prefixKey), topicLabel(item), field]); else seenPrefix.set(prefixKey, topicLabel(item));
  }
}

for (let left = 0; left < authoredGuideContent.length; left += 1) {
  for (let right = left + 1; right < authoredGuideContent.length; right += 1) {
    const a = authoredGuideContent[left]; const b = authoredGuideContent[right];
    for (const field of ["whyItMatters", "intuition", "preciseExplanation", "misconception", "boundary", "example", "fullRenderedBody"]) {
      const score = dice(fields(a)[field], fields(b)[field]);
      if (score >= 0.82) highSimilarity.push({ left: topicLabel(a), right: topicLabel(b), field, score: Number(score.toFixed(3)) });
    }
  }
}

const errors = [
  ...exact.map(([a, b, field]) => `exact duplicate ${field}: ${a} <> ${b}`),
  ...normalized.map(([a, b, field]) => `normalized duplicate ${field}: ${a} <> ${b}`),
  ...highSimilarity.map((flag) => `high similarity ${flag.field} ${flag.score}: ${flag.left} <> ${flag.right}`),
];
const tierLengths = Object.fromEntries(["tier1", "tier2", "tier3"].map((tier) => {
  const lengths = authoredGuideContent.filter((item) => item.tier === tier).map((item) => JSON.stringify(item).length);
  const mean = lengths.reduce((sum, value) => sum + value, 0) / Math.max(1, lengths.length);
  const sd = Math.sqrt(lengths.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / Math.max(1, lengths.length));
  return [tier, { count: lengths.length, min: Math.min(...lengths), max: Math.max(...lengths), coefficientOfVariation: Number((sd / mean).toFixed(3)) }];
}));
for (const [tier, stats] of Object.entries(tierLengths)) if (stats.count > 5 && stats.coefficientOfVariation < 0.06) errors.push(`${tier} lengths are suspiciously uniform (CV ${stats.coefficientOfVariation})`);

const report = { schemaVersion: 1, status: errors.length ? "FAIL" : "PASS", counts: { exact: exact.length, normalized: normalized.length, highSimilarity: highSimilarity.length, repeatedPrefix: repeatedPrefix.length }, tierLengths, repeatedPrefix, highSimilarity, errors };
await mkdir(path.resolve("artifacts"), { recursive: true });
await writeFile(path.resolve("artifacts/guide-template-audit.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(`Guide template audit: ${report.status} (exact ${exact.length}, normalized ${normalized.length}, high-similarity ${highSimilarity.length}, prefix flags ${repeatedPrefix.length})`);
for (const error of errors) console.error(`FAIL ${error}`);
if (errors.length) process.exitCode = 1;
