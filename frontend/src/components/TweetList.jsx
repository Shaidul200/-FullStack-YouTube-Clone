
import { Heart } from "lucide-react";
import { useGetUserTweetsQuery } from "../services/tweetApi";
import { Loader } from "./index.js";
import {useToggleLikedTweetMutation} from "../services/likeApi"
import { useState } from "react";

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

export default function TweetList({ userId }) {

    const { data: tweets, isLoading } = useGetUserTweetsQuery(userId);
    const [toggleLikedTweet] = useToggleLikedTweetMutation()
    const [isLiked, setIsLiked] = useState(false);

    if (isLoading) return <Loader
        width={100}
        height={100}
        color="white"
        animationDuration={1}
    />

     
    const tweetsData = tweets?.data
    const tweetsContent = tweetsData?.[0]?.tweets
    
     

    const handleLike = async (tweetId) => {
    try {
        const res = await toggleLikedTweet(tweetId).unwrap();
        setIsLiked((prev) => !prev);

        console.log("Like request succeeded");
        console.log("response:", res);
    } catch (error) {
        console.log("Like request failed:", error);
    }
};
if (tweetsContent.length === 0 ) {
    console.log("no tweets")
        return (
            <div className="flex w-full items-center justify-center">
                <p className="text-white-400">No tweets yet.</p>
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col gap-4">

            {tweetsData.map((tweet) => (
                <article
                    key={tweet._id}
                    className="rounded-xl border border-gray-800 bg-gray-950 p-4"
                >

                     
                    <div className="flex items-center gap-3">

                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-800">
                            <img
                                src={tweetsData?.[0]?.avatar}
                                alt={tweetsData?.[0]?.userName}
                                className="h-full w-full object-cover"
                            />
                        </div>

                       <div className="flex items-center gap-2">
    <p className="text-sm font-semibold text-white">
        @{tweetsData?.[0]?.userName}
    </p>

    <span className="text-xs text-white-400">
        {formatTimeAgo(tweetsContent?.[0]?.updatedAt)}
    </span>
</div>

                    </div>
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-200 sm:text-base">
                        {tweetsContent?.[0]?.content}
                    </p>
 
                    <div className="mt-4 border-t border-gray-800 pt-3">

                       <button
    type="button"
    onClick={() => handleLike(tweetsContent?.[0]?._id)}
    className={`flex items-center gap-2 transition ${
        isLiked
            ? "text-red-500"
            : "text-gray-400 hover:text-red-500"
    }`}
>
    <Heart
        size={19}
        strokeWidth={1.8}
        fill={isLiked ? "currentColor" : "none"}
    />

    <span className="text-sm">
        {isLiked ? "Liked" : "Like"}
    </span>
</button>
                    </div>

                </article>
            ))}

        </div>
    );
}