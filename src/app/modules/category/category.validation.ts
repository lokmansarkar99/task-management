import z from "zod";

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
    slug: z.string()
})

})


export const CategoryValidation = {
    createCategorySchema,
    getCategoryBySlug
}


export type TCreateCategoryPayload = z.infer<typeof createCategorySchema>['body']


export type TGetCategoryBySlug = z.infer<typeof getCategoryBySlug>