import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught React error caught by ErrorBoundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-slate-900 border border-red-500/30 rounded-2xl text-xs text-red-400 font-mono space-y-2 m-6">
          <p className="font-extrabold uppercase">Telemetry Stream Render Alert</p>
          <p className="text-[11px] text-slate-300">{this.state.error?.message || "Render exception encountered."}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
