import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  ArrowDownToLine,
  ArrowRight,
  Box,
  CheckCheck,
  CircleCheck,
  CircleX,
  ClipboardClock,
  Group,
  Plus,
  Store,
} from "lucide-react";
import Link from "next/link";

export default function Page() {
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
        {/* Top Navigation */}
        <SiteHeader />

        <main className="flex-1 w-full">
          <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-4xl font-bold tracking-tight text-soil font-display">
                  God morgon, Erik
                </h2>
                <p className="text-slate-500 font-medium mt-1 font-body">
                  Måndag, 20 Maj 2024
                </p>
              </div>
              <div className="flex gap-3 font-body">
                <button className="flex items-center gap-2 bg-white border border-soil/10 px-4 py-2 rounded-lg text-sm font-bold text-soil hover:shadow-sm transition-all focus:ring-2 focus:ring-wheat outline-none">
                  <ArrowDownToLine />
                  Export Data
                </button>
                <button className="flex items-center gap-2 bg-moss px-4 py-2 rounded-lg text-sm font-bold text-white hover:brightness-110 shadow-lg shadow-moss/20 transition-all focus:ring-2 focus:ring-wheat outline-none">
                  <Plus />
                  New Farm
                </button>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-soil/5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-moss/10 rounded-lg text-moss">
                    <Store />
                  </div>
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                    +2%
                  </span>
                </div>
                <p className="text-slate-500 text-sm font-medium font-body">
                  Total Farms
                </p>
                <p className="text-3xl font-display font-bold text-soil mt-1">
                  24
                </p>
              </div>
              <div className="bg-wheat/10 dark:bg-wheat/20 p-6 rounded-xl border border-wheat/30 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-wheat text-white rounded-lg">
                    <ClipboardClock />
                  </div>
                  <span className="text-xs font-bold text-wheat bg-white px-2 py-1 rounded">
                    Action Needed
                  </span>
                </div>
                <p className="text-soil/70 text-sm font-medium font-body">
                  Pending Approval
                </p>
                <p className="text-3xl font-display font-bold text-soil mt-1">
                  5
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-soil/5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <Group />
                  </div>
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                    -1%
                  </span>
                </div>
                <p className="text-slate-500 text-sm font-medium font-body">
                  Total Users
                </p>
                <p className="text-3xl font-display font-bold text-soil mt-1">
                  142
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-soil/5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                    <Box />
                  </div>
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                    +5%
                  </span>
                </div>
                <p className="text-slate-500 text-sm font-medium font-body">
                  Products Listed
                </p>
                <p className="text-3xl font-display font-bold text-soil mt-1">
                  89
                </p>
              </div>
            </div>

            {/* Bottom Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Approval Queue Table */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-800/50 rounded-xl border border-soil/5 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-soil/5 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-soil font-display">
                    Approval Queue
                  </h3>
                  <Link
                    className="text-sm font-bold text-moss hover:underline font-body"
                    href="#"
                  >
                    View all
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-body">
                    <thead className="bg-soil/5 text-soil/60 uppercase text-[10px] font-bold tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Farm Name</th>
                        <th className="px-6 py-4">Owner</th>
                        <th className="px-6 py-4">Region</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-soil/5">
                      <tr className="hover:bg-soil/2 transition-colors">
                        <td className="px-6 py-4 font-bold text-soil">
                          Gröna Dalen
                        </td>
                        <td className="px-6 py-4 text-sm">Anna Larsson</td>
                        <td className="px-6 py-4 text-sm">Skåne</td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          18 Maj, 2024
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex px-2 py-1 rounded bg-[#FEF3C7] text-[#92400E] text-[10px] font-bold uppercase">
                            Pending
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                              title="Approve"
                            >
                              <CircleCheck />
                            </button>
                            <button
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              title="Reject"
                            >
                              <CircleX />
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Actions Sidebar */}
              <div className="space-y-6">
                <div className="bg-soil text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-4 font-display">
                      Quick Actions
                    </h3>
                    <div className="space-y-3 font-body">
                      <button className="w-full flex items-center justify-between p-3 rounded-lg bg-white/10 hover:bg-wheat hover:text-soil transition-all group outline-none focus:ring-2 focus:ring-wheat">
                        <span className="font-medium">Add New Category</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button className="w-full flex items-center justify-between p-3 rounded-lg bg-white/10 hover:bg-wheat hover:text-soil transition-all group outline-none focus:ring-2 focus:ring-wheat">
                        <span className="font-medium">Manage Regions</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button className="w-full flex items-center justify-between p-3 rounded-lg bg-white/10 hover:bg-wheat hover:text-soil transition-all group outline-none focus:ring-2 focus:ring-wheat">
                        <span className="font-medium">Export Analytics</span>
                        <ArrowDownToLine className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-soil/5 shadow-sm font-body">
                  <h3 className="text-lg font-bold text-soil mb-4 font-display">
                    Regional Distribution
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-600">
                          Skåne
                        </span>
                        <span className="font-bold text-soil">45%</span>
                      </div>
                      <div className="w-full h-2 bg-soil/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-moss rounded-full"
                          style={{ width: "45%" }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-600">
                          Småland
                        </span>
                        <span className="font-bold text-soil">28%</span>
                      </div>
                      <div className="w-full h-2 bg-soil/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-wheat rounded-full"
                          style={{ width: "28%" }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-600">
                          Uppland
                        </span>
                        <span className="font-bold text-soil">15%</span>
                      </div>
                      <div className="w-full h-2 bg-soil/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-soil/40 rounded-full"
                          style={{ width: "15%" }}
                        ></div>
                      </div>
                    </div>
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
