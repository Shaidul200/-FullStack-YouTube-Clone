import React from "react";
import { Link } from "react-router-dom";
import { MoreVertical } from "lucide-react";

function formatDuration(seconds) {
    if (!seconds || seconds < 0) {
        return "0:00";
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, "0")}:${String(
            remainingSeconds
        ).padStart(2, "0")}`;
    }

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function formatTimeAgo(dateString) {
    if (!dateString) return "";
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

export default function SmallVideoCard({ video }) {
    return (
        <Link to={`/watch/${video._id}`} className="block">
            <article
                className="
                    group
                    flex
                    w-full
                    flex-row
                    items-start
                    gap-3
                    rounded-xl
                    p-2
                    transition-colors
                    duration-200
                    hover:bg-white/5
                "
            >

                {/* Thumbnail */}
                <div
                    className="
                        relative
                        w-40
                        shrink-0
                        overflow-hidden
                        rounded-lg
                        bg-neutral-900
                        sm:w-48
                    "
                >
                    <div className="aspect-video">
                        <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="
                                h-full
                                w-full
                                object-cover
                                transition-transform
                                duration-300
                                group-hover:scale-105
                            "
                        />
                    </div>

                    {/* Duration */}
                    <span
                        className="
                            absolute
                            bottom-1.5
                            right-1.5
                            rounded
                            bg-black/80
                            px-1.5
                            py-0.5
                            text-xs
                            font-medium
                            text-white
                        "
                    >
                        {formatDuration(video.duration)}
                    </span>
                </div>


                {/* Video Information */}
                <div
                    className="
                        flex
                        min-w-0
                        flex-1
                        flex-col
                        justify-between
                        self-stretch
                        py-0.5
                    "
                >

                    {/* Title + Menu */}
                    <div className="flex items-start justify-between gap-2">

                        <h4
                            className="
                                line-clamp-2
                                text-sm
                                font-semibold
                                leading-snug
                                text-white/90
                                transition-colors
                                group-hover:text-white
                            "
                        >
                            {video.title}
                        </h4>

                        {/* Optional menu */}
                        <button
                            type="button"
                            onClick={(e) => e.preventDefault()}
                            className="
                                shrink-0
                                rounded-full
                                p-1
                                text-neutral-400
                                opacity-0
                                transition
                                group-hover:opacity-100
                                hover:bg-white/10
                                hover:text-white
                            "
                        >
                            <MoreVertical size={18} />
                        </button>

                    </div>


                    {/* Channel */}
                    <p
                        className="
                            mt-1
                            flex
                            items-center
                            gap-1
                            text-xs
                            text-neutral-400
                        "
                    >
                        {video.owner?.fullName}
                    </p>


                    {/* Metadata */}
                    <p
                        className="
                            mt-1
                            flex
                            items-center
                            gap-1
                            text-xs
                            text-neutral-400
                        "
                    >
                        {video.views} views
                        <span>•</span>
                        {formatTimeAgo(video.createdAt)}
                    </p>

                </div>

            </article>
        </Link>
    );
}


 