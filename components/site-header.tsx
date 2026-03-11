import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Bell, ChevronDown, LogOut, Settings, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single()
    : { data: null };

  const displayName =
    profile?.full_name ?? user?.email?.split("@")[0] ?? "User";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-16 bg-white dark:bg-[#171b18]/50 border-b border-soil/10 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex-1 max-w-md flex items-center gap-2 lg:gap-4">
        <SidebarTrigger className="-ml-1 text-slate-500 hover:text-soil hover:bg-soil/5" />
        <div className="relative group w-full ml-2 md:ml-0">
          <Input
            className="w-full bg-soil/5 border-none rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-wheat text-sm font-body outline-none"
            placeholder="Sök gårdar, användare..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 lg:gap-4">
        <Popover>
          <PopoverTrigger>
            <div className="size-10 rounded-full hidden md:flex items-center justify-center hover:bg-soil/5 relative">
              <Bell className="w-5 h-5" />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-64 h-fit p-4">
            <p className="text-sm font-bold text-soil mb-2">Aviseringar</p>
            <p className="text-xs text-slate-400">Inga nya aviseringar.</p>
          </PopoverContent>
        </Popover>
        <div className="h-8 w-px bg-soil/10 mx-1 md:mx-2 hidden md:block" />
        <Popover>
          <PopoverTrigger>
            <div className="flex items-center gap-2 bg-soil/5 hover:bg-soil/10 transition-all px-3 py-1.5 rounded-full border border-soil/5">
              <div className="size-7 rounded-full bg-moss flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
              <span className="text-sm font-medium pr-1 font-body hidden sm:inline-block">
                {displayName.split(" ")[0]}
              </span>
              <ChevronDown className="size-4" />
            </div>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-48 h-fit p-2">
            <div className="px-2 py-1.5 mb-1">
              <p className="text-xs font-bold text-soil">{displayName}</p>
              <p className="text-xs text-slate-400 capitalize">
                {profile?.role ?? "user"}
              </p>
            </div>
            <div className="border-t border-soil/5 pt-1 space-y-0.5">
              <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-slate-600 hover:bg-soil/5 rounded-md transition-colors">
                <User className="w-4 h-4" /> Profil
              </button>
              <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-slate-600 hover:bg-soil/5 rounded-md transition-colors">
                <Settings className="w-4 h-4" /> Inställningar
              </button>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Logga ut
                </button>
              </form>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
