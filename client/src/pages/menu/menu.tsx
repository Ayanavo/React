import { AppLogo } from "@/components/app-logo";
import { Sidebar, useSidebar } from "@/components/ui/sidebar";
import showToast from "@/hooks/toast";
import { usePersistedState } from "@/hooks/usePersistedState";
import { cn } from "@/lib/utils";
import { useConfirmDialog } from "@/shared/confirmation";
import { logoutAPI } from "@/shared/services/auth";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import IconsComponent from "../../common/icons";
import "./menu.scss";

type NavItem = { label: string; icon: string; route: string };

const BOTTOM_ROUTES = new Set(["/profile"]);

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

  const mainNav = NavList.filter((item) => !BOTTOM_ROUTES.has(item.route));
  const bottomNav = NavList.filter((item) => BOTTOM_ROUTES.has(item.route));

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
            showToast({
              title: res.message,
              variant: "success",
            });
            closeMobileMenu();
            navigate("/login");
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
        <button
          type="button"
          className="app-sidebar__link"
          title={showLabels ? undefined : label}
          aria-current={isActive ? "page" : undefined}
          onClick={() => handleNavigate(route)}>
          <IconsComponent customClass="app-sidebar__icon" icon={icon} />
          {showLabels && <span>{label}</span>}
        </button>
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
        {showLabels && <span className="app-sidebar__brand-text">Epsilon</span>}
      </button>

      <ul className="app-sidebar__nav">
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
                    isRouteActive(item.route) && "app-sidebar__item--active",
                    index === 0 && "app-sidebar__item--push-bottom",
                  )}>
                  <button
                    type="button"
                    className="app-sidebar__link"
                    title={showLabels ? undefined : item.label}
                    aria-current={isRouteActive(item.route) ? "page" : undefined}
                    onClick={() => handleNavigate(item.route)}>
                    <IconsComponent customClass="app-sidebar__icon" icon={item.icon} />
                    {showLabels && <span>{item.label}</span>}
                  </button>
                </li>
              ))}
            {!isLoadingPermissions && (
              <li className="app-sidebar__item">
                <button
                  type="button"
                  className="app-sidebar__link app-sidebar__link--danger"
                  onClick={handleConfirmation}>
                  <IconsComponent customClass="app-sidebar__icon" icon="LogOutIcon" />
                  {showLabels && <span>Sign Out</span>}
                </button>
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
