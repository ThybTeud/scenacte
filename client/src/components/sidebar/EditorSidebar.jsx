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
  LibraryBig,
  PieChart,
  Download,
  Settings2,
  List,
  Users,
  History,
} from "lucide-react";
import { SidebarLogo } from "./SidebarLogo";
import { SidebarUserFooter } from "./SidebarUserFooter";
import { CollapsibleSection } from "./CollapsibleSection";

export function EditorSidebar({
  stats,
  structure = { items: [], orphanScenes: [], personnages: [] },
  characters = [],
  activeSection,
  onSectionClick,
  onCharacterClick,
  onOpenExport,
  onOpenEditorSettings,
  onOpenPageSettings,
  onVersionsClick,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const safeStats = stats || {
    totalScenes: 0,
    totalRepliques: 0,
    totalCharacters: 0,
  };

  return (
    <Sidebar collapsible="icon" className="border-2 border-gray-900 rounded-lg overflow-hidden">
      <SidebarLogo />

      <SidebarContent>
        {/* Retour bibliotheque */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Bibliotheque"
                asChild
                className="cursor-pointer"
              >
                <Link to="/library">
                  <LibraryBig className="h-4 w-4" />
                  <span>Bibliotheque</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Sommaire */}
        <CollapsibleSection
          title="Sommaire"
          icon={List}
          defaultOpen={false}
          tooltip="Sommaire"
        >
          <SidebarMenu>
            {structure.items?.map((act, a) => (
              <SidebarMenuItem key={a}>
                <SidebarMenuButton
                  size="sm"
                  onClick={() => onSectionClick(act.position)}
                  className={`cursor-pointer ${
                    activeSection === a ? "bg-muted font-medium" : ""
                  }`}
                >
                  <span>{act.value}</span>
                </SidebarMenuButton>
                {act.scenes?.length > 0 && (
                  <SidebarMenuSub>
                    {act.scenes.map((scene, s) => (
                      <SidebarMenuSubItem key={s}>
                        <SidebarMenuSubButton
                          size="sm"
                          onClick={() => onSectionClick(scene.position)}
                          className={`cursor-pointer ${
                            activeSection === s ? "bg-muted font-medium" : ""
                          }`}
                        >
                          {scene.value}
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </CollapsibleSection>

        {/* Personnages */}
        <CollapsibleSection
          title="Personnages"
          icon={Users}
          defaultOpen={false}
          tooltip="Personnages"
        >
          <SidebarMenuSub>
            {characters.map((char, index) => (
              <SidebarMenuSubItem key={index}>
                <SidebarMenuSubButton
                  size="sm"
                  onClick={() => onCharacterClick(char)}
                  className="cursor-pointer"
                >
                  <span>@{char}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleSection>

        {/* Statistiques */}
        <CollapsibleSection
          title="Statistiques"
          icon={PieChart}
          defaultOpen={false}
          tooltip="Statistiques"
        >
          <SidebarMenuSub>
            <SidebarMenuSubItem>
              <SidebarMenuSubButton size="sm" asChild>
                <span className="text-muted-foreground cursor-default">
                  {safeStats.totalScenes} scenes
                </span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
            <SidebarMenuSubItem>
              <SidebarMenuSubButton size="sm" asChild>
                <span className="text-muted-foreground cursor-default">
                  {safeStats.totalRepliques} repliques
                </span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
            <SidebarMenuSubItem>
              <SidebarMenuSubButton size="sm" asChild>
                <span className="text-muted-foreground cursor-default">
                  {safeStats.totalCharacters} personnages
                </span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          </SidebarMenuSub>
        </CollapsibleSection>

        {/* Parametres */}
        <CollapsibleSection
          title="Paramètres"
          icon={Settings2}
          defaultOpen={false}
          tooltip="Paramètres éditeur & mise en page"
          onCollapsedClick={onOpenEditorSettings}
        >
          <SidebarMenuSub>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="sm"
                tooltip="Paramètres éditeur"
                className="cursor-pointer"
                onClick={onOpenEditorSettings}
              >
                Editeur
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="sm"
                tooltip="Paramètres mise en page"
                className="cursor-pointer"
                onClick={onOpenPageSettings}
              >
                Mise en page
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenuSub>
        </CollapsibleSection>

        {/* Versions */}
        <SidebarGroup>
          <SidebarMenu>
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
          </SidebarMenu>
        </SidebarGroup>

        {/* Export */}
        <SidebarGroup>
          <SidebarMenu>
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
