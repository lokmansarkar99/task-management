import experss from 'express'
import { checkAuth } from '../../middlewares/checkAuth'
import { USER_ROLES } from '../../../enums/user'
import validateRequest from '../../middlewares/validateRequest'
import { StatsController } from './stats.controller'

const router = experss.Router()

router.get("/my-tasks", checkAuth(USER_ROLES.CLIENT, USER_ROLES.ADMIN), StatsController.getUserTaskStatus)
router.get("/priority", checkAuth(USER_ROLES.CLIENT, USER_ROLES.ADMIN), StatsController.getPriorityBreakdown)
router.get("/by-category", checkAuth(USER_ROLES.CLIENT, USER_ROLES.ADMIN), StatsController.getTasksByCategory)
router.get("/daily-activity", checkAuth(USER_ROLES.CLIENT, USER_ROLES.ADMIN), StatsController.getDailyTaskActivity)
router.get("/overdue", checkAuth(USER_ROLES.CLIENT, USER_ROLES.ADMIN), StatsController.getOverDueTasks)
router.get("/admin-dashboard", checkAuth(USER_ROLES.ADMIN), StatsController.getAdminDashboard)


export const StatsRoutes = router