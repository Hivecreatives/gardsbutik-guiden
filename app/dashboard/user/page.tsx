"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  ArrowRight,
  Bookmark,
  Heart,
  MapPin,
  Search,
  Share2,
  Star,
  Store,
} from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import Image from "next/image";

type Farm = Pick<
  Database["public"]["Tables"]["farms"]["Row"],
  "id" | "name" | "location_label" | "cover_image_url"
> & { category?: string | null };

export default function UserDashboardPage() {
  const { user, profile, loading } = useUser();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [newFarms, setNewFarms] = useState<Farm[]>([]);
  const [totalFarms, setTotalFarms] = useState<number>(0);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();

    const fetchFarms = async () => {
      const [favResult, newResult, countResult] = await Promise.all([
        supabase
          .from("farms")
          .select("id, name, location_label, cover_image_url")
          .eq("is_published", true)
          .limit(4),
        supabase
          .from("farms")
          .select("id, name, location_label, cover_image_url, category")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(4),
        supabase
          .from("farms")
          .select("*", { count: "exact", head: true })
          .eq("is_published", true),
      ]);

      setFarms(favResult.data ?? []);
      // setNewFarms(newResult.data ?? []);
      setTotalFarms(countResult.count ?? 0);
    };

    fetchFarms();
  }, [user]);

  const fullName = profile?.full_name ?? "Användare";
  const firstName = fullName.split(" ")[0];
  const location = (profile as any)?.location_label ?? "Sverige";

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
    <main className="flex-1 w-full">
      <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
        {/* ── User Profile Header ── */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-soil/10 pb-8">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative w-28 h-28 rounded-3xl overflow-hidden border-4 border-white shadow-xl flex-shrink-0">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={fullName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-moss/20 flex items-center justify-center">
                  <span className="text-4xl font-display font-bold text-moss">
                    {firstName.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Name & location */}
            <div className="space-y-1">
              <p className="text-slate-400 text-xs font-body">{greeting}</p>
              <h1 className="text-3xl font-bold tracking-tight font-display text-soil">
                {fullName}
              </h1>
              <div className="flex items-center text-slate-500 gap-1 font-body">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{location}</span>
              </div>
              <p className="text-slate-400 text-xs font-body">
                {todayCapitalized}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 font-body flex-wrap">
            <button className="px-6 py-2.5 bg-moss text-white rounded-xl font-bold shadow-lg shadow-moss/20 hover:brightness-110 transition-all focus:ring-2 focus:ring-wheat outline-none text-sm">
              Redigera Profil
            </button>
            <button className="px-4 py-2.5 border border-soil/20 rounded-xl hover:bg-soil/5 transition-all text-soil">
              <Share2 className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-2 border border-moss/30 px-4 py-2 rounded-lg text-sm font-bold text-moss hover:bg-moss/10 transition-all focus:ring-2 focus:ring-wheat outline-none">
              <Search className="w-4 h-4" />
              Hitta Gårdar
            </button>
          </div>
        </section>

        {/* ── Stat Cards ── */}
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
              {totalFarms}
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
            <p className="text-soil/70 text-sm font-medium">Sparade Gårdar</p>
            <p className="text-3xl font-display font-bold text-soil mt-1">0</p>
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
            <p className="text-slate-500 text-sm font-medium">Favoritgårdar</p>
            <p className="text-3xl font-display font-bold text-soil mt-1">0</p>
          </div>
        </div>

        {/* ── My Favorites Grid ── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-soil font-display">
              Mina Favoriter
            </h2>
            <button className="text-sm font-bold text-moss hover:underline font-body">
              Se alla
            </button>
          </div>

          {farms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {farms.map((farm) => (
                <div
                  key={farm.id}
                  className="group relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  <div className="h-48 bg-soil/10 relative overflow-hidden">
                    {farm.cover_image_url ? (
                      <Image
                        src={farm.cover_image_url}
                        alt={farm.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-moss/10">
                        <Store className="w-10 h-10 text-moss/30" />
                      </div>
                    )}
                  </div>
                  <div className="absolute top-3 right-3">
                    <button
                      className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm text-red-500 flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                      title="Ta bort från favoriter"
                    >
                      <Heart className="w-4 h-4 fill-red-500" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-soil font-display">
                      {farm.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 font-body flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {farm.location_label ?? "Okänd plats"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-12 text-center border border-soil/5">
              <Heart className="w-10 h-10 text-soil/20 mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-body">
                Du har inga favoritgårdar ännu.
              </p>
              <button className="mt-4 text-sm font-bold text-moss hover:underline font-body">
                Utforska gårdar →
              </button>
            </div>
          )}
        </section>

        {/* ── Bottom Layout: Newly Added + Sidebar Panels ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Newly Added Near You */}
          <div className="lg:col-span-2 bg-moss/5 rounded-3xl p-6">
            <div className="mb-5">
              <h3 className="text-xl font-bold text-soil font-display">
                Nyligen Tillagda Nära Dig
              </h3>
              <p className="text-sm text-slate-500 font-body">
                Upptäck nya lokala favoriter inom 20 km
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(newFarms.length > 0
                ? newFarms
                : ([
                    {
                      id: "1",
                      name: "Lilla Gröna Gården",
                      location_label: "4,2 km bort",
                      cover_image_url: null,
                      category: "Handgjorda Ostar",
                    },
                    {
                      id: "2",
                      name: "Odens Mejeri",
                      location_label: "8,7 km bort",
                      cover_image_url: null,
                      category: "Färsk Mjölk & Smör",
                    },
                    {
                      id: "3",
                      name: "Berglunds Äppelgård",
                      location_label: "12 km bort",
                      cover_image_url: null,
                      category: "Äpplen & Juice",
                    },
                    {
                      id: "4",
                      name: "Eklunds Ekologiska",
                      location_label: "15 km bort",
                      cover_image_url: null,
                      category: "Grönsaker & Örter",
                    },
                  ] as Farm[])
              ).map((farm, idx) => (
                <div
                  key={farm.id}
                  className="flex bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="w-28 flex-shrink-0 relative bg-moss/10 min-h-[5rem]">
                    {farm.cover_image_url ? (
                      <Image
                        src={farm.cover_image_url}
                        alt={farm.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Store className="w-6 h-6 text-moss/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col justify-center gap-1">
                    <h4 className="font-bold text-moss font-display text-sm">
                      {farm.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-body">
                      {(farm as any).category ?? "Ekologisk gård"} •{" "}
                      {farm.location_label ?? "Okänd plats"}
                    </p>
                    <div className="flex gap-0.5 mt-1">
                      {Array.from({ length: 4 - (idx % 2) }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-3 h-3 text-wheat fill-wheat"
                        />
                      ))}
                      {Array.from({ length: 1 + (idx % 2) }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-3 h-3 text-slate-200 fill-slate-200"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
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
            <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-soil/5 shadow-sm font-body">
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
                  <div key={name} className="flex items-center justify-between">
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
  );
}
