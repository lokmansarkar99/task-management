import z from "zod";
import { checkValidID } from "../../../shared/chackValid";

const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(3).max(100),
    color: z.string().optional(),
    icon: z.string().optional(),
    isActive: z.boolean().default(true),
  }),
});

const getCategoryBySlug = z.object({
  params: z.object({
    slug: z.string(),
  }),
});
const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(3).max(100).optional(),
    color: z.string().optional(),
    icon: z.string().optional(),
  }),
  params: z.object({
    id: checkValidID("Invalid Cateoty ID"),
  }),
});

export const CategoryValidation = {
  createCategorySchema,
  getCategoryBySlug,
  updateCategorySchema,
};

export type TCreateCategoryPayload = z.infer<
  typeof createCategorySchema
>["body"];

export type TGetCategoryBySlug = z.infer<typeof getCategoryBySlug>;
export type TUpdateCategory = z.infer<typeof updateCategorySchema>['body'];
