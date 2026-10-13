import asyncHandler from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"
import {Tweet} from "../models/tweet.model.js"
import ApiResponse from "../utils/ApiResponse.js"
import ApiError from "../utils/ApiError.js"
import mongoose, { isValidObjectId } from "mongoose"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body

    if(!content || content.trim() === ""){
        throw new ApiError(400,"Content is required")
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user?._id
    })
    if(!tweet){
        throw new ApiError(500,"Failed to create tweet")
    }

    return res.status(201).json(
        new ApiResponse(201, tweet, "Tweet created successfully")
    )

    
    
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params
    if(!userId){
        throw new ApiError (400, "User ID is required")
    }
    if(!isValidObjectId(userId)){
        throw new ApiError (400, "Invalid User ID")
    }
    const tweet =  await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(userId)
            }
            
        }, {
            $project:{
                avatar: 1,
                name: 1,
                userName: 1
            }
        },
        {
            $lookup:{
                from: "tweets",
                localField: "_id",
                foreignField: "owner",
                as: "tweets"
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200, tweet, "User tweets fetched successfully")
    )
    
})

const updateTweets = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const {content} = req.body

    if(!tweetId){
        throw new ApiError(400, "Please provide a tweetId")
    }
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweetId")
    }
    if(!content || content.trim() === ""){
        throw new ApiError(400, "Content is required")
    }
    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(404, "Tweet not found")
    }
    if(!tweet.owner.equals(req.user?._id)){
        throw new ApiError(401, "You are not authorized to update this tweet")
    }
    tweet.content = content
    await tweet.save()
    
     
    return res.status(200).json(
        new ApiResponse(200,tweet, "Tweet updated successfully")
    )
    
})

const deleteTweet = asyncHandler(async(req, res) => {
    const {tweetId} = req.params
    
    if(!tweetId){
        throw new ApiError(400, "Please provide a tweetId")
    }
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweetId")
    }
    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(404, "Tweet not found")
    }
    if(!tweet.owner.equals(req.user?._id)){
        throw new ApiError(401, "You are not authorized to delete this tweet")
    }
    const deletedTweet = await Tweet.findByIdAndDelete(tweetId)
    if(!deletedTweet){
        throw new ApiError(500, "Failed to delete tweet")
    }
    return res.status(200).json(
        new ApiResponse(200, "Tweet deleted successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweets,
    deleteTweet
}