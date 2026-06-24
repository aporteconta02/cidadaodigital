import * as React from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== "undefined") window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    const isDev = import.meta.env.DEV;
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto mb-4 size-14 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="size-7 text-destructive" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            Algo deu errado, mas já estamos corrigindo!
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tente recarregar o app. Se o problema persistir, volte mais tarde.
          </p>
          <button
            onClick={this.handleReset}
            className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Tentar novamente
          </button>
          {isDev && this.state.error && (
            <pre className="mt-6 max-h-64 overflow-auto rounded-md bg-muted p-3 text-left text-xs text-muted-foreground">
              {this.state.error.stack || this.state.error.message}
            </pre>
          )}
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
