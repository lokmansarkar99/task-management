import experss from 'express'
import { checkAuth } from '../../middlewares/checkAuth'
import { USER_ROLES } from '../../../enums/user'
import validateRequest from '../../middlewares/validateRequest'
import { CategoryValidation } from './category.validation'
import { CatergoryController } from './category.controller'
import { TaskValidation } from '../task/task.validation'

const router = experss.Router()

router.route('/').post(checkAuth(USER_ROLES.ADMIN), validateRequest(CategoryValidation.createCategorySchema), CatergoryController.createCategory).get(checkAuth(USER_ROLES.ADMIN, USER_ROLES.CLIENT), CatergoryController.getAllCategories)


router.route("/getwithtask").get(checkAuth(USER_ROLES.CLIENT), CatergoryController.getCategoryWithTaskCount)

router.route("/:slug").get(checkAuth(USER_ROLES.ADMIN, USER_ROLES.CLIENT), validateRequest(CategoryValidation.getCategoryBySlug), CatergoryController.getCategoryBySlug)


router.route("/:id").patch(checkAuth(USER_ROLES.ADMIN), validateRequest(CategoryValidation.updateCategorySchema), CatergoryController.updateCategory)

router.route("/:id/toggle").patch(checkAuth(USER_ROLES.ADMIN), CatergoryController.toggleCategory)
export const categoryRoutes = router