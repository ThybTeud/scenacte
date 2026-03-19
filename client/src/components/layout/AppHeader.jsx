import { useAuth } from "@/hooks/useAuth";
import { BaseHeader } from "@/components/layout/BaseHeader";

export function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <BaseHeader user={user} onLogout={logout}>
      <div className="flex-1" />
    </BaseHeader>
  );
}
