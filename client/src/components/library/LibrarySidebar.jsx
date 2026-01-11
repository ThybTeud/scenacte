import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, PieChart, History, Settings, Download } from "lucide-react"

function SidebarInner() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const statisticsItems = ["Item cliquable 1", "Item cliquable 2", "Item cliquable 3"]
  const versionsItems = ["Item cliquable 1", "Item cliquable 2"]
  const settingsItems = ["Item cliquable 1", "Item cliquable 2", "Item cliquable 3"]

  return (
    <>
      <SidebarHeader className="p-4">
        <img
          src={isCollapsed ? "/logo_short.png" : "/logo_long.png"}
          alt="Scenacte"
          className="h-8 w-auto object-contain"
        />
      </SidebarHeader>

      <SidebarContent>
        {/* Statistiques Group */}
        <SidebarGroup>
          <SidebarMenu>
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip="Statistiques">
                    <PieChart className="h-4 w-4" />
                    <span>Statistiques</span>
                    <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {statisticsItems.map((item, index) => (
                      <SidebarMenuSubItem key={index}>
                        <SidebarMenuSubButton>{item}</SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>

        {/* Versions Group */}
        <SidebarGroup>
          <SidebarMenu>
            <Collapsible className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip="Versions">
                    <History className="h-4 w-4" />
                    <span>Versions</span>
                    <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {versionsItems.map((item, index) => (
                      <SidebarMenuSubItem key={index}>
                        <SidebarMenuSubButton>{item}</SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>

        {/* Paramètres Group */}
        <SidebarGroup>
          <SidebarMenu>
            <Collapsible className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip="Paramètres">
                    <Settings className="h-4 w-4" />
                    <span>Paramètres</span>
                    <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {settingsItems.map((item, index) => (
                      <SidebarMenuSubItem key={index}>
                        <SidebarMenuSubButton>{item}</SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>

        {/* Export Group (no collapsible) */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Export">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="Jean DUPONT">
              <Avatar className="h-8 w-8">
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">Jean DUPONT</span>
                <span className="text-xs text-muted-foreground">jean.dupont@gmail.com</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  )
}

export function LibrarySidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarInner />
    </Sidebar>
  )
}
