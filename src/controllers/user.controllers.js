import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt  from "jsonwebtoken";


const generateAccessAndRefreshTokens = async(userId) => {
  try {
    const user = User.findById(userId)
    const refreshToken = user.generateRefreshToken()
    const accessToken = user.generateAccessToken()

    // here the "user" is an object that means it has the properties that also means that we can the properties to it as well 

    user.refreshToken = refreshToken
    user.save({ validateBeforeSave: false }) 
    
    return {refreshToken, accessToken}
    
  } catch (error) {
    throw new ApiError(500, " Something went wrong while generating refresh and access tokens")
    
  }
}

const registerUser = asyncHandler(async (req, res) => {
  // 1 The actual business logic
  const { fullName, username, email, password } = req.body;
  console.log("email", email);
  console.log(password);
  console.log(fullName);
  console.log(username);
  
  

  // 2 Checking for validation of the user

  // 2.1 Did the user fill the required fields
  if (
    [fullName, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "Please fill all the fields");
  }

  // 2.2 if the user exists or not

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "This useer already exists");
  }

  // 3 This is getting the photos
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  // const avatarLocalPath = req.files?.avatar && Array.isArray(req.files.avatar) && req.files.avatar.length > 0
  // ? req.files.avatar[0].path
  // : null;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar field is required");
  }

  // 4 uploading on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar field is required");
  }

  const user = await User.create({
    username: username.toLowerCase(),
    fullName,
    email,
    password,
    avatar: avatar?.url, // here we get a respose from cloudinary we just need only the url of it

    // In the same manner if we are to get for the coverIamge then code may crash if user didn't give one
    // we've not made sure that having the cover image is mandatory where we made sure about having an avatar
    // These are corner cases and bulids logical reasoning

    coverImage: coverImage?.url || "",
  });

  const createdUser = User.findById(user._id).select("-password -refreshToken");
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  return res
    .status(201)
    .json(
      new ApiResponse(200, createdUser, "The user is created successfully")
    );
});

  const  loginUser =  asyncHandler(async (req, res) => {
  // req body -> data
  // validation through email or username
  // find the user
  // check password
  // access tokens and refresh tokens generate and give to user
  // send cookie

  const { username, email, password } = req.body;

  // This dont work insted use 
  // if (!email || !username) {
    // throw new ApiError(400, "email or username is required to login");
  // } 

  if (!(username || email)) {
        throw new ApiError(400, "email or username is required to login");

  }


  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404,"The user does not exist");
    
  }

  const isPasswordValid = await user.isPasswordCorrect(password)

  if(!isPasswordValid){
    throw new ApiError(401, "Invalid user credentials")
  }

  const {refreshToken, accessToken} =  await generateAccessAndRefreshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
  .status(200)
  .cookie("refreshToken", refreshToken, options)
  .cookie("accessToken", accessToken, options)
  .json(
    200,
    {
      user: refreshToken, accessToken, loggedInUser
    },
    "User loggedIn successfully"
     
  )
});

const logoutUser = asyncHandler(async(req,res) => {
  await User.findByIdAndUpdate(
    req.user._id,{
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true
    },
  )
  const options = {
    httpOnly: true,
    secure: true
  }

  return res
  .status(200)
  .clearCookie("refreshToken", options)
  .clearCookie("accessToken", options)
  .json(new ApiResponse(200, {}, "User logged out"))
})

const refreshAccessToken = asyncHandler(async(req, res) =>{
  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorised user")
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
  
    const user = User.findById(decodedToken?._id)
  
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used")
    }
  
    const options =  {
      httpOnly: true,
      secure: true
    }
  
    const {newRefreshToken, accessToken} = await generateAccessAndRefreshTokens()
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("newRefreshToken",newRefreshToken, options)
    .json (
      new ApiResponse(
        200,
        {accessToken, refreshToken: newRefreshToken },
        "Access token refreshed"
      )
    )
  } catch (error) {
    throw new ApiError(error.message || "Invalid refresh token")
  }
})

const changeCurrentPassword = asyncHandler(async(req, res)=>{
  const {oldPassword, newPassword}= req.body
  
  const user = await User.findById(req.user?._id)
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
  if (!isPasswordCorrect) {
    throw new ApiError()
  }

  user.password = newPassword
  await user.save({validateBeforeSave: false})

  return res
  .status(200)
  .json(new ApiResponse(200, {}, "Password updated successfully"))

}) 

const getCurrentUser = asyncHandler(async(req, res) => {
  return res
  .status(200)
  .json(200, req.user, "Current user fetched successfully")
})

const updatePasswordDetails = asyncHandler(async(req, res) => {
  const {email, fullName} = req.body

  if (!(email || fullName)) {
    throw new ApiError(400, "All fields are required")
  }

  const user = User.findByIdAndUpdate(
    req.user?._id,
    {$set: {
     fullName,
     email
    }},
    {new: true} 
   ).select("-password")

   return res
  .status(200)
  .json(new ApiResponse(200, user, "User details updated successfully"))
   
})

const updateUserAvatar = asyncHandler(async(req, res) => {
  const avatarLocalPath = req.file?.path

  if (!avatarLocalPath) {
    throw new ApiError(400,"Avatar file is missing")
  }

  const avatar = uploadOnCloudinary(avatarLocalPath)

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading avatar")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {avatar: avatar.url}
    },
    {new: true}.select("-password")

  )

  return res
  .status(200)
  .json(new ApiResponse(200, user, "avatar updated successfully"))
    

  
})

const updateUserCoverImage = asyncHandler(async(req, res) => {
  const coverImageLocalPath = req.file?.path

  if (!coverImageLocalPath) {
    throw new ApiError(400,"coverImage file is missing")
  }

  const coverImage = uploadOnCloudinary(coverImageLocalPath)

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading coverImage")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {coverImage: coverImage.url}
    },
    {new: true}.select("-password")

  )
    
  return res
  .status(200)
  .json(new ApiResponse(200, user, "cover image updated successfully"))
    

  
})




export {
   registerUser, 
   loginUser,
   logoutUser,
   refreshAccessToken,
   changeCurrentPassword,
   getCurrentUser,
   updatePasswordDetails,
   updateUserAvatar,
   updateUserCoverImage,

   
   };
