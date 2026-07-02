import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useTutorialOptional } from "@/shared/tutorial/TutorialContext";
import { PRIVACY_PATH, TERMS_PATH } from "@/shared/utils/policy-paths";
import { FileText, GraduationCap, Shield } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import packageJson from "../../../../package.json";

const APP_NAME = "Notofy";

function AppInfoDialog() {
  const navigate = useNavigate();
  const tutorial = useTutorialOptional();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn("h-auto shrink-0 rounded-full px-2 py-1 text-[10px] font-medium sm:text-xs")}>
          v{packageJson.version}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onSelect={() => navigate(TERMS_PATH)}>
          <FileText className="h-4 w-4" />
          Terms & Conditions
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate(PRIVACY_PATH)}>
          <Shield className="h-4 w-4" />
          Privacy Policy
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => tutorial?.startTutorial()}>
          <GraduationCap className="h-4 w-4" />
          Tutorials
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <div className="px-2 py-2 text-center">
          <p className="text-sm font-semibold">{APP_NAME}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Version {packageJson.version}</p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default AppInfoDialog;
