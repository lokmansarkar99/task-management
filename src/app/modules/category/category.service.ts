import { StatusCodes } from "http-status-codes";
import { Category } from "./category.model";
import {
  CategoryValidation,
  TCreateCategoryPayload,
  TUpdateCategory,
} from "./category.validation";
import ApiError from "../../../errors/ApiErrors";

const createCategory = async (
  payload: TCreateCategoryPayload,
  userId: string,
) => {
  const existing = await Category.findOne({ name: payload.name });

  if (existing) {
    throw new ApiError(409, "This category already exists");
  }

  const category = await Category.create({
    name: payload.name,
    color: payload.color,
    icon: payload.icon,
    createdBy: userId,
  });

  return category;
};

const getAllCategories = async (query: Record<string, unknown>) => {
  const filter: Record<string, unknown> = { isActive: true };

  if (query.search) {
    filter.$or = [{ name: { $regex: query.search, $options: "i" } }];
  }

  const categories = Category.find(filter);

  return categories;
};

const getCategoryBySlug = async (slug: string) => {
  const getCat = Category.find({
    slug,
  });

  if (!slug) {
    throw new ApiError(404, "Slug Not Found");
  }

  return getCat;
};

const updateCategory = async (categoryId: string, payload: TUpdateCategory) => {
  const category = await Category.findByIdAndUpdate(categoryId, {
    $set: payload,
  }, 
{returnDocument: 'after', runValidators: true} 
);

  if (!category) {
    throw new ApiError(404, "Category Not Found");
  }

  return category;
};


const toggleCategory = async (categoryId: string) => {

  const cat = await Category.findById(
    categoryId,
  
  )
  if(!cat) {
    throw new ApiError(404, "Category Not Found")
  }

  cat.isActive = !cat.isActive

  cat.save()

  return cat


}


const getCategoryWithTaskCount = async () => {


  const cat = await Category.aggregate([
    {$lookup: {
      from: "tasks",
      localField: "_id",
      foreignField: "category",
      as: "categoryTasks"
    }}, 

{
  $addFields: {
    taskCount: {$size: "$categoryTasks"}
  }},

  {$project: {
    categoryTasks: 0
  }},

  ])
return cat

}


export const CategoryService = {
  createCategory,
  getAllCategories,
  getCategoryBySlug,
  updateCategory,
  toggleCategory,
  getCategoryWithTaskCount
};
