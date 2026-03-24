import express from 'express'

const router = express.Router()

import { checkAuth } from '../../middlewares/checkAuth'
import validateRequest from '../../middlewares/validateRequest'
import { USER_ROLES } from '../../../enums/user'
import { TaskValidation } from './task.validation'
import { TaskController } from './task.controller'





router.route("/").post(checkAuth(USER_ROLES.CLIENT), validateRequest (TaskValidation.createTaskSchema), TaskController.createTask).get(checkAuth(USER_ROLES.CLIENT), TaskController.getAllTasks)


router.route("/scheduled").get(checkAuth(USER_ROLES.CLIENT), TaskController.scheduledTasks)

router.route("/overdue").get(  checkAuth(USER_ROLES.CLIENT), TaskController.overDueTasks)


router.route("/bulk-status").patch(checkAuth(USER_ROLES.CLIENT), validateRequest(TaskValidation.bulkUpdateStatus), TaskController.bulkUpdateStatus)

router.route("/:id").get(checkAuth(USER_ROLES.CLIENT), TaskController.getSingleTask)

router.route("/:id/status").patch(checkAuth(USER_ROLES.CLIENT), validateRequest(TaskValidation.updateTaskStatus), TaskController.updateTaskStatus)


router.route("/:id").patch(checkAuth(USER_ROLES.CLIENT), validateRequest(TaskValidation.updateTaskSchema), TaskController.updateTask).delete(checkAuth(USER_ROLES.CLIENT), validateRequest(TaskValidation.deleteTaskSchema), TaskController.deleteTask)



export const TaskRoutes = router