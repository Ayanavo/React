import IconsComponent from "@/common/icons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { NavList } from "@/config/nav";
import { fetchPermissions } from "@/shared/services/masterAccess";
import { ShieldCheckIcon } from "lucide-react";
import React, { useEffect, useState } from "react";

type Props = {
  userId: string;
  onClose: () => void;
  onSave: (userId: string, routes: string[]) => void;
};

const lockedRoutes = new Set(["/profile", "/settings"]);

const withLockedRoutes = (routes: Record<string, boolean>) => {
  const next = { ...routes };
  lockedRoutes.forEach((route) => {
    next[route] = true;
  });
  return next;
};

const PermissionsDialog = ({ userId, onClose, onSave }: Props) => {
  const [open, setOpen] = useState(true);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [selectAll, setSelectAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const selectedCount = NavList.filter((item) => checked[item.route]).length;

  useEffect(() => {
    const loadPermissions = async () => {
      setIsLoading(true);
      try {
        const res = await fetchPermissions(userId);
        const allowed: string[] = res?.permissions?.allowedRoutes || [];
        const map: Record<string, boolean> = {};
        allowed.forEach((r: string) => (map[r] = true));
        const next = withLockedRoutes(map);
        setChecked(next);
        setSelectAll(NavList.every((n) => next[n.route]));
      } finally {
        setIsLoading(false);
      }
    };

    loadPermissions();
  }, [userId]);

  const toggle = (route: string) => {
    if (lockedRoutes.has(route)) return;

    setChecked((s) => {
      const next = withLockedRoutes({ ...s, [route]: !s[route] });
      setSelectAll(NavList.every((n) => next[n.route]));
      return next;
    });
  };

  const toggleAll = () => {
    const nextSelect = !selectAll;
    setSelectAll(nextSelect);
    const next: Record<string, boolean> = {};
    NavList.forEach((n) => (next[n.route] = nextSelect));
    setChecked(withLockedRoutes(next));
  };

  const handleSave = () => {
    const routes = Object.entries(withLockedRoutes(checked))
      .filter(([, v]) => v)
      .map(([k]) => k);
    onSave(userId, routes);
    setOpen(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border/70 bg-primary/5 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/15 bg-background text-primary shadow-sm">
              <ShieldCheckIcon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-base font-semibold">Permissions</DialogTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {selectedCount} of {NavList.length} menus enabled
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 px-5 py-4">
          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border/70 bg-card px-3 py-2.5 transition-colors hover:bg-muted/35">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary/15 bg-primary/5 text-primary">
                <ShieldCheckIcon className="h-4 w-4" />
              </span>
              <span className="truncate text-sm font-semibold text-foreground">Select all menus</span>
            </div>
            <Checkbox className="ml-3 border-primary/60 shadow-none" checked={selectAll} onCheckedChange={toggleAll} aria-label="Select all permissions" />
          </label>

          <div className="max-h-[360px] overflow-auto rounded-lg border border-border/70">
            <div className="grid divide-y divide-border/70">
              {isLoading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between bg-card px-3 py-2.5">
                      <div className="flex min-w-0 items-center gap-3">
                        <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
                        <div className="min-w-0 space-y-2 py-1">
                          <Skeleton className="h-3 w-32 rounded-md" />
                          <Skeleton className="h-2 w-24 rounded-md" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-6 rounded-full" />
                    </div>
                  ))
                : NavList.map((item) => {
                    const isChecked = !!checked[item.route];
                    const isLocked = lockedRoutes.has(item.route);

                    return (
                      <label key={item.route} className={`flex items-center justify-between bg-card px-3 py-2.5 transition-colors ${isLocked ? "cursor-not-allowed opacity-75" : "cursor-pointer hover:bg-muted/35"}`}>
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/70 bg-background text-muted-foreground">
                            <IconsComponent icon={item.icon} customClass="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-foreground">{item.label}</div>
                            <div className="truncate text-xs text-muted-foreground">{item.route}</div>
                          </div>
                        </div>
                        <Checkbox className="ml-3 border-primary/60 shadow-none" checked={isLocked || isChecked} disabled={isLocked} onCheckedChange={() => toggle(item.route)} aria-label={`Toggle ${item.label} permission`} />
                      </label>
                    );
                  })}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border/70 bg-muted/20 px-5 py-3">
          <Button
            variant="outline"
            className="h-9"
            onClick={() => {
              setOpen(false);
              onClose();
            }}>
            Cancel
          </Button>
          <Button className="h-9" onClick={handleSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PermissionsDialog;
