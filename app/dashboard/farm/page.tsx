"use client";

import {
  ArrowRight,
  CircleCheck,
  Clock,
  Eye,
  Image,
  MapPin,
  Package,
  PencilLine,
  Plus,
  Store,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { FarmPageActions } from "@/components/farm-page-actions";
import { useFarm } from "@/hooks/useFarm";
import { useUser } from "@/hooks/useUser";

export default function FarmDashboardPage() {
  const { user, profile, loading: userLoading } = useUser();
  const { farms, loading: farmsLoading } = useFarm(user?.id);

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

  // Derived counts from hook data
  const publishedCount = farms.filter((f) => f.is_published).length;
  const pendingCount = farms.filter(
    (f) => !f.is_published && f.submitted && !f.rejection_reason,
  ).length;
  const draftCount = farms.filter(
    (f) => !f.submitted && !f.is_published,
  ).length;
  const rejectedFarms = farms.filter((f) => !!f.rejection_reason);

  // Checklist is driven by the first farm's real data (if any)
  const firstFarm = farms[0] ?? null;
  const checklist = [
    { label: "Grundläggande information", done: !!firstFarm?.name },
    {
      label: "Kontaktuppgifter",
      done: !!firstFarm?.contact_email || !!firstFarm?.contact_number,
    },
    { label: "Omslagsbild uppladdad", done: !!firstFarm?.cover_image_url },
    {
      label: "Öppettider angivna",
      done: (firstFarm?.opening_hours?.length ?? 0) > 0,
    },
    {
      label: "Produkter tillagda",
      done: (firstFarm?.products?.length ?? 0) > 0,
    },
  ];

  const loading = userLoading || farmsLoading;

  if (loading) {
    return (
      <main className="flex-1 w-full flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-soil/40">
          <Store className="w-10 h-10 animate-pulse" />
          <p className="text-sm font-body">Laddar din dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 w-full">
      <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-soil font-display">
              {greeting}, {profile?.full_name?.split(" ")[0] ?? ""}
            </h2>
            <p className="text-slate-500 font-medium mt-1 font-body">
              {todayCapitalized}
            </p>
          </div>
          <FarmPageActions />
        </div>

        {/* Rejection Alert */}
        {rejectedFarms.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <TriangleAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-700">
                {rejectedFarms.length} gård
                {rejectedFarms.length > 1 ? "ar" : ""} avvisad
                {rejectedFarms.length > 1 ? "e" : ""}
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                Granska feedback och uppdatera din ansökan.
              </p>
              {rejectedFarms.map(
                (f) =>
                  f.rejection_reason && (
                    <p
                      key={f.id}
                      className="text-xs text-red-700 mt-1 font-medium"
                    >
                      <span className="font-bold">{f.name}:</span>{" "}
                      {f.rejection_reason}
                    </p>
                  ),
              )}
            </div>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-soil/5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-moss/10 rounded-lg text-moss">
                <Store className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                Publicerade
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium font-body">
              Publicerade Gårdar
            </p>
            <p className="text-3xl font-display font-bold text-soil mt-1">
              {publishedCount}
            </p>
          </div>

          <div className="bg-wheat/10 dark:bg-wheat/20 p-6 rounded-xl border border-wheat/30 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-wheat text-white rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-wheat bg-white px-2 py-1 rounded">
                Väntar
              </span>
            </div>
            <p className="text-soil/70 text-sm font-medium font-body">
              Väntar på Godkännande
            </p>
            <p className="text-3xl font-display font-bold text-soil mt-1">
              {pendingCount}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-soil/5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                <PencilLine className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded">
                Utkast
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium font-body">
              Utkast
            </p>
            <p className="text-3xl font-display font-bold text-soil mt-1">
              {draftCount}
            </p>
          </div>
        </div>

        {/* Bottom Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Farms Table */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800/50 rounded-xl border border-soil/5 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-soil/5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-soil font-display">
                Mina Gårdar
              </h3>
              <Link
                className="text-sm font-bold text-moss hover:underline font-body"
                href="/dashboard/farm/farms"
              >
                Se alla
              </Link>
            </div>
            <div className="overflow-x-auto">
              {farms.length > 0 ? (
                <table className="w-full text-left font-body">
                  <thead className="bg-soil/5 text-soil/60 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Gårdsnamn</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-right">Åtgärder</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-soil/5">
                    {farms.map((farm) => {
                      const status = farm.is_published
                        ? "published"
                        : farm.rejection_reason
                          ? "rejected"
                          : farm.submitted
                            ? "pending"
                            : "draft";

                      const badge = {
                        published: "bg-emerald-100 text-emerald-800",
                        pending: "bg-amber-100 text-amber-800",
                        draft: "bg-stone-100 text-stone-500",
                        rejected: "bg-red-100 text-red-800",
                      }[status];

                      const label = {
                        published: "Publicerad",
                        pending: "Väntar",
                        draft: "Utkast",
                        rejected: "Avvisad",
                      }[status];

                      return (
                        <tr
                          key={farm.id}
                          className="hover:bg-soil/[0.02] transition-colors"
                        >
                          <td className="px-6 py-4">
                            <p className="font-bold text-soil">{farm.name}</p>
                            {farm.location_label && (
                              <p className="text-xs text-slate-400 mt-0.5">
                                {farm.location_label}
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase ${badge}`}
                            >
                              {label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                className="p-1.5 text-slate-500 hover:bg-slate-50 rounded"
                                title="Redigera"
                              >
                                <PencilLine className="w-4 h-4" />
                              </button>
                              <button
                                className="p-1.5 text-moss hover:bg-moss/10 rounded"
                                title="Förhandsgranska"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center">
                  <Store className="w-10 h-10 text-soil/20 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">
                    Du har inga gårdar ännu.
                  </p>
                  <button className="mt-4 flex items-center gap-2 bg-moss text-white px-4 py-2 rounded-lg text-sm font-bold mx-auto hover:brightness-110 transition-all">
                    <Plus className="w-4 h-4" /> Lägg till din första gård
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-soil text-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold mb-4 font-display">
                Snabbåtgärder
              </h3>
              <div className="space-y-3 font-body">
                {[
                  {
                    icon: <Plus className="w-4 h-4" />,
                    label: "Lägg till Gård",
                  },
                  {
                    icon: <Package className="w-4 h-4" />,
                    label: "Hantera Produkter",
                  },
                  {
                    icon: <Image className="w-4 h-4" />,
                    label: "Ladda upp Bilder",
                  },
                  {
                    icon: <MapPin className="w-4 h-4" />,
                    label: "Uppdatera Plats",
                  },
                ].map(({ icon, label }) => (
                  <button
                    key={label}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-white/10 hover:bg-wheat hover:text-soil transition-all outline-none focus:ring-2 focus:ring-wheat"
                  >
                    <div className="flex items-center gap-2">
                      {icon}
                      <span className="font-medium">{label}</span>
                    </div>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Submission Checklist — driven by first farm's real data */}
            <div className="bg-white p-6 rounded-xl border border-soil/5 shadow-sm font-body">
              <h3 className="text-lg font-bold text-soil mb-1 font-display">
                Checklista för Publicering
              </h3>
              {firstFarm && (
                <p className="text-xs text-slate-400 mb-4">{firstFarm.name}</p>
              )}
              <div className="space-y-3">
                {checklist.map(({ done, label }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-moss" : "bg-soil/10"}`}
                    >
                      {done && <CircleCheck className="w-3 h-3 text-white" />}
                    </div>
                    <span
                      className={`text-sm ${done ? "text-soil font-medium" : "text-slate-400"}`}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
              <button
                disabled={!firstFarm || firstFarm.submitted}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-moss/10 text-moss rounded-lg py-2 text-sm font-bold hover:bg-moss/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {firstFarm?.submitted
                  ? "Inskickad för granskning"
                  : "Skicka in för Granskning"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
