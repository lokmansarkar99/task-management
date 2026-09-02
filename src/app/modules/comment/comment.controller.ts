import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { CommentService } from "./comment.service";

const createComment = catchAsync(async (req: Request, res: Response) => {
  const result = await CommentService.createComment(
    req.body,
    req.params.taskId as string,
    req.user!.id
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Comment created successfully",
    data: result,
  });
});

const createReply = catchAsync(async (req: Request, res: Response) => {
  const result = await CommentService.createReply(
    req.params.parentId as string,
    req.user!.id,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Reply added successfully",
    data: result,
  });
});

const getTaskComments = catchAsync(async (req: Request, res: Response) => {
  const result = await CommentService.getTaskComments(req.params.taskId as string, req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Comments retrieved successfully",
    data: result.comments,
    meta: result.meta
  });
});

const updateComment = catchAsync(async (req: Request, res: Response) => {
  const result = await CommentService.updateComment(
    req.params.commentId as string,
    req.user!.id,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Comment updated successfully",
    data: result,
  });
});

const deleteComment = catchAsync(async (req: Request, res: Response) => {
  const result = await CommentService.deleteComment(
    req.params.commentId as string,
    req.user!.id,
    req.user!.role
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Comment deleted successfully",
    data: result,
  });
});

const toggleLike = catchAsync(async (req: Request, res: Response) => {
  const result = await CommentService.toggleLike(
    req.params.commentId  as string,
    req.user!.id
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.liked ? "Comment liked" : "Comment unliked",
    data: result,
  });
});

export const CommentController = {
  createComment,
  createReply,
  getTaskComments,
  updateComment,
  deleteComment,
  toggleLike,
};