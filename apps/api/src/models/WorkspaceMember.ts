import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

const workspaceMemberSchema = new Schema(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: {
      type: String,
      enum: ["owner", "admin", "member", "viewer"],
      required: true,
      default: "member",
    },
    status: {
      type: String,
      enum: ["active", "invited", "removed"],
      required: true,
      default: "active",
    },
    joinedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

workspaceMemberSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });

export type WorkspaceMemberAttrs = InferSchemaType<typeof workspaceMemberSchema>;
export type WorkspaceMemberDoc = HydratedDocument<WorkspaceMemberAttrs>;

export const WorkspaceMember = model("WorkspaceMember", workspaceMemberSchema);
