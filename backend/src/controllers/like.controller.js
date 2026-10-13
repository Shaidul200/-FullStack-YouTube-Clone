import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { Like } from "../models/like.model.js"
import mongoose,{isValidObjectId} from "mongoose"
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.model.js"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"

const toggleVideoLike = asyncHandler(async(req,res)=>{
    const {videoId} = req.params
    if(!videoId){
        throw new ApiError(400, "videoId couldn't get")
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, "No video Found")
    }
    const alreadyLiked = await Like.findOne({
        video: videoId,
        likedBy: req.user?._id
    })
    if(alreadyLiked){
        await Like.findByIdAndDelete(alreadyLiked?._id)
        return res.status(200)
        .json(
            new ApiResponse(200, "unliked")
        )
    }
    if(!alreadyLiked){
        await Like.create({
            video:videoId,
            likedBy:req.user?._id
        })
        return res.status(200)
        .json(
            new ApiResponse(200, "Liked")
        )
    }
    
})

const toggleCommentLike = asyncHandler(async(req,res)=>{
    const {commentId} = req.params
    if(!commentId){
        throw new ApiError(400, "commentId couldn't find")
    }
    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment ID")
    }
    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404, "No comment found")
    }
    const alreadyLiked = await Like.findOne({
        comment:commentId,
        likedBy:req.user?._id
    })
    if(alreadyLiked){
        await Like.findByIdAndDelete(alreadyLiked?._id)
        return res.status(200).json(
            new ApiResponse(200,"unliked")
        )
    }
    if(!alreadyLiked){
        await Like.create({
            comment:commentId,
            likedBy:req.user?._id
        })
        return res.status(200).json(
            new ApiResponse(200,"liked")
        )
    }
})

const toggleTweetLike = asyncHandler(async(req,res)=>{
     
    const {tweetId} = req.params

    if(!tweetId){
        throw new ApiError(400, "tweetId couldn't find")
    }
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet ID")
    }
    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(404, "No tweet found")
    }
    const alreadyLiked = await Like.findOne({
        tweet:tweetId,
        likedBy:req.user?._id
    })
    if(alreadyLiked){
        await Like.findByIdAndDelete(alreadyLiked?._id)
        return res.status(200).json(
            new ApiResponse(200,"unliked")
        )
    }
    if(!alreadyLiked){
        await Like.create({
            tweet:tweetId,
            likedBy:req.user?._id
        })
        return res.status(200).json(
            new ApiResponse(200,"liked")
        )
    }
})

const getLikedVideos = asyncHandler(async (req, res) => {

    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(400, "No userId found")
    }

    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "likedBy",
                as: "likes",
                pipeline: [
                    {
                        $match: {
                            video: { $exists: true }
                        }
                    },
                    {
                        $lookup: {
                            from: "videos",
                            localField: "video",
                            foreignField: "_id",
                            as: "video"
                        }
                    },
                    {
                        $unwind: "$video"
                    }
                ]
            }
        },
        {
            $project: {
                _id: 0,
                likedVideos: "$likes.video"
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(
            200,
            "Liked videos fetched successfully",
            user
        )
    )
})


export{
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}