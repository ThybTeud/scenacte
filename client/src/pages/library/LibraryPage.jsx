import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { storageService } from "@/services/storage.service";
import { useAuth } from "@/hooks/useAuth";
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
import { CreatePlayModal, DeletePlayModal, RenamePlayModal, ExportModal } from "@/components/modals";
import VersionHistoryModal from "@/components/modals/VersionHistoryModal";

export default function LibraryPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

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
    const [showVersionsModal, setShowVersionsModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [selectedPlay, setSelectedPlay] = useState(null);
    const [playToExport, setPlayToExport] = useState(null);
    const [exportHtmlContent, setExportHtmlContent] = useState("");
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
    const isLastPage = pagination.page === pagination.totalPages
    const isGridIncomplete = filteredPlays.length < 20 // ou ta limite par page
    const showCreateCard = !isSearching && (isLastPage && isGridIncomplete)

    return (
        <div className="flex flex-col min-h-dvh bg-surface-strong">
            <AppHeader />
            <main className="flex-1 p-6">
                    {/* Actions row */}
                    <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
                        <SearchSortBar
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            sortBy={filters.sortBy}
                            sortOrder={filters.sortOrder}
                            onSortChange={(changes) => setFilters((prev) => ({ ...prev, ...changes }))}
                        />

                        {/* CTA */}
                        <Button variant="default" depth="raised" className="w-full sm:w-auto shrink-0" onClick={() => setShowCreateModal(true)}>
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
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(256px,1fr))] gap-4">
                                {filteredPlays.map((play) => (
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
                                    <CreatePlayCard onClick={() => setShowCreateModal(true)} />
                                )}
                            </div>

                            {/* Pagination */}
                            <PlaysPagination
                                currentPage={pagination.page}
                                totalPages={pagination.totalPages}
                                onPageChange={(page) =>
                                    setPagination((prev) => ({ ...prev, page }))
                                }
                            />
                        </>
                    )}
                </main>
            <AppFooter />

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

            <VersionHistoryModal
                isOpen={showVersionsModal}
                onClose={() => {
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
