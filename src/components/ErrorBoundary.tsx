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
        <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-dark-surface border border-dark-error rounded-xl p-6">
            <div className="text-dark-error text-5xl mb-4 text-center">⚠</div>
            <h2 className="text-dark-text text-2xl font-semibold mb-2 text-center">
              Something went wrong
            </h2>
            <p className="text-dark-muted text-center mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-dark-accent hover:bg-blue-600 text-dark-text font-semibold
                       py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
