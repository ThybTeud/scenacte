import { useState } from "react";
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, UserRound, EllipsisVertical, Bug } from "lucide-react";
import BugReportModal from "@/components/modals/BugReportModal";

/**
 * Génère les initiales depuis un email
 * @param {string} email - L'email (ex: "jean.dupont@gmail.com")
 * @returns {string} Les initiales (ex: "JD")
 */
function getInitialsFromEmail(email) {
  if (!email) return "?";

  const localPart = email.split("@")[0];
  const parts = localPart.split(/[._-]/);

  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return localPart.substring(0, 2).toUpperCase();
}

export function SidebarUserFooter({
  user = null,
  onLogout,
  onNavigateProfile,
  onNavigateSignup,
}) {
  const { state } = useSidebar();
  const isExpanded = state === "expanded";
  const [showBugReport, setShowBugReport] = useState(false);

  // État invité
  if (!user) {
    return (
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Signaler un bug" onClick={() => setShowBugReport(true)}>
              <Bug />
              <span>Signaler un bug</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Se connecter"
              onClick={onNavigateSignup}
            >
              <Avatar className="h-8 w-8 border-2 border-gray-900">
                <AvatarFallback className="rounded-lg">
                  <UserRound className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">Invité</span>
                <span className="text-xs text-primary">Se connecter →</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <BugReportModal
          isOpen={showBugReport}
          onClose={() => setShowBugReport(false)}
        />
      </SidebarFooter>
    );
  }

  // État connecté avec dropdown
  const initials = getInitialsFromEmail(user.email);

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Signaler un bug" onClick={() => setShowBugReport(true)}>
            <Bug />
            <span>Signaler un bug</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg" tooltip={user.email}>
                <Avatar className="h-8 w-8 border-2 border-gray-900">
                  <AvatarFallback className="bg-white">{initials}</AvatarFallback>
                </Avatar>
                <span className="flex-1 truncate text-sm font-medium">
                  {user.email}
                </span>
                {isExpanded && (
                  <EllipsisVertical className="ml-auto h-4 w-4 shrink-0" />
                )}
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="end"
              className="w-[--radix-dropdown-menu-trigger-width]"
            >
              <DropdownMenuItem onClick={onNavigateProfile}>
                <User className="mr-2 h-4 w-4" />
                Profil
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <BugReportModal
        isOpen={showBugReport}
        onClose={() => setShowBugReport(false)}
      />
    </SidebarFooter>
  );
}
