
"use client";

import { useState } from "react";
import  {InputElement} from "@/components/ui/InputElement";
import { Button } from "@/components/ui/CredButton";
import { Label } from "@/components/ui/Label";
import { TextLink } from "../ui/TextLink";
import axios from "axios";



export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://cac5c0e41dd146720309.free.beeceptor.com/api/users/", {
        email,
        password,
      });
  
      console.log("Register response:", res.data);
      // Navigate to login page or show a success message
    } catch (error) {
      console.error("Registration failed:", error);
    }

    console.log({ email, password });
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4 max-w-sm mx-auto">
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
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full">
        Register
      </Button>
            <div className=" text-center">
            <TextLink label="Already have an account?" href="/auth/login" />
            </div>
      
    </form>
  );
}
