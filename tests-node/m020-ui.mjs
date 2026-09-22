// Run in a separate Node process. JSDOM uses only an isolated in-memory origin;
// this is a React interaction test, not browser or foreground-app verification.
import assert from "node:assert/strict";
import { test } from "node:test";
import { JSDOM } from "jsdom";
import { act, createElement } from "react";
import { KnowledgeMaintenancePanel } from "../.build/features/content-studio/KnowledgeMaintenancePanel.js";
import { createInitialState, useAppStore } from "../.build/state/store.js";
import { emptyKnowledgeWorkspace, effectiveKnowledgeStatus } from "../.build/services/knowledge.js";

test("M020 中文表单：预览、确认、待审核持久化、修订恢复与来源导入", async () => {
  const dom = new JSDOM('<!doctype html><html><body><div id="test-root"></div></body></html>', { url: "https://m020.test.invalid/" });
  const originals = new Map();
  const replace = (key, value) => { originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key)); Object.defineProperty(globalThis, key, { configurable: true, writable: true, value }); };
  for (const key of ["window", "document", "navigator", "HTMLElement", "HTMLInputElement", "HTMLTextAreaElement", "HTMLSelectElement", "Event", "MouseEvent", "localStorage"]) replace(key, dom.window[key]);
  replace("IS_REACT_ACT_ENVIRONMENT", true);
  let networkCalls = 0;
  replace("fetch", () => { networkCalls += 1; throw new Error("M020 UI tests must remain offline"); });
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(document.getElementById("test-root"));
  const initial = createInitialState();
  useAppStore.setState({ ...initial, knowledgeWorkspace: emptyKnowledgeWorkspace(), hydrated: true });
  const buttons = () => [...document.querySelectorAll("button")];
  const click = async (text) => {
    const button = buttons().find((item) => item.textContent.trim() === text);
    assert.ok(button, `按钮不存在：${text}`);
    assert.equal(button.disabled, false, `按钮不可操作：${text}`);
    await act(async () => { button.dispatchEvent(new MouseEvent("click", { bubbles: true })); });
  };
  const fill = async (labelText, value) => {
    const label = [...document.querySelectorAll("label")].find((item) => item.textContent.trim().startsWith(labelText));
    assert.ok(label, `表单字段不存在：${labelText}`);
    const field = label.querySelector("input,textarea,select");
    assert.ok(field, `字段没有输入控件：${labelText}`);
    const prototype = field.tagName === "SELECT" ? HTMLSelectElement.prototype : field.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    await act(async () => {
      Object.getOwnPropertyDescriptor(prototype, "value").set.call(field, value);
      field.dispatchEvent(new Event(field.tagName === "SELECT" ? "change" : "input", { bubbles: true }));
    });
  };
  const confirm = async () => {
    await click("预览差异与影响");
    assert.match(document.body.textContent, /影响预览/);
    await fill("本次变更操作者", "隔离测试维护者");
    await click("确认变更并送审");
    assert.notEqual(useAppStore.getState().toast?.tone, "error", useAppStore.getState().toast?.text);
  };
  try {
    await act(async () => { root.render(createElement(KnowledgeMaintenancePanel, { initialMode: "template" })); });
    await fill("标题", "隔离测试：区间解释");
    await fill("科学问题", "如何界定区间解释及其适用条件？");
    await fill("精确解释", "第一条解释\n");
    const explanationField = [...document.querySelectorAll("label")].find((item) => item.textContent.trim().startsWith("精确解释")).querySelector("textarea");
    assert.equal(explanationField.value, "第一条解释\n", "逐行表单不能吞掉正在输入的换行");
    await fill("精确解释", "第一条解释\n第二条解释\n");
    await fill("变更理由", "建立可追溯的测试知识，等待科学审核。");
    assert.equal(useAppStore.getState().knowledgeWorkspace.units.length, 0);
    await click("预览差异与影响");
    assert.equal(useAppStore.getState().knowledgeWorkspace.units.length, 0, "预览不写知识库");
    await fill("本次变更操作者", "隔离测试维护者");
    await click("确认变更并送审");
    let workspace = useAppStore.getState().knowledgeWorkspace;
    assert.equal(workspace.units.length, 1, useAppStore.getState().toast?.text);
    const original = structuredClone(workspace.units[0]);
    assert.equal(original.lifecycle, "pending_review");
    assert.equal(original.verificationStatus, "pending");
    assert.deepEqual(original.preciseExplanation, ["第一条解释", "第二条解释"]);
    assert.equal(workspace.projections.length, 0);

    await click("修订");
    await fill("科学问题", "新增情境是否改变区间解释的边界？");
    await fill("变更理由", "补充新问题，保留原版本供历史追溯。");
    await confirm();
    workspace = useAppStore.getState().knowledgeWorkspace;
    assert.equal(workspace.units.length, 2, useAppStore.getState().toast?.text);
    assert.deepEqual(workspace.units.find((item) => item.revision === 1), original);
    const revised = workspace.units.find((item) => item.revision === 2);
    assert.equal(revised.id, original.id);
    assert.equal(revised.verificationStatus, "pending");

    await click("废弃");
    await fill("变更理由", "该测试版本暂不适用于新的学习活动。");
    await confirm();
    workspace = useAppStore.getState().knowledgeWorkspace;
    assert.equal(effectiveKnowledgeStatus(workspace, revised), "DEPRECATED");
    await click("恢复为待审核");
    await fill("变更理由", "恢复为新的待审核版本，保留废弃历史。");
    await confirm();
    workspace = useAppStore.getState().knowledgeWorkspace;
    assert.equal(workspace.units.length, 3, useAppStore.getState().toast?.text);
    assert.equal(workspace.units.find((item) => item.revision === 3).verificationStatus, "pending");
    assert.equal(effectiveKnowledgeStatus(workspace, revised), "DEPRECATED", "恢复不能重写旧版本的废弃状态");
    await click("预览学习候选");
    assert.equal(useAppStore.getState().knowledgeWorkspace.projections.length, 0, "教学预览不能隐式保存");
    await click("保存待审核学习候选");
    workspace = useAppStore.getState().knowledgeWorkspace;
    assert.equal(workspace.projections.length, 8, useAppStore.getState().toast?.text);
    assert.ok(workspace.projections.every((item) => item.lifecycle === "pending_review" && item.verificationStatus === "pending" && item.createsCompetence === false));
    assert.ok(workspace.projections.every((item) => item.knowledgeRevisionBindings[0].revision === 3 && item.knowledgeRevisionBindings[0].knowledgeUnitId === original.id));
    await act(async () => { await useAppStore.getState().persistNow(); });
    const saved = JSON.parse(localStorage.getItem("researchos-browser-state-v1"));
    assert.equal(saved.knowledgeWorkspace.units.length, 3);
    assert.equal(saved.knowledgeWorkspace.units[0].hash, original.hash);
    assert.equal(saved.knowledgeWorkspace.projections.length, 8);

    await click("添加知识");
    await fill("输入格式", "doi");
    await fill("DOI", "10.1000/m020-isolated-ui-fixture");
    await fill("标题（可选）", "测试来源线索");
    await click("识别并预览候选");
    assert.match(document.body.textContent, /导入预览/);
    assert.equal(useAppStore.getState().knowledgeWorkspace.units.length, 3);
    await click("保存待审核候选");
    workspace = useAppStore.getState().knowledgeWorkspace;
    const imported = workspace.candidates.find((item) => item.title === "测试来源线索");
    assert.ok(imported, useAppStore.getState().toast?.text);
    assert.equal(imported.lifecycle, "pending_review");
    assert.equal(imported.verificationStatus, "pending");
    assert.equal(workspace.units.length, 3, "保存来源候选不替换已有知识");
    await click("添加知识");
    const protocolButton = buttons().find((item) => item.textContent.includes("Western blot：弱信号诊断"));
    assert.ok(protocolButton, "已有WB staging应有可点击入口");
    await act(async () => { protocolButton.dispatchEvent(new MouseEvent("click", { bubbles: true })); });
    assert.match(document.body.textContent, /迁移预览/);
    assert.equal(useAppStore.getState().knowledgeWorkspace.units.length, 3, "协议迁移预览不写工作区");
    await click("保存迁移记录与待审核知识");
    workspace = useAppStore.getState().knowledgeWorkspace;
    const protocol = workspace.units.find((item) => item.knowledgeType === "protocol");
    assert.ok(protocol, useAppStore.getState().toast?.text);
    assert.equal(protocol.verificationStatus, "pending");
    assert.ok(protocol.provenance.originalPayload, "协议迁移应保留原始资产");
    assert.equal(networkCalls, 0, "DOI导入不得自动联网");
    assert.equal(useAppStore.getState().learningEvents.length, initial.learningEvents.length);
    assert.deepEqual(useAppStore.getState().learnerUnitStates, initial.learnerUnitStates);
  } finally {
    await act(async () => { root.unmount(); await new Promise((resolve) => setTimeout(resolve, 400)); });
    dom.window.close();
    for (const [key, descriptor] of originals) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key]; }
  }
});
