import mongoose,{isValidObjectId} from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import {Subscription} from "../models/subscription.model.js"
import {User} from "../models/user.model.js"

const toggleSubscription = asyncHandler(async(req, res) => { 
    const {channelId} = req.params;
    if(!channelId){
        throw new ApiError(400, "channelId is required")
    }
    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid channelId")
    }
    const channel = await User.findById(channelId)
    if (!channel) {
        throw new ApiError(404, "channel not found")
    }
    const alreadySubscribed = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    })
    if (alreadySubscribed) {
        await Subscription.findByIdAndDelete(alreadySubscribed._id)
        return res.status(200).json(new ApiResponse(200, "Unsubscribed successfully"))
    }
    await Subscription.create({
        subscriber: req.user._id,
        channel: channelId
    })
    return res.status(200).json(new ApiResponse(200, "Subscribed successfully"))

})

const getUserChannelSubscribers = asyncHandler (async(req, res) => {
    const {channelId} = req.params
    if(!channelId){
        throw new ApiError(400, "channalId is required")
    }
    if(!isValidObjectId(channelId))
    {
        throw new ApiError(400, "Invalid channalId")
    }
    const subscription = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        }, {
            $lookup:{
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline:[
                    {
                        $project:{
                            userName: 1,
                            avatar: 1,
                            subscriber: 1
                        }
                    }
                ]
            }
        }
    ])

    if(!subscription){
        throw new ApiError(404, "No subscription found")
    }
    return res.status(200).json(new ApiResponse(200, subscription, "Subscribers list fetched successfully"))
})

const getSubscribedChannels = asyncHandler(async(req, res) => {
    const subscriberId = req?.user?.id;
    console.log("SUBSCRIBER ID", subscriberId);
    if(!subscriberId){
        throw new ApiError(400, "subscriberId is required")
    }
    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400, "Invalid subscriberId")
    }
    const subscription = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        }, {
            $lookup:{
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel",
                pipeline:[
                    {
                        $project:{
                            userName: 1,
                            avatar: 1,
                            _id: 1
                        }
                    }
                ]
            }
        }
    ])

    if(!subscription){
        throw new ApiError(404, "No subscription found")
    }
    return res.status(200).json(new ApiResponse(200, subscription, "Subscribed channels list fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}