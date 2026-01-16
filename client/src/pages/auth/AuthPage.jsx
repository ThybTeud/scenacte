import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth.service";

export default function AuthPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { login, register, enableGuestMode } = useAuth();

    // Détecter le mode depuis l'URL
    const isResetPasswordMode = location.pathname === "/reset-password";
    const isForgotPasswordMode = location.pathname === "/forgot-password";
    const resetToken = searchParams.get("token");

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Login
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    // Register
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [registerConfirm, setRegisterConfirm] = useState("");

    // Forgot password
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotSent, setForgotSent] = useState(false);

    // Reset password
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [resetSuccess, setResetSuccess] = useState(false);

    // Déterminer l'onglet initial selon l'URL
    const getInitialTab = () => {
        if (location.pathname === "/register") return "register";
        return "login";
    };
    const [activeTab, setActiveTab] = useState(getInitialTab);

    // Mettre à jour le tab si l'URL change
    useEffect(() => {
        if (location.pathname === "/register") {
            setActiveTab("register");
        } else if (location.pathname === "/login") {
            setActiveTab("login");
        }
    }, [location.pathname]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            await login(loginEmail, loginPassword);
            navigate("/library");
        } catch (err) {
            setError(err.message || "Erreur de connexion");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        if (registerPassword !== registerConfirm) {
            setError("Les mots de passe ne correspondent pas");
            return;
        }

        setIsLoading(true);

        try {
            await register(registerEmail, registerPassword);
            navigate("/library");
        } catch (err) {
            setError(err.message || "Erreur lors de l'inscription");
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            await authService.forgotPassword(forgotEmail);
            setForgotSent(true);
        } catch (err) {
            setError(err.message || "Erreur lors de l'envoi du lien");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGuestMode = () => {
        enableGuestMode();
        navigate("/library");
    };

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

    // Reset Password View (avec token)
    if (isResetPasswordMode) {
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

    // Forgot Password View (via state ou via URL directe)
    if (showForgotPassword || isForgotPasswordMode) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Mot de passe oublié</CardTitle>
                        <CardDescription>
                            Entrez votre email pour recevoir un lien de
                            réinitialisation
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {forgotSent ? (
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Si un compte existe avec cet email, vous
                                    recevrez un lien de réinitialisation.
                                </p>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => {
                                        setShowForgotPassword(false);
                                        setForgotSent(false);
                                        setForgotEmail("");
                                        if (isForgotPasswordMode) {
                                            navigate("/login");
                                        }
                                    }}
                                >
                                    Retour à la connexion
                                </Button>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleForgotPassword}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="forgot-email">Email</Label>
                                    <Input
                                        id="forgot-email"
                                        type="email"
                                        placeholder="vous@exemple.com"
                                        value={forgotEmail}
                                        onChange={(e) =>
                                            setForgotEmail(e.target.value)
                                        }
                                        required
                                    />
                                </div>

                                {error && (
                                    <p className="text-sm text-destructive">
                                        {error}
                                    </p>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Envoi..." : "Envoyer le lien"}
                                </Button>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full"
                                    onClick={() => {
                                        setShowForgotPassword(false);
                                        if (isForgotPasswordMode) {
                                            navigate("/login");
                                        }
                                    }}
                                >
                                    Retour
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Main Auth View
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle>Scenacte</CardTitle>
                    <CardDescription>Éditeur de théâtre</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login">Connexion</TabsTrigger>
                            <TabsTrigger value="register">
                                Inscription
                            </TabsTrigger>
                        </TabsList>

                        {/* Login Tab */}
                        <TabsContent value="login">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="login-email">Email</Label>
                                    <Input
                                        id="login-email"
                                        type="email"
                                        placeholder="vous@exemple.com"
                                        value={loginEmail}
                                        onChange={(e) =>
                                            setLoginEmail(e.target.value)
                                        }
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="login-password">
                                        Mot de passe
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="login-password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={loginPassword}
                                            onChange={(e) =>
                                                setLoginPassword(e.target.value)
                                            }
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
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
                                    <p className="text-sm text-destructive">
                                        {error}
                                    </p>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    {isLoading
                                        ? "Connexion..."
                                        : "Se connecter"}
                                </Button>

                                <button
                                    type="button"
                                    className="w-full text-sm text-muted-foreground hover:underline"
                                    onClick={() => setShowForgotPassword(true)}
                                >
                                    Mot de passe oublié ?
                                </button>
                            </form>
                        </TabsContent>

                        {/* Register Tab */}
                        <TabsContent value="register">
                            <form
                                onSubmit={handleRegister}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="register-email">
                                        Email
                                    </Label>
                                    <Input
                                        id="register-email"
                                        type="email"
                                        placeholder="vous@exemple.com"
                                        value={registerEmail}
                                        onChange={(e) =>
                                            setRegisterEmail(e.target.value)
                                        }
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="register-password">
                                        Mot de passe
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="register-password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={registerPassword}
                                            onChange={(e) =>
                                                setRegisterPassword(
                                                    e.target.value
                                                )
                                            }
                                            required
                                            minLength={12}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
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
                                    <Label htmlFor="register-confirm">
                                        Confirmer le mot de passe
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="register-confirm"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={registerConfirm}
                                            onChange={(e) =>
                                                setRegisterConfirm(
                                                    e.target.value
                                                )
                                            }
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
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
                                    <p className="text-sm text-destructive">
                                        {error}
                                    </p>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    {isLoading
                                        ? "Inscription..."
                                        : "S'inscrire"}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>

                    {/* Guest Mode */}
                    <div className="mt-6 pt-6 border-t">
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={handleGuestMode}
                        >
                            Continuer sans compte
                        </Button>
                        <p className="mt-2 text-xs text-center text-muted-foreground">
                            Vos pièces seront sauvegardées localement
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
