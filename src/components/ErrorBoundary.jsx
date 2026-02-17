// Error Boundary Component
// Catches React rendering errors and shows a fallback UI

import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" role="alert">
          <div className="error-content">
            <span className="error-icon" aria-hidden="true">⚠️</span>
            <h2>Something went wrong</h2>
            <p className="error-message">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <details className="error-details">
              <summary>Technical Details</summary>
              <pre>{this.state.error?.stack}</pre>
            </details>
            <button
              className="error-reset-btn"
              onClick={this.handleReset}
              aria-label="Try again"
            >
              ↺ Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
