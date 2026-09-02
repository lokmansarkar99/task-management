import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import validateRequest from "../../middlewares/validateRequest";
import { USER_ROLES } from "../../../enums/user";
import { CommentValidation } from "./comment.validation";
import { CommentController } from "./comment.controller";

const router = express.Router();

//Create and list comments within a task
router
  .route("/task/:taskId")
  .get(
    checkAuth(USER_ROLES.CLIENT),
    validateRequest(CommentValidation.getTaskCommentsSchema),
    CommentController.getTaskComments
  )
  .post(
    checkAuth(USER_ROLES.CLIENT),
    validateRequest(CommentValidation.createCommentSchema),
    CommentController.createComment
  );

//Reply to a comment
router
  .route("/:parentId/reply")
  .post(
    checkAuth(USER_ROLES.CLIENT),
    validateRequest(CommentValidation.createReplySchema),
    CommentController.createReply
  );

//Like/unlike toggle
router
  .route("/:commentId/like")
  .post(
    checkAuth(USER_ROLES.CLIENT),
    validateRequest(CommentValidation.toggleLikeSchema),
    CommentController.toggleLike
  );

// Update/delete a specific comment 
router
  .route("/:commentId")
  .patch(
    checkAuth(USER_ROLES.CLIENT),
    validateRequest(CommentValidation.updateCommentSchema),
    CommentController.updateComment
  )
  .delete(
    checkAuth(USER_ROLES.CLIENT),
    validateRequest(CommentValidation.deleteCommentSchema),
    CommentController.deleteComment
  );

export const CommentRoutes = router;