import asyncHandler from "../utils/asyncHandler.js"
import ApiResponse from "../utils/ApiResponse.js"
import ApiError from "../utils/ApiError.js"
import mongoose,{isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {uploadOnCloudinary, deleteFromCloudinary} from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {

    const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        query,
        sortType = "desc",
        userId
    } = req.query
    
    const pageNumber = Number(page)
    const limitNumber = Number(limit)

    if (
        !Number.isInteger(pageNumber) ||
        !Number.isInteger(limitNumber) ||
        pageNumber < 1 ||
        limitNumber < 1
    ) {
        throw new ApiError(
            400,
            "Invalid page and limit"
        )
    }

    const allowedSortFields = [
        "createdAt",
        "views"
    ]

    if (!allowedSortFields.includes(sortBy)) {
        throw new ApiError(
            400,
            "Invalid sort field"
        )
    }

    if (!["asc", "desc"].includes(sortType)) {
        throw new ApiError(
            400,
            "sortType must be asc or desc"
        )
    }

    const sortDirection = sortType === "asc" ? 1 : -1

    if (userId && !isValidObjectId(userId)) {
        throw new ApiError(
            400,
            "Invalid userId"
        )
    }

    const searchQuery = query?.trim()

    const matchStage = {}

    if (searchQuery) {
        matchStage.$or = [
            {
                title: {
                    $regex: searchQuery,
                    $options: "i"
                }
            },
            {
                description: {
                    $regex: searchQuery,
                    $options: "i"
                }
            }
        ]
    }

    if (userId) {
        matchStage.owner = new mongoose.Types.ObjectId(userId)
    }
    const videos = await Video.aggregate([

        {
            $match: matchStage
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            userName: 1,
                            avatar: 1,
                            fullName: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: {
                path: "$ownerDetails",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $sort: {
                [sortBy]: sortDirection
            }
        },

        {
            $skip: (pageNumber - 1) * limitNumber
        },

        {
            $limit: limitNumber
        },
        {
            $project: {
                title: 1,
                description: 1,
                thumbnail: 1,
                videoFile: 1,
                views: 1,
                duration: 1,
                createdAt: 1,
                owner: "$ownerDetails"
            }
        }

    ])

    return res.status(200).json(
        new ApiResponse(
            200,
            videos,
            "Videos fetched successfully"
        )
    )
})

const publishAVideo = asyncHandler(async(req, res) => {
    const {title, description} = req.body

    if([
        title,
        description
    ].some((value) => 
    value.trim() === ""
    )){
        throw new ApiError(400, "All fields are required")
    }
    const videoLocalPath = req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    if(!videoLocalPath || !thumbnailLocalPath){
        throw new ApiError(400, "Please upload video and thumbnail")
    }
    const videoFile = await uploadOnCloudinary(videoLocalPath)
    const thumbnailFile = await uploadOnCloudinary(thumbnailLocalPath)
    console.log(videoFile)

    if(!videoFile || !thumbnailFile){
        throw new ApiError(400, "Failed to upload video or thumbnail")
    }
    const video = await Video.create({
        title,
        description,
        videoFile : videoFile.url,
        videoPublicId: videoFile.public_id,
        thumbnail : thumbnailFile.url,
        thumbnailPublicId: thumbnailFile.public_id,
        owner: req.user?._id,
        duration : videoFile.duration,
        views: 0,
        isPublished: true
    })

    return res.status(200).json(
        new ApiResponse(
            200,
            video,
            "Video published successfully"
        )
    )

})

const getVideoById = asyncHandler(async (req, res) => {

    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "Video id is required");
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    // 1. Find video and increase views
    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $inc: {
                views: 1
            }
        },
        {
            new: true
        }
    );

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // 2. Get video creator information
    const videoCreator = await Video.aggregate([

        {
            $match: {
                _id: new mongoose.Types.ObjectId(video._id)
            }
        },

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
                            userName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },

        {
            $unwind: {
                path: "$owner",
                preserveNullAndEmptyArrays: true
            }
        },

        {
            $project: {
                title: 1,
                description: 1,
                videoFile: 1,
                thumbnail: 1,
                views: 1,
                duration: 1,
                createdAt: 1,
                owner: 1
            }
        }

    ]);

    // 3. Check whether current user subscribed to creator
    const isSubscribed = await Subscription.exists({
        subscriber: req.user._id,
        channel: video.owner
    });

    // 4. Send everything to frontend
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                video: videoCreator[0],
                isSubscribed: !!isSubscribed
            },
            "Video fetched successfully"
        )
    );
});

const deleteVideo = asyncHandler(async(req, res) => {
    const {videoId} = req.params
    if(!videoId){
        throw new ApiError(400, "videoId is required")
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, "Video not found")
    }
    if(!video.owner.equals(req.user._id)){
        throw new ApiError(403, "You are not authorized to delete this video")
    }
    
    const videoDelete = await deleteFromCloudinary(video.videoPublicId, "video")
    const thumbnailDelete = await deleteFromCloudinary(video.thumbnailPublicId, "image")
    if(!videoDelete || !thumbnailDelete){
        throw new ApiError(500, "failed to delete video from the cloudinary")
    }


    const deletedVideo = await Video.findByIdAndDelete(videoId)
    if(!deletedVideo){
        throw new ApiError(404, "failed to delete video from the database")
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            "Video deleted successfully"
        )
    )
    
    
})

const updateVideo = asyncHandler(async(req, res) => {
    const {videoId} = req.params
    const {title, description} = req.body
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, "Video not found")
    }
    if(!video.owner.equals(req.user?._id)){
        throw new ApiError(403, "You are not authorized to update this video")
    }
    if(title?.trim()){
        video.title = title.trim()
    }
    if(description?.trim()){
        video.description = description.trim()
    }
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    if(thumbnailLocalPath){
        const thumbnailFile = await uploadOnCloudinary(thumbnailLocalPath)
        if(!thumbnailFile){
            throw new ApiError(500, "failed to upload thumbnail")
        }
        const thumbnailDelete = await deleteFromCloudinary(video.thumbnailPublicId, "image")
        if(!thumbnailDelete){
            throw new ApiError(500, "failed to delete thumbnail from the cloudinary")
        }
        video.thumbnail = thumbnailFile.url
        video.thumbnailPublicId = thumbnailFile.public_id
    }
    await video.save()
    return res.status(200).json(
        new ApiResponse(
            200,
            video,
            "Video updated successfully"
        )
    )
    
    
})

const togglePublishStatus = asyncHandler(async(req, res) => {
    const {videoId} = req.params
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id")  
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, "video not found")
    }
    if(!video.owner.equals(req.user?._id)){
        throw new ApiError(403, "You are not authorized to toggle publish status")
    }
    video.isPublished = !video.isPublished
    await video.save()
    return res.status(200).json(
        new ApiResponse(
            200,
            video,
            "Video publish status toggled successfully"
        )
    )
    
    
})

export {
    publishAVideo, 
    getAllVideos, 
    getVideoById, 
    deleteVideo, 
    updateVideo, 
    togglePublishStatus
}