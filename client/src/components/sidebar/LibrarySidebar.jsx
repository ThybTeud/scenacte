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
    Scale,
} from "lucide-react";
import { SidebarLogo } from "./SidebarLogo";
import { SidebarUserFooter } from "./SidebarUserFooter";

const navigationGroups = [
    {
        label: "Paramètres",
        icon: Settings,
        items: ["Editeur", "Mise en page"],
        openByDefault: true,
    },
    {
        label: "Légal",
        icon: Scale,
        items: [
            "Conditions d'utilisation",
            "Mentions légales",
            "Politique de confidentialité",
        ],
        openByDefault: false,
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
                        defaultOpen={group.openByDefault}
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
            </SidebarContent>

            <SidebarUserFooter />
        </Sidebar>
    );
}
