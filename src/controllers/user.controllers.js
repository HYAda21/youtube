import { asyncHandler } from "../utilis/aysnchandler.js";
import {apiError} from "../utilis/apiError.js"
import { User } from "../models/user.models.js";
import {uploadOnCloudnary} from "../utilis/cloudnary.js"
import { apiResponse } from "../utilis/apiResponse.js";

const registerUser = asyncHandler(async (req,res)=>{
    // get user detail from frontend
    // validation - not empty
    //check is the user already  exist : usernmae , email
    //check for image ,check for avatar
    //create user object - create entry in dv
    //remove passward and refresh token field fron respose
    //check foer user creation
    //return res


   const {fullName,email, username, passward}=  req.body
   console.log("email",email);
   if([fullName,email,username,passward].some((field)=> 
    field?.trim()==="")

   ){
       throw new apiError(400, "all fields are required")
   }
  const existUser=   User.findOne({
    $or: [{username},{email}]
   })
   if(existUser){
    throw new apiError(409), "user with email or username already exist"
   }

  const avatarLocalPath =  req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if(avatarLocalPath){
    throw new apiError(400,"avatar file is require")
  }

const avatar = await uploadOnCloudnary(avatarLocalPath)
 const coverImage = await uploadOnCloudnary(coverImageLocalPath)

 if(!avatar){
  throw new apiError(400,"avatar files is require")
 }

 const user = await User.create({
  fullName,
  avatar: avatar.url,
  coverImage : coverImage?.url || "",
  email,
  passward,
  username:username.toLowerCase()
 })

 const createuser = await User.findById(user._id).select(
  "-passward - refreshToken"
 )

 if(!createuser){
  throw new apiError(500,"something wentwrong while registering the user")
 }
return res.status(201).json(
  new apiResponse(200,createuser,"User registered sucessfully")
)


})

export {registerUser}