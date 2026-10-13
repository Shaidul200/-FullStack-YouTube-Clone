import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"

const getChannelStats = asyncHandler(async (req, res) => {

    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(400, "UserId is required")
    }

    const videoStats = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $group: {
                _id: null,
                totalVideos: { $sum: 1 },
                totalViews: { $sum: "$views" },
                totalLikes: { $sum: { $size: "$likes" } }
            }
        }
    ])

    const subscriberStats = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $count: "totalSubscribers"
        }
    ])

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalVideos: videoStats[0]?.totalVideos || 0,
                totalViews: videoStats[0]?.totalViews || 0,
                totalLikes: videoStats[0]?.totalLikes || 0,
                totalSubscribers: subscriberStats[0]?.totalSubscribers || 0
            },
            "Channel stats fetched successfully"
        )
    )
})

const getChannelVideos = asyncHandler(async(req, res) => {
    const userId = req.user?._id
    if(!userId) {
        throw new ApiError(400, "User id is required")
    }
    const videos = await Video.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $sort:{
                createdAt:-1
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200,videos,"Channel videos fetched successfully")
    )
})

export {
    getChannelStats,
    getChannelVideos
}