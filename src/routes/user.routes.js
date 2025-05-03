import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken } from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middlewares.js"
import {verifyJwt} from "../middlewares/auth.middlewares.js"

 const router = Router()
router.route("/register").post(
    
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1  
        }
    ])
    ,registerUser)
    // Login section
    router.route("/login").post(loginUser)

    // logout section
    router.route("/logout").post(verifyJwt, logoutUser)

    //refreshAccessToken
    router.route("/refresh-token").post(refreshAccessToken)

    export default router 

