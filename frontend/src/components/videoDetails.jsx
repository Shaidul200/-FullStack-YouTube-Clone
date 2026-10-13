import React from "react";
import { ThumbsUp, ListPlus } from "lucide-react";
import { useToggleSubscriptionMutation } from "../services/subscriptionApi";
import { useEffect, useState } from "react";
import CreatePlaylist from "./CreatePlaylist";
import { useToggleLikedVideoMutation } from '../services/likeApi';

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();

    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) {
        return "just now";
    }

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
        return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 30) {
        return `${days} day${days === 1 ? "" : "s"} ago`;
    }

    const months = Math.floor(days / 30);

    if (months < 12) {
        return `${months} month${months === 1 ? "" : "s"} ago`;
    }

    const years = Math.floor(months / 12);

    return `${years} year${years === 1 ? "" : "s"} ago`;
}

export default function VideoDetails({ video, isSubscribed, videoId }) {
    const [toggleSubscription] = useToggleSubscriptionMutation();
    const [toggleLikedVideo] = useToggleLikedVideoMutation();

    const [subscribed, setSubscribed] = useState(isSubscribed);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    console.log(videoId,"video id")

    const toggleLike = async () => {
        try {
            await toggleLikedVideo(videoId);
            setIsLiked((prev) => !prev)
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };
     

    useEffect(() => {
        setSubscribed(isSubscribed);
    }, [isSubscribed]);

    const channelId = video.owner?._id;

    const handleToggleSubscription = async () => {
        try {
            await toggleSubscription(channelId);
            setSubscribed((prev) => !prev);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <section className="w-full border-b border-gray-700 py-4 max-sm:py-3">

            <div className="flex w-full items-start justify-between gap-4 max-sm:flex-col max-sm:gap-3">

                <div className="min-w-0 max-sm:w-full">
                    <h1 className="text-xl font-bold text-white max-sm:text-lg break-words">
                        {video.title}
                    </h1>

                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-400 max-sm:text-xs">
                        <span>{video.views} views</span>
                        <span>•</span>
                        <span>{formatTimeAgo(video.createdAt)}</span>
                    </div>
                </div>


                <div className="flex shrink-0 items-center gap-2 max-sm:w-full max-sm:justify-start">

                    <button
                        type="button"
                        onClick={toggleLike}
                        className={`
        flex items-center gap-2
        rounded-full
        border
        px-4 py-2
        transition
        max-sm:px-3
        max-sm:py-1.5
        max-sm:text-sm
        ${
            isLiked
                ? "border-purple-500 bg-purple-500/20 text-purple-400"
                : "border-gray-600 text-white hover:bg-gray-800"
        }
    `}
                    >
                        <ThumbsUp size={18} />
                        <span>Like</span>
                    </button>


                    <button
                        type="button"
                        onClick={() => setShowPlaylistModal(true)}
                        className="
                            flex items-center gap-2
                            rounded-full
                            border border-gray-600
                            px-4 py-2
                            text-white
                            hover:bg-gray-800
                            max-sm:px-3
                            max-sm:py-1.5
                            max-sm:text-sm
                        "
                    >
                        <ListPlus size={18} />
                        <span>Save</span>
                    </button>

                </div>

            </div>


            

            {showPlaylistModal && (
                <CreatePlaylist
                    open={showPlaylistModal}
                    onClose={() => setShowPlaylistModal(false)}
                    videoId={videoId}
                />
            )}


            <div className="mt-5 flex w-full items-center justify-between gap-4 max-sm:gap-2">

                <div className="flex min-w-0 items-center gap-3">

                    <img
                        src={video.owner?.avatar}
                        alt={video.owner?.fullName}
                        className="h-10 w-10 shrink-0 rounded-full object-cover max-sm:h-9 max-sm:w-9"
                    />

                    <div className="min-w-0">
                        <p className="truncate font-medium text-white max-sm:text-sm">
                            {video.owner?.fullName}
                        </p>

                        <p className="truncate text-sm text-gray-400 max-sm:text-xs">
                            @{video.owner?.userName}
                        </p>
                    </div>

                </div>


                <button
                    type="button"
                    onClick={handleToggleSubscription}
                    className="
                        shrink-0
                        rounded-full
                        bg-[#a87ffb]
                        px-5 py-2
                        font-semibold
                        text-black
                        transition
                        hover:bg-[#b592fc]
                        max-sm:px-4
                        max-sm:py-1.5
                        max-sm:text-sm
                    "
                >
                    {subscribed ? "Subscribed" : "Subscribe"}
                </button>

            </div>


            <div className="mt-4 border-b border-white/30" />


            <div className="mt-4">

                <p className="whitespace-pre-wrap text-sm leading-6 text-gray-300 break-words max-sm:text-xs">
                    {video.description}
                </p>

            </div>

        </section>
    );
}