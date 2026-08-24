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
        <span className="eyebrow">RESEARCHOS · STARTUP RECOVERY</span>
        <h1>The workspace could not finish opening.</h1>
        <p>Your local database was not reset. Retry once; if this remains, include the diagnostic below in a bug report.</p>
        <pre>{this.state.error.message || this.state.error.name}</pre>
        <button className="primary" onClick={() => window.location.reload()}>Retry startup</button>
      </main>
    );
  }
}
