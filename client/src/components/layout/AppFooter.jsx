import { Link } from "react-router-dom";

export function AppFooter() {
  return (
    <footer className="border-t-2 border-border px-6 py-4 bg-sidebar">
      <nav className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <Link to="/legal/legal" className="hover:text-foreground">
          Mentions légales
        </Link>
        <Link to="/legal/terms" className="hover:text-foreground">
          CGU
        </Link>
        <Link to="/legal/privacy" className="hover:text-foreground">
          Confidentialité
        </Link>
      </nav>
    </footer>
  );
}
