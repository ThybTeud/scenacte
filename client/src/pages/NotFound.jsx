import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

export function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-foreground mb-4">
          Page non trouvée
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link to="/plays">
          <Button variant="default">Retour à l'accueil</Button>
        </Link>
      </div>
    </div>
  );
}
