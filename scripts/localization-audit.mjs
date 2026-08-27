import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { methodConcepts } from "../.build/data/methods.js";
import { bilingualMethodTitle, researchTerms } from "../.build/i18n/researchTerms.js";
import { supportedLocales, t } from "../.build/i18n/index.js";

const root = path.resolve(import.meta.dirname, "..");
const errors = [];
const warnings = [];
const checks = [];
const check = (name, passed, detail) => { checks.push({ name, passed: Boolean(passed), detail }); if (!passed) errors.push(`${name}: ${detail}`); };
const hasChinese = (value) => /[\u3400-\u9fff]/u.test(value);

check("default locale", t(undefined, "nav.today") === "今日学习", t(undefined, "nav.today"));
check("supported locales", supportedLocales.some((x) => x.value === "zh-CN") && supportedLocales.some((x) => x.value === "en-US"), supportedLocales.map((x) => x.value).join(", "));
const navigationKeys = ["nav.today", "nav.library", "nav.paperLab", "nav.methodLab", "nav.problemAtlas", "nav.review", "nav.aiAudit", "nav.frontier", "nav.projects", "nav.skillMap", "nav.assessment", "nav.settings"];
check("Chinese navigation", navigationKeys.every((key) => hasChinese(t("zh-CN", key))), navigationKeys.map((key) => t("zh-CN", key)).join(" / "));
check("English fallback", navigationKeys.every((key) => /[A-Za-z]/.test(t("en-US", key))), navigationKeys.map((key) => t("en-US", key)).join(" / "));

const localizedTitles = methodConcepts.map((item) => bilingualMethodTitle(item.id, item.title));
const missingMethodTitles = methodConcepts.filter((item, index) => !hasChinese(localizedTitles[index])).map((item) => item.id);
check("Method Lab bilingual titles", missingMethodTitles.length === 0, missingMethodTitles.length ? `missing: ${missingMethodTitles.join(", ")}` : `${localizedTitles.length}/${methodConcepts.length} localized`);

const invalidTerms = Object.entries(researchTerms).filter(([, item]) => !item.english || !item.chinese || !item.preferred || !item.definition || !item.domain);
check("terminology fields complete", invalidTerms.length === 0, invalidTerms.map(([id]) => id).join(", ") || `${Object.keys(researchTerms).length} complete terms`);
const duplicateChinese = Object.values(researchTerms).map((item) => item.chinese).filter((item, index, all) => all.indexOf(item) !== index);
check("terminology Chinese names unique", duplicateChinese.length === 0, duplicateChinese.join(", ") || "no duplicates");

const uiFiles = [
  "src/components/AppShell.tsx", "src/components/AttemptFlow.tsx", "src/components/CommandPalette.tsx", "src/components/Onboarding.tsx",
  "src/components/Tutorial.tsx",
  "src/features/today/TodayView.tsx", "src/features/library/LibraryView.tsx", "src/features/paper-lab/PaperLabView.tsx",
  "src/features/methods/MethodLabView.tsx", "src/features/review/ReviewView.tsx", "src/features/ai-audit/AuditView.tsx",
  "src/features/frontier/FrontierView.tsx", "src/features/projects/ProjectsView.tsx", "src/features/skills/SkillMapView.tsx",
  "src/features/assessment/AssessmentView.tsx", "src/features/settings/SettingsView.tsx",
  "src/features/problem-atlas/ProblemAtlasView.tsx", "src/features/problem-atlas/DiagnosticSessionView.tsx",
  "src/features/learning/LearningView.tsx", "src/features/content-studio/ContentStudioView.tsx", "src/features/content-studio/AiContentExchangePanel.tsx",
];
const forbidden = ["Start today", "Open paper", "Add project", "Go to review", "No command matches", "Lock answer", "Save transfer", "No PDF attached", "Retry startup", "Import PDF", "Test connection", "Reset local learning data"];
for (const file of uiFiles) {
  const source = await readFile(path.join(root, file), "utf8");
  for (const phrase of forbidden) if (source.includes(phrase)) errors.push(`${file}: unexpected English-only UI phrase “${phrase}”`);
}
check("English-only UI denylist", !errors.some((item) => item.includes("English-only UI phrase")), `${forbidden.length} forbidden phrases scanned across ${uiFiles.length} core pages`);

const css = await readFile(path.join(root, "src/styles/app.css"), "utf8");
check("Chinese system font stack", css.includes('"Microsoft YaHei UI"') && css.includes('"Microsoft YaHei"'), "Microsoft YaHei UI / Microsoft YaHei");
check("150% and 200% DPI rules", css.includes("min-resolution: 1.5dppx") && css.includes("min-resolution: 2dppx"), "DPI media queries present");
check("Chinese uppercase override", css.includes('[lang="zh-CN"] .eyebrow'), "zh-CN text-transform override present");

const report = { generatedAt: new Date().toISOString(), locale: "zh-CN", uiCoverageTarget: ">=95%", checks, errors, warnings };
await mkdir(path.join(root, "artifacts"), { recursive: true });
await writeFile(path.join(root, "artifacts/localization-audit.json"), `${JSON.stringify(report, null, 2)}\n`);
if (errors.length) { console.error(`Localization audit FAILED: ${errors.length} error(s).`); for (const error of errors) console.error(`- ${error}`); process.exit(1); }
console.log(`Localization audit PASSED: ${checks.length} checks; ${localizedTitles.length}/${methodConcepts.length} bilingual method titles.`);
