import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props { children: ReactNode }
interface State { error?: Error }

export class StartupErrorBoundary extends Component<Props, State> {
  state: State = {};

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // The visible fallback is intentional: startup failures must never become a blank window.
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="startup-error" role="alert">
        <span className="eyebrow">RESEARCHOS · 启动恢复</span>
        <h1>工作区未能完成启动。</h1>
        <p>本地数据库没有被重置。请重试一次；如果问题仍然存在，请在错误报告中附上下方诊断信息。</p>
        <pre>{this.state.error.message || this.state.error.name}</pre>
        <button className="primary" onClick={() => window.location.reload()}>重新启动</button>
      </main>
    );
  }
}
