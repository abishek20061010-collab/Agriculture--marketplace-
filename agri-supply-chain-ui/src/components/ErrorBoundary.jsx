import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#f4f9f0]">
          <div className="bg-white rounded-xl shadow-lg border border-red-100 p-8 max-w-md w-full text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold text-red-700 mb-2">Something went wrong</h1>
            <p className="text-sm text-gray-600 mb-6 bg-gray-50 p-3 rounded font-mono text-left overflow-auto max-h-32">
              {this.state.error?.toString() || "Unknown error occurred"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#1a6b3c] text-white font-semibold py-2 px-6 rounded-lg hover:bg-[#155a30] transition-colors btn-press"
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

export default ErrorBoundary;
