"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Users, CheckCircle2, XCircle, Bell, LogOut, Plus } from "lucide-react";
import Link from "next/link";
import { getCurrentUser, logoutUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface Client {
  id: string;
  name: string;
  email: string;
  lastCheckIn: string | null;
  alertCount: number;
  status: "checked" | "missing";
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddClient, setShowAddClient] = useState(false);
  const [clientEmail, setClientEmail] = useState("");
  const [addError, setAddError] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        if (currentUser.role === "COACH") {
          const res = await api.get("/coach/clients");
          setClients(res.data);
        }
      } catch (err) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
  };

  const handleAddClient = async () => {
    try {
      await api.post("/coach/clients", { email: clientEmail });
      const res = await api.get("/coach/clients");
      setClients(res.data);
      setClientEmail("");
      setShowAddClient(false);
      setAddError("");
    } catch (err: any) {
      setAddError(err.response?.data?.message || "Failed to add client");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Loading...</p>
    </div>
  );

  const checkedIn = clients.filter(c => c.status === "checked").length;
  const missing = clients.filter(c => c.status === "missing").length;
  const totalAlerts = clients.reduce((sum, c) => sum + c.alertCount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-teal-600" />
            <span className="text-xl font-semibold text-gray-900">PulseCheck</span>
            <span className="ml-4 text-gray-500 text-sm">Dashboard</span>
          </div>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
              <Users className="w-4 h-4" /> Total Clients
            </div>
            <p className="text-3xl font-semibold text-gray-900">{clients.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" /> Checked In
            </div>
            <p className="text-3xl font-semibold text-gray-900">{checkedIn}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
              <XCircle className="w-4 h-4 text-red-500" /> Missing
            </div>
            <p className="text-3xl font-semibold text-gray-900">{missing}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
              <Bell className="w-4 h-4 text-amber-500" /> Active Alerts
            </div>
            <p className="text-3xl font-semibold text-gray-900">{totalAlerts}</p>
          </div>
        </div>

        {/* Client Table */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Your Clients</h2>
            <Button
              onClick={() => setShowAddClient(!showAddClient)}
              className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Client
            </Button>
          </div>

          {showAddClient && (
            <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-col gap-3">
              <p className="text-sm font-medium text-gray-700">Enter client's email address:</p>
              <div className="flex gap-3">
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <Button onClick={handleAddClient} className="bg-teal-600 hover:bg-teal-700 text-white">
                  Add
                </Button>
              </div>
              {addError && <p className="text-sm text-red-600">{addError}</p>}
            </div>
          )}

          {clients.length === 0 ? (
            <div className="flex flex-col items-center py-16 px-6 text-center">
              <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-4">
                <Users className="w-10 h-10 text-teal-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No clients yet</h3>
              <p className="text-gray-500 mb-6 max-w-xs">Add your first client to start tracking check-ins and progress.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Client Name</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Last Check-In</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Alerts</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{client.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {client.lastCheckIn
                          ? new Date(client.lastCheckIn).toLocaleDateString()
                          : "Never"
                        }
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-white ${
                          client.status === "checked" ? "bg-green-500" : "bg-red-500"
                        }`}>
                          {client.status === "checked" ? "Checked in" : "Missing"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{client.alertCount}</td>
                      <td className="px-6 py-4">
                        <Link href={`/coach/client/${client.id}`}>
                          <Button size="sm" variant="outline">Open Profile</Button>
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