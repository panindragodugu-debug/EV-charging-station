import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { reportLovableError } from "@/lib/lovable-error-reporting";

interface Props {
  children: ReactNode;
  title?: string;
  message?: string;
  fallback?: ReactNode;
}

/** Keeps one broken section from blanking the whole dashboard. */
export class ErrorBoundary extends Component<Props, { error: Error | null }> {
  override state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
    reportLovableError(error, { boundary: "chargewise_section", section: this.props.title });
  }

  override render() {
    if (!this.state.error) return this.props.children;
    if (this.props.fallback) return this.props.fallback;
    return (
      <div role="alert" className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-warning">
          <AlertTriangle className="h-4 w-4" aria-hidden />
          <span className="text-sm font-semibold">{this.props.title ?? "This section"} couldn't load</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {this.props.message ?? "The rest of the dashboard still works. You can try loading this part again."}
        </p>
        <button
          onClick={() => this.setState({ error: null })}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RotateCcw className="h-4 w-4" aria-hidden /> Try again
        </button>
      </div>
    );
  }
}
