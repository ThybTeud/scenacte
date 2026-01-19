import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, CircleQuestionMark } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function GuestModeBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  if (!isVisible) return null;

  return (
    <Alert variant="warning" className="mb-4 pr-12">
      <CircleQuestionMark className="w-4 h-4" />
      <AlertTitle>Mode invité</AlertTitle>
      <AlertDescription>
        <span className="inline">
          Vos pièces sont stockées localement dans votre navigateur.{" "}
          <Button variant="link" className="px-0" onClick={() => navigate("/register")}>
            Créer un compte
          </Button>{" "}
          pour synchroniser vos pièces et y accéder depuis tous vos appareils.
        </span>
      </AlertDescription>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-3 top-3 text-black/60 hover:text-black transition-colors"
        aria-label="Fermer"
      >
        <X className="w-5 h-5" />
      </button>
    </Alert>
  );
}
