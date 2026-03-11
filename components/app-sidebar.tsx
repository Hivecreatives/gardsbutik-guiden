"use client";

import * as React from "react";
import {
  IconDashboard,
  IconListDetails,
  IconChartBar,
  IconUsers,
  IconBuildingStore,
  IconPackage,
  IconPhoto,
  IconClock,
  IconHeart,
  IconUser,
  IconSettings,
  IconHelp,
  IconSearch,
  IconInnerShadowTop,
  IconLeaf,
} from "@tabler/icons-react";

import { useUser } from "@/hooks/useUser";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const adminNav = [
  { title: "Dashboard", url: "/dashboard/admin", icon: <IconDashboard /> },
  {
    title: "Farm Approvals",
    url: "/dashboard/admin/approvals",
    icon: <IconListDetails />,
  },
  {
    title: "Analytics",
    url: "/dashboard/admin/analytics",
    icon: <IconChartBar />,
  },
  {
    title: "User Management",
    url: "/dashboard/admin/users",
    icon: <IconUsers />,
  },
];

const farmOwnerNav = [
  { title: "My Farms", url: "/dashboard/farm", icon: <IconBuildingStore /> },
  { title: "Products", url: "/dashboard/farm/products", icon: <IconPackage /> },
  { title: "Images", url: "/dashboard/farm/images", icon: <IconPhoto /> },
  {
    title: "Opening Hours",
    url: "/dashboard/farm/opening-hours",
    icon: <IconClock />,
  },
];

const userNav = [
  {
    title: "My Favorites",
    url: "/dashboard/user/favorites",
    icon: <IconHeart />,
  },
  { title: "My Profile", url: "/dashboard/user/profile", icon: <IconUser /> },
];

const navSecondary = [
  { title: "Settings", url: "#", icon: <IconSettings /> },
  { title: "Get Help", url: "#", icon: <IconHelp /> },
  { title: "Search", url: "#", icon: <IconSearch /> },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { profile, isAdmin, isFarmOwner } = useUser();

  const navItems = isAdmin ? adminNav : isFarmOwner ? farmOwnerNav : userNav;

  const userData = {
    name: profile?.full_name ?? undefined,
    email: profile?.email ?? undefined,
    avatar: profile?.avatar_url ?? undefined,
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/dashboard">
                <IconLeaf className="size-5!" />
                <span className="text-base font-semibold">
                  Gårdsbutik Guiden
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navItems} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
