import { asyncHandler } from "../utilis/aysnchandler.js";
import {apiError} from "../utilis/apiError.js"
import { User } from "../models/user.models.js";
import {uploadOnCloudinary} from "../utilis/cloudinary.js"
import { apiResponse } from "../utilis/apiResponse.js";



const generateAccessAndRefreshTokens = async(userId)=>{
  try {
   const user = await User.findById(userId)
  const accessToken = user.generateAccessToken()
  const refreshToken =  user.generateRefreshToken()

user.refreshToken = refreshToken
await user.save({ validateBeforeSave: false })

  return{accessToken, refreshToken}
  } catch (error) {
    throw new apiError(500, "spmething went wrong while generating refresh and accesss token")
  }
}
const registerUser = asyncHandler(async (req,res)=>{
    // get user detail from frontend
    // validation - not empty
    //check is the user already  exist : usernmae , email
    //check for image ,check for avatar
    //create user object - create entry in dv
    //remove passward and refresh token field fron respose
    //check foer user creation
    //return res


   const {fullName,email, username, password}=  req.body
   console.log("email",email);
   if([fullName,email,username,password].some((field)=> 
    field?.trim()==="")

   ){
       throw new apiError(400, "all fields are required")
   }
  const existUser=  await User.findOne({
    $or: [{username},{email}]
   })
   if(existUser){
    throw new apiError(409, "user with email or username already exist")
   }

  const avatarLocalPath =  req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if(!avatarLocalPath){
    console.log("FILES =>", req.files); // Add this before line 37
   console.log("BODY  =>", req.body);

    throw new apiError(400,"avatar file is require")
  }

const avatar = await uploadOnCloudinary(avatarLocalPath)
console.log("Cloudinary avatar upload result:", avatar);
 const coverImage = await uploadOnCloudinary(coverImageLocalPath)

 if(!avatar){
  throw new apiError(400,"avatar files is require")
 }

 const user = await User.create({
  fullName,
  avatar: avatar.url,
  coverImage : coverImage?.url || "",
  email,
  password,
  username:username.toLowerCase()
 })

 const createuser = await User.findById(user._id).select(
  "-password -refreshToken"
 )

 if(!createuser){
  throw new apiError(500,"something wentwrong while registering the user")
 }
return res.status(201).json(
  new apiResponse(200,createuser,"User registered sucessfully")
)


})

const loginUser = asyncHandler(async(req, res)=>{
// req bbody -> data
//username or email
//find the user
//password check
//access and referesh token
// send cookies

const{email,username,password}= req.body
if (!username || !email){
  throw new apiError(400,"username or passwor is require")
}

const user = await User.findOne({
  $or:[{username},{email}]
})

if(!user){
  throw new apiError(404,"user does not exist")
}

const isPasswordValid= await user.isPasswordCorrect(password)

if(!isPasswordValid){
  throw new apiError(401,"invalid user credentials")
}

 const{accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

 const loginUser = await  User.findById(user._id).
 select("-password -refreshToken")

 const options = {
  httpOnly : true,
  secure: true
 }
 return res
 .status(200)
 .cookie("accessToken",accessToken,options)
 .cookie("refreshToken",refreshToken,options)
 .json(
  new apiResponse(
    200,{

      user:loginUser,accessToken,
      refreshToken
    },
    "user logged in sucessfully"
  )
 )
})

const logoutUser = asyncHandler (async(res,req)=>{
  await User.findByIdAndUpdate(
    req.user._id,
{
  $set: {
    refreshToken:undefined
  }
},
  {
    new:true
  }
)
const options = {
  httpOnly:true,
  secure: true
}

return res 
.status(200)
.clearCookies("accessToken", options)
.clearCookies("refresgToken",options)
.json(new apiError(200, {} , "user log out"))
})


export {
  registerUser,
  loginUser,
  logoutUser
}