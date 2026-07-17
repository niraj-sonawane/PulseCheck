"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Scale,
  TrendingDown,
  TrendingUp,
  Flame,
  Award,
  AlertCircle,
} from "lucide-react";

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

function formatWeekLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
import { getCurrentUser, logoutUser } from "@/lib/auth";
import type { CurrentUser } from "@/lib/types";
import { getCheckIns, getClientMetrics, getCurrentWeekStatus } from "@/lib/client";
import type { CheckIn, ClientMetrics } from "@/lib/client";
import { AppHeader } from "@/components/ui/app-header";
import { MetricCard } from "@/components/ui/metric-card";
import { Button } from "@/components/ui/button";

export default function ClientProgressPage() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [metrics, setMetrics] = useState<ClientMetrics | null>(null);
  const [pendingCheckIn, setPendingCheckIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showStreakBanner, setShowStreakBanner] = useState(true);
  const [noProfile, setNoProfile] = useState(false);

  // Prepare chart data — sorted ascending (oldest first) for left-to-right progression
  const chartData = useMemo(() => {
    return [...checkIns].reverse().map((c) => ({
      week: formatWeekLabel(c.weekDate),
      weight: c.weight,
      energy: c.energyScore,
      mood: c.moodScore,
      sleep: c.sleepHours,
      workouts: c.workoutsCompleted,
    }));
  }, [checkIns]);

  const recentCheckIns = useMemo(() => checkIns.slice(0, 4), [checkIns]);

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "CLIENT") {
          router.replace("/login");
          return;
        }
        setUser(currentUser);

        const [history, metricsData, weekStatus] = await Promise.all([
          getCheckIns(),
          getClientMetrics(),
          getCurrentWeekStatus(),
        ]);

        setCheckIns(history);
        setMetrics(metricsData);
        setPendingCheckIn(!weekStatus.submitted);
      } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
        const status = axiosErr.response?.status;
        const msg = axiosErr.response?.data?.message || "";
        if (status === 404 || msg === "Client profile not found") {
          // User is a CLIENT but has not been assigned to a coach yet
          setNoProfile(true);
        } else {
          router.replace("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (noProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AppHeader user={user} onLogout={handleLogout} />
        <main id="main-content" className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center max-w-md w-full">
            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Flame className="w-8 h-8 text-teal-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Waiting for Your Coach</h1>
            <p className="text-gray-500 text-sm mb-6">
              Your account is set up! Your coach needs to add you to their roster before you can access your dashboard.
              Share your email address with your coach and ask them to add you.
            </p>
            <button
              onClick={handleLogout}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium underline"
            >
              Sign out
            </button>
          </div>
        </main>
      </div>
    );
  }


  const weightChangePositive = metrics && metrics.weightChange > 0;
  const milestoneWeeks = [5, 8, 12, 20];
  const currentMilestone = metrics
    ? milestoneWeeks.filter((w) => w <= metrics.currentStreak).pop()
    : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader user={user} onLogout={handleLogout} />

      <main id="main-content" className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Your Progress</h1>
          <p className="text-gray-500 text-sm">Track your weekly check-ins and see how far you&apos;ve come.</p>
        </div>

        {/* Pending check-in banner */}
        {pendingCheckIn && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-0.5">You haven&apos;t checked in this week.</h3>
                <p className="text-sm text-gray-600">Keep your streak going! It only takes 2 minutes.</p>
              </div>
            </div>
            <Link href="/client/check-in" className="flex-shrink-0">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white whitespace-nowrap text-sm">
                Check in now
              </Button>
            </Link>
          </div>
        )}

        {/* Streak Milestone Banner */}
        {currentMilestone && showStreakBanner && (
          <div className="mb-6 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="font-semibold text-amber-900">
                  {currentMilestone} weeks in a row! ✨🌟🎊💪
                </p>
                <p className="text-sm text-amber-700">Incredible consistency — keep it up!</p>
              </div>
            </div>
            <button
              onClick={() => setShowStreakBanner(false)}
              className="text-amber-400 hover:text-amber-600 flex-shrink-0 text-lg font-medium"
              aria-label="Dismiss banner"
            >
              ✕
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Current Weight"
            value={metrics ? `${metrics.currentWeight} lbs` : "—"}
            icon={<Scale className="w-4 h-4 text-teal-600" />}
          />
          <MetricCard
            title="Weight Change"
            value={
              metrics
                ? `${metrics.weightChange > 0 ? "+" : ""}${metrics.weightChange} lbs`
                : "—"
            }
            icon={
              weightChangePositive
                ? <TrendingUp className="w-4 h-4 text-red-500" />
                : <TrendingDown className="w-4 h-4 text-green-600" />
            }
            className={
              metrics
                ? metrics.weightChange < 0
                  ? "[&_p]:text-green-600"
                  : metrics.weightChange > 0
                  ? "[&_p]:text-red-600"
                  : ""
                : ""
            }
          />
          <MetricCard
            title="Current Streak"
            value={metrics ? `${metrics.currentStreak} wks` : "—"}
            icon={<Flame className="w-4 h-4 text-orange-500" />}
          />
          <MetricCard
            title="Best Streak"
            value={metrics ? `${metrics.bestStreak} wks` : "—"}
            icon={<Award className="w-4 h-4 text-amber-500" />}
          />
        </div>

        {/* Empty State */}
        {checkIns.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Flame className="w-8 h-8 text-teal-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No check-ins yet</h3>
            <p className="text-gray-500 text-sm mb-6">Your progress charts will appear after your first check-in.</p>
            <Link href="/client/check-in">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white">Submit My First Check-In</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="sr-only">
              <h2>Check-In Visualizations Description</h2>
              <p>The charts below represent your weight history, sleep logs, mood and energy ratings, and completed weekly workouts. All values are also available in tabular form under the Recent Check-Ins section.</p>
            </div>
            {/* Charts Grid */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">

              {/* Weight Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Weight Over Time</h2>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" domain={["auto", "auto"]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: 12 }}
                      labelStyle={{ fontWeight: 600, color: "#111827" }}
                    />
                    <Line type="monotone" dataKey="weight" stroke="#0d9488" strokeWidth={2} dot={{ fill: "#0d9488", r: 4 }} name="Weight (lbs)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Energy & Mood Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Energy & Mood</h2>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: 12 }}
                      labelStyle={{ fontWeight: 600, color: "#111827" }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b", r: 4 }} name="Energy" />
                    <Line type="monotone" dataKey="mood" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6", r: 4 }} name="Mood" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Workouts Chart — full width */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Workouts Per Week</h2>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                    <YAxis domain={[0, 7]} tick={{ fontSize: 11 }} stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: 12 }}
                      labelStyle={{ fontWeight: 600, color: "#111827" }}
                    />
                    <Bar dataKey="workouts" fill="#0d9488" radius={[4, 4, 0, 0]} name="Workouts" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Check-Ins Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Check-Ins</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentCheckIns.map((c, idx) => (
                  <div key={c.id} className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                    <div className="mb-3">
                      <p className="font-semibold text-gray-900 text-sm">
                        {idx === 0 ? "This Week" : `Week ${checkIns.length - idx}`}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(c.weekDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Weight:</span>
                        <span className="font-medium text-gray-900">{c.weight} lbs</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Sleep:</span>
                        <span className="font-medium text-gray-900">{c.sleepHours}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Energy:</span>
                        <span className="font-medium text-gray-900">{c.energyScore}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Mood:</span>
                        <span className="font-medium text-gray-900">{c.moodScore}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Workouts:</span>
                        <span className="font-medium text-gray-900">{c.workoutsCompleted}</span>
                      </div>
                    </div>
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
