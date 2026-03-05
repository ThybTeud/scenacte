import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Logo from '@/components/ui/Logo';

export default function LandingNavbar() {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="fixed top-0 z-50 w-full border-b-2 border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/">
          <Logo variant="full" />
        </Link>

        {isAuthenticated ? (
          <Link
            to="/library"
            className="text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            Ma bibliothèque
          </Link>
        ) : (
          <Link
            to="/login"
            className="text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            Connexion
          </Link>
        )}
      </div>
    </nav>
  );
}
