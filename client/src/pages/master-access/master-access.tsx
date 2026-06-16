import BreadcrumbInbuild from "@/components/inbuild/breadcrumb-inbuild";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ResourceGrid, { GridColumnConfig } from "@/pages/layout/grid/ResourceGrid";
import { formatAppDateTime, formatDuration } from "@/lib/date-format";
import { useConfirmDialog } from "@/shared/confirmation";
import { useUserLoginStatusSocket } from "@/shared/hooks/useUserLoginStatusSocket";
import { deleteUser, fetchUsers, savePermissions } from "@/shared/services/masterAccess";
import { getUserIdFromToken } from "@/shared/utils/auth-token";
import { usePermissions } from "@/shared/context/PermissionsContext";
import { EllipsisIcon, ListFilterIcon, ShieldCheckIcon, Trash2Icon } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import PermissionsDialog from "./permissions-dialog";
import { cn } from "@/lib/utils";
type MasterAccessUser = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  isLoggedIn?: boolean;
  lastLoginAt?: string | null;
  lastLogoutAt?: string | null;
  totalTimeSpentMs?: number;
  currentSessionStartedAt?: string | null;
};

function getEffectiveTotalTimeSpentMs(user: MasterAccessUser): number {
  let ms = user.totalTimeSpentMs ?? 0;
  if (user.isLoggedIn && user.currentSessionStartedAt) {
    ms += Date.now() - new Date(user.currentSessionStartedAt).getTime();
  }
  return ms;
}

const MasterAccess = () => {
  const [openPermissionsFor, setOpenPermissionsFor] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeLoginOnly, setActiveLoginOnly] = useState(false);
  const { confirm } = useConfirmDialog();
  const { refetchPermissions } = usePermissions();

  const currentUserId = useMemo(() => getUserIdFromToken(), []);

  useUserLoginStatusSocket<MasterAccessUser>({ queryKey: "master-access-users", enabled: true });

  const filterFn = useCallback(
    (row: MasterAccessUser) => !activeLoginOnly || row.isLoggedIn === true,
    [activeLoginOnly]
  );

  const openPermissions = (userId: string) => {
    setSelectedUserId(userId);
    setOpenPermissionsFor(userId);
  };

  const onSavePermissions = async (userId: string, routes: string[], menuOrder: string[]) => {
    await savePermissions(userId, routes, menuOrder);
    if (userId === currentUserId) {
      await refetchPermissions();
    }
    setOpenPermissionsFor(null);
  };

  const columns: GridColumnConfig<MasterAccessUser>[] = [
    { key: "select", label: "Select" },
    {
      key: "firstName",
      label: "First Name",
      render: (_value, row) => (
        <div className="flex items-center gap-2">
          <span>{row.firstName ?? "—"}</span>
          {row._id === currentUserId && (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-medium uppercase tracking-wide">
              You
            </Badge>
          )}
        </div>
      ),
    },
    { key: "lastName", label: "Last Name" },
    { key: "email", label: "Email" },
    {
      key: "isLoggedIn",
      label: "Status",
      align: "center",
      render: (_value, row) => (
        <div className="flex w-full items-center justify-center gap-1.5">
          {row.isLoggedIn ?
            <Badge
              className={cn(
                "border-transparent bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-400",
                row._id === currentUserId && "ring-1 ring-emerald-500/40"
              )}>
              Active
            </Badge>
          : <Badge variant="outline" className="font-normal text-muted-foreground">
              Offline
            </Badge>
          }
        </div>
      ),
    },
    {
      key: "lastLoginAt",
      label: "Last Logged In",
      render: (_value, row) => (
        <span className="text-sm text-muted-foreground">{formatAppDateTime(row.lastLoginAt, "—")}</span>
      ),
    },
    {
      key: "lastLogoutAt",
      label: "Last Logged Out",
      render: (_value, row) => (
        <span className="text-sm text-muted-foreground">{formatAppDateTime(row.lastLogoutAt, "—")}</span>
      ),
    },
    {
      key: "totalTimeSpentMs",
      label: "Total Time Spent",
      render: (_value, row) => (
        <span className="text-sm text-muted-foreground">{formatDuration(getEffectiveTotalTimeSpentMs(row))}</span>
      ),
    },
    { key: "action", label: "Actions" },
  ];

  const actionRenderer = (row: MasterAccessUser, del: (id: string) => void) => (
    <div className="opacity-0 transition-opacity group-hover:opacity-100">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <span className="sr-only">Open menu</span>
            <EllipsisIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onSelect={() => openPermissions(row._id)}>
            <ShieldCheckIcon className="mr-2 h-4 w-4" />
            Permissions
          </DropdownMenuItem>
          {row._id !== currentUserId ?
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={async () => {
                  const ok = await confirm({
                    title: "Delete User",
                    message: "Are you sure you want to delete this user?",
                    confirmText: "Delete",
                    cancelText: "Cancel",
                    showLoadingOnConfirmClick: true,
                  });
                  if (ok) del(row._id);
                }}
                className="text-destructive">
                <Trash2Icon className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </>
          : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  const filterControls = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative h-9 w-9 shrink-0">
          <ListFilterIcon className="h-4 w-4" />
          <span className="sr-only">Filter</span>
          {activeLoginOnly ?
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
          : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Filters</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={activeLoginOnly} onCheckedChange={(checked) => setActiveLoginOnly(checked === true)}>
          Active users only
        </DropdownMenuCheckboxItem>
        {activeLoginOnly ?
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setActiveLoginOnly(false)}>Clear filters</DropdownMenuItem>
          </>
        : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex-none px-6 pt-4">
        <BreadcrumbInbuild />
      </div>
      <div className="min-h-0 flex-1">
        <ResourceGrid
        queryKey="master-access-users"
        resourceLabel="User"
        basePath="/master-access"
        columns={columns}
        fetchList={fetchUsers}
        deleteResource={deleteUser}
        actionRenderer={actionRenderer}
        showAddButton={false}
        filterControls={filterControls}
        filterFn={filterFn}
        />
      </div>
      {openPermissionsFor && selectedUserId && (
        <PermissionsDialog
          userId={selectedUserId}
          onClose={() => setOpenPermissionsFor(null)}
          onSave={onSavePermissions}
        />
      )}
    </div>
  );

};

export default MasterAccess;
