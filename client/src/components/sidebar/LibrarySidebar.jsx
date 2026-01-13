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
} from "@/components/ui/sidebar";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    PieChart,
    History,
    Settings,
    Download,
    ChevronDown,
} from "lucide-react";
import { SidebarLogo } from "./SidebarLogo";
import { SidebarUserFooter } from "./SidebarUserFooter";

const navigationGroups = [
    {
        label: "Statistiques",
        icon: PieChart,
        items: ["Item cliquable 1", "Item cliquable 2", "Item cliquable 3"],
    },
    {
        label: "Versions",
        icon: History,
        items: ["Item cliquable 1", "Item cliquable 2"],
    },
    {
        label: "Paramètres",
        icon: Settings,
        items: ["Editeur", "Mise en page"],
    },
];

export function LibrarySidebar() {
    return (
        <Sidebar collapsible="icon">
            <SidebarLogo />

            <SidebarContent>
                {navigationGroups.map((group) => (
                    <Collapsible
                        key={group.label}
                        defaultOpen={group.label === "Statistiques"}
                        className="group/collapsible"
                    >
                        <SidebarGroup>
                            <SidebarGroupLabel asChild>
                                <CollapsibleTrigger className="flex w-full items-center cursor-pointer">
                                    <group.icon className="h-4 w-4 mr-2" />
                                    <span>{group.label}</span>
                                    <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                </CollapsibleTrigger>
                            </SidebarGroupLabel>
                            <CollapsibleContent>
                                <SidebarGroupContent>
                                    <SidebarMenuSub>
                                        {group.items.map((item, index) => (
                                            <SidebarMenuSubItem key={index}>
                                                <SidebarMenuSubButton className="cursor-pointer">
                                                    {item}
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                </SidebarGroupContent>
                            </CollapsibleContent>
                        </SidebarGroup>
                    </Collapsible>
                ))}

                {/* Export - pas de sous-items */}
                <SidebarGroup>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                tooltip="Export"
                                className="cursor-pointer"
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
    );
}
