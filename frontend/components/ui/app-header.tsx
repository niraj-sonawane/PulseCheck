"use client";

import Link from "next/link";
import { Activity, LogOut } from "lucide-react";
import { Button } from "./button";

interface User {
  id: string;
  name: string;
  email: string;
  role: "COACH" | "CLIENT";
}

interface AppHeaderProps {
  user: User | null;
  onLogout: () => void;
}

export function AppHeader({ user, onLogout }: AppHeaderProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-teal-600" />
            <span className="text-xl font-semibold text-gray-900">PulseCheck</span>
          </Link>
          
          {user && (
            <nav className="hidden sm:flex items-center gap-4">
              {user.role === "COACH" ? (
                <Link
                  href="/coach/dashboard"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/client/progress"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    My Progress
                  </Link>
                  <Link
                    href="/client/check-in"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    Check In
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div
                title={user.name}
                role="img"
                aria-label={`User avatar: ${user.name}`}
                className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-semibold shadow-sm cursor-default"
              >
                {getInitials(user.name)}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                aria-label="Logout"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
