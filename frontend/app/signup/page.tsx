"use client";

import { CardHeader } from "@/components/ui/card";
import { useState } from "react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"COACH" | "CLIENT">("CLIENT");

  return (
    <div className="flex min-h-screen items-center justify-content bg-zinc-50">
        <card className="w-full max-w-sm"> 
            <CardHeader>
                <CardTitle>Create your account</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <div>
                    <label htmlFor="name">Name</label>
                    <input 
                    id="name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    />
                    </div>

                    <div>
                        <label htmlFor="email">Email</label>
                        <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e)} => setEmail(e.target.value)}
                        placeholder="You@exampe.com"
                        />
                    </div>
                </div>
            </CardContent>
        </card>
        
         </div>
  );
}