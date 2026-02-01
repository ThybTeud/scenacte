import { useSidebar, SidebarHeader } from "@/components/ui/sidebar"

export function SidebarLogo() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <SidebarHeader className="px-4 pt-6 flex items-start">
      <img
        src={isCollapsed ? "/logo_short.png" : "/logo_long.png"}
        alt="Scenacte"
        className="h-8 w-auto object-contain"
      />
    </SidebarHeader>
  )
}
