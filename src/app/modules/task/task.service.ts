import { Types } from "mongoose";
import ApiError from "../../../errors/ApiErrors";
import { Task } from "./task.model";
import { TBulkUpdateStatus, TCreateTaskPayload, TUpdateTaskPayload, TUpdateTaskStatus } from "./task.validation";

import { USER_ROLES } from "../../../enums/user";
import { TASK_STATUS } from "../../../enums/task";

const createTask = async (payload: TCreateTaskPayload, userId: string) => {
  const createTask = await Task.create({
    ...payload,
    createdBy: userId,
  });

  return createTask;
};

const updateTask = async (payload: TUpdateTaskPayload, taskId: string, userId:string) => {
  const isExistTask = await Task.findById(taskId);




  if (!isExistTask) {
    throw new ApiError(404, "Task Not Found");
  }

const isOwner = await Task.findOne({_id: taskId, createdBy: userId})


if(!isOwner) {
    throw new ApiError (403, "Forbidden, You are not permitted for edit this task.")
}


const updatedTask = await Task.findByIdAndUpdate(
     taskId,
     {$set: payload}, 
     { returnDocument: "after"}
    )

    return updatedTask

};

const getAllTasks = async (query: Record<string, unknown>, userID: string, userRole: string) => {
// Base Filter 
const filter: Record<string, unknown> = { isDeleted: false}
if(userRole !== USER_ROLES.ADMIN) {
    filter.createdBy = userID
}
// Dynamic Filter
// status filter (simple $eq)

if(query.status ) {
    filter.status = query.status 
}

// priority filter

if(query.priority ) {
    filter.priority = query.priority
}
// tags filter ($in)
if(query.tags) {
    const tagsArr = (query.tags as string).split(",") 
    filter.tags = {$in : tagsArr}
}

// category filter
if(query.category) {
    filter.category = query.category
}

// date range ($lte / $gte)
if(query.dueBefore || query.dueAfter) {
    filter.dueDate = {}

    if(query.dueBefore) { (filter.dueDate as any).$lte = new Date(query.dueBefore as string)}

    if(query.dueAfter) { (filter.dueDate as any).$gte = new Date(query.dueAfter as string)}

}


// scheduled only ($exists)

if(query.scheduledOnly === "true") {
    filter.scheduledAt = {$exists: true}
}

// exclude specific user ($ne)
if(query.excludeUser) {
    filter.createdBy = {$ne: query.excludeUser}
}


// active task only ($or) 

if(query.activeOnly === "true")  {
    filter.$or = [ {status: TASK_STATUS.TODO}, {status: TASK_STATUS.IN_PROGRESS}]
}

// text search ($regex)

if(query.search) {
    filter.$or = [
        { title: {$regex: query.search , $options: "i"}},
        {description: {$regex: query.search, $options: "i"}}
    ]
}


// Pagination 

const page = Number(query.page) || 1
const limit = Number(query.limit) || 10
const skip = (page - 1) * limit

// Sort

const sortBy: string = (query.sortBy as string) || "createdAt"
const sortOrder: 1 | -1 = query.sortOrder === "asc" ? 1 : -1

const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder }



// Query
const [tasks, total] = await Promise.all([
    Task.find(filter).sort(sort).skip(skip).limit(limit),
    Task.countDocuments(filter)
])

return { 
    tasks,
    meta: { page, limit, total, totalPges: Math.ceil(total / limit)}
}


};

const deleteTask = async (taskId: string, userId: string) => {
  const isTaskExist = await Task.findById(taskId);

  if (!isTaskExist) {
    throw new ApiError(404, "Task Not Found");
  }

  const isOwner = await Task.findOne({_id: taskId, createdBy: userId})

  if(!isOwner) {
    throw new ApiError(403, "Forbidden")
  }

  const deleteTask = await Task.findByIdAndUpdate(taskId, {isDeleted: true} , {new: true})

  return deleteTask;
};


const getSingleTask = async (taskId: string) => {


const task = await Task.findById(taskId).populate('createdBy' ,'name email profileImage')

if(!task) {
    throw new ApiError(404, "Task Not Found")

}

if(task.isDeleted) {
    throw new ApiError(400, "Task has deleted")
}
await Task.updateOne({_id: taskId}, {$inc: {viewCount: 1}} )


return task


}

const updateTaskStatus = async (taskId: string, userId: string, payload: TUpdateTaskStatus) => {

    const ups = await Task.findOneAndUpdate({
        _id: taskId, createdBy: userId, isDeleted: false },
        payload.status === TASK_STATUS.DONE ? { $set: {status: payload.status, completedAt: new Date ()}} : {$set: { status: payload.status}},

        {runValidators: true, returnDocument: 'after'}    )

        return ups;
    

} 



const bulkUpdateStatus = async (payload:TBulkUpdateStatus, userId:string) => {

    const updatedTasks =  await Task.updateMany(
        {_id: {$in: payload.taskIds}, createdBy: userId, isDeleted: false},
        {$set: {status: payload.newStatus}},
        
        
        
    )

return updatedTasks.modifiedCount


}




const getScheduledTasks = async () => {
// scheduled tasks 
    const gs = await Task.find({
        status: TASK_STATUS.SCHEDULED,
        scheduledAt: {$lte: new Date()},
        isDeleted: false
    })


    return gs    

}

const getOverDueTasks = async (userId: string) => {

    const ot = await Task.find({
            createdBy: userId,
            dueDate: {$lt: new Date()},
            status: {$nin: [TASK_STATUS.DONE, TASK_STATUS.CANCELLED]},
            isDeleted: false
    })
    .sort({dueDate: 1}).lean()

    return ot
}







export const TaskService = {
  createTask,
  updateTask,
  getAllTasks,
  deleteTask,
  getSingleTask,
  updateTaskStatus, 
  bulkUpdateStatus,
  getScheduledTasks,
  getOverDueTasks
};
