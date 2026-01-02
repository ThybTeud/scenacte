import React from 'react';

/**
 * ErrorBoundary component - Attrape les erreurs de rendu React
 * Affiche un fallback UI en cas d'erreur et log l'erreur pour monitoring
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Met à jour le state pour afficher le fallback UI au prochain rendu
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log l'erreur pour debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Future: Envoyer à un service de monitoring (Sentry, etc.)
    // if (window.Sentry) {
    //   Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    // }

    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cream flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border-2 border-black rounded shadow-brutal p-8 text-center">
            {/* Icône d'erreur */}
            <div className="mb-6">
              <svg
                className="w-16 h-16 mx-auto text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            {/* Message d'erreur */}
            <h1 className="text-2xl font-bold text-black mb-3">
              Une erreur est survenue
            </h1>
            <p className="text-gray-700 mb-6">
              Nous sommes désolés, quelque chose s'est mal passé. Veuillez recharger la page.
            </p>

            {/* Bouton de rechargement - Style néobrutalist */}
            <button
              onClick={this.handleReload}
              className="inline-flex items-center justify-center px-6 py-3 bg-orange text-white font-medium border-2 border-black rounded shadow-brutal hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal-hover active:translate-x-[2px] active:translate-y-[2px] active:shadow-brutal-active transition-[transform] cursor-pointer"
            >
              Recharger la page
            </button>

            {/* Détails de l'erreur (uniquement en dev) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-black">
                  Détails techniques
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 border-2 border-black rounded text-xs overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
