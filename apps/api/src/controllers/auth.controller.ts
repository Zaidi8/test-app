import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";

import { loginSchema, registerSchema, type UserPublic } from "@prioritree/shared";

import { env, isGoogleOAuthConfigured } from "../config/env.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { User, type UserDoc } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import {
  clearAuthCookies,
  REFRESH_TOKEN_COOKIE,
  setAuthCookies,
} from "../utils/cookies.js";
import {
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  type RefreshTokenPayload,
} from "../utils/tokens.js";

const SALT_ROUNDS = 12;
const REFRESH_TOKEN_TTL_MS =
  env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;

/** Map a User document to the public shape shared with clients. */
function toUserPublic(user: UserDoc): UserPublic {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    provider: user.provider as UserPublic["provider"],
    avatarUrl: user.avatarUrl ?? null,
  };
}

/**
 * Sign a fresh access/refresh pair, persist the refresh token's hash for
 * rotation/revocation, and set both HttpOnly cookies on the response.
 */
async function issueTokens(
  res: Response,
  userId: string,
  email: string,
): Promise<void> {
  const accessToken = signAccessToken({ sub: userId, email });
  const refreshToken = signRefreshToken(userId);

  await RefreshToken.create({
    userId,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  });

  setAuthCookies(res, accessToken, refreshToken);
}

function getGoogleClient(): OAuth2Client {
  return new OAuth2Client({
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    redirectUri: env.GOOGLE_CALLBACK_URL,
  });
}

// POST /api/v1/auth/register
export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest(
      "Invalid registration details",
      parsed.error.flatten(),
    );
  }

  const { name, password } = parsed.data;
  const email = parsed.data.email.toLowerCase();

  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name, email, passwordHash, provider: "local" });

  await issueTokens(res, String(user._id), user.email);
  res.status(201).json({ user: toUserPublic(user) });
}

// POST /api/v1/auth/login
export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest("Invalid login details", parsed.error.flatten());
  }

  const email = parsed.data.email.toLowerCase();
  const user = await User.findOne({ email });

  // Generic message — never reveal whether the email exists.
  if (!user?.passwordHash) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(
    parsed.data.password,
    user.passwordHash,
  );
  if (!passwordMatches) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  await issueTokens(res, String(user._id), user.email);
  res.status(200).json({ user: toUserPublic(user) });
}

// POST /api/v1/auth/refresh — verify + rotate the refresh token.
export async function refresh(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined;
  if (!token) {
    throw ApiError.unauthorized("Missing refresh token");
  }

  let payload: RefreshTokenPayload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }

  // Must exist in the DB and not already be revoked (rotation/logout).
  const stored = await RefreshToken.findOne({ tokenHash: hashToken(token) });
  if (!stored || stored.revokedAt) {
    throw ApiError.unauthorized("Refresh token is no longer valid");
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    throw ApiError.unauthorized("User no longer exists");
  }

  // Rotate: revoke the presented token, then issue a brand-new pair.
  stored.revokedAt = new Date();
  await stored.save();

  await issueTokens(res, String(user._id), user.email);
  res.status(200).json({ user: toUserPublic(user) });
}

// POST /api/v1/auth/logout — revoke current refresh token + clear cookies.
export async function logout(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined;
  if (token) {
    await RefreshToken.updateOne(
      { tokenHash: hashToken(token) },
      { $set: { revokedAt: new Date() } },
    );
  }
  clearAuthCookies(res);
  res.status(200).json({ success: true });
}

// GET /api/v1/auth/me — current user from the access token (via requireAuth).
export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw ApiError.unauthorized();
  }
  const user = await User.findById(req.user.id);
  if (!user) {
    throw ApiError.unauthorized("User no longer exists");
  }
  res.status(200).json({ user: toUserPublic(user) });
}

// GET /api/v1/auth/google — redirect to Google's consent screen.
export async function googleRedirect(_req: Request, res: Response): Promise<void> {
  if (!isGoogleOAuthConfigured()) {
    throw ApiError.notImplemented("Google OAuth is not configured");
  }
  const url = getGoogleClient().generateAuthUrl({
    access_type: "offline",
    scope: ["openid", "email", "profile"],
    prompt: "consent",
  });
  res.redirect(url);
}

// GET /api/v1/auth/google/callback — exchange code, find/create user, set cookies.
export async function googleCallback(req: Request, res: Response): Promise<void> {
  if (!isGoogleOAuthConfigured()) {
    throw ApiError.notImplemented("Google OAuth is not configured");
  }

  const code = req.query.code;
  if (typeof code !== "string") {
    throw ApiError.badRequest("Missing authorization code");
  }

  const client = getGoogleClient();
  const { tokens } = await client.getToken(code);
  if (!tokens.id_token) {
    throw ApiError.unauthorized("Google did not return an ID token");
  }

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: env.GOOGLE_CLIENT_ID,
  });
  const profile = ticket.getPayload();
  if (!profile?.sub || !profile.email) {
    throw ApiError.unauthorized("Google profile is incomplete");
  }

  const email = profile.email.toLowerCase();

  // Prefer a match on googleId, then link an existing local account by email,
  // otherwise provision a brand-new Google-provider account.
  let user = await User.findOne({ googleId: profile.sub });
  if (!user) {
    user = await User.findOne({ email });
    if (user) {
      user.googleId = profile.sub;
      if (!user.avatarUrl && profile.picture) {
        user.avatarUrl = profile.picture;
      }
      await user.save();
    } else {
      user = await User.create({
        name: profile.name ?? email,
        email,
        provider: "google",
        googleId: profile.sub,
        avatarUrl: profile.picture ?? null,
      });
    }
  }

  await issueTokens(res, String(user._id), user.email);
  res.redirect(`${env.CLIENT_URL}/dashboard/projects`);
}
