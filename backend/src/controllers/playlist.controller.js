import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import mongoose,{isValidObjectId} from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {

    const {name, description} = req.body

    if(!name) {
        throw new ApiError(400, "Name is required")
    }

    const playlist = await Playlist.create({
        name,
        description: description || "",
        owner: req.user?._id
    })

    if(!playlist){
        throw new ApiError(500, "Failed to create playlist")
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            playlist,
            "Playlist created successfully"
        )
    )
    
})

const getUserPlaylist = asyncHandler(async (req, res) => {

    const {userId} = req.params

    if(!userId){
        throw new ApiError(400, "User id is required")
    }
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user id")
    }
    const playlist = await Playlist.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(userId)
            }
        }, {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            }
        }

    ])

    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            playlist,
            "Playlist fetched successfully"
        )
    )
    
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    if(!playlistId){
        throw new ApiError(400, "playlist id is required")
    }
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id")
    }

    const playlist = await Playlist.findById(playlistId)
        .populate({
            path: "videos",
            populate: {
                path: "owner",
                select: "fullName userName avatar"
            }
        })
        .populate("owner", "fullName userName avatar");

    if(!playlist){
        throw new ApiError(404, "playlist not found")
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            playlist,
            "Playlist fetched successfully"
        )
    )

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!playlistId || !videoId){
        throw new ApiError(400, "playlistId and videoId are required")
    }

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid playlistId or videoId")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(400, "playlist not find")
    }
    if (!playlist.owner.equals(req.user?._id)) {
    throw new ApiError(403, "You are not authorized to add video to this playlist")
}
    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "video not find")
    }

    const isVideoAlreadyAdded = playlist.videos.some((video) =>
        video.equals(videoId)
    )
    
    if(isVideoAlreadyAdded) {
        throw new ApiError(400, "video is already added to the playlist")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push:{
                videos: videoId
            }
        },{
            new: true
        }
    )
    if(!updatedPlaylist){
        throw new ApiError(500, "Failed to add video to playlist")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "Video added to playlist successfully"
        )
    )


    
})

const removeVideoFromPlaylist = asyncHandler(async(req, res) => {
    const { playlistId, videoId } = req.params

    if(!playlistId || !videoId) {
        throw new ApiError(400, "playlistId and videoId are required")
    }
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid playlistId or videoId")
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new
         ApiError(400, "playlist not find")
    }
    if(!playlist.owner.equals(req.user._id)){
        throw new ApiError(403, "you are not authorized to remove video from this playlist")
    }
    const video = await Video.findById(videoId)
    
    if(!video){
        throw new ApiError(404, "video not find")
    }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull:{
                videos: videoId
            }
        },
        {
            new: true
        }
    )
    if(!updatedPlaylist){
        throw new ApiError(500, "Failed to remove video from playlist")
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "Video removed from playlist successfully"
        )
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!playlistId){
        throw new ApiError(400, "playlistId not find")
    }
    if(!isValidObjectId(playlistId)) {
        throw new ApiError(400, "invalid playlistId")
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404, "playlist not find")
    }
    if(!playlist.owner.equals(req.user._id)){
        throw new ApiError(403, "you are not authorized to delete this playlist")
    }
    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)
    if(!deletedPlaylist){
        throw new ApiError(500, "Failed to delete playlist")
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Playlist deleted successfully"
        )
    )
})

const updatePlaylist = asyncHandler(async(req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body

    if(!playlistId){
        throw new ApiError(400, "playlistId not find")
    }
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlistId")
    }
    if(!name && !description){
        throw new ApiError(400, "Atleast name or description is required")
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404, "playlist not find")
    }
    if(!playlist.owner.equals(req.user._id)){
        throw new ApiError(403, "you are not authorized to update this playlist")
    }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set:{
                name: name ?? playlist.name,
                description: description ?? playlist.description
            }
        },
        {
            new: true
        }
    )
    if(!updatedPlaylist){
        throw new ApiError(500, "Failed to update playlist")
    }
    return res.status(200).json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "Playlist updated successfully"
        )
    )
})

export {
    createPlaylist,
    getUserPlaylist,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}