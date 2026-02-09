import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  LibraryBig,
  Download,
  Settings2,
  History,
  FileText,
  ChartPie,
} from "lucide-react";
import { SidebarLogo } from "./SidebarLogo";
import { SidebarUserFooter } from "./SidebarUserFooter";

export function EditorSidebar({
  onOpenExport,
  onOpenEditorSettings,
  onOpenPageSettings,
  onVersionsClick,
  onOpenStats,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Sidebar
      collapsible="icon"
      className="border-r-2 border-gray-900 overflow-hidden"
    >
      <SidebarLogo />

      <SidebarContent>
        {/* Retour bibliotheque */}
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
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
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="uppercase">Outils</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Historique */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Historique"
                  className="cursor-pointer"
                  onClick={onVersionsClick}
                >
                  <History className="h-4 w-4" />
                  <span>Historique</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Statistiques */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Statistiques"
                  className="cursor-pointer"
                  onClick={onOpenStats}
                >
                  <ChartPie className="h-4 w-4" />
                  <span>Stats</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Editeur */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Éditeur"
                  className="cursor-pointer"
                  onClick={onOpenEditorSettings}
                  disabled // A VENIR - Modal en cours de dev
                >
                  <Settings2 className="h-4 w-4" />
                  <span>Éditeur</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Mise en page */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Mise en page"
                  className="cursor-pointer"
                  onClick={onOpenPageSettings}
                >
                  <FileText className="h-4 w-4" />
                  <span>Mise en page</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Export */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Exporter"
                  className="cursor-pointer"
                  onClick={onOpenExport}
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
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
  );
}
