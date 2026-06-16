import IconsComponent from "@/common/icons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { NavList } from "@/config/nav";
import { SETTINGS_ROUTE, getSortableMenuOrder, normalizeMenuOrder } from "@/config/nav-order";
import { cn } from "@/lib/utils";
import { fetchPermissions } from "@/shared/services/masterAccess";
import { getUserIdFromToken } from "@/shared/utils/auth-token";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ShieldCheckIcon } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

type Props = {
  userId: string;
  onClose: () => void;
  onSave: (userId: string, routes: string[], menuOrder: string[]) => void;
};

type NavListItem = (typeof NavList)[number];

const baseLockedRoutes = new Set(["/profile", "/settings"]);

const withLockedRoutes = (routes: Record<string, boolean>, lockedRoutes: Set<string>) => {
  const next = { ...routes };
  lockedRoutes.forEach((route) => {
    next[route] = true;
  });
  return next;
};

type SortableMenuRowProps = {
  item: NavListItem;
  isChecked: boolean;
  isLocked: boolean;
  onToggle: (route: string) => void;
};

type MenuRowContentProps = {
  item: NavListItem;
  isChecked: boolean;
  isLocked: boolean;
  onToggle?: (route: string) => void;
  isOverlay?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
};

const MenuRowContent = ({
  item,
  isChecked,
  isLocked,
  onToggle,
  isOverlay = false,
  dragHandleProps,
}: MenuRowContentProps) => (
  <div
    className={cn(
      "flex items-center justify-between bg-card px-3 py-2.5",
      isOverlay && "rounded-lg border border-primary/30 shadow-md",
      isLocked && !isOverlay && "opacity-75",
      !isLocked && !isOverlay && "hover:bg-muted/35"
    )}>
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <button
        type="button"
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground",
          dragHandleProps ? "cursor-grab hover:bg-muted active:cursor-grabbing" : "cursor-default"
        )}
        aria-label={dragHandleProps ? `Drag to reorder ${item.label}` : undefined}
        {...dragHandleProps}>
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/70 bg-background text-muted-foreground">
        <IconsComponent icon={item.icon} customClass="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-foreground">{item.label}</div>
        <div className="truncate text-xs text-muted-foreground">{item.route}</div>
      </div>
    </div>
    <Checkbox
      className="ml-3 border-primary/60 shadow-none"
      checked={isLocked || isChecked}
      disabled={isLocked || isOverlay}
      onCheckedChange={() => onToggle?.(item.route)}
      aria-label={`Toggle ${item.label} permission`}
    />
  </div>
);

const SortableMenuRow = ({ item, isChecked, isLocked, onToggle }: SortableMenuRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.route });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : undefined,
      }}
      className="bg-card">
      <MenuRowContent
        item={item}
        isChecked={isChecked}
        isLocked={isLocked}
        onToggle={onToggle}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};

const PermissionsDialog = ({ userId, onClose, onSave }: Props) => {
  const currentUserId = useMemo(() => getUserIdFromToken(), []);
  const lockedRoutes = useMemo(() => {
    const routes = new Set(baseLockedRoutes);
    if (userId === currentUserId) {
      routes.add("/master-access");
    }
    return routes;
  }, [userId, currentUserId]);

  const [open, setOpen] = useState(true);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [orderedRoutes, setOrderedRoutes] = useState<string[]>([]);
  const [activeRoute, setActiveRoute] = useState<string | null>(null);
  const [selectAll, setSelectAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [lastLoginAt, setLastLoginAt] = useState<string | null>(null);

  const navByRoute = useMemo(() => new Map(NavList.map((item) => [item.route, item])), []);
  const settingsItem = navByRoute.get(SETTINGS_ROUTE);
  const selectedCount = NavList.filter((item) => checked[item.route]).length;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const loadPermissions = async () => {
      setIsLoading(true);
      try {
        const res = await fetchPermissions(userId);
        const allowed: string[] = res?.permissions?.allowedRoutes || [];
        const menuOrder = res?.permissions?.menuOrder || [];
        setIsLoggedIn(res?.permissions?.isLoggedIn ?? null);
        setLastLoginAt(res?.permissions?.lastLoginAt ?? null);
        const map: Record<string, boolean> = {};
        allowed.forEach((route: string) => {
          map[route] = true;
        });
        const next = withLockedRoutes(map, lockedRoutes);
        setChecked(next);
        setOrderedRoutes(getSortableMenuOrder(menuOrder));
        setSelectAll(NavList.every((item) => next[item.route]));
      } finally {
        setIsLoading(false);
      }
    };

    void loadPermissions();
  }, [userId, lockedRoutes]);

  const toggle = (route: string) => {
    if (lockedRoutes.has(route)) return;

    setChecked((current) => {
      const next = withLockedRoutes({ ...current, [route]: !current[route] }, lockedRoutes);
      setSelectAll(NavList.every((item) => next[item.route]));
      return next;
    });
  };

  const toggleAll = () => {
    const nextSelect = !selectAll;
    setSelectAll(nextSelect);
    const next: Record<string, boolean> = {};
    NavList.forEach((item) => {
      next[item.route] = nextSelect;
    });
    setChecked(withLockedRoutes(next, lockedRoutes));
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveRoute(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveRoute(null);

    if (!over || active.id === over.id) return;

    setOrderedRoutes((current) => {
      const oldIndex = current.indexOf(String(active.id));
      const newIndex = current.indexOf(String(over.id));
      if (oldIndex < 0 || newIndex < 0) return current;
      return arrayMove(current, oldIndex, newIndex);
    });
  };

  const activeItem = activeRoute ? navByRoute.get(activeRoute) : undefined;

  const handleSave = () => {
    const routes = Object.entries(withLockedRoutes(checked, lockedRoutes))
      .filter(([, value]) => value)
      .map(([route]) => route);
    const menuOrder = normalizeMenuOrder([...orderedRoutes, SETTINGS_ROUTE]);
    onSave(userId, routes, menuOrder);
    setOpen(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-xl gap-0 p-0">
        <DialogHeader className="border-b border-border/70 bg-primary/5 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/15 bg-background text-primary shadow-sm">
              <ShieldCheckIcon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-base font-semibold">Permissions</DialogTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {selectedCount} of {NavList.length} menus enabled
                {isLoggedIn !== null ?
                  <> · {isLoggedIn ? "Currently logged in" : "Not logged in"}</>
                : null}
                {lastLoginAt ?
                  <> · Last login {new Date(lastLoginAt).toLocaleString()}</>
                : null}
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
            <Checkbox
              className="ml-3 border-primary/60 shadow-none"
              checked={selectAll}
              onCheckedChange={toggleAll}
              aria-label="Select all permissions"
            />
          </label>

          <div className="rounded-lg border border-border/70">
            <div className="grid divide-y divide-border/70">
              {isLoading ?
                Array.from({ length: 6 }).map((_, index) => (
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
              : <>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragCancel={() => setActiveRoute(null)}>
                    <SortableContext items={orderedRoutes} strategy={verticalListSortingStrategy}>
                      {orderedRoutes.map((route) => {
                        const item = navByRoute.get(route);
                        if (!item) return null;

                        return (
                          <SortableMenuRow
                            key={route}
                            item={item}
                            isChecked={!!checked[route]}
                            isLocked={lockedRoutes.has(route)}
                            onToggle={toggle}
                          />
                        );
                      })}
                    </SortableContext>

                    <DragOverlay className="opacity-100" dropAnimation={null}>
                      {activeItem && activeRoute ?
                        <MenuRowContent
                          item={activeItem}
                          isChecked={!!checked[activeRoute]}
                          isLocked={lockedRoutes.has(activeRoute)}
                          isOverlay
                        />
                      : null}
                    </DragOverlay>
                  </DndContext>

                  {settingsItem ?
                    <div className="flex items-center justify-between bg-card px-3 py-2.5 opacity-75">
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground/40">
                          <GripVertical className="h-4 w-4" />
                        </span>
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/70 bg-background text-muted-foreground">
                          <IconsComponent icon={settingsItem.icon} customClass="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-foreground">{settingsItem.label}</div>
                          <div className="truncate text-xs text-muted-foreground">{settingsItem.route}</div>
                        </div>
                      </div>
                      <Checkbox
                        className="ml-3 border-primary/60 shadow-none"
                        checked
                        disabled
                        aria-label={`${settingsItem.label} permission`}
                      />
                    </div>
                  : null}
                </>
              }
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
