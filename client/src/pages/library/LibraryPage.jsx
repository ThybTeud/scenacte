import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { storageService } from "@/services/storage.service";
import { useAuth } from "@/hooks/useAuth";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PlaysPagination } from "@/components/ui/Pagination";
import { Plus } from "lucide-react";
import { SearchSortBar } from "@/components/library/SearchSortBar";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { PlayCard } from "@/components/library/PlayCard";
import { CreatePlayCard } from "@/components/library/CreatePlayCard";
import { CreatePlayModal, DeletePlayModal, RenamePlayModal, ExportModal, VersionHistoryModal } from "@/components/modals";

const PLAYS_PER_PAGE = 20;

const SORT_FIELD_MAP = {
    updated_at: "lastEditedAt",
    created_at: "createdAt",
    title: "title",
};

export default function LibraryPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [allPlays, setAllPlays] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
        sortBy: "updated_at",
        sortOrder: "desc",
    });
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [showVersionsModal, setShowVersionsModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [selectedPlay, setSelectedPlay] = useState(null);
    const [playToExport, setPlayToExport] = useState(null);
    const [exportHtmlContent, setExportHtmlContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch unique au mount
    useEffect(() => {
        fetchPlays();
    }, []);

    // Reset page 1 quand la recherche change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm]);

    // Pipeline : tri → recherche → pagination
    const sortedPlays = useMemo(() => {
        const sorted = [...allPlays];
        const { sortBy, sortOrder } = filters;
        const field = SORT_FIELD_MAP[sortBy];

        sorted.sort((a, b) => {
            let comparison;
            if (sortBy === "title") {
                comparison = a.title.localeCompare(b.title, "fr");
            } else {
                comparison = new Date(a[field]) - new Date(b[field]);
            }
            return sortOrder === "asc" ? comparison : -comparison;
        });
        return sorted;
    }, [allPlays, filters.sortBy, filters.sortOrder]);

    const filteredPlays = useMemo(() => {
        if (!debouncedSearchTerm) return sortedPlays;
        const searchLower = debouncedSearchTerm.toLowerCase();
        return sortedPlays.filter(
            (play) =>
                play.title.toLowerCase().includes(searchLower) ||
                (play.subtitle && play.subtitle.toLowerCase().includes(searchLower))
        );
    }, [sortedPlays, debouncedSearchTerm]);

    const totalPages = Math.max(1, Math.ceil(filteredPlays.length / PLAYS_PER_PAGE));

    const paginatedPlays = useMemo(() => {
        const start = (currentPage - 1) * PLAYS_PER_PAGE;
        return filteredPlays.slice(start, start + PLAYS_PER_PAGE);
    }, [filteredPlays, currentPage]);

    // Garde out-of-bounds (ex: suppression sur dernière page)
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    const handleSortChange = (changes) => {
        setFilters((prev) => ({ ...prev, ...changes }));
        setCurrentPage(1);
    };

    const fetchPlays = async () => {
        setIsLoading(true);
        try {
            const response = await storageService.listPlays();
            setAllPlays(response.plays);
        } catch (error) {
            toast.error("Erreur lors du chargement des pièces");
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

    const openVersionsModal = (play) => {
        setSelectedPlay(play);
        setShowVersionsModal(true);
    };

    const handleExportPlay = async (play) => {
        try {
            const fullPlay = await storageService.getPlay(play.id);
            setPlayToExport(fullPlay);
            setExportHtmlContent(fullPlay.htmlContent || "");
            setShowExportModal(true);
        } catch (error) {
            toast.error("Erreur lors du chargement de la pièce pour l'export");
        }
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

    // Affichage conditionnel de la carte "Créer une pièce"
    const isSearching = debouncedSearchTerm.length > 0
    const isLastPage = currentPage === totalPages
    const isGridIncomplete = paginatedPlays.length < PLAYS_PER_PAGE
    const showCreateCard = !isSearching && (isLastPage && isGridIncomplete)

    return (
        <div className="flex flex-col min-h-dvh bg-surface-strong">
            <AppHeader />
            <main className="flex-1 p-6">
                <div className="max-w-6xl mx-auto">
                    {/* Actions row */}
                    <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
                        <SearchSortBar
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            sortBy={filters.sortBy}
                            sortOrder={filters.sortOrder}
                            onSortChange={handleSortChange}
                        />

                        {/* CTA */}
                        <Button variant="default" depth="raised" className="w-full md:w-auto shrink-0" onClick={() => setShowCreateModal(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Nouvelle pièce
                        </Button>
                    </div>

                    {/* Loading State */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="space-y-3">
                                    <Skeleton className="h-[120px] w-full rounded-lg" />
                                </div>
                            ))}
                        </div>
                    ) : paginatedPlays.length === 0 ? (
                        /* Empty State */
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="text-muted-foreground mb-4">
                                {allPlays.length === 0
                                    ? "Aucune pièce trouvée"
                                    : "Aucun résultat pour votre recherche"}
                            </p>
                            {allPlays.length === 0 && (
                                <Button onClick={() => setShowCreateModal(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Créer votre première pièce
                                </Button>
                            )}
                        </div>
                    ) : (
                        /* Grid */
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {paginatedPlays.map((play) => (
                                    <PlayCard
                                    key={play.id}
                                    play={play}
                                    onOpen={(p) => navigate(`/editor/${p.id}`)}
                                    onExport={(p) => handleExportPlay(p)}
                                    onRename={openRenameModal}
                                    onDelete={openDeleteModal}
                                    onVersions={openVersionsModal}
                                    />
                                ))}
                                {showCreateCard && (
                                    <CreatePlayCard className="hidden md:block" onClick={() => setShowCreateModal(true)} />
                                )}
                            </div>

                            {/* Pagination */}
                            <PlaysPagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </>
                    )}
                    </div>
                </main>
            <AppFooter />

            <CreatePlayModal
                open={showCreateModal}
                onOpenChange={() => setShowCreateModal(false)}
                onSubmit={handleCreatePlay}
                isLoading={isSubmitting}
            />

            <DeletePlayModal
                open={showDeleteModal}
                onOpenChange={() => {
                    setShowDeleteModal(false);
                    setSelectedPlay(null);
                }}
                onConfirm={handleDeletePlay}
                isLoading={isSubmitting}
                playTitle={selectedPlay?.title || ""}
            />

            <RenamePlayModal
                open={showRenameModal}
                onOpenChange={() => {
                    setShowRenameModal(false);
                    setSelectedPlay(null);
                }}
                onSubmit={handleRenamePlay}
                isLoading={isSubmitting}
                play={selectedPlay}
            />

            <VersionHistoryModal
                open={showVersionsModal}
                onOpenChange={() => {
                    setShowVersionsModal(false);
                    setSelectedPlay(null);
                }}
                play={selectedPlay}
                onRestore={fetchPlays}
            />

            <ExportModal
                open={showExportModal}
                onOpenChange={(open) => {
                    setShowExportModal(open);
                    if (!open) {
                        setPlayToExport(null);
                        setExportHtmlContent("");
                    }
                }}
                htmlContent={exportHtmlContent}
                playTitle={playToExport?.title}
                playSubtitle={playToExport?.subtitle}
            />
        </div>
    );
}
