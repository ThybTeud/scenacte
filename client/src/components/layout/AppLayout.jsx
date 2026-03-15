import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { LibrarySidebar } from "@/components/sidebar";

export default function AppLayout({ title, children }) {
    return (
        <SidebarProvider>
            <LibrarySidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6 sm:hidden">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    {title && (
                        <h1 className="text-xl font-bold font-heading">{title}</h1>
                    )}
                </header>

                <main className="flex-1 p-6">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    );
}
