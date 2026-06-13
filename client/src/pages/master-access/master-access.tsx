import BreadcrumbInbuild from "@/components/inbuild/breadcrumb-inbuild";

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
import { useConfirmDialog } from "@/shared/confirmation";
import { useUserLoginStatusSocket } from "@/shared/hooks/useUserLoginStatusSocket";
import { deleteUser, fetchUsers, savePermissions } from "@/shared/services/masterAccess";
import { EllipsisIcon, ListFilterIcon, ShieldCheckIcon, Trash2Icon } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import PermissionsDialog from "./permissions-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "@/shared/services/socket";
import { formatAppDateTime } from "@/lib/date-format";

type MasterAccessUser = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  isLoggedIn?: boolean;
  lastLoginAt?: string | null;
};

const MasterAccess = () => {
  const [openPermissionsFor, setOpenPermissionsFor] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeLoginOnly, setActiveLoginOnly] = useState(false);
  const { confirm } = useConfirmDialog();
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();
    socket.connect();
    const onLoginStatus = ({ userId, isLoggedIn }: { userId: string; isLoggedIn: boolean }) => {
      queryClient.setQueryData<Array<{ _id: string; isLoggedIn?: boolean }>>(
        ["master-access-users"],
        (users) => users?.map((user) => (user._id === userId ? { ...user, isLoggedIn } : user))
      );
    };
    socket.on("user:login-status", onLoginStatus);
    return () => {
      socket.off("user:login-status", onLoginStatus);
      socket.disconnect();
    };
  }, [queryClient]);

  useUserLoginStatusSocket<MasterAccessUser>({ queryKey: "master-access-users", enabled: true });

  const filterFn = useCallback(
    (row: MasterAccessUser) => !activeLoginOnly || row.isLoggedIn === true,
    [activeLoginOnly]
  );

  const openPermissions = (userId: string) => {
    setSelectedUserId(userId);
    setOpenPermissionsFor(userId);
  };

  const onSavePermissions = async (userId: string, routes: string[]) => {
    await savePermissions(userId, routes);
    setOpenPermissionsFor(null);
  };

  const columns: GridColumnConfig<MasterAccessUser>[] = [
    { key: "select", label: "Select" },
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "email", label: "Email" },
    {
      key: "isLoggedIn",
      label: "Active Login",
      align: "center",
      render: (_value, row) => (
        <div className="flex w-full items-center justify-center">
          <span className={`inline-flex h-3 w-3 rounded-full ${row.isLoggedIn ? "bg-green-500" : "bg-gray-400"}`} />
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
          Active login only
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
    <div className="flex flex-col">
      <div className="px-6 pt-4">
        <BreadcrumbInbuild />
      </div>

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
