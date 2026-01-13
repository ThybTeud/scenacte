import { SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function SidebarUserFooter({
  name = "Jean DUPONT",
  email = "jean.dupont@gmail.com",
  initials = "JD"
}) {
  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" tooltip={name}>
            <Avatar className="h-8 w-8">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-semibold">{name}</span>
              <span className="text-xs text-muted-foreground">{email}</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  )
}
