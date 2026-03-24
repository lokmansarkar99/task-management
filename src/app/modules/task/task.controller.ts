
import { Request, Response } from "express";
import { TaskService } from "./task.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { Task } from "./task.model";
import { TASK_STATUS } from "../../../enums/task";


const createTask = catchAsync(async (req:Request, res:Response) => {

    const result = await TaskService.createTask(req.body, req.user!.id as string )

    sendResponse(res , {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: "Task Created Successfully",
        data: result
    })
})



const updateTask = catchAsync( async (req: Request, res:Response) => {

    const result= await TaskService.updateTask(req.body, req.params.id as string, req.user!.id as string)


    sendResponse( res, {
        success: true, 
        statusCode: StatusCodes.OK,
        message: "Task Updated Successfully",
        data: result
    })
})



const getAllTasks = catchAsync(async (req:Request , res:Response) => {
    const result = await TaskService.getAllTasks(req.query, req.user!.id as string, req.user!.role as string)

    sendResponse( res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "All tasks retrived successfully", 
        data: result
    })
})


const deleteTask = catchAsync( async (req:Request, res: Response) => {

    const result = await TaskService.deleteTask(req.params.id as string, req.user!.id as string)

    sendResponse( res, {
        success: true , 
        message: "Task Deleted Successfully",
        statusCode: StatusCodes.OK,
        data: result
    })
} )


const getSingleTask = catchAsync(async (req:Request , res: Response) => {
    const result = await TaskService.getSingleTask(req.params.id as string)

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Task retrived successfully",
        data: result
    })
})



const updateTaskStatus = catchAsync( async (req: Request, res:Response) => {

    const result = await TaskService.updateTaskStatus(req.params.id as string, req.user!.id, req.body)

    
    sendResponse( res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: ` Task Status Updated to ${req.body.status}`,
        data: result
    })


})

const bulkUpdateStatus = catchAsync( async (req:Request, res: Response) => {

    const result = await TaskService.bulkUpdateStatus(req.body,  req.user!.id)


    sendResponse(  res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: `Task Status Updated to ${req.body.newStatus}`,
        data: result
    })

} )



const scheduledTasks = catchAsync(  async (req: Request, res: Response) => {

    const result =  await TaskService.getScheduledTasks()

    sendResponse( res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Scheduled Tasks Retrived Successfully",
        data: result
    } )

} )


const overDueTasks = catchAsync( async(req: Request, res: Response) => {

    const result = await TaskService.getOverDueTasks(req.user!.id)


sendResponse( res, {
    success: true, 
    statusCode: StatusCodes.OK,
    message: "OverDue Task Retrived Successfully",
    data: result
})

})




export const TaskController = {
    createTask,
    updateTask,
    getAllTasks,
    deleteTask,
    getSingleTask,
    updateTaskStatus,
    bulkUpdateStatus,
    scheduledTasks,
    overDueTasks
 
}