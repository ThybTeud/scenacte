import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              {/* Icône d'erreur */}
              <div className="mb-6">
                <AlertTriangle className="w-16 h-16 mx-auto text-destructive" />
              </div>

              {/* Message d'erreur */}
              <h1 className="text-2xl font-bold text-foreground mb-3">
                Une erreur est survenue
              </h1>
              <p className="text-muted-foreground mb-6">
                Nous sommes désolés, quelque chose s'est mal passé. Veuillez recharger la page.
              </p>

              {/* Bouton de rechargement */}
              <Button onClick={this.handleReload} variant="default">
                Recharger la page
              </Button>

              {/* Détails de l'erreur (uniquement en dev) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                    Détails techniques
                  </summary>
                  <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto max-h-40">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
