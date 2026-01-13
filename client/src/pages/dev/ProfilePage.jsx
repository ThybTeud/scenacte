import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff } from "lucide-react";

export default function ProfilePage() {
    // États formulaires
    const [email, setEmail] = useState("utilisateur@exemple.com");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPasswords, setShowPasswords] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // TODO: Récupérer depuis AuthContext
    const user = {
        email: "utilisateur@exemple.com",
        createdAt: "2024-06-15T10:30:00Z",
    };

    const handleUpdateEmail = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        // TODO: Connecter à l'API
        console.log("Update email:", email);
        setTimeout(() => setIsLoading(false), 1000);
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas");
            return;
        }

        setIsLoading(true);
        // TODO: Connecter à l'API
        console.log("Update password");
        setTimeout(() => {
            setIsLoading(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        }, 1000);
    };

    const handleExportData = async () => {
        setIsLoading(true);
        // TODO: Connecter à l'API - télécharger un JSON/ZIP
        console.log("Export data");
        setTimeout(() => setIsLoading(false), 1000);
    };

    const handleDeleteAccount = async () => {
        // TODO: Ajouter une modale de confirmation
        if (
            window.confirm(
                "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible."
            )
        ) {
            setIsLoading(true);
            // TODO: Connecter à l'API
            console.log("Delete account");
            setTimeout(() => setIsLoading(false), 1000);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    return (
        <AppLayout title="Profil">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Informations du compte */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informations du compte</CardTitle>
                        <CardDescription>
                            Membre depuis le {formatDate(user.createdAt)}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleUpdateEmail}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="email">Adresse email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading
                                    ? "Mise à jour..."
                                    : "Mettre à jour l'email"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Modifier le mot de passe */}
                <Card>
                    <CardHeader>
                        <CardTitle>Modifier le mot de passe</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleUpdatePassword}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="current-password">
                                    Mot de passe actuel
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="current-password"
                                        type={
                                            showPasswords ? "text" : "password"
                                        }
                                        value={currentPassword}
                                        onChange={(e) =>
                                            setCurrentPassword(e.target.value)
                                        }
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        onClick={() =>
                                            setShowPasswords(!showPasswords)
                                        }
                                    >
                                        {showPasswords ? (
                                            <EyeOff size={16} />
                                        ) : (
                                            <Eye size={16} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="new-password">
                                    Nouveau mot de passe
                                </Label>
                                <Input
                                    id="new-password"
                                    type={showPasswords ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(e.target.value)
                                    }
                                    required
                                    minLength={12}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">
                                    Confirmer le mot de passe
                                </Label>
                                <Input
                                    id="confirm-password"
                                    type={showPasswords ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            {error && (
                                <p className="text-sm text-destructive">
                                    {error}
                                </p>
                            )}

                            <Button type="submit" disabled={isLoading}>
                                {isLoading
                                    ? "Mise à jour..."
                                    : "Modifier le mot de passe"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Export et suppression */}
                <Card>
                    <CardHeader>
                        <CardTitle>Données et compte</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">
                                    Exporter mes données
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Télécharger toutes vos pièces et données
                                    personnelles
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={handleExportData}
                                disabled={isLoading}
                            >
                                Exporter
                            </Button>
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-destructive">
                                    Supprimer mon compte
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Cette action est irréversible
                                </p>
                            </div>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteAccount}
                                disabled={isLoading}
                            >
                                Supprimer
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
