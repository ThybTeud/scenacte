import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
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
import { CollapsibleSection } from "./CollapsibleSection";
import {
  PieChart,
  History,
  Settings2,
  Download,
  ChevronDown,
  Scale,
  LibraryBig,
  ChevronRight,
} from "lucide-react";
import { SidebarLogo } from "./SidebarLogo";
import { SidebarUserFooter } from "./SidebarUserFooter";
import { SettingsModal } from "@/components/modals";

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

  const [settingsTab, setSettingsTab] = useState("editor");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const openEditorSettings = () => {
    setSettingsTab("editor");
    setSettingsOpen(true);
  };

  const openPageSettings = () => {
    setSettingsTab("page");
    setSettingsOpen(true);
  };

  return (
    <>
      <Sidebar collapsible="icon" className="border-r-2 border-gray-900 overflow-hidden">
        <SidebarLogo />

        <SidebarContent>
          {/* Retour bibliothèque */}
          <SidebarGroup>
            <SidebarMenu>
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
            </SidebarMenu>
          </SidebarGroup>

          {/* Paramètres */}
          <CollapsibleSection
            title="Paramètres"
            icon={Settings2}
            defaultOpen={true}
            tooltip="Paramètres éditeur & mise en page"
            onCollapsedClick={() => setSettingsOpen(true)}
          >
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton
                  size="sm"
                  className="cursor-pointer"
                  onClick={openEditorSettings}
                >
                  Editeur
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton
                  size="sm"
                  className="cursor-pointer"
                  onClick={openPageSettings}
                >
                  Mise en page
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </CollapsibleSection>
          {navigationGroups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarMenu>
                <Collapsible
                  defaultOpen={group.openByDefault}
                  className="group/collapsible"
                  asChild
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="cursor-pointer">
                        <group.icon className="h-4 w-4" />
                        <span>{group.label}</span>
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {group.items.map((item, index) => (
                          <SidebarMenuSubItem key={index}>
                            <SidebarMenuSubButton
                              size="sm"
                              className="cursor-pointer"
                              onClick={() => item.path && navigate(item.path)}
                              disabled={!item.path}
                            >
                              {item.label}
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarUserFooter
          user={user}
          onLogout={logout}
          onNavigateProfile={() => navigate("/profile")}
          onNavigateSignup={() => navigate("/register")}
        />
      </Sidebar>
      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        defaultTab={settingsTab}
      />
    </>
  );
}
