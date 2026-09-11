import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatsService } from "./stats.service"


const getUserTaskStatus = catchAsync(async(req, res) => {
    const result = await StatsService.getUserTaskStatus(req.user.id)

    sendResponse(res, {
        statusCode:200,
        success: true,
        message: "User task status fetched successfully",
        data: result
    })
})


const getPriorityBreakdown = catchAsync(async(req, res)=> {
    const result = await StatsService.getPriorityBreakdown(req.user.id)

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Priority Breakdown fetched successfully",
        data: result
    })
})

const getTasksByCategory = catchAsync(async(req, res)=> {
    const result = await StatsService.getTasksByCategory(req.user.id)

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Tasks by category fetched successfully",
        data: result
    })
})


const getDailyTaskActivity = catchAsync(async(req, res)=> {
    const result = await StatsService.getDailyTaskActivity(req.user.id)

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Daily Task Activity fetched successfully",
        data: result
    })
})


const getOverDueTasks = catchAsync(async(req, res)=> {
    const result = await StatsService.getOverDueTasks(req.user.id)

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Over Due Tasks fetched successfully",
        data: result
    })
})



const getAdminDashboard = catchAsync(async(req, res)=> {
    const result = await StatsService.getAdminDashboard()

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Admin Dashboard fetched successfully",
        data: result
    })
})

export const StatsController = {
    getUserTaskStatus,
    getPriorityBreakdown,
    getTasksByCategory,
    getDailyTaskActivity,
    getOverDueTasks,
    getAdminDashboard
}