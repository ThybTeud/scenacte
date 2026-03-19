import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";

export default function AppLayout({ children }) {
  return (
    <div className="flex flex-col min-h-dvh bg-surface-muted">
      <AppHeader />
      <main className="flex-1 p-6">{children}</main>
      <AppFooter />
    </div>
  );
}
