import type { Request } from "express";

/** Safely extract a single string param from an Express 5 route (string | string[]). */
export function param(req: Request, name: string): string {
  const val = req.params[name];
  return Array.isArray(val) ? val[0] : (val ?? "");
}
