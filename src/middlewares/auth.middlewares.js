import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js";


export const verifyJwt = asyncHandler(async(req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        // This targets bothe the users cookies(browser users) and header(mobile users)
    
        if (!token) {
            throw new ApiError(401, "Unothrized user")
        }
    
        const decodedUser = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedUser?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid access token ")
        }
    
        req.user = user
        next()

    } catch (error) {
       throw new ApiError(401, error?.message || "Invalid access token") 
    }
})

