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
  ArrowLeft,
  PieChart,
  Download,
  Settings2,
  List,
  Users,
} from "lucide-react";
import { SidebarLogo } from "./SidebarLogo";
import { SidebarUserFooter } from "./SidebarUserFooter";
import { CollapsibleSection } from "./CollapsibleSection";
import { ExportModal, SettingsModal } from "@/components/modals";

export function EditorSidebar({
  stats,
  structure = { items: [], orphanScenes: [], personnages: [] },
  characters = [],
  activeSection,
  onSectionClick,
  onCharacterClick,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const safeStats = stats || {
    totalScenes: 0,
    totalRepliques: 0,
    totalCharacters: 0,
  };
  const [exportOpen, setExportOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState("editor");

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
      <Sidebar collapsible="icon">
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
                    <ArrowLeft className="h-4 w-4" />
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
                    {safeStats.totalScenes} scènes
                  </span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton size="sm" asChild>
                  <span className="text-muted-foreground cursor-default">
                    {safeStats.totalRepliques} répliques
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

          {/* Paramètres */}
          <CollapsibleSection
            title="Paramètres"
            icon={Settings2}
            defaultOpen={true}
            tooltip="Paramètres éditeur & mise en page"
            onCollapsedClick={() => setSettingsOpen(true)}
          >
            <SidebarMenuSub>
              <SidebarMenuItem>
                <SidebarMenuButton
                  size="sm"
                  tooltip="Paramètres éditeur"
                  className="cursor-pointer"
                  onClick={openEditorSettings}
                >
                  Editeur
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  size="sm"
                  tooltip="Paramètres mise en page"
                  className="cursor-pointer"
                  onClick={openPageSettings}
                >
                  Mise en page
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenuSub>
          </CollapsibleSection>

          {/* Export */}
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Exporter"
                  className="cursor-pointer"
                  onClick={() => setExportOpen(true)}
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

      <ExportModal open={exportOpen} onOpenChange={setExportOpen} />
      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        defaultTab={settingsTab}
      />
    </>
  );
}
