(() => {
  let ready = false;
  const root = () => document.getElementById("root");
  const describe = (value) => value instanceof Error ? value.message : String(value || "Unknown startup error");
  const showFailure = (value) => {
    if (ready) return;
    const container = root();
    if (!container) return;
    const panel = document.createElement("main");
    panel.setAttribute("role", "alert");
    panel.style.cssText = "min-height:100vh;padding:48px;background:#20272c;color:#e2e7e5;font:14px Segoe UI,sans-serif";
    const title = document.createElement("h1");
    title.textContent = "ResearchOS could not start";
    const message = document.createElement("p");
    message.textContent = describe(value);
    const safety = document.createElement("p");
    safety.textContent = "Your local database has not been reset. Close the app and report this diagnostic.";
    panel.replaceChildren(title, message, safety);
    container.replaceChildren(panel);
  };

  window.__RESEARCHOS_BOOT__ = {
    ready() { ready = true; },
    fail: showFailure,
  };
  window.addEventListener("error", (event) => {
    const target = event.target;
    if (target instanceof HTMLScriptElement) showFailure(`Failed to load startup script: ${target.src}`);
    else if (target instanceof HTMLLinkElement) showFailure(`Failed to load startup stylesheet: ${target.href}`);
    else showFailure(event.error || event.message);
  }, true);
  window.addEventListener("unhandledrejection", (event) => showFailure(event.reason));
  window.setTimeout(() => showFailure("Startup timed out before the interface became ready."), 10_000);
})();
