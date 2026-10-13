import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {Video} from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 20 } = req.query

    if (!videoId) {
        throw new ApiError(400, "Video id is required")
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const pageNumber = Number(page)
    const limitNumber = Number(limit)

    if (
        !Number.isInteger(pageNumber) ||
        !Number.isInteger(limitNumber) ||
        pageNumber < 1 ||
        limitNumber < 1
    ) {
        throw new ApiError(400, "Invalid page and limit")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    const comments = await Comment.aggregate([
        {
            $match:{
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline:[
                    {
                        $project:{
                            userName:1,
                            avatar:1,
                            fullName:1
                        }
                    }
                ]
            }
        },
        {
            $sort:{
                createdAt: -1
            }
        },
        {
            $skip: (pageNumber-1)*limitNumber
        },
        {
            $limit: limitNumber
        }
    ])

    return res.status(200).json(
        new ApiResponse(200, comments,"Comments fetched successfully")
    )

})

const addComment = asyncHandler(async(req, res) => {
    const { videoId } = req.params
    const { content } = req.body
    if(!videoId || !content?.trim()) {
        throw new ApiError(400,"Both video id and content is required")
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid videoId")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, "video doesn't exist")
    }
    const comment = await Comment.create({
        content,
        owner: req.user._id,
        video: videoId
    })
    if (!comment) {
        throw new ApiError(500, "Failed to add comment")
    }
    return res.status(201).json(
        new ApiResponse(201, comment, "Comment added successfully")
    )

})

const updateComment = asyncHandler(async(req, res) => {
    const {commentId} = req.params
    const {content} = req.body
    if(!commentId || !content?.trim()){
        throw new ApiError(400, "commentId and content is required")
    }
    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid commentId")
    }
    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404, "comment not found")
    }
    if(!comment.owner.equals(req.user?._id)){
        throw new ApiError(403, "You can't update this comment")
    }
    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {content}
        },
        {
            new:true
        }
    )
    if(!updatedComment){
        throw new ApiError(500, "Failed to update comment")
    }
    return res.status(200).json(
        new ApiResponse(200, updatedComment, "Comment updated successfully")
    )

})

const deleteComment = asyncHandler(async(req, res) => {
    const {commentId} = req.params
    if(!commentId){
        throw new ApiError(400, "commentId is required")
    }
    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid commentId")
    }
    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404, "The comment not found")
    }
    if(!comment.owner.equals(req.user?._id)){
        throw new ApiError(403, "You aren't authorized todelete this comment")
    }
    const deleteComment = await Comment.findByIdAndDelete(commentId)
    if(!deleteComment){
        throw new ApiError(500, "Failed to delete comment")
    }
    return res.status(200).json(
        new ApiResponse(200, "Comment deleted successfully")
    )

})

export{
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}