import {
  ArrowDownToLine,
  ArrowRight,
  Box,
  CircleCheck,
  CircleX,
  ClipboardClock,
  Group,
  Plus,
  Store,
} from "lucide-react";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  await requireRole(["admin"]);

  const supabase = await createClient();
  const { data: farms } = await supabase
    .from("farms")
    .select(
      "id, name, is_published, submitted, rejection_reason, owner_id, created_at, region_id",
    )
    .order("created_at", { ascending: false });

  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const totalFarms = farms?.length ?? 0;
  const pendingFarms =
    farms?.filter((f) => f.submitted && !f.is_published) ?? [];
  const publishedCount = farms?.filter((f) => f.is_published).length ?? 0;

  return (
    <main className="flex-1 w-full">
      <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-soil font-display">
              Admin Dashboard
            </h2>
            <p className="text-slate-500 font-medium mt-1 font-body">
              {new Date()
                .toLocaleDateString("sv-SE", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
                .replace(/^\w/, (c) => c.toUpperCase())}
            </p>
          </div>
          <div className="flex gap-3 font-body">
            <button className="flex items-center gap-2 bg-white border border-soil/10 px-4 py-2 rounded-lg text-sm font-bold text-soil hover:shadow-sm transition-all">
              <ArrowDownToLine className="w-4 h-4" />
              Export Data
            </button>
            <button className="flex items-center gap-2 bg-moss px-4 py-2 rounded-lg text-sm font-bold text-white hover:brightness-110 shadow-lg shadow-moss/20 transition-all">
              <Plus className="w-4 h-4" />
              New Farm
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-soil/5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-moss/10 rounded-lg text-moss">
                <Store className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                Totalt
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium">Total Gårdar</p>
            <p className="text-3xl font-display font-bold text-soil mt-1">
              {totalFarms}
            </p>
          </div>
          <div className="bg-wheat/10 p-6 rounded-xl border border-wheat/30 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-wheat text-white rounded-lg">
                <ClipboardClock className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-wheat bg-white px-2 py-1 rounded">
                Åtgärd krävs
              </span>
            </div>
            <p className="text-soil/70 text-sm font-medium">
              Väntar på Godkännande
            </p>
            <p className="text-3xl font-display font-bold text-soil mt-1">
              {pendingFarms.length}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-soil/5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Group className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded">
                Totalt
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium">
              Totala Användare
            </p>
            <p className="text-3xl font-display font-bold text-soil mt-1">
              {totalUsers ?? 0}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-soil/5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <Box className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                Live
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium">
              Publicerade Gårdar
            </p>
            <p className="text-3xl font-display font-bold text-soil mt-1">
              {publishedCount}
            </p>
          </div>
        </div>

        {/* Approval Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800/50 rounded-xl border border-soil/5 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-soil/5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-soil font-display">
                Godkännandekö
              </h3>
              <Link
                className="text-sm font-bold text-moss hover:underline"
                href="/dashboard/admin/approvals"
              >
                Se alla
              </Link>
            </div>
            <div className="overflow-x-auto">
              {pendingFarms.length > 0 ? (
                <table className="w-full text-left font-body">
                  <thead className="bg-soil/5 text-soil/60 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Gårdsnamn</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-right">Åtgärder</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-soil/5">
                    {pendingFarms.slice(0, 5).map((farm) => (
                      <tr
                        key={farm.id}
                        className="hover:bg-soil/2 transition-colors"
                      >
                        <td className="px-6 py-4 font-bold text-soil">
                          {farm.name}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex px-2 py-1 rounded bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">
                            Väntar
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                              title="Godkänn"
                            >
                              <CircleCheck className="w-4 h-4" />
                            </button>
                            <button
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              title="Avvisa"
                            >
                              <CircleX className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center">
                  <p className="text-slate-400 text-sm">
                    Inga gårdar väntar på godkännande.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-soil text-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-4 font-display">
              Snabbåtgärder
            </h3>
            <div className="space-y-3 font-body">
              {[
                { label: "Lägg till Kategori" },
                { label: "Hantera Regioner" },
                {
                  label: "Exportera Analys",
                  icon: <ArrowDownToLine className="w-4 h-4" />,
                },
              ].map(({ label, icon }) => (
                <button
                  key={label}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-white/10 hover:bg-wheat hover:text-soil transition-all"
                >
                  <span className="font-medium">{label}</span>
                  {icon ?? <ArrowRight className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
