"use client";

import { Search, Menu } from "lucide-react";
import Link from "next/link";
import { cn } from "@red-salud/core/utils";

export interface DashboardMobileHeaderProps {
  dashboardRoute: string;
  onMenuClick: () => void;
  onSearchClick?: () => void;
}

export function DashboardMobileHeader({
  dashboardRoute,
  onMenuClick,
  onSearchClick,
}: DashboardMobileHeaderProps) {
  return (
    <div className="h-14 w-full flex flex-row md:hidden">
      <nav className="group px-4 z-10 w-full h-14 border-b bg-sidebar border-sidebar-border shadow-xl transition-width duration-200 hide-scrollbar flex flex-row items-center justify-between overflow-x-auto">
        {/* Logo */}
        <Link
          className="flex items-center h-[26px] w-[26px] min-w-[26px]"
          href={dashboardRoute}
        >
          <div className="absolute h-[26px] w-[26px] cursor-pointer rounded bg-gradient-to-br from-blue-600 to-teal-600 text-white flex items-center justify-center font-bold text-xs">
            RS
          </div>
        </Link>

        {/* Actions */}
        <div className="flex gap-2">
          {/* Search Button */}
          <button
            onClick={onSearchClick}
            className={cn(
              "whitespace-nowrap border border-input text-sm hover:bg-accent ring-offset-background",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:pointer-events-none disabled:opacity-50",
              "group flex-grow h-[30px] rounded-md p-2 flex items-center justify-between",
              "bg-transparent border-none text-sidebar-foreground/70",
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              "focus-visible:!outline-4 focus-visible:outline-offset-1 focus-visible:outline-brand-600",
              "transition"
            )}
            aria-haspopup="dialog"
            aria-expanded="false"
          >
            <div className="flex items-center space-x-2">
              <Search className="size-[18px]" />
            </div>
          </button>

          {/* Menu Button */}
          <button
            onClick={onMenuClick}
            data-size="tiny"
            type="button"
            title="Menu dropdown button"
            className={cn(
              "relative justify-center cursor-pointer items-center space-x-2 text-center font-regular",
              "ease-out duration-200 outline-none transition-all outline-0",
              "focus-visible:outline-4 focus-visible:outline-offset-1",
              "border hover:bg-sidebar-accent hover:border-sidebar-border",
              "focus-visible:outline-brand-600 data-[state=open]:outline-brand-600",
              "data-[state=open]:border-button-hover",
              "text-xs px-2.5 py-1 flex lg:hidden",
              "border-sidebar-border bg-sidebar text-sidebar-foreground",
              "rounded-md min-w-[30px] w-[30px] h-[30px]",
              "data-[state=open]:bg-sidebar-accent"
            )}
            tabIndex={0}
          >
            <div className="[&_svg]:h-[14px] [&_svg]:w-[14px] text-sidebar-foreground/70">
              <Menu className="size-[14px]" />
            </div>
          </button>
        </div>
      </nav>
    </div>
  );
}
