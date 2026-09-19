import { verifyToken } from "../config/generateToken.js"
import userModel from "../models/user.model.js";


export const authenticateUser = async(req, res, next) => {

    try {
        const token = req.cookies.token

        if(!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, no token provided"
            })
        }

        const decoded = verifyToken(token);

        const user = await userModel.findById(decoded.userId).select("-password")

        req.user = user;

        next()

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Tokenization error",
            error: error.message
        })
    }

}