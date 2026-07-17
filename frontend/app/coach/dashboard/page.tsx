"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  CheckCircle2,
  XCircle,
  Bell,
  Plus,
  Search,
  ArrowRight,
  AlertTriangle
} from "lucide-react";
import { getCurrentUser, logoutUser } from "@/lib/auth";
import type { CurrentUser } from "@/lib/types";
import { api } from "@/lib/api";
import { AppHeader } from "@/components/ui/app-header";
import { MetricCard } from "@/components/ui/metric-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Client {
  id: string;
  name: string;
  email: string;
  lastCheckIn: string | null;
  alertCount: number;
  status: "checked" | "missing";
}

interface AlertLog {
  id: string;
  clientId: string;
  clientName: string;
  message: string;
  type: "missed" | "trend";
}

export default function CoachDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Add Client Form States
  const [showAddClient, setShowAddClient] = useState(false);
  const [clientEmail, setClientEmail] = useState("");
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState(false);

  useEffect(() => {
    const initDashboard = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== "COACH") {
          router.replace("/login");
          return;
        }
        setUser(currentUser);
        
        // Fetch clients list
        const res = await api.get("/coach/clients");
        setClients(res.data);
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };
    initDashboard();
  }, [router]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push("/login");
    } catch {
      // logout errors are non-fatal; redirect anyway
      router.push("/login");
    }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    setAddSuccess(false);
    
    if (!clientEmail.trim()) {
      setAddError("Please enter an email address.");
      return;
    }

    try {
      await api.post("/coach/clients", { email: clientEmail });
      
      // Refresh list
      const res = await api.get("/coach/clients");
      setClients(res.data);
      
      setClientEmail("");
      setAddSuccess(true);
      setShowAddClient(false);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setAddError(axiosErr.response?.data?.message || "Failed to add client. Make sure the user exists and is signed up as a CLIENT.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm">Loading Coach Dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate Metrics
  const totalClients = clients.length;
  const checkedIn = clients.filter((c) => c.status === "checked").length;
  const missing = clients.filter((c) => c.status === "missing").length;
  const totalAlerts = clients.reduce((sum, c) => sum + c.alertCount, 0);

  // Derive alert logs dynamically based on database properties
  const alertLogs: AlertLog[] = [];
  clients.forEach((client) => {
    if (client.status === "missing") {
      alertLogs.push({
        id: `missed-${client.id}`,
        clientId: client.id,
        clientName: client.name,
        message: `${client.name}: Missed check-in this week`,
        type: "missed"
      });
    }
    if (client.alertCount > 0) {
      alertLogs.push({
        id: `trend-${client.id}`,
        clientId: client.id,
        clientName: client.name,
        message: `${client.name}: Flagged metric alert (${client.alertCount} indicator drop)`,
        type: "trend"
      });
    }
  });

  // Filter clients list
  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader user={user} onLogout={handleLogout} />

      <main id="main-content" className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full">
        {/* Page Header Title */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Coach Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Review check-in status and alerts for your active clients.</p>
          </div>
          <Button
            onClick={() => {
              setShowAddClient(!showAddClient);
              setAddError("");
              setAddSuccess(false);
            }}
            className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Client
          </Button>
        </div>

        {/* Invite Form Banner */}
        {showAddClient && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
            <h3 className="font-semibold text-gray-950 mb-2">Invite Client to PulseCheck</h3>
            <p className="text-xs text-gray-500 mb-4">Enter your client&apos;s email address to connect them. Note: The user must already have a registered account under the CLIENT role.</p>
            <form onSubmit={handleAddClient} className="flex flex-col sm:flex-row gap-3 max-w-lg">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="client@example.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">Add</Button>
                <Button type="button" variant="ghost" onClick={() => setShowAddClient(false)}>Cancel</Button>
              </div>
            </form>
            {addError && <p className="text-sm text-red-600 mt-2">{addError}</p>}
          </div>
        )}

        {addSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 text-green-700 text-sm font-medium">
            Client added successfully!
          </div>
        )}

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Total Clients"
            value={totalClients}
            icon={<Users className="w-4 h-4 text-teal-600" />}
          />
          <MetricCard
            title="Checked In"
            value={checkedIn}
            icon={<CheckCircle2 className="w-4 h-4 text-green-600" />}
          />
          <MetricCard
            title="Missing"
            value={missing}
            icon={<XCircle className="w-4 h-4 text-red-600" />}
          />
          <MetricCard
            title="Active Alerts"
            value={totalAlerts}
            icon={<Bell className="w-4 h-4 text-amber-500" />}
          />
        </div>

        {/* Alerts Banner notices */}
        {alertLogs.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8 space-y-3">
            <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Attention Required ({alertLogs.length})</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {alertLogs.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-2 bg-white rounded-lg border border-amber-100 p-3 shadow-xs hover:border-amber-200 transition-colors"
                >
                  <span className="text-base flex-shrink-0">⚠️</span>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{alert.clientName}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{alert.message}</p>
                    <Link
                      href={`/coach/client/${alert.clientId}`}
                      className="text-[10px] text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-0.5 mt-2"
                    >
                      Inspect Profile <ArrowRight className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Roster list */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {/* Table Header Controls */}
          <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Client Roster</h2>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
          </div>

          {filteredClients.length === 0 ? (
            <div className="flex flex-col items-center py-16 px-6 text-center">
              <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-teal-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No clients found</h3>
              <p className="text-gray-500 text-sm max-w-xs">
                {searchQuery ? "Try refining your search keyword." : "Add clients above using their email to begin tracking."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] table-auto">
                <thead className="bg-gray-50 border-b border-gray-200 text-left">
                  <tr>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client Name</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Check-In</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Alerts</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900">{client.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{client.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {client.lastCheckIn
                          ? new Date(client.lastCheckIn).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "Never"
                        }
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          client.status === "checked" 
                            ? "bg-green-50 text-green-700 border-green-200" 
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}>
                          {client.status === "checked" ? "Checked in" : "Missing"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {client.alertCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
                            {client.alertCount} Alert(s)
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm font-medium">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/coach/client/${client.id}`}>
                          <Button size="sm" variant="outline" className="text-gray-700 hover:bg-gray-100 border-gray-300">
                            Open Profile
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
