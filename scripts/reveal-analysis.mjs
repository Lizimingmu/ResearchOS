import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { stagedAssessmentAssets } from "./strict-blind-public-representation.mjs";

const frozenPath = path.resolve("reviews/M019_1C_FRESH_EXTERNAL_BLIND_FROZEN.json");
const frozen = JSON.parse(await readFile(frozenPath, "utf8"));

const results = [];
let agreeCount = 0;
let disagreeCount = 0;
let ambiguousCount = 0;

for (let i = 0; i < stagedAssessmentAssets.length; i++) {
  const asset = stagedAssessmentAssets[i];
  const aid = `A${String(i + 1).padStart(3, "0")}`;
  const record = frozen.records.find((r) => r.anonymousAssessmentId === aid);
  
  const authorOpts = asset.options.flatMap((opt, optIndex) =>
    asset.expectedOptionIds.includes(opt.id) ? [`O${optIndex + 1}`] : []
  );
  
  const reviewerOpts = record ? record.selectedOptionIds : [];
  const reviewerVerdict = record ? record.verdict : "MISSING";
  const noteCn = record ? record.noteCn : "";
  
  const authorKeyStr = authorOpts.sort().join(",");
  const reviewerKeyStr = reviewerOpts.sort().join(",");
  const keyMatches = authorKeyStr === reviewerKeyStr;
  
  let status = "";
  if (reviewerVerdict === "AMBIGUOUS") {
    ambiguousCount++;
    status = "AMBIGUOUS";
  } else if (keyMatches) {
    agreeCount++;
    status = "AGREE";
  } else {
    disagreeCount++;
    status = "DISAGREE";
  }
  
  results.push({
    aid,
    assetId: asset.id,
    authorOpts,
    reviewerOpts,
    reviewerVerdict,
    keyMatches,
    status,
    noteCn
  });
}

console.log("=== FRESH EXTERNAL BLIND REVIEW REVEAL ANALYSIS ===");
console.log(`Total items: ${stagedAssessmentAssets.length}`);
console.log(`AGREE (CLEAR + Key Match): ${agreeCount}`);
console.log(`DISAGREE (CLEAR + Key Mismatch): ${disagreeCount}`);
console.log(`AMBIGUOUS (Flagged unsolvable): ${ambiguousCount}`);

if (disagreeCount > 0) {
  console.log("\n--- DISAGREEMENTS ---");
  for (const r of results.filter((x) => x.status === "DISAGREE")) {
    console.log(`${r.aid} (${r.assetId}): Reviewer=[${r.reviewerOpts}] Author=[${r.authorOpts}]`);
  }
}

console.log("\n--- SAMPLE OF AMBIGUOUS ITEMS (Author Key Reveal) ---");
for (const r of results.filter((x) => x.status === "AMBIGUOUS").slice(0, 15)) {
  console.log(`${r.aid} (${r.assetId}): Author=[${r.authorOpts}] Reviewer=[${r.reviewerOpts}] Note: ${r.noteCn}`);
}

await writeFile(
  path.resolve("artifacts/m019-1c-fresh-blind-reveal-results.json"),
  JSON.stringify({ agreeCount, disagreeCount, ambiguousCount, results }, null, 2),
  "utf8"
);
console.log("\nSaved detailed results to artifacts/m019-1c-fresh-blind-reveal-results.json");
