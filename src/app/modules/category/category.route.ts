import experss from 'express'
import { checkAuth } from '../../middlewares/checkAuth'
import { USER_ROLES } from '../../../enums/user'
import validateRequest from '../../middlewares/validateRequest'
import { CategoryValidation } from './category.validation'
import { CatergoryController } from './category.controller'

const router = experss.Router()

router.route('/').post(checkAuth(USER_ROLES.ADMIN), validateRequest(CategoryValidation.createCategorySchema), CatergoryController.createCategory).get(checkAuth(USER_ROLES.ADMIN, USER_ROLES.CLIENT), CatergoryController.getAllCategories)


router.route("/:slug").get(checkAuth(USER_ROLES.ADMIN, USER_ROLES.CLIENT), validateRequest(CategoryValidation.getCategoryBySlug), CatergoryController.getCategoryBySlug)


export const categoryRoutes = router