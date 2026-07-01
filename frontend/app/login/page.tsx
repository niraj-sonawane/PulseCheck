"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { loginUser } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    try {
      await loginUser({ email, password });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-md mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-teal-600" />
            <span className="text-xl font-semibold text-gray-900">PulseCheck</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <p className="text-gray-600 text-sm">Login to your PulseCheck account</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1.5">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex justify-start mt-1">
                  <button
                    type="button"
                    className="text-xs text-teal-600 hover:text-teal-700"
                    onClick={() => alert("Coming soon")}
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button onClick={handleSubmit} className="w-full">
                Login
              </Button>

              <p className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/signup" className="text-teal-600 hover:text-teal-700 font-medium">
                  Sign up
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}