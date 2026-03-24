import z from "zod";
import { TASK_PRIORITY, TASK_STATUS } from "../../../enums/task";
import { checkValidID } from "../../../shared/chackValid";

const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(5),
    description: z.string().optional(),
    status: z.nativeEnum(TASK_STATUS).optional(),
    priority: z.nativeEnum(TASK_PRIORITY),
    tags: z.array(z.string().max(50)).optional().default([]),
    category: checkValidID("Invalid Category ID ").optional(),
    assignedTo: checkValidID("Invalid Category ID ").optional(),
    scheduledAt:z.coerce.date().optional(),
    dueDate: z.coerce.date().optional(),


  })
})


const  updateTaskSchema = z.object({
params: z.object({
  id: checkValidID("Invalid Task ID")
}), 

  body: z.object({
    title: z.string().optional(),
    descirption: z.string().optional(),
    status: z.nativeEnum(TASK_STATUS).optional(),
    priority: z.nativeEnum(TASK_PRIORITY).optional(),
        tags: z.array(z.string().max(50)).optional().default([]),
    assignedTo: checkValidID("Invalid Category ID ").optional(),
    scheduledAt:z.coerce.date().optional(),
    dueDate: z.coerce.date().optional()
    
  })
})


const updateTaskStatus = z.object({
  params: z.object({
    id: checkValidID("Invalid Task ID")
  }),

  body: z.object({
    status: z.nativeEnum(TASK_STATUS)
  })

})


const bulkUpdateStatus = z.object({
  body: z.object({
  taskIds: z.array(z.string().min(1)),
  newStatus: z.nativeEnum(TASK_STATUS)
  })
})


const deleteTaskSchema = z.object({
  params: z.object({
    id: checkValidID("Invalid Task ID")
  })
})

export const TaskValidation = {
    createTaskSchema, updateTaskSchema, deleteTaskSchema, bulkUpdateStatus, updateTaskStatus
}



export type TCreateTaskPayload = z.infer<typeof createTaskSchema>['body']

export type TUpdateTaskPayload = z.infer<typeof updateTaskSchema>['body']

export type TDeleteTaskPayload = z.infer<typeof deleteTaskSchema>

export type TBulkUpdateStatus = z.infer<typeof bulkUpdateStatus>['body']

export type TUpdateTaskStatus = z.infer<typeof updateTaskStatus>['body']