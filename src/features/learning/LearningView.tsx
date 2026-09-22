import { ArrowLeft, ArrowRight, BookOpen, FastForward, X } from "lucide-react";
import { useMemo, useState } from "react";
import { ThinkBeforeAi } from "../../components/ThinkBeforeAi";
import { bindingByUnitRole, learningUnits, practiceAssetById, prerequisiteEdges } from "../../data/learningUnits";
import type { LearningEventAssetRef, PracticeRole } from "../../domain/learningKernel";
import { projectSkillMap } from "../../domain/learningKernel";
import { canStartUnit } from "../../learning/learningKernelEngine";
import { useAppStore } from "../../state/store";
import { isKnowledgeLearningAllowed } from "../../services/knowledge";
import { KnowledgeMaintenanceNotice } from "../../components/KnowledgeMaintenanceNotice";
import { LearningShell } from "./LearningShell";
import { PracticeActivity } from "./PracticeActivity";
import { coreLessonSteps, defaultStepForStage, stepsForLearner } from "./lessonFlow";
import { LearningArchitectureView } from "./LearningArchitectureView";

export function LearningView() {
  const [legacyOpen,setLegacyOpen]=useState(false);
  const knowledgeWorkspace=useAppStore((s)=>s.knowledgeWorkspace);
  const selectedId=useAppStore((s)=>s.selectedLearningUnitId), states=useAppStore((s)=>s.learnerUnitStates), pausedIds=useAppStore((s)=>s.pausedLearningUnitIds), progress=useAppStore((s)=>s.lessonProgressByUnitId[selectedId]), projects=useAppStore((s)=>s.projects);
  const start=useAppStore((s)=>s.startLearningUnit),record=useAppStore((s)=>s.recordLearningTransition),setStep=useAppStore((s)=>s.setLessonStep),togglePause=useAppStore((s)=>s.toggleLearningUnitPaused),notify=useAppStore((s)=>s.notify);
  const [mapOpen,setMapOpen]=useState(false),[thinking,setThinking]=useState(false),[feedbackRole,setFeedbackRole]=useState<PracticeRole>(),[attemptRevision,setAttemptRevision]=useState(0); const unit=learningUnits.find((x)=>x.id===selectedId)??learningUnits[0], learner=states.find((x)=>x.unitId===unit.id), steps=stepsForLearner(learner,feedbackRole), desired=progress?.currentStepId??defaultStepForStage(learner), currentIndex=Math.max(0,steps.findIndex((x)=>x.id===desired)), step=steps[currentIndex]??steps[0];
  const blocks=useMemo(()=>unit.blocks.filter((b)=>step.blockKinds?.includes(b.kind)),[unit,step]),gate=canStartUnit({unitId:unit.id,states,edges:prerequisiteEdges,pausedUnitIds:new Set(pausedIds)}),projection=projectSkillMap(unit,learner),due=learner?.dueAt?Date.parse(learner.dueAt)<=Date.now():true;
  const advanceInstruction=()=>{for(const block of blocks)if(!useAppStore.getState().learnerUnitStates.find((x)=>x.unitId===unit.id)?.instruction.completedBlockIds.includes(block.id))record(unit.id,{type:"instruction_block_completed",mode:"learning",blockId:block.id,hintsUsed:[]});const next=steps[Math.min(currentIndex+1,steps.length-1)];setStep(unit.id,next.id,step.id);};
  const continueAfterFeedback=(role:PracticeRole,passed:boolean)=>{setFeedbackRole(undefined);setAttemptRevision((value)=>value+1);if(role==="prediction"||role==="worked"){const next=steps[Math.min(currentIndex+1,steps.length-1)];setStep(unit.id,next.id,step.id);return;}const latest=useAppStore.getState().learnerUnitStates.find((item)=>item.unitId===unit.id);const nextId=role==="self_check"?(passed?"guided":"misconception"):defaultStepForStage(latest);setStep(unit.id,nextId,passed?step.id:undefined);};
  const practice=(role:PracticeRole)=>{
    const binding=bindingByUnitRole.get(`${unit.id}:${role}`),asset=binding?practiceAssetById.get(binding.assetId):undefined;
    if(!binding||!asset)return <div className="empty-state"><p>练习资产未通过绑定校验。</p></div>;
    const assetRef:LearningEventAssetRef={bindingId:binding.id,kind:binding.assetKind,id:asset.id,revision:asset.revision,hash:asset.contentHash};
    return <PracticeActivity key={`${asset.id}:${attemptRevision}`} asset={asset} binding={binding} projects={projects} onContinue={(passed)=>continueAfterFeedback(role,passed)} onSubmit={(result)=>{
      setFeedbackRole(role);
      if(role==="prediction"||role==="worked"){if(role==="worked")for(const block of unit.blocks.filter((item)=>item.kind==="worked_example"))record(unit.id,{type:"instruction_block_completed",mode:"learning",blockId:block.id,hintsUsed:[]});return;}
      const challenge=role==="independent"&&learner?.selectedMode==="challenge"&&learner.stage==="unseen";
      const type=role==="self_check"?"self_check_attempt":role==="guided"?"guided_attempt":challenge?"challenge_attempt":role==="independent"?"independent_attempt":role==="review"?"retrieval_attempt":"far_transfer_attempt";
      try{record(unit.id,{type,mode:challenge?"challenge":"learning",outcome:result.passed?"pass":"fail",score:result.score,confidence:result.confidence,hintsUsed:result.hintsUsed,asset:assetRef,response:result.response,highConfidenceConceptualError:!result.passed&&(result.confidence??0)>=3});}catch(error){setFeedbackRole(undefined);notify(String(error),"error");}
    }}/>;
  };
  if(!legacyOpen)return <LearningArchitectureView onOpenLegacy={()=>setLegacyOpen(true)}/>;
  if(!isKnowledgeLearningAllowed(knowledgeWorkspace,unit.id))return <div className="page learning-page"><KnowledgeMaintenanceNotice/></div>;
  if(!learner)return <div className="page learning-page"><section className="learning-start-card"><BookOpen size={30}/><h1>{unit.titleCn}</h1><p>兼容的 M017 路径保留用于既有记录；M018 默认使用 Learn → Explain → Apply。</p><button className="primary" disabled={!gate.allowed} onClick={()=>start(unit.id,"learning")}>开始 Guided Lesson <ArrowRight size={14}/></button><button disabled={!gate.allowed} onClick={()=>start(unit.id,"challenge")}><FastForward size={14}/> 进入标准 Apply</button>{!gate.allowed&&<small>{gate.reasonCn}</small>}</section></div>;
  return <LearningShell title={unit.titleCn} step={currentIndex+1} total={steps.length} minutes={Math.max(1,unit.estimatedMinutes-Math.floor(currentIndex*unit.estimatedMinutes/steps.length))} paused={pausedIds.includes(unit.id)} onPause={()=>togglePause(unit.id)} onMap={()=>setMapOpen(true)}>
    {pausedIds.includes(unit.id)?<section className="learning-wait"><h2>本单元已暂停</h2><p>当前步骤和所有作答证据都已保留；继续后从这里恢复。</p><button className="primary" onClick={()=>togglePause(unit.id)}>继续本单元</button></section>:<>
    {mapOpen&&<aside className="lesson-map"><button aria-label="关闭课程地图" onClick={()=>setMapOpen(false)}><X/></button><h2>课程地图</h2>{coreLessonSteps.map((x,i)=><button key={x.id} className={progress?.completedStepIds.includes(x.id)?"completed":""} disabled={!progress?.completedStepIds.includes(x.id)&&x.id!==desired} onClick={()=>{setStep(unit.id,x.id);setMapOpen(false);}}>{i+1}. {x.titleCn}</button>)}<div><strong>学习进度</strong><span>{projection.learningProgress.completedRequired}/{projection.learningProgress.totalRequired}</span><strong>独立能力</strong><span>{projection.demonstratedCompetence.level}</span></div></aside>}
    {step.kind==="instruction"&&<section className="lesson-instruction"><span className="eyebrow">{step.titleCn}</span>{blocks.map((b)=><article key={b.id}><h2>{b.titleCn}</h2><p>{b.bodyCn}</p>{b.terms?.map((t)=><dl key={t.en}><dt>{t.zh} <span>{t.en}</span></dt><dd>{t.definitionCn}</dd></dl>)}</article>)}{projects[0]&&step.id==="why"&&<p className="project-relevance">与你的项目“{projects[0].name}”相关：先确认 {unit.projectRelevanceTerms.slice(0,2).join(" / ")} 在哪个层级支持推断。</p>}</section>}
    {step.role&&((step.id==="review"||step.id==="far-transfer")&&!due?<section className="learning-wait"><h2>让记忆先隔一段时间</h2><p>到期时间：{new Date(learner.dueAt!).toLocaleString("zh-CN")}</p></section>:practice(step.role))}
    {step.id==="far-transfer"&&<button className="subtle" onClick={()=>setThinking(true)}>先写 Think Before AI 迁移笔记</button>}
    {thinking&&<ThinkBeforeAi source="learning_transfer" projectId={projects[0]?.id} onClose={()=>setThinking(false)}/>}
    {step.kind==="complete"&&<section className="lesson-complete"><h2>你已经完成一次真实迁移</h2><p>学习经历与独立能力仍分开记录；后续证据会继续更新，而不是生成永久 mastery 标签。</p></section>}
    <footer className="lesson-navigation"><button disabled={currentIndex===0} onClick={()=>setStep(unit.id,steps[currentIndex-1].id)}><ArrowLeft/> 上一步</button>{step.kind==="instruction"&&<button className="primary" onClick={advanceInstruction}>继续 <ArrowRight/></button>}</footer>
    </>}
  </LearningShell>;
}
