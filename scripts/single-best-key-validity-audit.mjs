import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { stagedConceptLessons, stagedMethodLessons } from "../.build/data/curriculum/index.js";
import { assessmentValidityOverrides, m0191cFlaggedLogicalIds, singleBestKeyManifest } from "../.build/data/curriculum/assessment-validity-adjudication.js";

const assets=[...stagedConceptLessons,...stagedMethodLessons].flatMap(l=>[l.primaryApply,l.remediation,l.delayedReview]);
const singleContracts=new Set(["classification","claim_rewrite","error_localization","choose_next_evidence"]);
const errors=[],results=[],byContract=new Map();
for(const asset of assets){
  const logicalId=asset.id.replace(/-v[23]$/,"");
  const flagged=m0191cFlaggedLogicalIds.has(logicalId);
  if(flagged!==asset.id.endsWith("-v3"))errors.push(`${asset.id}: version does not match frozen flagged set`);
  if(!singleContracts.has(asset.taskContract))continue;
  const decision=singleBestKeyManifest[logicalId];
  if(!decision){errors.push(`${asset.id}: missing item-specific key`);continue;}
  if(asset.expectedOptionIds.length!==1||!asset.expectedOptionIds[0].endsWith(`-${decision.expectedActionKey}`))errors.push(`${asset.id}: materialized key differs from manifest`);
  if(asset.id.endsWith("-v3")&&!asset.materialization.authorRationaleCn.some(x=>x.includes("item-specific key manifest")))errors.push(`${asset.id}: revised key missing rationale trace`);
  const keys=byContract.get(asset.taskContract)??new Set();keys.add(decision.expectedActionKey);byContract.set(asset.taskContract,keys);
  results.push({assessmentId:asset.id,logicalId,taskContract:asset.taskContract,expectedActionKey:decision.expectedActionKey,basis:decision.basis});
}
if(assets.length!==183)errors.push(`expected 183 assessments, got ${assets.length}`);
if(Object.keys(singleBestKeyManifest).length!==109)errors.push(`expected 109 single-best manifest entries, got ${Object.keys(singleBestKeyManifest).length}`);
if(m0191cFlaggedLogicalIds.size!==74)errors.push(`expected 74 externally flagged items, got ${m0191cFlaggedLogicalIds.size}`);
if(Object.keys(assessmentValidityOverrides).length!==21)errors.push(`expected 21 ambiguity repairs, got ${Object.keys(assessmentValidityOverrides).length}`);
for(const [contract,keys] of byContract)if(keys.size<2)errors.push(`${contract}: answer key still collapses to one semantic slot`);
const report={schemaVersion:1,status:errors.length?"FAIL":"PASS",counts:{assessments:assets.length,singleBest:results.length,flaggedV3:assets.filter(a=>a.id.endsWith("-v3")).length,ambiguityRepairs:Object.keys(assessmentValidityOverrides).length},byContract:Object.fromEntries([...byContract].map(([k,v])=>[k,[...v].sort()])),results,errors};
await mkdir(path.resolve("artifacts"),{recursive:true});
await writeFile(path.resolve("artifacts/m019-1c-single-best-key-validity-audit.json"),JSON.stringify(report,null,2)+"\n");
console.log(`M019.1c single-best key validity: ${report.status} (single-best ${report.counts.singleBest}, v3 ${report.counts.flaggedV3})`);
for(const e of errors)console.error("FAIL "+e);
if(errors.length)process.exitCode=1;
