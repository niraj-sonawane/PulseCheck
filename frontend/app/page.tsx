"use client";

import Link from "next/link";
import {
  Activity,
  UserPlus,
  ClipboardList,
  TrendingUp,
  Bell,
  BookOpen,
  Zap,
  Smile,
  ShieldAlert,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Activity className="w-6 h-6 text-teal-600" />
              <span className="text-xl font-semibold text-gray-900">PulseCheck</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </a>
              <a href="#for-coaches" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                For Coaches
              </a>
              <a href="#for-clients" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                For Clients
              </a>
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Login
              </Link>
              <Link href="/signup">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm">
                  Get Started
                </Button>
              </Link>
            </div>

            <div className="md:hidden">
              <Link href="/signup">
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-teal-50/30 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6 leading-tight">
                Turn weekly check‑ins into <span className="text-teal-600">real coaching insights.</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-xl">
                Track your clients&apos; weight, mood, energy, and habits with smart alerts. Get notified when something needs your attention. Keep everyone accountable without the manual work.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white w-full sm:w-auto shadow-md">
                    Start as a Coach
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto hover:bg-gray-50 border-gray-300">
                    View My Dashboard
                  </Button>
                </Link>
              </div>
            </div>

            {/* Dashboard Mockup Card */}
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 max-w-md mx-auto w-full">
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="font-semibold text-gray-950">Coach Dashboard</h3>
                  <p className="text-xs text-gray-500">Active roster summary</p>
                </div>
                <div className="bg-red-50 text-red-700 border border-red-100 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping"></span>
                  3 Active Alerts
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { name: "Sarah Lee", status: "Checked in", color: "green", detail: "Last check-in: Today" },
                  { name: "Mike Johnson", status: "Missing", color: "red", detail: "Missed 2 weeks" },
                  { name: "Emma Davis", status: "Checked in", color: "green", detail: "Last check-in: Yesterday" },
                  { name: "Tom Wilson", status: "Missing", color: "red", detail: "Missed 10 days" }
                ].map((client) => (
                  <div key={client.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100/50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{client.name}</p>
                      <p className="text-xs text-gray-500">{client.detail}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      client.color === "green" 
                        ? "bg-green-50 text-green-700 border-green-200" 
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}>
                      {client.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works / Features Section */}
      <section id="features" className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8 border-t border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-4 sm:text-4xl">How it works</h2>
            <p className="text-gray-600">PulseCheck bridges the gap between coaching guidelines and client consistency.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-6">
                <UserPlus className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-950 mb-3">1. Invite Clients</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Add your client&apos;s email right from your coach dashboard. They&apos;ll receive an invite to sign up and establish their profile in seconds.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-6">
                <ClipboardList className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-950 mb-3">2. 2-Min Weekly Check-ins</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Clients fill in their weekly stats, sliders for sleep/mood/energy, workout counts, and notes. No complex worksheets required.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-950 mb-3">3. View Trends & Alerts</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Spot negative flags early with automatic trend detection and visually stunning charts tracing client health indicators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Details Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16">
            {/* For Coaches */}
            <div id="for-coaches" className="space-y-8">
              <div className="border-b border-gray-100 pb-4">
                <span className="text-xs font-semibold tracking-wider text-teal-600 uppercase">Coach Suite</span>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 mt-2">Built for Online Coaches</h2>
              </div>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-950 mb-1">Weekly Summaries</h4>
                    <p className="text-gray-600 text-sm">See the checklist status of your entire roster at a glance. Identify who checked in and who is missing.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-950 mb-1">Visual Progress Charts</h4>
                    <p className="text-gray-600 text-sm">Inspect charts charting weight fluctuations, sleep quantity, energy logs, and workout consistency over time.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-950 mb-1">Smart System Alerts</h4>
                    <p className="text-gray-600 text-sm">Receive proactive warnings for consecutive missed check-ins, unwanted weight gains, or critical drops in energy levels.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-950 mb-1">Internal Coach Notes</h4>
                    <p className="text-gray-600 text-sm">Log private check-in reflections and notes on client profiles to guide future programming adaptations.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Clients */}
            <div id="for-clients" className="space-y-8">
              <div className="border-b border-gray-100 pb-4">
                <span className="text-xs font-semibold tracking-wider text-teal-600 uppercase">Client Portal</span>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 mt-2">Built for Busy Clients</h2>
              </div>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                    <Smile className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-950 mb-1">Frictionless Inputs</h4>
                    <p className="text-gray-600 text-sm">A mobile-friendly, beautiful check-in layout that clients can breeze through in under 2 minutes.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-950 mb-1">Personal Journey Dashboard</h4>
                    <p className="text-gray-600 text-sm">Clients access their own metrics, milestone charts, and summaries to celebrate their physical changes.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-950 mb-1">Clean Trend Analytics</h4>
                    <p className="text-gray-600 text-sm">Clients gain clear, uncluttered feedback showing their consistency and habits directly.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                    <ShieldAlert className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-950 mb-1">Built-in Accountability</h4>
                    <p className="text-gray-600 text-sm">Consistent streak metrics and milestone notifications keep clients motivated week over week.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-teal-600 px-4 sm:px-6 lg:px-8 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">Ready to keep a closer pulse on your clients?</h2>
          <p className="text-teal-100 text-lg mb-8 max-w-xl mx-auto">Join coaches worldwide using PulseCheck to build stronger client accountability and track actual health parameters.</p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-teal-700 hover:bg-gray-100 font-semibold shadow-md px-8 py-6 text-base">
              Create a Free Coach Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-500 py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-900">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Activity className="w-5 h-5 text-teal-500" />
            <span className="text-lg font-semibold text-white">PulseCheck</span>
          </div>
          <p className="text-sm">© 2026 PulseCheck. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
