import { asyncHandler } from "../utilis/aysnchandler.js";
import { apiError } from "../utilis/apiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utilis/cloudinary.js";
import { apiResponse } from "../utilis/apiResponse.js";
import jwt from "jsonwebtoken";
import { use } from "react";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(500, "Error generating tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
      // get user detail from frontend
    // validation - not empty
    //check is the user already  exist : usernmae , email
    //check for image ,check for avatar
    //create user object - create entry in dv
    //remove passward and refresh token field fron respose
    //check foer user creation
    //return res
  const { fullName, email, username, password } = req.body;

  if ([fullName, email, username, password].some(field => field?.trim() === "")) {
    throw new apiError(400, "All fields are required");
  }

  const existUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existUser) {
    throw new apiError(409, "User with email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
   // console.log("FILES =>", req.files);
    //console.log("BODY  =>", req.body);
    throw new apiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new apiError(400, "Avatar upload failed");
  }

  const user = new User({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email: email.toLowerCase(),
    password,
    username: username.toLowerCase()
  });

  await user.save(); //  This triggers password hashing

  const dbUser = await User.findById(user._id).select("+password");
  //console.log("🔐 Stored Hashed Password:", dbUser.password); // should start with $2b$

  const createuser = await User.findById(user._id).select("-password -refreshToken");
  if (!createuser) {
    throw new apiError(500, "Failed to register user");
  }

  return res.status(201).json(new apiResponse(200, createuser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new apiError(400, "Username or Email is required");
  }

  const user = await User.findOne({
    $or: [
      { username: username?.toLowerCase() },
      { email: email?.toLowerCase() }
    ]
  }).select("+password");

  if (!user) {
    throw new apiError(404, "User does not exist");
  }

  //console.log("Entered Password:", password);
 // console.log("Stored Hashed Password:", user.password);

  const isPasswordValid = await user.isPasswordCorrect(password);
  //console.log("Password Match:", isPasswordValid);

  if (!isPasswordValid) {
    throw new apiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  const loginUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new apiResponse(200, { user: loginUser, accessToken, refreshToken }, "User logged in successfully"));
});

// req bbody -> data
//username or email
//find the user
//password check
//access and referesh token
// send cookies

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: undefined
    }
  }, {
    new: true
  });

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async(req,res)=>{
   const IncomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

   if(IncomingRefreshToken){
    throw new apiError(401,"unauthorized request ")
   }

  try {
    const decodedToken =  jwt.verify(
      IncomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
     )
    const user = await User.findById(decodedToken?._id)
   
    if(!user){
      throw new apiError(401,"invaid refresh token")
    }
    if(IncomingRefreshToken !==user?.refreshToken){
      throw new apiError(401, "refresh token is expired or used")
    }
    const options ={
      httpOnly: true,
      secure:true
    }
  
    const {accessToken, newrefreshToken}= await generateAccessAndRefreshTokens(user._id)
    return res
    .status(200)
    .cookie("accessToken",accessToken, options)
    .cookie("refreshToken", newrefreshToken, options)
    .json(
      new apiResponse(
        200,
        {accessToken, refreshToken:newrefreshToken},
        "Acesss token refreshed"
      )
    )
  } catch (error) {
       throw new apiError(401,error?.message ||"invalid refresh token")
  }
})


export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken
};
