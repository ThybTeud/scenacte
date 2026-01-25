import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { bugReportsService } from "@/services/bugReports.service";
import { useAuth } from "@/hooks/useAuth";
import { ImageIcon, X } from "lucide-react";

const CATEGORIES = [
  { id: "editeur", label: "Éditeur" },
  { id: "apercu", label: "Aperçu / Preview" },
  { id: "export_pdf", label: "Export PDF" },
  { id: "sauvegarde", label: "Sauvegarde" },
  { id: "compte", label: "Compte / Connexion" },
  { id: "performance", label: "Performance / Lenteurs" },
  { id: "autre", label: "Autre" },
];

export default function BugReportModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState([]);
  const [email, setEmail] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState("");

  // Support de la capture d'écran (desktop uniquement)
  const supportsScreenCapture =
    typeof navigator !== "undefined" &&
    navigator.mediaDevices &&
    navigator.mediaDevices.getDisplayMedia;

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setDescription("");
      setCategories([]);
      setEmail("");
      setScreenshot(null);
      setError("");
    }
  }, [isOpen]);

  const handleCategoryToggle = (categoryId) => {
    setCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const captureScreen = async () => {
    setIsCapturing(true);

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: "screen" },
      });
      const track = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(track);
      const bitmap = await imageCapture.grabFrame();
      track.stop();

      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bitmap, 0, 0);

      const base64 = canvas.toDataURL("image/jpeg", 0.8);
      setScreenshot(base64);
    } catch (err) {
      // Permission refusée ou annulation
      console.log("Capture annulée ou refusée");
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!description.trim()) {
      setError("La description est requise");
      return;
    }

    if (categories.length === 0) {
      setError("Veuillez sélectionner au moins une catégorie");
      return;
    }

    if (!user && !email) {
      setError("Veuillez fournir votre email");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await bugReportsService.create({
        description: description.trim(),
        categories,
        email: user?.email || email,
        screenshot,
        url: window.location.href,
        userAgent: navigator.userAgent,
        appVersion: import.meta.env.VITE_APP_VERSION || "1.0.0",
      });

      toast.success("Merci pour votre signalement !");
      onClose();
    } catch (err) {
      setError(err.message || "Une erreur est survenue");
      toast.error("Erreur lors de l'envoi du signalement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit =
    description.trim() && categories.length > 0 && (user || email);

  return (
    <Dialog open={isOpen && !isCapturing} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Signaler un bug</DialogTitle>
          <DialogDescription>
            Décrivez le problème rencontré. Votre signalement nous aidera à
            améliorer Scenacte.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description du problème <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez le problème rencontré..."
              disabled={isSubmitting}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Catégories */}
          <div className="space-y-2">
            <Label>
              Catégories <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CATEGORIES.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={category.id}
                    checked={categories.includes(category.id)}
                    onCheckedChange={() => handleCategoryToggle(category.id)}
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor={category.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {category.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Email (uniquement si non connecté) */}
          {!user && (
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Pour recevoir une confirmation de votre signalement
              </p>
            </div>
          )}

          {/* Capture d'écran */}
          {supportsScreenCapture && (
            <div className="space-y-2">
              <Label>Capture d'écran (optionnel)</Label>
              {!screenshot ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={captureScreen}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Joindre une capture d'écran
                </Button>
              ) : (
                <div className="relative border rounded-md p-2">
                  <img
                    src={screenshot}
                    alt="Capture d'écran"
                    className="w-full h-auto rounded"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-4 right-4"
                    onClick={() => setScreenshot(null)}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Envoi..." : "Envoyer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
