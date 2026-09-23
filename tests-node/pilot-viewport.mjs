import assert from "node:assert/strict";
import { test } from "node:test";
import { JSDOM } from "jsdom";
import { act, createElement } from "react";
import { createInitialState, useAppStore } from "../.build/state/store.js";
import { TodayView } from "../.build/features/today/TodayView.js";
import { LearningArchitectureView } from "../.build/features/learning/LearningArchitectureView.js";
import { PilotFeedbackView } from "../.build/features/pilot/PilotFeedbackView.js";
import { PilotFeedbackModal } from "../.build/features/pilot/PilotFeedbackModal.js";
import { Onboarding } from "../.build/components/Onboarding.js";

function setupDom(width, height) {
  const dom = new JSDOM('<!doctype html><html><head><style></style></head><body><div id="test-root"></div></body></html>', {
    url: "http://localhost:5173",
    pretendToBeVisual: true,
  });

  const originals = new Map();
  const replace = (key, value) => {
    originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  };

  for (const key of [
    "window", "document", "navigator", "HTMLElement", "HTMLInputElement",
    "HTMLTextAreaElement", "HTMLSelectElement", "Event", "MouseEvent", "localStorage",
  ]) {
    replace(key, dom.window[key]);
  }

  // Set window innerWidth and innerHeight for target viewport
  Object.defineProperty(dom.window, "innerWidth", { value: width, configurable: true });
  Object.defineProperty(dom.window, "innerHeight", { value: height, configurable: true });
  Object.defineProperty(globalThis, "innerWidth", { value: width, configurable: true });
  Object.defineProperty(globalThis, "innerHeight", { value: height, configurable: true });
  replace("IS_REACT_ACT_ENVIRONMENT", true);

  return {
    dom,
    cleanup() {
      for (const [key, desc] of originals.entries()) {
        if (desc) Object.defineProperty(globalThis, key, desc);
        else delete globalThis[key];
      }
    },
  };
}

for (const [width, height] of [[1280, 720], [1440, 900]]) {
  test(`pilot UI viewport verification (${width}x${height})`, async () => {
    const { cleanup } = setupDom(width, height);
    const { createRoot } = await import("react-dom/client");
    const container = document.getElementById("test-root");
    const root = createRoot(container);

    try {
      // 1. Onboarding with Pilot Fast-Start Banner
      useAppStore.setState({ ...createInitialState(), hydrated: true, onboardingCompleted: false });
      await act(async () => {
        root.render(createElement(Onboarding));
      });
      assert.match(container.textContent, /建议 30[–-]45 分钟/);
      assert.match(container.textContent, /开始试用/);

      // Click "开始试用"
      const pilotBtn = [...container.querySelectorAll("button")].find((b) => b.textContent.includes("开始试用"));
      assert.ok(pilotBtn, "Pilot start button must be present in Onboarding");
      await act(async () => {
        pilotBtn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
      assert.equal(useAppStore.getState().isPilotMode, true);
      assert.equal(useAppStore.getState().onboarding.completed, true);

      // 2. TodayView under Pilot Mode
      await act(async () => {
        root.render(createElement(TodayView));
      });
      assert.match(container.textContent, /今天推进一个真正的科研认知步骤/);
      assert.match(container.textContent, /先判断 → 学习 → 再判断 → 迁移/);
      assert.match(container.textContent, /Foundation Thread/);
      assert.match(container.textContent, /试用反馈与导出/);

      // 3. LearningArchitectureView - Explain phase
      useAppStore.getState().selectLearningContent("concept-statistical-unit-v1");
      useAppStore.getState().setLearningContentPhase("concept-statistical-unit-v1", "explain");
      await act(async () => {
        root.render(createElement(LearningArchitectureView, { onOpenLegacy: () => {} }));
      });
      assert.match(container.textContent, /用你自己的话解释这个概念/);
      assert.match(container.textContent, /自检清单/);
      assert.match(container.textContent, /指出患者级研究问题/);
      assert.match(container.textContent, /我已尝试解释，进入版本化 Apply/);

      const textarea = container.querySelector("textarea");
      assert.ok(textarea, "Explain phase textarea must render");

      // 4. PilotFeedbackModal
      await act(async () => {
        root.render(createElement(PilotFeedbackModal, {
          lessonId: "concept-statistical-unit-v1",
          lessonTitle: "统计单位",
          isOpen: true,
          onClose: () => {},
        }));
      });
      assert.match(container.textContent, /试用体验反馈/);
      assert.match(container.textContent, /这节内容对你来说/);
      assert.match(container.textContent, /哪个地方最有问题/);
      assert.match(container.textContent, /还有什么让我觉得难用/);
      assert.match(container.textContent, /提交反馈并返回 Today/);
      assert.match(container.textContent, /跳过反馈，返回 Today/);

      // 5. PilotFeedbackView
      useAppStore.getState().recordPilotFeedback({
        lessonId: "concept-statistical-unit-v1",
        difficulty: "just_right",
        issueTags: ["没有明显问题"],
        freeText: "设计非常清楚，自检清单有帮助",
        lessonCompleted: true,
      });
      await act(async () => {
        root.render(createElement(PilotFeedbackView));
      });
      assert.match(container.textContent, /试用反馈与数据导出/);
      assert.match(container.textContent, /已提交反馈/);
      assert.match(container.textContent, /导出 Pilot Feedback/);
      assert.match(container.textContent, /开始新的 Pilot Session/);
      assert.match(container.textContent, /设计非常清楚，自检清单有帮助/);

      // Root unmount clean
      await act(async () => {
        root.unmount();
      });
    } finally {
      cleanup();
    }
  });
}
