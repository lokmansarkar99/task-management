import { Types } from "mongoose"

export interface ICategory {
    name: string
    slug: string
    description?: string
    color: string
    icon?: string
    createdBy: Types.ObjectId
    isActive: boolean
}