import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // 1 The actual business logic
  const { fullName, username, email, password } = req.body;
  console.log("email", email);

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
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0 ) {
    coverImageLocalPath = req.files.coverImage[0].path
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
    avatar: avatar?.url , // here we get a respose from cloudinary we just need only the url of it

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

export { registerUser };
