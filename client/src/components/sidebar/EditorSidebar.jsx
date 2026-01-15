import { useState } from "react";
import { Link } from "react-router-dom";
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
    SidebarSeparator,
    useSidebar,
} from "@/components/ui/sidebar";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    ArrowLeft,
    PieChart,
    Download,
    Settings2,
    ChevronDown,
    List,
    Users,
    History,
} from "lucide-react";
import { SidebarLogo } from "./SidebarLogo";
import { SidebarUserFooter } from "./SidebarUserFooter";
import { ExportModal, SettingsModal } from "@/components/modals";

export function EditorSidebar({
    stats = { scenes: 12, repliques: 156, characters: 5 },
    acts = [],
    characters = [],
    activeSection,
    onSectionClick,
    onCharacterClick,
}) {
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";
    const [exportOpen, setExportOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [settingsTab, setSettingsTab] = useState("editor");

    // Handlers pour ouvrir sur un tab spécifique
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
                    {!isCollapsed ? (
                        <Collapsible defaultOpen className="group/collapsible">
                            <SidebarGroup>
                                <SidebarGroupLabel asChild>
                                    <CollapsibleTrigger className="flex w-full items-center cursor-pointer">
                                        <List className="h-4 w-4 mr-2" />
                                        <span>Sommaire</span>
                                        <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                    </CollapsibleTrigger>
                                </SidebarGroupLabel>
                                <CollapsibleContent>
                                    <SidebarGroupContent>
                                        <SidebarMenu>
                                            {acts.map((act) => (
                                                <SidebarMenuItem key={act.id}>
                                                    <SidebarMenuButton
                                                        onClick={() =>
                                                            onSectionClick?.(
                                                                act.id
                                                            )
                                                        }
                                                        className={`cursor-pointer ${
                                                            activeSection ===
                                                            act.id
                                                                ? "bg-muted font-medium"
                                                                : ""
                                                        }`}
                                                    >
                                                        <span>{act.title}</span>
                                                    </SidebarMenuButton>
                                                    {act.scenes &&
                                                        act.scenes.length >
                                                            0 && (
                                                            <SidebarMenuSub>
                                                                {act.scenes.map(
                                                                    (scene) => (
                                                                        <SidebarMenuSubItem
                                                                            key={
                                                                                scene.id
                                                                            }
                                                                        >
                                                                            <SidebarMenuSubButton
                                                                                onClick={() =>
                                                                                    onSectionClick?.(
                                                                                        scene.id
                                                                                    )
                                                                                }
                                                                                className={`cursor-pointer ${
                                                                                    activeSection ===
                                                                                    scene.id
                                                                                        ? "bg-muted font-medium"
                                                                                        : ""
                                                                                }`}
                                                                            >
                                                                                {
                                                                                    scene.title
                                                                                }
                                                                            </SidebarMenuSubButton>
                                                                        </SidebarMenuSubItem>
                                                                    )
                                                                )}
                                                            </SidebarMenuSub>
                                                        )}
                                                </SidebarMenuItem>
                                            ))}
                                        </SidebarMenu>
                                    </SidebarGroupContent>
                                </CollapsibleContent>
                            </SidebarGroup>
                        </Collapsible>
                    ) : (
                        <SidebarGroup>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        tooltip="Sommaire"
                                        className="cursor-pointer"
                                    >
                                        <List className="h-4 w-4" />
                                        <span>Sommaire</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroup>
                    )}

                    {/* Personnages */}
                    {!isCollapsed ? (
                        <Collapsible defaultOpen className="group/collapsible">
                            <SidebarGroup>
                                <SidebarGroupLabel asChild>
                                    <CollapsibleTrigger className="flex w-full items-center cursor-pointer">
                                        <Users className="h-4 w-4 mr-2" />
                                        <span>Personnages</span>
                                        <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                    </CollapsibleTrigger>
                                </SidebarGroupLabel>
                                <CollapsibleContent>
                                    <SidebarGroupContent>
                                        <SidebarMenu>
                                            {characters.map((char) => (
                                                <SidebarMenuItem key={char.id}>
                                                    <SidebarMenuButton
                                                        onClick={() =>
                                                            onCharacterClick?.(
                                                                char.name
                                                            )
                                                        }
                                                        className="cursor-pointer text-primary"
                                                    >
                                                        <span>
                                                            @{char.name}
                                                        </span>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            ))}
                                        </SidebarMenu>
                                    </SidebarGroupContent>
                                </CollapsibleContent>
                            </SidebarGroup>
                        </Collapsible>
                    ) : (
                        <SidebarGroup>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        tooltip="Personnages"
                                        className="cursor-pointer"
                                    >
                                        <Users className="h-4 w-4" />
                                        <span>Personnages</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroup>
                    )}

                    {/* Statistiques */}
                    {!isCollapsed ? (
                        <Collapsible defaultOpen className="group/collapsible">
                            <SidebarGroup>
                                <SidebarGroupLabel asChild>
                                    <CollapsibleTrigger className="flex w-full items-center cursor-pointer">
                                        <PieChart className="h-4 w-4 mr-2" />
                                        <span>Statistiques</span>
                                        <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                    </CollapsibleTrigger>
                                </SidebarGroupLabel>
                                <CollapsibleContent>
                                    <SidebarGroupContent>
                                        <div className="px-4 py-2 text-sm text-muted-foreground space-y-1">
                                            <p className="truncate">
                                                {stats.scenes} scènes
                                            </p>
                                            <p className="truncate">
                                                {stats.repliques} répliques
                                            </p>
                                            <p className="truncate">
                                                {stats.characters} personnages
                                            </p>
                                        </div>
                                    </SidebarGroupContent>
                                </CollapsibleContent>
                            </SidebarGroup>
                        </Collapsible>
                    ) : (
                        <SidebarGroup>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton tooltip="Statistiques">
                                        <PieChart className="h-4 w-4" />
                                        <span>Statistiques</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroup>
                    )}

                    {/* Historique */}
                    {!isCollapsed ? (
                        <Collapsible
                            defaultOpen={false}
                            className="group/collapsible"
                        >
                            <SidebarGroup>
                                <SidebarGroupLabel asChild>
                                    <CollapsibleTrigger className="flex w-full items-center cursor-pointer">
                                        <History className="h-4 w-4" />
                                        <span>Historique</span>
                                        <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                    </CollapsibleTrigger>
                                </SidebarGroupLabel>
                                <CollapsibleContent>
                                    <SidebarGroupContent>
                                        <SidebarMenuSub>
                                            <SidebarMenuItem>
                                                <SidebarMenuButton
                                                    tooltip="Historique des modifications"
                                                    className="cursor-pointer"
                                                >
                                                    Version du 12 janv. 21:14
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                            <SidebarMenuItem>
                                                <SidebarMenuButton
                                                    tooltip="Historique des modifications"
                                                    className="cursor-pointer"
                                                >
                                                    Version du 13 janv. 9:17
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        </SidebarMenuSub>
                                    </SidebarGroupContent>
                                </CollapsibleContent>
                            </SidebarGroup>
                        </Collapsible>
                    ) : (
                        <SidebarGroup>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        tooltip="Historique des modifications"
                                        className="cursor-pointer"
                                    >
                                        <History className="h-4 w-4" />
                                        <span>Historique</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroup>
                    )}

                    {/* Paramètres */}
                    {!isCollapsed ? (
                        <Collapsible defaultOpen className="group/collapsible">
                            <SidebarGroup>
                                <SidebarGroupLabel asChild>
                                    <CollapsibleTrigger className="flex w-full items-center cursor-pointer">
                                        <Settings2 className="h-4 w-4 mr-2" />
                                        <span>Paramètres</span>
                                        <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                    </CollapsibleTrigger>
                                </SidebarGroupLabel>
                                <CollapsibleContent>
                                    <SidebarGroupContent>
                                        <SidebarMenuSub>
                                            <SidebarMenuItem>
                                                <SidebarMenuButton
                                                    tooltip="Paramètres éditeur"
                                                    className="cursor-pointer"
                                                    onClick={openEditorSettings}
                                                >
                                                    Editeur
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                            <SidebarMenuItem>
                                                <SidebarMenuButton
                                                    tooltip="Paramètres mise en page"
                                                    className="cursor-pointer"
                                                    onClick={openPageSettings}
                                                >
                                                    Mise en page
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        </SidebarMenuSub>
                                    </SidebarGroupContent>
                                </CollapsibleContent>
                            </SidebarGroup>
                        </Collapsible>
                    ) : (
                        <SidebarGroup>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        tooltip="Paramètres éditeur & mise en page"
                                        className="cursor-pointer"
                                        onClick={() => setSettingsOpen(true)}
                                    >
                                        <Settings2 className="h-4 w-4" />
                                        <span>Paramètres</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroup>
                    )}

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

                <SidebarUserFooter />
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
