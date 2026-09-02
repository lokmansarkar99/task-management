import { model, Schema } from "mongoose";
import { IComment } from "./comment.interface";

export const commentSchema = new Schema<IComment>(
  {
    content: { type: String, required: true, maxlength: 1000, trim: true },

    task: { type: Schema.Types.ObjectId, ref: "Task", required: true },

    author: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // ── Self-Referencing Field — এটাই মূল concept ──
    // parentComment একই Comment model কে ref করছে
    // null হলে root comment, ObjectId হলে reply
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },

    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],

    isDeleted: { type: Boolean, default: false },

    editedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// ── Indexes ──
// task এর সব root comments দ্রুত বের করার জন্য (parentComment: null filter সহ)
commentSchema.index({ task: 1, parentComment: 1 });

// একটা task এর comment গুলো newest-first sort করতে
commentSchema.index({ task: 1, createdAt: -1 });

export const Comment = model<IComment>("Comment", commentSchema);