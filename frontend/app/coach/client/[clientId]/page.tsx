"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, Scale, TrendingDown, TrendingUp, BarChart2, Flame } from "lucide-react";

// Lazy load Recharts components to reduce initial bundle size
const ResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false, loading: () => <div className="h-[220px] bg-gray-50 rounded-xl animate-pulse" /> }
);
const LineChart = dynamic(
  () => import("recharts").then((mod) => mod.LineChart),
  { ssr: false }
);
const Line = dynamic(
  () => import("recharts").then((mod) => mod.Line),
  { ssr: false }
);
const BarChart = dynamic(
  () => import("recharts").then((mod) => mod.BarChart),
  { ssr: false }
);
const Bar = dynamic(
  () => import("recharts").then((mod) => mod.Bar),
  { ssr: false }
);
const XAxis = dynamic(
  () => import("recharts").then((mod) => mod.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import("recharts").then((mod) => mod.YAxis),
  { ssr: false }
);
const CartesianGrid = dynamic(
  () => import("recharts").then((mod) => mod.CartesianGrid),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import("recharts").then((mod) => mod.Tooltip),
  { ssr: false }
);
const Legend = dynamic(
  () => import("recharts").then((mod) => mod.Legend),
  { ssr: false }
);

import { getCurrentUser, logoutUser } from "@/lib/auth";
import type { CurrentUser } from "@/lib/types";
import { getCoachClientDetail } from "@/lib/client";
import type { ClientDetail } from "@/lib/client";
import { AppHeader } from "@/components/ui/app-header";
import { MetricCard } from "@/components/ui/metric-card";
import { Button } from "@/components/ui/button";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function CoachClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params?.clientId as string;

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [clientDetail, setClientDetail] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const checkIns = useMemo(() => clientDetail?.checkIns || [], [clientDetail]);

  // Chart data sorted ascending (oldest first)
  const chartData = useMemo(() => {
    return [...checkIns].reverse().map((c) => ({
      week: formatDate(c.weekDate),
      weight: c.weight,
      energy: c.energyScore,
      mood: c.moodScore,
      workouts: c.workoutsCompleted,
    }));
  }, [checkIns]);

  const recentCheckIns = useMemo(() => checkIns.slice(0, 4), [checkIns]);

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "COACH") {
          router.replace("/login");
          return;
        }
        setUser(currentUser);

        const detail = await getCoachClientDetail(clientId);
        setClientDetail(detail);
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message || "Failed to load client profile.");
      } finally {
        setLoading(false);
      }
    };
    if (clientId) init();
  }, [clientId, router]);

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading client profile...</p>
        </div>
      </div>
    );
  }

  if (error || !clientDetail) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AppHeader user={user} onLogout={handleLogout} />
        <main id="main-content" className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-red-600 font-semibold mb-4">{error || "Client not found."}</p>
            <Link href="/coach/dashboard">
              <Button variant="outline">← Back to Dashboard</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const { name, email, metrics } = clientDetail;

  const weightChangePositive = metrics.weightChange > 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader user={user} onLogout={handleLogout} />

      <main id="main-content" className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full">

        {/* Back + Client Header */}
        <div className="mb-6">
          <Link href="/coach/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Dashboard
          </Link>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
                <p className="text-sm text-gray-500 mt-0.5">{email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  {metrics.totalCheckIns} check-ins total
                </span>
              </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <MetricCard
                title="Current Weight"
                value={`${metrics.currentWeight} lbs`}
                icon={<Scale className="w-4 h-4 text-teal-600" />}
              />
              <MetricCard
                title="Weight Change"
                value={`${metrics.weightChange > 0 ? "+" : ""}${metrics.weightChange} lbs`}
                icon={
                  weightChangePositive
                    ? <TrendingUp className="w-4 h-4 text-red-500" />
                    : <TrendingDown className="w-4 h-4 text-green-600" />
                }
                className={
                  metrics.weightChange < 0
                    ? "[&_p]:text-green-600"
                    : metrics.weightChange > 0
                    ? "[&_p]:text-red-600"
                    : ""
                }
              />
              <MetricCard
                title="Current Streak"
                value={`${metrics.currentStreak} wks`}
                icon={<Flame className="w-4 h-4 text-orange-500" />}
              />
              <MetricCard
                title="Total Check-Ins"
                value={metrics.totalCheckIns}
                icon={<BarChart2 className="w-4 h-4 text-teal-600" />}
              />
            </div>
          </div>
        </div>

        {/* Empty State */}
        {checkIns.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No check-ins yet</h3>
            <p className="text-gray-500 text-sm">
              {name} hasn&apos;t submitted a check-in yet. Charts will appear once they do.
            </p>
          </div>
        ) : (
          <>
            <div className="sr-only">
              <h2>Client Visualizations Description</h2>
              <p>The charts below represent the client&apos;s weight tracking, energy and mood logs, and completed workouts. Full data is also available in tabular form in the Recent Check-Ins section below.</p>
            </div>
            {/* Charts Grid */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">

              {/* Weight Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Weight Over Time</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" domain={["auto", "auto"]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: 11 }}
                      labelStyle={{ fontWeight: 600, color: "#111827" }}
                    />
                    <Line type="monotone" dataKey="weight" stroke="#0d9488" strokeWidth={2} dot={{ fill: "#0d9488", r: 3 }} name="Weight (lbs)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Energy & Mood Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Energy & Mood</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: 11 }}
                      labelStyle={{ fontWeight: 600, color: "#111827" }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b", r: 3 }} name="Energy" />
                    <Line type="monotone" dataKey="mood" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6", r: 3 }} name="Mood" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Workouts Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Workouts Per Week</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                    <YAxis domain={[0, 7]} tick={{ fontSize: 10 }} stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: 11 }}
                      labelStyle={{ fontWeight: 600, color: "#111827" }}
                    />
                    <Bar dataKey="workouts" fill="#0d9488" radius={[4, 4, 0, 0]} name="Workouts" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Check-Ins */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Check-Ins</h2>
              <div className="space-y-3">
                {recentCheckIns.map((c, idx) => (
                  <div key={c.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-gray-900 text-sm">
                        {idx === 0 ? "Latest" : formatDate(c.weekDate)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(c.weekDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Weight</p>
                        <p className="font-semibold text-gray-900">{c.weight} lbs</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Sleep</p>
                        <p className="font-semibold text-gray-900">{c.sleepHours}h</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Energy</p>
                        <p className="font-semibold text-gray-900">{c.energyScore}/10</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Mood</p>
                        <p className="font-semibold text-gray-900">{c.moodScore}/10</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Workouts</p>
                        <p className="font-semibold text-gray-900">{c.workoutsCompleted}</p>
                      </div>
                    </div>
                    {c.notes && (
                      <p className="mt-3 text-sm text-gray-600 bg-white rounded-lg border border-gray-200 px-3 py-2">
                        💬 {c.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
