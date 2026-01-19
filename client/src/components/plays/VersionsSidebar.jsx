import { useState, useEffect } from 'react';
import { versionsService } from '@/services/versions.service';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { PlaysPagination } from '@/components/ui/Pagination';
import { ScrollArea } from '@/components/ui/scroll-area';

export function VersionsSidebar({ isOpen, onClose, playId, onRestore }) {
  const [versions, setVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    if (isOpen && playId) {
      fetchVersions();
    }
  }, [isOpen, playId, pagination.page]);

  const fetchVersions = async () => {
    setIsLoading(true);
    try {
      const response = await versionsService.listVersions(playId, {
        page: pagination.page,
        limit: 20,
      });
      setVersions(response.versions);
      setPagination(response.pagination);
    } catch (error) {
      toast.error('Erreur lors du chargement des versions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedVersion) return;

    setIsRestoring(true);
    try {
      await versionsService.restoreVersion(playId, selectedVersion.id);
      toast.success('Version restaurée avec succès !');
      setShowRestoreDialog(false);
      setSelectedVersion(null);
      onRestore();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la restauration');
    } finally {
      setIsRestoring(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openRestoreDialog = (version) => {
    setSelectedVersion(version);
    setShowRestoreDialog(true);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="w-96 flex flex-col p-0">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle>Versions</SheetTitle>
            <SheetDescription>
              Historique des versions de votre pièce
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 px-6">
            {isLoading ? (
              <div className="py-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ))}
              </div>
            ) : versions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Aucune version disponible
              </p>
            ) : (
              <div className="py-4 space-y-3">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">
                          Version #{version.versionNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(version.createdAt)}
                        </p>
                      </div>
                      <Badge
                        variant={version.versionType === 'manual' ? 'default' : 'secondary'}
                      >
                        {version.versionType === 'manual' ? 'Manuel' : 'Auto'}
                      </Badge>
                    </div>

                    {version.manualLabel && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {version.manualLabel}
                      </p>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => openRestoreDialog(version)}
                    >
                      Restaurer
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {!isLoading && versions.length > 0 && pagination.totalPages > 1 && (
            <SheetFooter className="px-6 py-4 border-t">
              <PlaysPagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(page) =>
                  setPagination((prev) => ({ ...prev, page }))
                }
              />
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurer la version</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir restaurer la version #{selectedVersion?.versionNumber} ?
              Cela remplacera le contenu actuel de la pièce.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRestoring}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore} disabled={isRestoring}>
              {isRestoring ? 'Restauration...' : 'Restaurer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
