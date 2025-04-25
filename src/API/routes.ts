// app/api/login/route.ts
import { NextResponse } from "next/server";
import { getAuth } from "firebase/auth";
import { cookies } from "next/headers";
import { adminApp } from "@/lib/firebaseAdmin"; // Initialize Firebase Admin

export async function POST(request: Request) {
  const { idToken } = await request.json();

  try {
    const decodedToken = await getAuth(adminApp).verifyIdToken(idToken);

    cookies().set("session", idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return NextResponse.json({ message: "Login successful" });
  } catch (err) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
