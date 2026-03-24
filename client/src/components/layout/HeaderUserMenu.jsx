import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User, LogOut, UserRound, Bug } from "lucide-react";
import { BugReportModal } from "@/components/modals";
import { getInitialsFromEmail } from "@/utils/userUtils";

export function HeaderUserMenu({ user, onLogout }) {
  const navigate = useNavigate();
  const [showBugReport, setShowBugReport] = useState(false);

  // État invité
  if (!user) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => navigate("/register")}
        >
          <Avatar className="h-8 w-8 border-2 border-border">
            <AvatarFallback className="bg-white">
              <UserRound className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
        <BugReportModal
          open={showBugReport}
          onOpenChange={() => setShowBugReport(false)}
        />
      </>
    );
  }

  // État connecté
  const initials = getInitialsFromEmail(user.email);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="h-8 w-8 border-2 border-border">
              <AvatarFallback className="bg-white">{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => navigate("/profile")}>
            <User className="mr-2 h-4 w-4" />
            Profil
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowBugReport(true)}>
            <Bug className="mr-2 h-4 w-4" />
            Signaler un bug
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <BugReportModal
        isOpen={showBugReport}
        onClose={() => setShowBugReport(false)}
      />
    </>
  );
}
