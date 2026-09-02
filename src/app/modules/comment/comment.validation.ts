import { z } from "zod";
import { checkValidID } from "../../../shared/chackValid";

const createCommentSchema = z.object({
  params: z.object({
    taskId: checkValidID("Invalid Task ID"),
  }),
  body: z.object({
    content: z.string().min(1, "Comment cannot be empty").max(1000),
  }),
});

const createReplySchema = z.object({
  params: z.object({
    parentId: checkValidID("Invalid Comment ID"),
  }),
  body: z.object({
    content: z.string().min(1, "Reply cannot be empty").max(1000),
  }),
});

const getTaskCommentsSchema = z.object({
  params: z.object({
    taskId: checkValidID("Invalid Task ID"),
  }),
});

const updateCommentSchema = z.object({
  params: z.object({
    commentId: checkValidID("Invalid Comment ID"),
  }),
  body: z.object({
    content: z.string().min(1).max(1000),
  }),
});

const deleteCommentSchema = z.object({
  params: z.object({
    commentId: checkValidID("Invalid Comment ID"),
  }),
});

const toggleLikeSchema = z.object({
  params: z.object({
    commentId: checkValidID("Invalid Comment ID"),
  }),
});

export const CommentValidation = {
  createCommentSchema,
  createReplySchema,
  getTaskCommentsSchema,
  updateCommentSchema,
  deleteCommentSchema,
  toggleLikeSchema,
};

export type TCreateCommentPayload = z.infer<typeof createCommentSchema>["body"];
export type TCreateReplyPayload = z.infer<typeof createReplySchema>["body"];
export type TUpdateCommentPayload = z.infer<typeof updateCommentSchema>["body"];