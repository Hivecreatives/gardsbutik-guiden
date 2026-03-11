import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Bell, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";

export function SiteHeader() {
  return (
    <header className="h-16 bg-white dark:bg-[#171b18]/50 border-b border-soil/10 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex-1 max-w-md flex items-center gap-2 lg:gap-4">
        <SidebarTrigger className="-ml-1 text-slate-500 hover:text-soil hover:bg-soil/5" />
        <div className="relative group w-full ml-2 md:ml-0">
          <Input
            className="w-full bg-soil/5 border-none rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-wheat text-sm font-body outline-none"
            placeholder="Search farms, users or orders..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 lg:gap-4">
        <Popover>
          <PopoverTrigger>
            <button className="size-10 rounded-full hidden md:flex items-center justify-center hover:bg-soil/5 relative">
              <Bell />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-40 h-fit p-6">
            <p className="text-lg">Notifications</p>
          </PopoverContent>
        </Popover>
        <div className="h-8 w-px bg-soil/10 mx-1 md:mx-2 hidden md:block"></div>
        <Popover>
          <PopoverTrigger>
            <button className="flex items-center gap-2 bg-soil/5 hover:bg-soil/10 transition-all px-3 py-1.5 rounded-full border border-soil/5">
              <div className="size-7 rounded-full bg-moss flex items-center justify-center text-white text-xs font-bold">
                EA
              </div>
              <span className="text-sm font-medium pr-1 font-body hidden sm:inline-block">
                Erik
              </span>
              <ChevronDown className="size-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-44 h-fit p-4">
            <p>Profile</p>
            <p>Settings</p>
            <Button variant="destructive">Logout</Button>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
