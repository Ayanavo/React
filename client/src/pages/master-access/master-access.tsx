import BreadcrumbInbuild from "@/components/inbuild/breadcrumb-inbuild";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ResourceGrid, { GridColumnConfig } from "@/pages/layout/grid/ResourceGrid";
import { useConfirmDialog } from "@/shared/confirmation";
import { deleteUser, fetchUsers, savePermissions } from "@/shared/services/masterAccess";
import { getSocket } from "@/shared/services/socket";
import { useQueryClient } from "@tanstack/react-query";
import { EllipsisIcon, ShieldCheckIcon, Trash2Icon } from "lucide-react";
import React, { useEffect, useState } from "react";
import PermissionsDialog from "./permissions-dialog";

const MasterAccess = () => {
  const [openPermissionsFor, setOpenPermissionsFor] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
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

  const openPermissions = (userId: string) => {
    setSelectedUserId(userId);
    setOpenPermissionsFor(userId);
  };

  const onSavePermissions = async (userId: string, routes: string[]) => {
    await savePermissions(userId, routes);
    setOpenPermissionsFor(null);
  };
  const columns: GridColumnConfig<any>[] = [
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
    { key: "action", label: "Actions" },
  ];
  const actionRenderer = (row: any, del: (id: string) => void) => (
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
              const ok = await confirm({ title: "Delete User", message: "Are you sure you want to delete this user?", confirmText: "Delete", cancelText: "Cancel", showLoadingOnConfirmClick: true });
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
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-2 pt-3">
        <BreadcrumbInbuild />
      </div>
      <ResourceGrid queryKey="master-access-users" resourceLabel="User" basePath="/master-access" columns={columns} fetchList={fetchUsers} deleteResource={deleteUser} actionRenderer={actionRenderer} showAddButton={false} />
      {openPermissionsFor && selectedUserId && <PermissionsDialog userId={selectedUserId} onClose={() => setOpenPermissionsFor(null)} onSave={onSavePermissions} />}
    </div>
  );
};

export default MasterAccess;
