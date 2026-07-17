"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default function DashboardRouterPage() {
  const router = useRouter();

  useEffect(() => {
    const checkRoleAndRedirect = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser && currentUser.role === "COACH") {
          router.replace("/coach/dashboard");
        } else if (currentUser && currentUser.role === "CLIENT") {
          router.replace("/client/progress");
        } else {
          router.replace("/login");
        }
      } catch {
        router.replace("/login");
      }
    };
    checkRoleAndRedirect();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm font-medium">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}