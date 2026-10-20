import { verifyToken } from "../config/generateToken.js"
import userModel from "../models/user.model.js";


export const authenticateUser = async(req, res, next) => {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Not authorized, no token provided"
        })
    }

    let decoded;
    try {
        decoded = verifyToken(token);
    } catch {
        return res.status(401).json({
            success: false,
            message: "Not authorized, invalid or expired token"
        })
    }

    try {
        const user = await userModel.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, user no longer exists"
            })
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Authentication lookup failed:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to authenticate user"
        })
    }
}