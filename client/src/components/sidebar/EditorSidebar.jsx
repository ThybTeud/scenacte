import { Link } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ArrowLeft, PieChart, Download, Settings, ChevronDown } from "lucide-react"
import { SidebarLogo } from "./SidebarLogo"
import { SidebarUserFooter } from "./SidebarUserFooter"

export function EditorSidebar({ stats = { scenes: 12, repliques: 156, characters: 5 } }) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon">
      <SidebarLogo />

      <SidebarContent>
        {/* Retour bibliothèque */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Bibliothèque" asChild className="cursor-pointer">
                <Link to="/library">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Bibliothèque</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

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
                    <p className="truncate">{stats.scenes} scènes</p>
                    <p className="truncate">{stats.repliques} répliques</p>
                    <p className="truncate">{stats.characters} personnages</p>
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

        {/* Export */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Exporter" className="cursor-pointer">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Paramètres */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Paramètres" className="cursor-pointer">
                <Settings className="h-4 w-4" />
                <span>Paramètres</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarUserFooter />
    </Sidebar>
  )
}
