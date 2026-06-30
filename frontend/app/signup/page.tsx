"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { registerUser } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"COACH" | "CLIENT">("CLIENT");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    try {
      await registerUser({ name, email, password, role });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Tabs value={role} onValueChange={(v) => setRole(v as "COACH" | "CLIENT")} className="mb-2">
  <TabsList className="grid w-full grid-cols-2">
    <TabsTrigger value="COACH">I'm a Coach</TabsTrigger>
    <TabsTrigger value="CLIENT">I'm a Client</TabsTrigger>
  </TabsList>
</Tabs>

<p className={`text-sm mb-2 rounded-lg px-3 py-2 ${
  role === "COACH" ? "bg-teal-50 text-teal-700" : "bg-blue-50 text-blue-700"
}`}>
  {role === "COACH"
    ? "You'll be able to add clients and see their trends."
    : "You'll submit weekly check-ins for your coach."
  }
</p>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

         <div>
  <Label htmlFor="password">Password</Label>
  <div className="relative">
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
</div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button onClick={handleSubmit}>Sign up</Button>
        </CardContent>
      </Card>
    </div>
  );
}