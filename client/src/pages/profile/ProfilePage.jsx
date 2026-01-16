import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { useAuth } from "@/hooks/useAuth";
import { usersService } from "@/services/users.service";
import { toast } from "sonner";

export default function ProfilePage() {
    const navigate = useNavigate();
    const { user, updateUser, logout } = useAuth();

    // États formulaires
    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [deletePassword, setDeletePassword] = useState("");
    const [showPasswords, setShowPasswords] = useState(false);

    // États de chargement séparés pour chaque action
    const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);

    const [error, setError] = useState("");

    // Initialiser l'email depuis le user
    useEffect(() => {
        if (user?.email) {
            setEmail(user.email);
        }
    }, [user]);

    const handleUpdateEmail = async (e) => {
        e.preventDefault();
        setIsUpdatingEmail(true);
        setError("");

        try {
            const response = await usersService.updateProfile({ email });
            updateUser({ email: response.user?.email || email });
            toast.success("Email mis à jour avec succès");
        } catch (err) {
            toast.error(err.message || "Erreur lors de la mise à jour de l'email");
        } finally {
            setIsUpdatingEmail(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas");
            return;
        }

        if (newPassword.length < 12) {
            setError("Le mot de passe doit contenir au moins 12 caractères");
            return;
        }

        setIsUpdatingPassword(true);

        try {
            await usersService.updateProfile({
                currentPassword,
                newPassword,
            });
            toast.success("Mot de passe modifié avec succès");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            toast.error(err.message || "Erreur lors de la modification du mot de passe");
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            toast.error("Veuillez entrer votre mot de passe pour confirmer");
            return;
        }

        if (!window.confirm(
            "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible."
        )) {
            return;
        }

        setIsDeletingAccount(true);

        try {
            await usersService.deleteAccount(deletePassword);
            toast.success("Compte supprimé avec succès");
            logout();
            navigate("/login");
        } catch (err) {
            toast.error(err.message || "Erreur lors de la suppression du compte");
        } finally {
            setIsDeletingAccount(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Date inconnue";
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
                            Membre depuis le {formatDate(user?.createdAt)}
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
                            <Button type="submit" disabled={isUpdatingEmail || email === user?.email}>
                                {isUpdatingEmail
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

                            <Button type="submit" disabled={isUpdatingPassword}>
                                {isUpdatingPassword
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
                            {/* TODO: Implémenter l'export des données côté backend */}
                            <Button
                                variant="outline"
                                disabled
                                title="Fonctionnalité à venir"
                            >
                                Exporter
                            </Button>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-destructive">
                                        Supprimer mon compte
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Cette action est irréversible
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    type="password"
                                    placeholder="Entrez votre mot de passe pour confirmer"
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    className="flex-1"
                                />
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteAccount}
                                    disabled={isDeletingAccount || !deletePassword}
                                >
                                    {isDeletingAccount ? "Suppression..." : "Supprimer"}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
