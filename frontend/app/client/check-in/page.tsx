"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { getCurrentUser, logoutUser } from "@/lib/auth";
import type { CurrentUser } from "@/lib/types";
import { submitCheckIn, getCurrentWeekStatus } from "@/lib/client";
import { AppHeader } from "@/components/ui/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

type Comparison = "better" | "same" | "worse" | "";

const COMPARISON_OPTIONS = [
  { value: "better" as const, emoji: "😊", label: "Better", selected: "border-green-500 bg-green-50 text-green-700", hover: "hover:border-green-200" },
  { value: "same" as const, emoji: "😐", label: "Same", selected: "border-gray-400 bg-gray-100 text-gray-700", hover: "hover:border-gray-300" },
  { value: "worse" as const, emoji: "😔", label: "Worse", selected: "border-red-400 bg-red-50 text-red-700", hover: "hover:border-red-200" },
];

function getCurrentWeekLabel(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  return monday.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function ClientCheckInPage() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [error, setError] = useState("");
  const [noProfile, setNoProfile] = useState(false);

  const [weight, setWeight] = useState("");
  const [sleep, setSleep] = useState([7]);
  const [energy, setEnergy] = useState([7]);
  const [mood, setMood] = useState([7]);
  const [workouts, setWorkouts] = useState("");
  const [comparison, setComparison] = useState<Comparison>("");
  const [notes, setNotes] = useState("");

  const weekLabel = getCurrentWeekLabel();

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "CLIENT") {
          router.replace("/login");
          return;
        }
        setUser(currentUser);

        const status = await getCurrentWeekStatus();
        setAlreadySubmitted(status.submitted);
      } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
        const status = axiosErr.response?.status;
        const msg = axiosErr.response?.data?.message || "";
        if (status === 404 || msg === "Client profile not found") {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!weight || !workouts) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      await submitCheckIn({
        weight: parseFloat(weight),
        sleepHours: sleep[0],
        energyScore: energy[0],
        moodScore: mood[0],
        workoutsCompleted: parseInt(workouts),
        notes: notes.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
      if (axiosErr.response?.status === 409) {
        setAlreadySubmitted(true);
      } else {
        setError(axiosErr.response?.data?.message || "Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (noProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AppHeader user={user} onLogout={handleLogout} />
        <main id="main-content" className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center max-w-md w-full">
            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-teal-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Ready</h1>
            <p className="text-gray-500 text-sm mb-6">
              Your account is set up! Your coach needs to add you to their roster before you can submit check-ins.
              Share your email address with your coach and ask them to add you from their dashboard.
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

  // ── Success View ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AppHeader user={user} onLogout={handleLogout} />
        <main id="main-content" className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center max-w-md w-full">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Check-in Complete!</h1>
            <p className="text-gray-600 mb-8">
              Your weekly check-in has been submitted. Your coach will review it shortly.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/client/progress" className="w-full">
                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                  View My Progress
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSubmitted(false);
                  setWeight("");
                  setSleep([7]);
                  setEnergy([7]);
                  setMood([7]);
                  setWorkouts("");
                  setComparison("");
                  setNotes("");
                }}
              >
                Submit Another Check-in
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── Already Submitted Banner ──────────────────────────────────────────────
  if (alreadySubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AppHeader user={user} onLogout={handleLogout} />
        <main id="main-content" className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center max-w-md w-full">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-teal-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Already Checked In</h1>
            <p className="text-gray-600 mb-8">
              You&apos;ve already submitted a check-in for the week of <span className="font-medium text-gray-900">{weekLabel}</span>. See you next week!
            </p>
            <Link href="/client/progress" className="w-full">
              <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                View My Progress
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ── Check-In Form ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader user={user} onLogout={handleLogout} />

      <main id="main-content" className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Weekly Check-In</h1>
              <p className="text-gray-500 text-sm">Takes less than 2 minutes. Week of {weekLabel}.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7">

              {/* Weight */}
              <div>
                <Label htmlFor="weight">Weight (lbs) <span className="text-red-500">*</span></Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  min="50"
                  max="600"
                  placeholder="e.g. 142.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                  className="mt-1.5"
                />
              </div>

              {/* Sleep Slider */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Sleep (hours per night)</Label>
                  <span className="text-sm font-semibold text-teal-600">{sleep[0]}h</span>
                </div>
                <Slider
                  value={sleep}
                  onValueChange={setSleep}
                  min={0}
                  max={12}
                  step={0.5}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>0h</span>
                  <span>12h</span>
                </div>
              </div>

              {/* Energy Slider */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Energy Level</Label>
                  <span className="text-sm font-semibold text-teal-600">{energy[0]}/10</span>
                </div>
                <Slider
                  value={energy}
                  onValueChange={setEnergy}
                  min={1}
                  max={10}
                  step={1}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>1 — Exhausted</span>
                  <span>10 — On fire 🔥</span>
                </div>
              </div>

              {/* Mood Slider */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Mood</Label>
                  <span className="text-sm font-semibold text-teal-600">{mood[0]}/10</span>
                </div>
                <Slider
                  value={mood}
                  onValueChange={setMood}
                  min={1}
                  max={10}
                  step={1}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>1 — Very low</span>
                  <span>10 — Great 😊</span>
                </div>
              </div>

              {/* Workouts */}
              <div>
                <Label htmlFor="workouts">Workouts This Week <span className="text-red-500">*</span></Label>
                <Input
                  id="workouts"
                  type="number"
                  min="0"
                  max="21"
                  placeholder="e.g. 4"
                  value={workouts}
                  onChange={(e) => setWorkouts(e.target.value)}
                  required
                  className="mt-1.5"
                />
              </div>

              {/* Comparison */}
              <div>
                <Label className="mb-3 block">Compared to last week, I feel:</Label>
                <div className="grid grid-cols-3 gap-3">
                  {COMPARISON_OPTIONS.map((opt) => {
                    const isSelected = comparison === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setComparison(opt.value)}
                        className={`flex flex-col items-center gap-1.5 py-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? opt.selected
                            : `border-gray-200 bg-white text-gray-600 ${opt.hover}`
                        }`}
                      >
                        <span className="text-2xl">{opt.emoji}</span>
                        <span className="text-sm font-semibold">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Anything your coach should know? <span className="text-gray-400 font-normal">(Optional)</span></Label>
                <textarea
                  id="notes"
                  rows={4}
                  placeholder="Felt great this week! Workouts are getting easier..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 text-base font-semibold disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Check-In"}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
