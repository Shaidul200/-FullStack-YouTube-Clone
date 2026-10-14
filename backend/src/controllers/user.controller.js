import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary, deleteFromCloudinary} from "../utils/cloudinary.js"
import ApiResponse from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken";
import mongoose from "mongoose"

const generateAccessAndRefreshToken = async(userId) => {

    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "The Access and Refresh Token couldn't generate")
    }

}

const registerUser = asyncHandler(async (req, res) => {

    const {  fullName, email, userName, password } = req.body

    if([fullName, email, userName, password].some((value) => 
        value?.trim() === ""
    )) { 
        throw new ApiError(400, "all the fields are needed") 
    }

    const existedUser = await User.findOne({
        $or: [{email}, {userName}]
    });

    if (existedUser) {
        throw new ApiError(409, "user already exist")
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path

    const coverImageLocalPath = req.files?.coverImage?.[0]?.path

    let coverImage;

    if( coverImageLocalPath ) {

        coverImage = await uploadOnCloudinary(coverImageLocalPath)
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "avater file is required")
    } 

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar) {
        throw new ApiError(400, "avatar is required")
    }

    const user = await User.create({
        userName: userName.toLowerCase(),
        password,
        email,
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        avatarPublicId: avatar.public_id,
        coverImagePublicId: coverImage?.public_id || ""
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    
    if(!createdUser) {
        throw new ApiError(500, "something went wrong while creating user")
    }

     return res.status(201).json(
        new ApiResponse(201, createdUser, "User is created successfully")
     )
})

const loginUser = asyncHandler(async (req, res) => {

    const {email , userName, password} = req.body;

    if(!email && !userName) {
        throw new ApiError(400, "Email or userName is required")
    }

    const user = await User.findOne({
        $or: [{email}, {userName}]
    })

    if(!user) {
        throw new ApiError(404, "user not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

  const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  const options = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
  }

  return res.status(200).cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(200,
        {   
            accessToken,
            refreshToken,
            user: loggedInUser
        },
        "User logged in successfully"
     )
  )
  
})

const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(req.user._id,
        {
          $unset : {refreshToken : 1}
        },
        {
            new: true
        }
    )

    const options = {
      httpOnly : true,
      secure : true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
    new ApiResponse(200, {},
        "User logged out successfully"
    )
 )

})

const refreshAccessToken = asyncHandler(async(req, res) => {
const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken   
   
   if(!incomingRefreshToken) {
    throw new ApiError(401, "unautorized request")
   }
   
  const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

  const user = await User.findById(decodedToken?._id)

  if(!user) {
    throw new ApiError(401, "Invalid Refresh Token")
  }

  if(incomingRefreshToken !== user?.refreshToken) {
    throw new ApiError(401, "RefreshToken is either used or expiered")

  }

  const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)


  const options = {
    httpOnly: true,
    secure: true
  }

  return res.status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(
        200,
        {
            accessToken,
            refreshToken
        },
        "Access Token Refreshed successfully"
    )
  )

})

const changeCurrentPassword =  asyncHandler( async (req, res) => {

  const { oldPassword, newPassword, confirmPassword } = req.body

  if(newPassword !== confirmPassword) {
    throw new ApiError(400, "Password and confirm password does not match")
  }

  const user = await User.findById(req.user?._id)

  const isPasswordCorrect = user.isPasswordCorrect(oldPassword)

  if(!isPasswordCorrect) {
    throw new ApiError(401, "Invalid Password")
   }

   user.password = newPassword;

   await user.save({validateBeforeSave: false})

   return res.status(200)
   .json(
    new ApiResponse(
        200,
        "Password changed successfully"
    )
   )
})

const getCurrentUser = asyncHandler( async (req, res) => {
    
    return res.status(200).json( 
        new ApiResponse (200,
            req.user,
     "current user fetched successfully")
    )

})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { email, fullName} = req.body

    if(!email && !fullName) {
         throw new ApiError(400, "please, provide at least one of them.")
    }

    const updateFileds = {};

    if(email) {
        updateFileds.email = email
    }

    if(fullName) {
        updateFileds.fullName = fullName
    }

    const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
        $set: updateFileds
    }, {
     new: true
    }
).select("-password")

  return res.status(200)
  .json(
    new ApiResponse( 200, user, "The fileds were updated")
  )


})

const updateUserAvatar = asyncHandler(async (req, res) => {

    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath) {
        throw new ApiError(400, "The updated file  couldn't find")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url) {
        throw new ApiError (500,"The file couldn't update on the cloudinary")
    }
    
    const user = await User.findById(req.user?._id)
    
    if(user.avatar) {
        await deleteFromCloudinary(user.avatarPublicId)
    }
 
    const userUpdated = await User.findByIdAndUpdate(req.user?._id, {
        $set:{
            avatar: avatar.url,
            avatarPublicId: avatar.public_id
        }
    },{
        new: true
    }
).select("-password")

  return res.status(200).json(
   new ApiResponse (200, userUpdated, "The avatar update successfully")
  )
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400, "The coverImageLocalPath couldn't find!!")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(500, "coverImage update is failed")
    }
    const user = await User.findById(req.user?._id)
    
    if(user.coverImage) {
        await deleteFromCloudinary(user.coverImagePublicId)
    }

    const userUpdated = await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            coverImage: coverImage.url,
            coverImagePublicId: coverImage.public_id
        }
    }, {
        new: true
    }
)

return res.status(200).json(
    new ApiResponse (200, userUpdated, "the coverImage update successfully")
)
})

const getUserChannelProfile = asyncHandler(async (req, res) => {

    const { userName } = req.params;

    if (!userName?.trim()) {
        throw new ApiError(400, "userName is invalid");
    }

    const channel = await User.aggregate([
        {
            $match: {
                userName: userName.toLowerCase()
            }
        },

        // Get subscribers
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },

        // Get channels this user subscribed to
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },

        // Get videos created by this user
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videos"
            }
        },

        // // Get tweets created by this user
        // {
        //     $lookup: {
        //         from: "tweets",
        //         localField: "_id",
        //         foreignField: "owner",
        //         as: "tweets"
        //     }
        // },

        // Calculate subscription information
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },

                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },

                isSubscribed: {
                    $cond: {
                        if: {
                            $in: [
                                req.user?._id,
                                "$subscribers.subscriber"
                            ]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },

        // Select what you want to return
        {
            $project: {
                fullName: 1,
                userName: 1,
                avatar: 1,
                coverImage: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,

                // Channel's videos
                videos: 1,

                // Channel's tweets
                tweets: 1
            }
        }
    ]);

    if (!channel?.length) {
        throw new ApiError(404, "channel doesn't exist");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            channel,
            "user channel fetched successfully!"
        )
    );
});

const getWatchHistory = asyncHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            // req.user._id,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})

const addToWatchHistory = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const user = await User.findById(req.user._id);

    user.watchHistory.push(videoId);

    await user.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            user.watchHistory,
            "Video added to watch history successfully"
        )
    );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
    addToWatchHistory
}