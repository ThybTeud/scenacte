import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Scale, LibraryBig, ChevronRight } from "lucide-react";
import { SidebarLogo } from "./SidebarLogo";
import { SidebarUserFooter } from "./SidebarUserFooter";
import { EditorSettingsModal } from "@/components/modals";

const navigationGroups = [
  {
    label: "Légal",
    icon: Scale,
    items: [
      { label: "Conditions d'utilisation", path: "/legal/terms" },
      { label: "Mentions légales", path: "/legal/legal" },
      { label: "Politique de confidentialité", path: "/legal/privacy" },
    ],
    openByDefault: false,
  },
];

export function LibrarySidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <Sidebar
        collapsible="icon"
        className="border-r-2 border-gray-900 overflow-hidden"
      >
        <SidebarLogo />

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="uppercase">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* Bibliothèque */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Bibliothèque"
                    asChild
                    className="cursor-pointer"
                  >
                    <Link to="/library">
                      <LibraryBig className="h-4 w-4" />
                      <span>Bibliothèque</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                {/* Légal */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Légal"
                    asChild
                    className="cursor-pointer"
                  >
                    <Link to="/legal/legal">
                      <Scale className="h-4 w-4" />
                      <span>Légal</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarUserFooter
          user={user}
          onLogout={logout}
          onNavigateProfile={() => navigate("/profile")}
          onNavigateSignup={() => navigate("/register")}
        />
      </Sidebar>
      <EditorSettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
