import { Link } from "react-router-dom";
import { HeaderUserMenu } from "@/components/layout/HeaderUserMenu";

export function BaseHeader({ children, user, onLogout, compactLogo = false }) {
  return (
    <header className="sticky top-0 z-50 flex  shrink-0 items-center gap-2 md:gap-2 px-4 py-4 md:px-12 md:py-6 border-b-2 border-border bg-sidebar">
      <Link to="/library" className="shrink-0">
        <img
          src="/logo_long.png"
          alt="Scenacte"
          className={`h-8 w-auto object-contain ${compactLogo ? "hidden md:block" : ""}`}
        />
        {compactLogo && (
          <img
            src="/logo_short.png"
            alt="Scenacte"
            className="h-8 w-auto object-contain md:hidden"
          />
        )}
      </Link>
      {children}
      <HeaderUserMenu user={user} onLogout={onLogout} />
    </header>
  );
}
