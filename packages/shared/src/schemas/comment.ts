import { z } from "zod";

export const commentSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  authorId: z.string(),
  body: z.string(),
  mentions: z.array(z.string()),
  createdAt: z.string(),
});

export const createCommentSchema = z.object({
  body: z.string().min(1, "Comment cannot be empty").max(5000),
});

export const updateCommentSchema = z.object({
  body: z.string().min(1).max(5000),
});

export const commentWithAuthorSchema = commentSchema.extend({
  author: z.object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string().nullish(),
  }),
});

export type Comment = z.infer<typeof commentSchema>;
export type CommentWithAuthor = z.infer<typeof commentWithAuthorSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;