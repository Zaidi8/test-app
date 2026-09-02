import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

/**
 * One row per issued refresh token. We store only the SHA-256 hash, never the
 * raw token, so a leaked DB dump cannot be replayed. Rotation revokes the old
 * row (sets `revokedAt`) and inserts a fresh one on every /auth/refresh.
 */
const refreshTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// TTL index: MongoDB removes each document once `expiresAt` has passed.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type RefreshTokenAttrs = InferSchemaType<typeof refreshTokenSchema>;
export type RefreshTokenDoc = HydratedDocument<RefreshTokenAttrs>;

export const RefreshToken = model("RefreshToken", refreshTokenSchema);
