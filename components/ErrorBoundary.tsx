import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

// Top-level safety net: catches unexpected errors thrown during render or in
// component lifecycle methods anywhere in the tree, so a bug in one screen
// doesn't blank the entire app with no way back. Note this can't catch
// errors thrown during module evaluation (e.g. a bad import at the top of a
// file) -- those happen before React even starts rendering; see firebase.ts
// for how that specific case is handled.
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error('ESL GAME LAB: Unhandled render error', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-900 text-white">
          <div className="max-w-sm w-full text-center space-y-4 p-8 border-2 border-slate-700 rounded-2xl bg-slate-800">
            <h1 className="text-lg font-bold">Something went wrong</h1>
            <p className="text-sm text-slate-400">
              An unexpected error occurred. Reloading the page usually fixes this.
            </p>
            <button
              onClick={() => window.location.assign('/')}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
