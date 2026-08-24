(() => {
  let ready = false;
  const root = () => document.getElementById("root");
  const describe = (value) => value instanceof Error ? value.message : String(value || "未知启动错误");
  const showFailure = (value) => {
    if (ready) return;
    const container = root();
    if (!container) return;
    const panel = document.createElement("main");
    panel.setAttribute("role", "alert");
    panel.style.cssText = "min-height:100vh;padding:48px;background:#20272c;color:#e2e7e5;font:14px Segoe UI,sans-serif";
    const title = document.createElement("h1");
    title.textContent = "ResearchOS 无法启动";
    const message = document.createElement("p");
    message.textContent = describe(value);
    const safety = document.createElement("p");
    safety.textContent = "你的本地数据库没有被重置。请关闭应用，并在反馈问题时附上此诊断信息。";
    panel.replaceChildren(title, message, safety);
    container.replaceChildren(panel);
  };

  window.__RESEARCHOS_BOOT__ = {
    ready() { ready = true; },
    fail: showFailure,
  };
  window.addEventListener("error", (event) => {
    const target = event.target;
    if (target instanceof HTMLScriptElement) showFailure(`启动脚本加载失败：${target.src}`);
    else if (target instanceof HTMLLinkElement) showFailure(`启动样式表加载失败：${target.href}`);
    else showFailure(event.error || event.message);
  }, true);
  window.addEventListener("unhandledrejection", (event) => showFailure(event.reason));
  window.setTimeout(() => showFailure("界面未能在规定时间内完成启动。"), 10_000);
})();
