import crypto from "node:crypto";

import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

export interface AccessTokenPayload {
  sub: string; // user id
  email: string;
  type: "access";
}

export interface RefreshTokenPayload {
  sub: string; // user id
  type: "refresh";
}

const ACCESS_TOKEN_SECRET: jwt.Secret = env.JWT_ACCESS_SECRET;
const REFRESH_TOKEN_SECRET: jwt.Secret = env.JWT_REFRESH_SECRET;

/** Sign a short-lived access token. */
export function signAccessToken(payload: Omit<AccessTokenPayload, "type">): string {
  const tokenPayload: AccessTokenPayload = { ...payload, type: "access" };
  return jwt.sign(tokenPayload, ACCESS_TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL as jwt.SignOptions["expiresIn"],
  });
}

/** Sign a long-lived refresh token. */
export function signRefreshToken(userId: string): string {
  const tokenPayload: RefreshTokenPayload = { sub: userId, type: "refresh" };
  return jwt.sign(tokenPayload, REFRESH_TOKEN_SECRET, {
    expiresIn: `${env.REFRESH_TOKEN_TTL_DAYS}d` as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as AccessTokenPayload;
  if (decoded.type !== "access") {
    throw new Error("Not an access token");
  }
  return decoded;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
  if (decoded.type !== "refresh") {
    throw new Error("Not a refresh token");
  }
  return decoded;
}

/**
 * Hash a refresh token for at-rest storage (SHA-256).
 * A stolen DB dump cannot be replayed to mint new tokens.
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
