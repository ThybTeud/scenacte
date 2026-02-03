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
  structure = { items: [], orphanScenes: [], personnages: [] },
  characters = [],
  activeSection,
  onSectionClick,
  onCharacterClick,
  onOpenExport,
  onOpenEditorSettings,
  onOpenPageSettings,
  onVersionsClick,
  onOpenStats,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Sidebar collapsible="icon" className="border-r-2 border-gray-900 overflow-hidden">
      <SidebarLogo />

      <SidebarContent>
        {/* Retour bibliotheque */}
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

        {/* Sommaire */}
        <CollapsibleSection
          title="Sommaire"
          icon={List}
          defaultOpen={false}
          tooltip="Sommaire"
        >
          <SidebarMenuSub>
            {structure.items?.map((act, a) => (
              <SidebarMenuSubItem key={a}>
                <SidebarMenuSubButton
                  size="sm"
                  onClick={() => onSectionClick(act.position)}
                  className={`cursor-pointer line-clamp-1 ${
                    activeSection === a ? "bg-muted font-medium" : ""
                  }`}
                >
                  {act.value}
                </SidebarMenuSubButton>
                {act.scenes?.length > 0 && (
                  <SidebarMenuSub>
                    {act.scenes.map((scene, s) => (
                      <SidebarMenuSubItem key={s}>
                        <SidebarMenuSubButton
                          size="sm"
                          onClick={() => onSectionClick(scene.position)}
                          className={`cursor-pointer line-clamp-1 ${
                            activeSection === s ? "bg-muted font-medium" : ""
                          }`}
                        >
                          {scene.value}
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
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
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Statistiques"
                className="cursor-pointer"
                onClick={onOpenStats}
              >
                <PieChart className="h-4 w-4" />
                <span>Statistiques</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Parametres */}
        <CollapsibleSection
          title="Paramètres"
          icon={Settings2}
          defaultOpen={false}
          tooltip="Paramètres éditeur & mise en page"
          onCollapsedClick={onOpenEditorSettings}
        >
          <SidebarMenuSub>
            <SidebarMenuSubItem>
              <SidebarMenuSubButton
                size="sm"
                className="cursor-pointer"
                onClick={onOpenEditorSettings}
              >
                Editeur
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
            <SidebarMenuSubItem>
              <SidebarMenuSubButton
                size="sm"
                className="cursor-pointer"
                onClick={onOpenPageSettings}
              >
                Mise en page
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
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
