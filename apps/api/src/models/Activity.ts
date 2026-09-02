import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

import { emitActivityCreated } from "../socket/activityEmitter.js";

const activitySchema = new Schema(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    actorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "task:created",
        "task:updated",
        "task:deleted",
        "task:statusChanged",
        "comment:created",
        "comment:updated",
        "comment:deleted",
        "member:joined",
        "member:roleChanged",
        "member:left",
      ],
      required: true,
    },
    entityId: { type: String, required: true },
    entityType: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

activitySchema.index({ workspaceId: 1, createdAt: -1 });

activitySchema.post("save", function () {
  emitActivityCreated(this as unknown as ActivityDoc);
});

export type ActivityAttrs = InferSchemaType<typeof activitySchema>;
export type ActivityDoc = HydratedDocument<ActivityAttrs>;

export const Activity = model("Activity", activitySchema);
