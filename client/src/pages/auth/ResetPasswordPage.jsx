import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { Eye, EyeOff } from "lucide-react";
import { authService } from "@/services/auth.service";

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const resetToken = searchParams.get("token");

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [resetSuccess, setResetSuccess] = useState(false);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError("");

        if (!resetToken) {
            setError("Token de réinitialisation manquant");
            return;
        }

        if (newPassword.length < 12) {
            setError("Le mot de passe doit contenir au moins 12 caractères");
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setError("Les mots de passe ne correspondent pas");
            return;
        }

        setIsLoading(true);

        try {
            await authService.resetPassword(resetToken, newPassword);
            setResetSuccess(true);
        } catch (err) {
            setError(err.message || "Erreur lors de la réinitialisation");
        } finally {
            setIsLoading(false);
        }
    };

    // Pas de token = erreur
    if (!resetToken) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Lien invalide</CardTitle>
                        <CardDescription>
                            Le lien de réinitialisation est invalide ou a expiré
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-destructive">
                            Le token de réinitialisation est manquant ou invalide.
                        </p>
                        <Button
                            className="w-full"
                            onClick={() => navigate("/forgot-password")}
                        >
                            Demander un nouveau lien
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full"
                            onClick={() => navigate("/login")}
                        >
                            Retour à la connexion
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Succès
    if (resetSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Mot de passe réinitialisé</CardTitle>
                        <CardDescription>
                            Votre mot de passe a été modifié avec succès
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            className="w-full"
                            onClick={() => navigate("/login")}
                        >
                            Se connecter
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Formulaire reset
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Nouveau mot de passe</CardTitle>
                    <CardDescription>
                        Entrez votre nouveau mot de passe
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-password">
                                Nouveau mot de passe
                            </Label>
                            <div className="relative">
                                <Input
                                    id="new-password"
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={12}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff size={16} />
                                    ) : (
                                        <Eye size={16} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirm-new-password">
                                Confirmer le mot de passe
                            </Label>
                            <div className="relative">
                                <Input
                                    id="confirm-new-password"
                                    type={showPassword ? "text" : "password"}
                                    value={confirmNewPassword}
                                    onChange={(e) =>
                                        setConfirmNewPassword(e.target.value)
                                    }
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff size={16} />
                                    ) : (
                                        <Eye size={16} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading
                                ? "Réinitialisation..."
                                : "Réinitialiser le mot de passe"}
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full"
                            onClick={() => navigate("/login")}
                        >
                            Retour à la connexion
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
