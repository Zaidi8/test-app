import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

const workspaceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export type WorkspaceAttrs = InferSchemaType<typeof workspaceSchema>;
export type WorkspaceDoc = HydratedDocument<WorkspaceAttrs>;

export const Workspace = model("Workspace", workspaceSchema);
