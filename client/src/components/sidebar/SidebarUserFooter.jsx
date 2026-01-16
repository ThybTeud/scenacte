import { SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronUp, User, LogOut, UserRound } from "lucide-react"

/**
 * Génère les initiales depuis un nom complet
 * @param {string} name - Le nom complet (ex: "Jean DUPONT")
 * @returns {string} Les initiales (ex: "JD")
 */
function getInitials(name) {
  if (!name) return "?"

  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase()
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function SidebarUserFooter({
  user = null,
  onLogout,
  onNavigateProfile,
  onNavigateSignup
}) {
  const { state } = useSidebar()
  const isExpanded = state === "expanded"

  // État invité
  if (!user) {
    return (
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="Mode invité">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  <UserRound className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">Mode invité</span>
                <button
                  onClick={onNavigateSignup}
                  className="text-xs text-primary hover:underline text-left"
                >
                  Créer un compte
                </button>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    )
  }

  // État connecté avec dropdown
  const initials = getInitials(user.name)

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg" tooltip={user.name}>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col gap-0.5 leading-none">
                  <span className="font-semibold">{user.name}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
                {isExpanded && (
                  <ChevronUp className="ml-auto h-4 w-4" />
                )}
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="end"
              className="w-[--radix-dropdown-menu-trigger-width]"
            >
              <DropdownMenuItem onClick={onNavigateProfile}>
                <User className="mr-2 h-4 w-4" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  )
}
