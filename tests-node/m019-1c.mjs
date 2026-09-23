import assert from "node:assert/strict";
import { test } from "node:test";
import { stagedConceptLessons, stagedMethodLessons } from "../.build/data/curriculum/index.js";
import { assessmentValidityOverrides, m0191cFlaggedLogicalIds, singleBestKeyManifest } from "../.build/data/curriculum/assessment-validity-adjudication.js";
import { createInitialKnowledgeWorkspace, createM0201KnowledgeBaseline } from "../.build/data/knowledge.js";
import { createInitialState } from "../.build/state/store.js";
import { migratePersistedState, CURRENT_STATE_SCHEMA } from "../.build/state/migrations.js";
import { knowledgeHash, proposeKnowledgeChange, applyKnowledgeChange, resolveHistoricalKnowledgeBinding } from "../.build/services/knowledge.js";
const assets=[...stagedConceptLessons,...stagedMethodLessons].flatMap(l=>[l.primaryApply,l.remediation,l.delayedReview]);
const single=new Set(["classification","claim_rewrite","error_localization","choose_next_evidence"]);
test("M019.1c versions exactly 74 externally flagged items to v3",()=>{assert.equal(assets.length,183);assert.equal(m0191cFlaggedLogicalIds.size,74);assert.equal(assets.filter(a=>a.id.endsWith("-v3")).length,74);});
test("M019.1c single-best keys are item-specific",()=>{assert.equal(Object.keys(singleBestKeyManifest).length,109);assert.equal(Object.keys(assessmentValidityOverrides).length,21);const by=new Map();for(const a of assets.filter(x=>single.has(x.taskContract))){const d=singleBestKeyManifest[a.id.replace(/-v[23]$/,"")];assert.ok(d,a.id);assert.equal(a.expectedOptionIds.length,1);assert.ok(a.expectedOptionIds[0].endsWith("-"+d.expectedActionKey),a.id);const s=by.get(a.taskContract)??new Set();s.add(d.expectedActionKey);by.set(a.taskContract,s);}for(const [c,s] of by)assert.ok(s.size>=2,`${c} still has a fixed answer slot`);});
test("M019.1c preserves canonical science and appends pedagogical bindings",()=>{const before=createM0201KnowledgeBaseline(),after=createInitialKnowledgeWorkspace();assert.deepEqual(after.units,before.units);assert.deepEqual(after.sources,before.sources);assert.deepEqual(after.claims,before.claims);assert.deepEqual(after.learningBindings.slice(0,before.learningBindings.length),before.learningBindings);assert.ok(after.learningBindings.length>before.learningBindings.length);assert.ok(after.learningBindings.slice(before.learningBindings.length).every(b=>!b.legacyActive));});
test("M019.1c schema 9 upgrade preserves learning history",()=>{const defaults=createInitialState(),baseline=createM0201KnowledgeBaseline();const raw={...defaults,schemaVersion:9,knowledgeWorkspace:baseline,learningEvents:[{id:"keep-event"}],reviewLogs:[{id:"keep-review"}],assessmentHistory:[{id:"keep-assessment"}]};const frozen=JSON.stringify(raw),m=migratePersistedState(raw,defaults);assert.equal(JSON.stringify(raw),frozen);assert.equal(m.schemaVersion,CURRENT_STATE_SCHEMA);assert.deepEqual(m.learningEvents,raw.learningEvents);assert.deepEqual(m.reviewLogs,raw.reviewLogs);assert.deepEqual(m.assessmentHistory,raw.assessmentHistory);assert.deepEqual(m.knowledgeWorkspace.units,baseline.units);assert.ok(m.knowledgeWorkspace.learningBindings.length>baseline.learningBindings.length);});

test("M019.1c canonical bytes match the independently rebuilt bc70840 baseline", () => {
  const workspace = createInitialKnowledgeWorkspace();
  const hashes = {units:"sha256:eb52ca3202cc93112217359235f27427083ca8f4b02d5a374943548cf2c6b107",sources:"sha256:d65ee4e5e908b0a202867b45309df13c9848867592308bd117624f0440eb3acd",claims:"sha256:248744786ad8271fdc610a2fb555120967e41fea0c79603e87d8d8a039d85a3d"};
  for (const [collection,hash] of Object.entries(hashes)) assert.equal(knowledgeHash(workspace[collection]),hash);
});

test("M019.1c all one-choice items use manifest keys, including integrated judgments", () => {
  const oneChoice=assets.filter(asset=>asset.expectedOptionIds.length===1);
  assert.equal(oneChoice.length,108);
  for(const asset of oneChoice) {
    const decision=singleBestKeyManifest[asset.id.replace(/-v[23]$/,'')];
    assert.ok(decision,asset.id);
    assert.equal(asset.expectedOptionIds[0],asset.id.replace(/-v[23]$/,'')+'-'+decision.expectedActionKey);
    assert.ok(asset.options.some(option=>option.id===asset.expectedOptionIds[0]));
    if(asset.id.endsWith('-v3'))assert.ok(asset.materialization.authorRationaleCn.some(text=>text.includes('item-specific key manifest')));
  }
});

test("M019.1c migration inherits existing holds, preserves history and rejects missing receipts", () => {
  const defaults=createInitialState(), baseline=createM0201KnowledgeBaseline();
  const unit=baseline.units.find(u=>u.id==='staged-concept-research-question');
  const now='2026-09-23T00:00:00Z';
  const candidate=proposeKnowledgeChange(baseline,{id:'m0191c-existing-update',operation:'revise',target:{knowledgeUnitId:unit.id,revision:unit.revision,hash:unit.hash},unit,now,reason:'existing maintenance fixture'});
  const applied=applyKnowledgeChange(baseline,candidate,{reviewer:'fixture',now});
  assert.equal(applied.ok,true,applied.errors.join('\n'));
  const raw={...defaults,schemaVersion:9,knowledgeWorkspace:applied.workspace,learningEvents:[{id:'event',unitHash:'historical'}],reviewLogs:[{id:'review'}],assessmentHistory:[{id:'assessment'}],learnerUnitStates:[{unitId:'historical',competence:{level:'retained'}}]};
  const frozen=JSON.stringify(raw), migrated=migratePersistedState(raw,defaults);
  assert.equal(JSON.stringify(raw),frozen);
  for(const key of ['learningEvents','reviewLogs','assessmentHistory','learnerUnitStates']) assert.deepEqual(migrated[key],raw[key]);
  for(const key of ['units','sources','claims','candidates','ledger']) assert.deepEqual(migrated.knowledgeWorkspace[key],applied.workspace[key]);
  assert.deepEqual(migrated.knowledgeWorkspace.holds.slice(0,applied.workspace.holds.length),applied.workspace.holds);
  assert.ok(migrated.knowledgeWorkspace.holds.some(h=>h.assetId==='staged-concept-research-question-apply-v3'));
  assert.equal(JSON.stringify(migratePersistedState(JSON.parse(JSON.stringify(migrated)),defaults)),JSON.stringify(migrated));
  for(const binding of baseline.learningBindings) assert.equal(resolveHistoricalKnowledgeBinding(migrated.knowledgeWorkspace,binding.assetId,binding.assetRevision,binding.assetHash).status,'RESOLVED');
  for(const mutate of [w=>{w.holds=[];},w=>{w.ledger=[];},w=>{w.units[0].title='tampered';}]) {
    const bad=structuredClone(raw);mutate(bad.knowledgeWorkspace);
    assert.throws(()=>migratePersistedState(bad,defaults),/数据库未被修改/);
  }
  assert.throws(()=>migratePersistedState({...raw,knowledgeWorkspace:{schemaVersion:1}},defaults),/数据库未被修改/);
});
