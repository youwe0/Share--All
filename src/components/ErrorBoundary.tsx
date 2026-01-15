import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 relative overflow-hidden">
          {/* Background grid pattern */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'radial-gradient(rgba(239, 68, 68, 0.1) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Error glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(239, 68, 68, 0.1) 0%, transparent 60%)',
            }}
          />

          <div className="relative max-w-md w-full">
            <div className="glass-strong rounded-2xl overflow-hidden">
              {/* Header with error icon */}
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-dark-error/10 mb-6">
                  <AlertTriangle className="w-10 h-10 text-dark-error" />
                </div>

                <h2 className="text-dark-text text-2xl font-bold mb-2">
                  Something went wrong
                </h2>
                <p className="text-dark-muted">
                  The application encountered an unexpected error.
                </p>
              </div>

              {/* Error details */}
              {this.state.error?.message && (
                <div className="px-8 pb-4">
                  <div className="bg-dark-bg/50 rounded-xl p-4 border border-dark-border">
                    <p className="text-dark-muted text-sm font-mono break-all">
                      {this.state.error.message}
                    </p>
                  </div>
                </div>
              )}

              {/* Action button */}
              <div className="p-8 pt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-dark-accent hover:bg-blue-600 text-white font-semibold
                           py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2
                           hover:shadow-lg hover:shadow-dark-accent/20"
                >
                  <RefreshCw className="w-5 h-5" />
                  Reload Page
                </button>

                <p className="text-dark-subtle text-xs text-center mt-4">
                  If this problem persists, try clearing your browser cache.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
