import { AppLogo } from "@/components/app-logo";
import { Sidebar, useSidebar } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import showToast from "@/hooks/toast";
import { usePersistedState } from "@/hooks/usePersistedState";
import { cn } from "@/lib/utils";
import { useConfirmDialog } from "@/shared/confirmation";
import { logoutAPI } from "@/shared/services/auth";
import { LOGIN_PATH } from "@/shared/utils/auth-paths";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import IconsComponent from "../../common/icons";
import "./menu.scss";

type NavItem = { label: string; icon: string; route: string };

const BOTTOM_ROUTES = new Set(["/profile", "/settings"]);
const BOTTOM_ROUTE_ORDER = ["/profile", "/settings"];

type NavMenuButtonProps = {
  label: string;
  icon: string;
  isActive?: boolean;
  className?: string;
  showLabels: boolean;
  tooltipSide: "left" | "right";
  onClick: () => void;
};

function NavMenuButton({
  label,
  icon,
  isActive = false,
  className,
  showLabels,
  tooltipSide,
  onClick,
}: NavMenuButtonProps) {
  const button = (
    <button
      type="button"
      className={cn("app-sidebar__link", className)}
      aria-current={isActive ? "page" : undefined}
      aria-label={showLabels ? undefined : label}
      onClick={onClick}>
      <IconsComponent customClass="app-sidebar__icon" icon={icon} />
      {showLabels && <span>{label}</span>}
    </button>
  );

  if (showLabels) {
    return button;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side={tooltipSide} align="center" sideOffset={15}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function menu({
  NavList,
  isLoadingPermissions = false,
}: {
  NavList: Array<NavItem>;
  isExpanded: boolean;
  setIsExpanded: Function;
  isLoadingPermissions?: boolean;
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { state: sidebarSide } = usePersistedState<"left" | "right">("vite-ui-sidebar", "left");
  const { confirm } = useConfirmDialog();
  const { isMobile, setOpenMobile, state: sidebarState, toggleSidebar } = useSidebar();
  const showLabels = isMobile || sidebarState === "expanded";
  const tooltipSide = sidebarSide === "right" ? "left" : "right";

  const mainNav = NavList.filter((item) => !BOTTOM_ROUTES.has(item.route));
  const bottomNav = NavList.filter((item) => BOTTOM_ROUTES.has(item.route)).sort(
    (a, b) => BOTTOM_ROUTE_ORDER.indexOf(a.route) - BOTTOM_ROUTE_ORDER.indexOf(b.route)
  );

  const closeMobileMenu = () => {
    if (isMobile) setOpenMobile(false);
  };

  const handleNavigate = (route: string) => {
    navigate(route);
    closeMobileMenu();
  };

  const isRouteActive = (route: string) => {
    return pathname === route || pathname.startsWith(`${route}/`);
  };

  const handleConfirmation = async () => {
    confirm({
      message: "Are you sure you want to log out?",
      title: "Logout Confirmation",
    }).then((res: boolean) => {
      if (res) {
        logoutAPI()
          .then((res) => {
            showToast({ title: res.message || "Logged out successfully", variant: "success" });
            closeMobileMenu();
            navigate(LOGIN_PATH);
          })
          .catch((error) => {
            showToast({
              title: error.message,
              variant: "error",
            });
          });
      }
    });
  };

  const renderNavItem = ({ label, icon, route }: NavItem) => {
    const isActive = isRouteActive(route);

    return (
      <li key={route} className={cn("app-sidebar__item", isActive && "app-sidebar__item--active")}>
        <NavMenuButton
          label={label}
          icon={icon}
          isActive={isActive}
          showLabels={showLabels}
          tooltipSide={tooltipSide}
          onClick={() => handleNavigate(route)}
        />
      </li>
    );
  };

  const sidebarBody = (
    <div className={cn("app-sidebar", sidebarState === "collapsed" && !isMobile && "app-sidebar--collapsed")}>
      <button
        type="button"
        className="app-sidebar__brand"
        aria-label={sidebarState === "expanded" ? "Collapse sidebar" : "Expand sidebar"}
        onClick={toggleSidebar}>
        <span className="app-sidebar__brand-mark">
          <AppLogo />
        </span>
        {showLabels && <span className="app-sidebar__brand-text">Notofy</span>}
      </button>

      <ul className="app-sidebar__nav" data-tutorial="app-menu">
        {isLoadingPermissions ?
          Array.from({ length: 7 }).map((_, index) => (
            <li key={index} className="app-sidebar__skeleton">
              <div className="app-sidebar__skeleton-icon" />
              {showLabels && <div className="app-sidebar__skeleton-bar" />}
            </li>
          ))
        : <>
            {mainNav.map(renderNavItem)}
            {!isLoadingPermissions &&
              bottomNav.map((item, index) => (
                <li
                  key={item.route}
                  className={cn(
                    "app-sidebar__item",
                    "app-sidebar__item--bottom",
                    isRouteActive(item.route) && "app-sidebar__item--active",
                    index === 0 && "app-sidebar__item--push-bottom"
                  )}>
                  <NavMenuButton
                    label={item.label}
                    icon={item.icon}
                    isActive={isRouteActive(item.route)}
                    showLabels={showLabels}
                    tooltipSide={tooltipSide}
                    onClick={() => handleNavigate(item.route)}
                  />
                </li>
              ))}
            {!isLoadingPermissions && (
              <li className="app-sidebar__item app-sidebar__item--bottom">
                <NavMenuButton
                  label="Sign Out"
                  icon="LogOutIcon"
                  className="app-sidebar__link--danger"
                  showLabels={showLabels}
                  tooltipSide={tooltipSide}
                  onClick={handleConfirmation}
                />
              </li>
            )}
          </>
        }
      </ul>
    </div>
  );

  return (
    <Sidebar
      collapsible={isMobile ? "offcanvas" : "icon"}
      variant="sidebar"
      side={sidebarSide}
      className="app-sidebar-panel z-40">
      {sidebarBody}
    </Sidebar>
  );
}

export default menu;
