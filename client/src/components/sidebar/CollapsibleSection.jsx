import { useState } from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";

/**
 * Section de sidebar collapsible avec support du mode icône.
 * Gère automatiquement l'affichage expanded/collapsed.
 *
 * @param {Object} props
 * @param {string} props.title - Titre de la section
 * @param {React.ElementType} props.icon - Composant icône Lucide
 * @param {boolean} props.defaultOpen - Section ouverte par défaut
 * @param {string} props.tooltip - Tooltip en mode collapsed (défaut: title)
 * @param {React.ReactNode} props.children - Contenu de la section
 * @param {Function} props.onCollapsedClick - Action au clic en mode collapsed (remplace le comportement par défaut)
 */
export function CollapsibleSection({
  title,
  icon: Icon,
  defaultOpen = false,
  tooltip,
  children,
  onCollapsedClick,
}) {
  const { state, setOpen } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Mode collapsed : afficher uniquement l'icône avec tooltip
  if (isCollapsed) {
    return (
      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={tooltip || title}
              className="cursor-pointer"
              onClick={() => {
                if (onCollapsedClick) {
                  onCollapsedClick();
                } else {
                  setIsOpen(true);
                  setOpen(true);
                }
              }}
            >
              <Icon className="h-4 w-4" />
              <span>{title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  // Mode expanded : section collapsible complète
  return (
    <SidebarGroup>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="group/collapsible">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={tooltip || title} className="cursor-pointer">
              <CollapsibleTrigger>
                <Icon className="h-4 w-4" />
                <span>{title}</span>
                <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
              </CollapsibleTrigger>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <CollapsibleContent>
            <SidebarGroupContent>
              {children}
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarMenu>
      </Collapsible>
    </SidebarGroup>
  );
}
