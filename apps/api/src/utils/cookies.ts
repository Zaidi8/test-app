import type { CookieOptions, Response } from "express";

import { env } from "../config/env.js";

export const ACCESS_TOKEN_COOKIE = "accessToken";
export const REFRESH_TOKEN_COOKIE = "refreshToken";

const isProd = env.NODE_ENV === "production";

/** Shared flags for every auth cookie. HttpOnly + SameSite=lax; Secure in prod. */
const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax",
  path: "/",
};

const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000; // matches ACCESS_TOKEN_TTL (15m)
const REFRESH_TOKEN_MAX_AGE_MS =
  env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;

/** Set both auth cookies on the response. */
export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
): void {
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    ...baseCookieOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE_MS,
  });
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...baseCookieOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
  });
}

/** Clear both auth cookies (logout). Options must match those used to set them. */
export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_TOKEN_COOKIE, baseCookieOptions);
  res.clearCookie(REFRESH_TOKEN_COOKIE, baseCookieOptions);
}
