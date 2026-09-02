import { Types } from "mongoose";
import ApiError from "../../../errors/ApiErrors";
import { Task } from "../task/task.model";
import { Comment } from "./comment.model";
import {
  TCreateCommentPayload,
  TCreateReplyPayload,
  TUpdateCommentPayload,
} from "./comment.validation";
import { QueryBuilder } from "../../buillder/queryBuilder";

const createComment = async (
  payload: TCreateCommentPayload,
  taskId: string,
  userId: string,
) => {
  // Task Existance Check
  const isTaskExist = await Task.findById(taskId);
  if (!isTaskExist) {
    throw new ApiError(404, "Task Not Exist");
  }

  if (isTaskExist.isDeleted) {
    throw new ApiError(400, "Cannot comment on a deleted task.");
  }

  const comment = await Comment.create({
    content: payload.content,
    task: taskId,
    author: userId,
    parentComment: null,
  });

  const populated = await comment.populate("author", "name email profileImage");

  return populated;
};

// createReply for comment

const createReply = async (
  parentId: string,
  userId: string,
  payload: TCreateReplyPayload,
) => {
  // existance check
  const parent = await Comment.findById(parentId);
  if (!parent) {
    throw new ApiError(404, "Parent comment not found");
  }

  if (parent.isDeleted) {
    throw new ApiError(400, "Cannot reply to a deleted comment");
  }

  // Allow only two levels of nesting.
  if (parent.parentComment) {
    throw new ApiError(400, "Maximum 2 level nested allowed");
  }

  // Create the reply.
  const reply = await Comment.create({
    content: payload.content,
    task: parent.task,
    author: userId,
    parentComment: parentId,
  });

  const populated = reply.populate("author", "name email profileImage");
  return populated;
};

// getTaskComments — root comments with nested replies.

const getTaskComments = async (taskId: string, query: Record<string, unknown>) => {
  const baseFilter = { task:taskId, parentComment:null, isDeleted:false}
  // chain with query builder
  const commentQuery = new QueryBuilder(Comment.find(baseFilter), query)
  .sort()
  .paginate()

  // chain populate + lean differently for root comments and nested replies
  const rootComments = await commentQuery.modelQuery
  .populate("author", "name email profileImage")
  .lean()

  // fetch nested replies for each root comment
  const commentsWithReplies = await Promise.all(
    rootComments.map( async (comment) => {
      const replies = await Comment.find({parentComment: comment._id, isDeleted:false})

      .populate("author", "name email profileImage")
      .sort({ createdAt: 1 }) 
      .lean()
      return { ...comment, replies };
    })
  )


  const meta = await commentQuery.countTotal()

  return { comments: commentsWithReplies, meta };

};

// 4. updateComment — author-only edit.

const updateComment = async (
  commentId: string,
  userId: string,
  payload: TUpdateCommentPayload,
) => {
  const isExist = await Comment.findById(commentId);
  if (!isExist) {
    throw new ApiError(404, "Comment Not Found");
  }

  if (isExist.author.toString() !== userId) {
    throw new ApiError(403, "You are not permitted to edit this comment");
  }

  const updated = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content: payload.content,
        isEdited: true,
        editedAt: new Date(),
      },
    },
    { returnDocument: "after", runValidators: true },
  ).populate("author", "name email profileImage");

  return updated;
};

// deleteComment — cascade soft delete (delete replies when deleting a root comment)

const deleteComment = async (
  commentId: string,
  userId: string,
  userRole: string,
) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment Not Found");
  }

  // Permission: only the author or an admin can delete the comment.
  const isAuthor = comment.author.toString() === userId;
  const isAdmin = userRole === "ADMIN";

  if (!isAuthor && !isAdmin) {
    throw new ApiError(403, "You are not permitted to delete this comment");
  }

  // Cascade delete: if this is a root comment (parentComment === null),
  // soft-delete all replies beneath it as well.
  if (comment.parentComment === null) {
    await Comment.updateMany(
      { parentComment: commentId },
      { $set: { isDeleted: true } },
    );
  }

  const deleted = await Comment.findByIdAndUpdate(
    commentId,
    { $set: { isDeleted: true } },
    { new: true },
  );

  return deleted;
};

// 6. toggleLike — like or unlike using $addToSet / $pull.

const toggleLike = async (commentId: string, userId: string) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment Not Found");
  }

  // Check whether the user has already liked the comment.
  const alreadyLiked = comment.likes.some(
    (likeId) => likeId.toString() === userId,
  );

  const updated = await Comment.findByIdAndUpdate(
    commentId,
    alreadyLiked
      ? { $pull: { likes: userId } } // Already liked: unlike and remove the user.
      : { $addToSet: { likes: userId } }, // Not liked: like and add the user safely.
    { new: true },
  );

  return {
    liked: !alreadyLiked,
    totalLikes: updated?.likes.length ?? 0,
  };
};

export const CommentService = {
  createComment,
  createReply,
  getTaskComments,
  updateComment,
  deleteComment,
  toggleLike,
};
