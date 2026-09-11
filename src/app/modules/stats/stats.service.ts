import { Task } from "../task/task.model";
import mongoose from "mongoose";
import { User } from "../user/user.model";
import { Comment } from "../comment/comment.model";
import { Category } from "../category/category.model";

const ObjectId = (userId: string) => new mongoose.Types.ObjectId(userId);
// get user task status
const getUserTaskStatus = async (userId: string) => {
  const result = await Task.aggregate([
    // stage:1 filter
    {
      $match: {
        createdBy: new mongoose.Types.ObjectId(userId),
      },
    },

    // stage 2: group
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalViews: { $sum: "$viewCount" },
        avgViewsPerTask: { $avg: "$viewCount" },
      },
    },

    // stage 3: format output

    {
      $project: {
        _id: 0,
        status: "$_id",
        count: 1,
        totalViews: 1,
        avgViewsPerTask: { $round: ["$avgViewsPerTask", 1] },
      },
    },
    // stage 4: sort by count
    {
      $sort: {
        count: -1,
      },
    },
  ]);
  return result;
};

// getPriority Breakdown
const getPriorityBreakdown = async (userId: string) => {
  const result = await Task.aggregate([
    {
      $match: {
        createdBy: ObjectId(userId),
      },
    },

    // grouping
    {
      $group: {
        _id: "$priority",
        count: { $sum: 1 },
        completedCount: {
          // conditional count -  done tasks only
          $sum: { $cond: [{ $eq: ["$status", "DONE"] }, 1, 0] },
        },
      },
    },
    // ADD FIELDS
    {
      $addFields: {
        completionRate: {
          $multiply: [{ $divide: ["$completedCount", "$count"] }, 100],
        },
      },
    },

    // Projection
    {
      $project: {
        priority: "$_id",
        _id: 0,
        count: 1,
        completedCount: 1,
        completionRate: { $round: ["$completionRate", 1] }, // round to 1 decimal
      },
    },
  ]);

  return result;
};

// getTasksByCategory
const getTasksByCategory = async (userId: string) => {
  const result = await Task.aggregate([
    // match
    {
      $match: {
        createdBy: ObjectId(userId),
        isDeleted: false,
        category: { $exists: true },
      },
    },

    // lookup - join data from Category Collection
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryData",
      },
    },
    // make object from array
    { $unwind: "$categoryData" },

    // group by category

    {
      $group: {
        _id: "$categoryData._id",
        categoryName: { $first: "$categoryData.name" },
        categoryColor: { $first: "$categoryData.color" },
        taskCount: { $sum: 1 },
        completedCount: {
          $sum: { $cond: [{ $eq: ["$status", "DONE"] }, 1, 0] },
        },
      },
    },

    // sort
    {
      $sort: {
        taskCount: -1,
      },
    },
  ]);

  return result;
};

// getDailyTaskActivity- Date Groupping

const getDailyTaskActivity = async (userId: string, lastNDays: number = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - lastNDays);

  const result = Task.aggregate([
    // match

    {
      $match: {
        createdBy: ObjectId(userId),
        createdAt: { $gte: startDate },
      },
    },

    // group
    {
      $group: {
        _id: {
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
        },
        created: { $sum: 1 },
        completed: {
          $sum: {
            $cond: [{ $eq: ["$status", "DONE"] }, 1, 0],
          },
        },
      },
    },

    // format
    {
      $project: {
        _id: 0,
        date: "$_id.date",
        created: 1,
        completed: 1,
        inProgress: {
          $sum: {
            $cond: [{ $eq: ["$status", "IN_PROGRESS"] }, 1, 0],
          },
        },
        todo: {
          $sum: {
            $cond: [{ $eq: ["$status", "TODO"] }, 1, 0],
          },
        },
      },
    },

    // sort
    {
      $sort: {
        date: 1,
      },
    },
  ]);
  return result;
};

// getOverdue Tasks

const getOverDueTasks = async (userId: string) => {
  const result = await Task.find({
    createdBy: ObjectId(userId),
    dueDate: { $lt: new Date() },
    isDeleted: false,
    status: { $nin: ["DONE", "CANCELLED"] },
  });

  return result;
};

// getAdminDashboard - Multi Collectdion Stats

const getAdminDashboard = async () => {
  const [userStats, taskStatus, commentStats, categoryStats] =
    await Promise.all([
      // Total user by role
      User.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } },
        {
          $project: {
           
            role:"$_id",
            count: 1,
            _id: 0
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
      ]),
      // Total Task by Status
      Task.aggregate([
        {
          $match: {
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        }  ,
        {
          $project: {
            status: "$_id",
            count: 1,
            _id: 0,
          },
        }
      ]),
      // Total Comment
      Comment.countDocuments(),
      // active Categories
      Category.countDocuments({ isActive: true }),
    ]);


    return {
        userStats,
        taskStatus,
        commentStats,
        categoryStats
    }
};

export const StatsService = {
  getUserTaskStatus,
  getPriorityBreakdown,
  getTasksByCategory,
  getDailyTaskActivity,
  getOverDueTasks,
  getAdminDashboard,
};
