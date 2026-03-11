import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  ArrowRight,
  Bookmark,
  Heart,
  MapPin,
  Search,
  Star,
  Store,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function UserDashboardPage() {
  await requireRole(["user", "farm_owner", "admin"]);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user!.id)
    .single();

  // Fetch a sample of published farms
  const { data: farms } = await supabase
    .from("farms")
    .select("id, name, location_label, region_id, cover_image_url")
    .eq("is_published", true)
    .limit(6);

  const { count: totalFarms } = await supabase
    .from("farms")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true);

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  const hours = new Date().getHours();
  const greeting =
    hours < 12 ? "God morgon" : hours < 17 ? "God eftermiddag" : "God kväll";

  const today = new Date().toLocaleDateString("sv-SE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--header-height": "4rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset className="bg-cream dark:bg-[#171b18] text-slate-900 dark:text-slate-100 font-body min-h-screen border-none overflow-x-hidden">
        <SiteHeader />

        <main className="flex-1 w-full">
          <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-4xl font-bold tracking-tight text-soil font-display">
                  {greeting}, {firstName}
                </h2>
                <p className="text-slate-500 font-medium mt-1 font-body">
                  {todayCapitalized}
                </p>
              </div>
              <div className="flex gap-3 font-body">
                <button className="flex items-center gap-2 bg-moss px-4 py-2 rounded-lg text-sm font-bold text-white hover:brightness-110 shadow-lg shadow-moss/20 transition-all focus:ring-2 focus:ring-wheat outline-none">
                  <Search className="w-4 h-4" />
                  Hitta Gårdar
                </button>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-soil/5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-moss/10 rounded-lg text-moss">
                    <Store className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                    Totalt
                  </span>
                </div>
                <p className="text-slate-500 text-sm font-medium">
                  Gårdar Tillgängliga
                </p>
                <p className="text-3xl font-display font-bold text-soil mt-1">
                  {totalFarms ?? 0}
                </p>
              </div>

              <div className="bg-wheat/10 dark:bg-wheat/20 p-6 rounded-xl border border-wheat/30 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-wheat text-white rounded-lg">
                    <Bookmark className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-wheat bg-white px-2 py-1 rounded">
                    Sparade
                  </span>
                </div>
                <p className="text-soil/70 text-sm font-medium">
                  Sparade Gårdar
                </p>
                <p className="text-3xl font-display font-bold text-soil mt-1">
                  0
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-soil/5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-red-50 rounded-lg text-red-500">
                    <Heart className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">
                    Favoriter
                  </span>
                </div>
                <p className="text-slate-500 text-sm font-medium">
                  Favoritgårdar
                </p>
                <p className="text-3xl font-display font-bold text-soil mt-1">
                  0
                </p>
              </div>
            </div>

            {/* Bottom Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Nearby Farms */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-800/50 rounded-xl border border-soil/5 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-soil/5 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-soil font-display">
                    Utforska Gårdar
                  </h3>
                  <button className="text-sm font-bold text-moss hover:underline font-body">
                    Se alla
                  </button>
                </div>
                <div className="overflow-x-auto">
                  {farms && farms.length > 0 ? (
                    <table className="w-full text-left font-body">
                      <thead className="bg-soil/5 text-soil/60 uppercase text-[10px] font-bold tracking-wider">
                        <tr>
                          <th className="px-6 py-4">Gårdsnamn</th>
                          <th className="px-6 py-4">Plats</th>
                          <th className="px-6 py-4 text-right">Åtgärder</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-soil/5">
                        {farms.map((farm) => (
                          <tr
                            key={farm.id}
                            className="hover:bg-soil/2 transition-colors"
                          >
                            <td className="px-6 py-4 font-bold text-soil">
                              {farm.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {farm.location_label ?? "Okänd plats"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  className="p-1.5 text-red-400 hover:bg-red-50 rounded"
                                  title="Spara som favorit"
                                >
                                  <Heart className="w-4 h-4" />
                                </button>
                                <button
                                  className="p-1.5 text-moss hover:bg-moss/10 rounded"
                                  title="Visa gård"
                                >
                                  <ArrowRight className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-12 text-center">
                      <Store className="w-10 h-10 text-soil/20 mx-auto mb-3" />
                      <p className="text-slate-500 text-sm">
                        Inga gårdar publicerade ännu.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar panels */}
              <div className="space-y-6">
                {/* Explore by Region */}
                <div className="bg-soil text-white p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-bold mb-4 font-display">
                    Utforska efter Region
                  </h3>
                  <div className="space-y-3 font-body">
                    {[
                      "Skåne",
                      "Småland",
                      "Uppland",
                      "Västra Götaland",
                      "Dalarna",
                    ].map((region) => (
                      <button
                        key={region}
                        className="w-full flex items-center justify-between p-3 rounded-lg bg-white/10 hover:bg-wheat hover:text-soil transition-all outline-none focus:ring-2 focus:ring-wheat"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span className="font-medium">{region}</span>
                        </div>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Top Rated */}
                <div className="bg-white p-6 rounded-xl border border-soil/5 shadow-sm font-body">
                  <h3 className="text-lg font-bold text-soil mb-4 font-display">
                    Toppbetyg
                  </h3>
                  <div className="space-y-4">
                    {[
                      { name: "Lilla Gröna Gården", region: "Skåne", stars: 5 },
                      {
                        name: "Berglunds Äppelgård",
                        region: "Småland",
                        stars: 5,
                      },
                      {
                        name: "Eklunds Ekologiska",
                        region: "Uppland",
                        stars: 4,
                      },
                    ].map(({ name, region, stars }) => (
                      <div
                        key={name}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-bold text-soil">{name}</p>
                          <p className="text-xs text-slate-400">{region}</p>
                        </div>
                        <div className="flex">
                          {Array.from({ length: stars }).map((_, i) => (
                            <Star
                              key={i}
                              className="w-3 h-3 text-wheat fill-wheat"
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
