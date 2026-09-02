import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

const invitationSchema = new Schema(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: {
      type: String,
      enum: ["admin", "member", "viewer"],
      required: true,
      default: "member",
    },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

invitationSchema.index({ email: 1, workspaceId: 1 });
invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type InvitationAttrs = InferSchemaType<typeof invitationSchema>;
export type InvitationDoc = HydratedDocument<InvitationAttrs>;

export const Invitation = model("Invitation", invitationSchema);
