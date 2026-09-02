import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

const projectSchema = new Schema(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    status: {
      type: String,
      enum: ["active", "archived", "completed"],
      required: true,
      default: "active",
    },
    color: { type: String, default: null },
    dueDate: { type: Date, default: null },
  },
  { timestamps: true },
);

projectSchema.index({ workspaceId: 1, status: 1 });

export type ProjectAttrs = InferSchemaType<typeof projectSchema>;
export type ProjectDoc = HydratedDocument<ProjectAttrs>;

export const Project = model("Project", projectSchema);
