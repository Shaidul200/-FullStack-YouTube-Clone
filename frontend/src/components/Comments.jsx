import {
    useGetCommentQuery,
    useAddCommentMutation,
} from "../services/commentApi";

import { useState } from "react";
import { Loader } from ".";

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


export default function Comments({ videoId }) {
    const {
        data,
        isLoading,
        error,
    } = useGetCommentQuery({videoId});

    const [
        addComment,
        { isLoading: isAddingComment },
    ] = useAddCommentMutation();

    const [commentText, setCommentText] = useState("");

     
    const comments = data?.data || [];

    const handleCommentSubmit = async () => {
        if (!commentText.trim()) return;

        try {
            await addComment({
                videoId,
                content: commentText,
            }).unwrap();

            setCommentText("");
        } catch (err) {
            console.error("Failed to add comment:", err);
        }
    };


    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <Loader
                    width="50px"
                    height="50px"
                    color="#ffffff"
                />
            </div>
        );
    }


    if (error) {
        return (
            <div className="py-6 text-red-400">
                Failed to load comments.
            </div>
        );
    }


    return (
        <section className="w-full bg-neutral-900 py-6 text-white max-sm:py-4 max-sm:px-2">

            {/* ───────────────── Comments header ───────────────── */}

            <div className="mb-6">

                <h2 className="text-xl font-semibold text-white max-sm:text-lg">
                    Comments
                    <span className="ml-2 text-sm font-normal text-neutral-400">
                        {comments.length}
                    </span>
                </h2>

            </div>


            {/* ───────────────── Add comment ───────────────── */}

            <div className="mb-8 flex w-full gap-3 max-sm:gap-2 max-sm:mb-5">

                <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="
                        min-w-0
                        flex-1
                        rounded-full
                        border
                        border-neutral-700
                        bg-neutral-800
                        px-5
                        py-3
                        text-white
                        placeholder:text-neutral-500
                        outline-none
                        transition
                        focus:border-neutral-500
                        max-sm:px-3.5
                        max-sm:py-2
                        max-sm:text-sm
                    "
                />

                <button
                    type="button"
                    onClick={handleCommentSubmit}
                    disabled={
                        isAddingComment ||
                        !commentText.trim()
                    }
                    className="
                        shrink-0
                        rounded-full
                        bg-[#a87ffb]
                        px-6
                        py-3
                        font-semibold
                        text-black
                        transition
                        hover:bg-[#b592fc]
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                        max-sm:px-4
                        max-sm:py-2
                        max-sm:text-sm
                    "
                >
                    {isAddingComment ? "Posting..." : "Comment"}
                </button>

            </div>


            {/* ───────────────── Existing comments ───────────────── */}

            <div className="flex flex-col gap-6">

                {comments.map((comment) => {

                    /*
                     * ownerDetails is an array because
                     * your backend probably uses MongoDB $lookup.
                     *
                     * We only need the first owner.
                     */
                    const owner = comment.ownerDetails?.[0];


                    return (
                        <article
                            key={comment._id}
                            className="
                                flex
                                gap-4
                                border-b
                                border-neutral-800
                                pb-6
                                max-sm:gap-3
                                max-sm:pb-4
                            "
                        >

                            {/* Avatar */}

                            <img
                                src={owner?.avatar}
                                alt={owner?.userName || "User"}
                                className="
                                    h-10
                                    w-10
                                    shrink-0
                                    rounded-full
                                    object-cover
                                    max-sm:h-8
                                    max-sm:w-8
                                "
                            />


                            {/* Comment content */}

                            <div className="min-w-0 flex-1">

                                {/* User information */}

                                <div className="flex items-center gap-2">

                                    <p className="font-semibold text-white max-sm:text-sm">
                                        {owner?.fullName}
                                    </p>

                                    <p className="text-sm text-neutral-400 max-sm:text-xs">
                                        @{owner?.userName}
                                    </p>

                                </div>


                                {/* Time */}

                                <p className="mt-1 text-xs text-neutral-500">
                                    {formatTimeAgo(comment.createdAt)}
                                </p>


                                {/* Comment */}

                                <p className="mt-3 break-words text-sm leading-6 text-neutral-200 max-sm:mt-2 max-sm:text-xs">
                                    {comment.content}
                                </p>

                            </div>

                        </article>
                    );
                })}

            </div>


            {/* ───────────────── No comments ───────────────── */}

            {comments.length === 0 && (
                <p className="py-8 text-center text-neutral-500">
                    No comments yet. Be the first to comment.
                </p>
            )}

        </section>
    );
}