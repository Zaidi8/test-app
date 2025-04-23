// src/components/auth/LoginForm.tsx

"use client";

import { useState } from "react";
import { InputElement } from "@/components/ui/InputElement";
import { Button } from "@/components/ui/CredButton";
import { Label } from "@/components/ui/Label";
import { TextLink } from "../ui/TextLink";
import axios from "axios";
export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://cac5c0e41dd146720309.free.beeceptor.com/api/users/", {
        email,
        password,
      });

      console.log("Login simulated:", res.data);
      // In a real API, you would validate here and store token
    } catch (error) {
      console.error("Login failed:", error);
    }
  };


  return (
    <form onSubmit={handleLogin} className="space-y-4 max-w-sm mx-auto">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <InputElement
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <InputElement
          id="password"
          type="password"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className=" text-center">
      <Button type="submit" variant={"outline"} className="cursor-pointer">
        Login
      </Button>
      </div>

      <div className=" text-center">
      <TextLink label="Don't have an account?" href="/auth/register" />
      </div>
    </form>
  );
}
