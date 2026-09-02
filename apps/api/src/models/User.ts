import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

/**
 * A PriorTree account. `passwordHash` is null for accounts created purely
 * through an OAuth provider (e.g. Google); `provider` records how it was made.
 */
const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, default: null },
    provider: {
      type: String,
      enum: ["local", "google"],
      required: true,
      default: "local",
    },
    googleId: { type: String },
    avatarUrl: { type: String, default: null },
  },
  { timestamps: true },
);

// Unique only among users that actually have a googleId (OAuth accounts).
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });

export type UserAttrs = InferSchemaType<typeof userSchema>;
export type UserDoc = HydratedDocument<UserAttrs>;

export const User = model("User", userSchema);
