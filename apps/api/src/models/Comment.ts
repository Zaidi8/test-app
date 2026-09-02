import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

const commentSchema = new Schema(
  {
    taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, maxlength: 5000 },
    mentions: { type: [String], default: [] },
  },
  { timestamps: true },
);

commentSchema.index({ taskId: 1, createdAt: 1 });

export type CommentAttrs = InferSchemaType<typeof commentSchema>;
export type CommentDoc = HydratedDocument<CommentAttrs>;

export const Comment = model("Comment", commentSchema);
