import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { storageService } from "@/services/storage.service";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { GuestModeBanner } from "@/components/ui/GuestModeBanner";
import { Pagination } from "@/components/ui/Pagination";
import { Search, Plus } from "lucide-react";
import { LibrarySidebar } from "@/components/sidebar";
import { PlayCard } from "@/components/library/PlayCard";
import { CreatePlayCard } from "@/components/library/CreatePlayCard";
import { CreatePlayModal, DeletePlayModal, RenamePlayModal } from "@/components/modals";

export default function LibraryPage() {
    const navigate = useNavigate();
    const { user, logout, isGuest } = useAuth();

    const [plays, setPlays] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        totalPlays: 0,
    });
    const [filters, setFilters] = useState({
        status: "",
        sortBy: "updated_at",
        sortOrder: "desc",
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [selectedPlay, setSelectedPlay] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const menuRef = useRef(null);

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Load plays on mount and when pagination/filters change
    useEffect(() => {
        fetchPlays();
    }, [pagination.page, filters]);

    // Filter plays locally based on search term
    const filteredPlays = useMemo(() => {
        if (!debouncedSearchTerm) return plays;

        const searchLower = debouncedSearchTerm.toLowerCase();
        return plays.filter(
            (play) =>
                play.title.toLowerCase().includes(searchLower) ||
                (play.subtitle && play.subtitle.toLowerCase().includes(searchLower))
        );
    }, [plays, debouncedSearchTerm]);

    const fetchPlays = async () => {
        setIsLoading(true);
        try {
            const response = await storageService.listPlays({
                page: pagination.page,
                limit: 20,
                ...filters,
            });
            setPlays(response.plays);
            setPagination(response.pagination);
        } catch (error) {
            toast.error("Erreur lors du chargement des pièces");
            // Error already handled by toast notification
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreatePlay = async ({ title, subtitle }) => {
        setIsSubmitting(true);
        try {
            const response = await storageService.createPlay({ title, subtitle });
            toast.success("Pièce créée avec succès !");
            setShowCreateModal(false);
            navigate(`/editor/${response.play.id}`);
        } catch (error) {
            toast.error(error.message || "Erreur lors de la création");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeletePlay = async () => {
        if (!selectedPlay) return;
        setIsSubmitting(true);
        try {
            await storageService.deletePlay(selectedPlay.id);
            toast.success("Pièce supprimée avec succès !");
            setShowDeleteModal(false);
            setSelectedPlay(null);
            fetchPlays();
        } catch (error) {
            toast.error(error.message || "Erreur lors de la suppression");
        } finally {
            setIsSubmitting(false);
        }
    };

    const openDeleteModal = (play) => {
        setSelectedPlay(play);
        setShowDeleteModal(true);
    };

    const openRenameModal = (play) => {
        setSelectedPlay(play);
        setShowRenameModal(true);
    };

    const handleRenamePlay = async ({ title, subtitle }) => {
        if (!selectedPlay) return;
        setIsSubmitting(true);
        try {
            await storageService.renamePlay(selectedPlay.id, { title, subtitle });
            toast.success("Pièce renommée avec succès !");
            setShowRenameModal(false);
            setSelectedPlay(null);
            fetchPlays();
        } catch (error) {
            toast.error(error.message || "Erreur lors du renommage");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SidebarProvider>
            <LibrarySidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6 sm:hidden">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <h1 className="text-lg font-semibold">Bibliothèque</h1>
                </header>

                <main className="flex-1 p-6">
                    <h1 className="text-2xl font-semibold mb-6 hidden sm:block">
                        Bibliothèque
                    </h1>

                    {/* Guest Mode Banner */}
                    {isGuest && <GuestModeBanner />}

                    {/* Actions row */}
                    <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
                        {/* Recherche + Filtres */}
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 flex-1 min-w-0">
                            <div className="relative w-full sm:w-80 sm:max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher une pièce..."
                                    className="pl-9 w-full"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Select
                                    value={filters.status || "all"}
                                    onValueChange={(value) =>
                                        setFilters((prev) => ({ ...prev, status: value === "all" ? "" : value }))
                                    }
                                >
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Statut" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous</SelectItem>
                                        <SelectItem value="draft">Brouillon</SelectItem>
                                        <SelectItem value="completed">Terminé</SelectItem>
                                        <SelectItem value="archived">Archivé</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={filters.sortBy}
                                    onValueChange={(value) =>
                                        setFilters((prev) => ({ ...prev, sortBy: value }))
                                    }
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Trier par" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="updated_at">Dernière modification</SelectItem>
                                        <SelectItem value="created_at">Date de création</SelectItem>
                                        <SelectItem value="title">Titre</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={filters.sortOrder}
                                    onValueChange={(value) =>
                                        setFilters((prev) => ({ ...prev, sortOrder: value }))
                                    }
                                >
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Ordre" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="desc">Décroissant</SelectItem>
                                        <SelectItem value="asc">Croissant</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* CTA */}
                        <Button className="w-full sm:w-auto shrink-0" onClick={() => setShowCreateModal(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Nouvelle pièce
                        </Button>
                    </div>

                    {/* Loading State */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="space-y-3">
                                    <Skeleton className="h-[120px] w-full rounded-lg" />
                                </div>
                            ))}
                        </div>
                    ) : filteredPlays.length === 0 ? (
                        /* Empty State */
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="text-muted-foreground mb-4">
                                {plays.length === 0
                                    ? "Aucune pièce trouvée"
                                    : "Aucun résultat pour votre recherche"}
                            </p>
                            {plays.length === 0 && (
                                <Button onClick={() => setShowCreateModal(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Créer votre première pièce
                                </Button>
                            )}
                        </div>
                    ) : (
                        /* Grid */
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredPlays.map((play) => (
                                    <PlayCard
                                        key={play.id}
                                        play={play}
                                        onClick={() => navigate(`/editor/${play.id}`)}
                                        onRename={openRenameModal}
                                        onDelete={openDeleteModal}
                                    />
                                ))}
                                <CreatePlayCard
                                    onClick={() => setShowCreateModal(true)}
                                />
                            </div>

                            {/* Pagination */}
                            <Pagination
                                currentPage={pagination.page}
                                totalPages={pagination.totalPages}
                                onPageChange={(page) =>
                                    setPagination((prev) => ({ ...prev, page }))
                                }
                            />
                        </>
                    )}
                </main>
            </SidebarInset>

            <CreatePlayModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreatePlay}
                isLoading={isSubmitting}
            />

            <DeletePlayModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedPlay(null);
                }}
                onConfirm={handleDeletePlay}
                isLoading={isSubmitting}
                playTitle={selectedPlay?.title || ""}
            />

            <RenamePlayModal
                isOpen={showRenameModal}
                onClose={() => {
                    setShowRenameModal(false);
                    setSelectedPlay(null);
                }}
                onSubmit={handleRenamePlay}
                isLoading={isSubmitting}
                play={selectedPlay}
            />
        </SidebarProvider>
    );
}
