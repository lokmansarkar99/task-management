import { Request, Response } from "express";

import { CategoryService } from "./category.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";


const createCategory = catchAsync( async (req: Request, res: Response) => {

const result = await CategoryService.createCategory(req.body, req.user!.id)


sendResponse( res, {
    success: true, 
    statusCode: StatusCodes.OK,
     message: "Category Created Successfully",
     data: result,

})


})




const getAllCategories = catchAsync( async (req: Request, res: Response) => {

    const result = await CategoryService.getAllCategories(req.query)


    sendResponse( res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "All category retrived",
        data: result
    })
} )




const getCategoryBySlug = catchAsync( async (req:Request, res: Response) => {


    const result = await CategoryService.getCategoryBySlug(req.params.slug as string)

       sendResponse( res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Cagegoy By Slug",
        data: result
    })
})


export const CatergoryController = {
    createCategory,
    getAllCategories,
    getCategoryBySlug
}