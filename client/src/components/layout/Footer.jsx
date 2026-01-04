import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="py-6 text-center text-sm text-gray-500 border-t border-gray-200">
      <nav className="flex justify-center gap-6 mb-2">
        <Link to="/legal" className="hover:text-gray-700 transition-colors">
          Mentions légales
        </Link>
        <Link to="/privacy" className="hover:text-gray-700 transition-colors">
          Confidentialité
        </Link>
        <Link to="/terms" className="hover:text-gray-700 transition-colors">
          CGU
        </Link>
      </nav>
      <p>© {new Date().getFullYear()} Scenacte</p>
    </footer>
  );
}
