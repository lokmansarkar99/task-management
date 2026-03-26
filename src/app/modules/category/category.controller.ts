import { Request, Response } from "express";

import { CategoryService } from "./category.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.createCategory(req.body, req.user!.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Category Created Successfully",
    data: result,
  });
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.getAllCategories(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "All category retrived",
    data: result,
  });
});

const getCategoryBySlug = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.getCategoryBySlug(
    req.params.slug as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Cagegoy By Slug",
    data: result,
  });
});



const updateCategory = catchAsync(  async (req: Request, res: Response) => {

    const result = await CategoryService.updateCategory(req.params.id as string, req.body)

    sendResponse( res, {
        success: true, 
        statusCode: StatusCodes.OK,
        message:  "Category Updated Successfully",
        data: result

    } )

} )


const toggleCategory = catchAsync ( async ( req: Request, res:Response) => {

    const result = await CategoryService.toggleCategory(req.params.id as string)

        sendResponse( res, {
        success: true, 
        statusCode: StatusCodes.OK,
        message:  "Category toggled Successfully",
        data: result

    } )
} )



const getCategoryWithTaskCount = catchAsync ( async (req: Request, res: Response) => {

    const result = await CategoryService.getCategoryWithTaskCount()
  sendResponse( res, {
        success: true, 
        statusCode: StatusCodes.OK,
        message:  "Category with task count",
        data: result

    } )

} )

export const CatergoryController = {
  createCategory,
  getAllCategories,
  getCategoryBySlug,
  updateCategory,
  toggleCategory,
  getCategoryWithTaskCount
};
