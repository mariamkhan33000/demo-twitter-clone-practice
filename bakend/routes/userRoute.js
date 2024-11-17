import express from 'express'
import { followUnfollowUsers, getSuggestedUsers, getUserProfile, updateUser } from '../controllers/userController.js'
import { protectedRoutes } from '../middleware/protectRoute.js'
const router = express.Router()

router.get('/profile/:username', protectedRoutes, getUserProfile)
router.get('/suggested', protectedRoutes , getSuggestedUsers)
router.post('/follow/:id', protectedRoutes ,  followUnfollowUsers)
router.post('/update', protectedRoutes ,  updateUser)

export default router 