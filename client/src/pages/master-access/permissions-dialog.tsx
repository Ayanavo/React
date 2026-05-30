import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NavList } from "@/config/nav";
import { fetchPermissions } from "@/shared/services/masterAccess";
import React, { useEffect, useState } from "react";

type Props = {
  userId: string;
  onClose: () => void;
  onSave: (userId: string, routes: string[]) => void;
};

const PermissionsDialog = ({ userId, onClose, onSave }: Props) => {
  const [open, setOpen] = useState(true);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchPermissions(userId).then((res) => {
      const allowed: string[] = res?.permissions?.allowedRoutes || res?.allowedRoutes || [];
      const map: Record<string, boolean> = {};
      allowed.forEach((r: string) => (map[r] = true));
      setChecked(map);
      setSelectAll(NavList.every((n) => map[n.route]));
    });
  }, [userId]);

  const toggle = (route: string) => {
    setChecked((s) => {
      const next = { ...s, [route]: !s[route] };
      setSelectAll(NavList.every((n) => next[n.route]));
      return next;
    });
  };

  const toggleAll = () => {
    const nextSelect = !selectAll;
    setSelectAll(nextSelect);
    const next: Record<string, boolean> = {};
    NavList.forEach((n) => (next[n.route] = nextSelect));
    setChecked(next);
  };

  const handleSave = () => {
    const routes = Object.entries(checked)
      .filter(([, v]) => v)
      .map(([k]) => k);
    onSave(userId, routes);
    setOpen(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Permissions</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="grid gap-2">
            {[{ label: "Select All", route: "__all__" }, ...NavList].map((item) => {
              const isAll = item.route === "__all__";
              return (
                <label key={item.route} className="flex items-center justify-between p-2 border rounded">
                  <div>{item.label}</div>
                  <Checkbox checked={isAll ? selectAll : !!checked[item.route]} onCheckedChange={() => (isAll ? toggleAll() : toggle(item.route))} />
                </label>
              );
            })}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              onClose();
            }}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PermissionsDialog;
