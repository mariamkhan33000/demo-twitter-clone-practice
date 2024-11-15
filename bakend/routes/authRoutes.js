import express from 'express'
import { getMe, logInUser, logOutUser, signUpUser } from '../controllers/authController.js'
import { protectedRoutes } from '../middleware/protectRoute.js'
const router = express.Router()

router.get('/me', protectedRoutes,  getMe)
router.post('/signup', signUpUser)
router.post('/login', logInUser)
router.post('/logout', logOutUser)

export default router