export type NavItem = { label: string; icon: string; route: string };

export const NavList: Array<NavItem> = [
  { label: "Master Access", icon: "ShieldCheckIcon", route: "/master-access" },
  { label: "Activities", icon: "CalendarDaysIcon", route: "/activities" },
  { label: "Notes", icon: "NotebookPenIcon", route: "/notes" },
  { label: "Tags", icon: "TagsIcon", route: "/tags" },
  { label: "CV Builder", icon: "FileTextIcon", route: "/cv-builder" },
  { label: "Whiteboard", icon: "WorkflowIcon", route: "/whiteboard" },
  { label: "Profile", icon: "UserIcon", route: "/profile" },
  { label: "Settings", icon: "SettingsIcon", route: "/settings" },
];

export const NavExclusionList = ["/profile", "/settings", "/dashboard"];
