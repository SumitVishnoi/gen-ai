import express from "express"
import { getMe, login, logout, register } from "../controller/auth.controller.js"
import { authenticateUser } from "../middlewares/user.middleware.js"

const router = express.Router()

/**
 * @route POST /api/auth/register
 * @description To create a new user
 */
router.post("/register", register)

/**
 * @route POST /api/auth/login
 * @description login to existing user
 */
router.post("/login", login)

/**
 * @route POST /api/auth/logout
 * @description to remove the current loggedin user
 */
router.post("/logout", logout)

/**
 * @route GET /api/auth/me
 * @description get current user
 * @access Private
 */
router.get("/me", authenticateUser, getMe)


export default router