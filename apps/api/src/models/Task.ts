import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

const taskSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: null },
    status: {
      type: String,
      enum: ["todo", "in_progress", "review", "done"],
      required: true,
      default: "todo",
    },
    priority: { type: Number, enum: [1, 2, 3, 4], required: true, default: 3 },
    assigneeId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    scheduledStart: { type: Date, default: null },
    scheduledEnd: { type: Date, default: null },
    dueDate: { type: Date, default: null },
    timeEstimate: { type: Number, default: null },
    timeLogged: { type: Number, default: 0, min: 0 },
    tags: { type: [String], default: [] },
    order: { type: Number, default: 0 },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

taskSchema.index({ workspaceId: 1, projectId: 1 });
taskSchema.index({ workspaceId: 1, assigneeId: 1, scheduledStart: 1 });

export type TaskAttrs = InferSchemaType<typeof taskSchema>;
export type TaskDoc = HydratedDocument<TaskAttrs>;

export const Task = model("Task", taskSchema);
