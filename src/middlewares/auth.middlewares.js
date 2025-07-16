import { apiError } from "../utilis/apiError";
import { asyncHandler } from "../utilis/aysnchandler";
import jwt from "jsonwebtoken"
import { User } from "../models/user.models";


export const verifyJWT = asyncHandler(async(req, _,next)=>{
try {
    const token = req.cookies?.accessToken || req.header
    ("Authorization")?.replace("Bearer","")
     
    if(!token){
        throw new apiError(400, "unauthorized request")
    }
     const decodedToken = jwt.verify(token, process.env.
        ACCESS_TOKEN_SECRET)
    
     const user = await User.findById(decodedToken?._id).
     select("-password -refreshToken")
    
     if(!user){
    
        throw new apiError(401, "Invaild Access Token")
     }
    
     req.user = user;
     next()
    
} catch (error) {
    throw new apiError(401, error?.message || "invaild access token")
}
})

