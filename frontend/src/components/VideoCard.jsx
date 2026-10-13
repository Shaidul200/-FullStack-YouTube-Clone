import { Link } from "react-router-dom";

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

export default function VideoCard({ video }) {
    return (
        <Link to={`/watch/${video._id}`}>
            <article className="w-full cursor-pointer">

                <div className="relative aspect-video overflow-hidden rounded-xl">
                    <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="h-full w-full object-cover"
                    />

                    <span className="absolute bottom-2 right-2 rounded bg-black px-1.5 py-0.5 text-xs font-medium text-white">
                        {formatDuration(video.duration)}
                    </span>
                </div>


                <div className="mt-3 flex gap-3 max-sm:mt-2 max-sm:gap-2.5">

                    <img
                        src={video.owner?.avatar}
                        alt={video.owner?.userName}
                        className="h-9 w-9 shrink-0 rounded-full object-cover max-sm:h-8 max-sm:w-8"
                    />

                    <div className="min-w-0">

                        <h4 className="line-clamp-2 font-medium text-white/85 max-sm:text-sm">
                            {video.title}
                        </h4>

                        <p className="mt-1 text-sm text-gray-400 max-sm:mt-0.5 max-sm:text-xs">
                            {video.owner?.fullName}
                        </p>
                        <p className="text-sm text-gray-400 max-sm:text-xs">
                            {video.views} views •{" "}
                            {formatTimeAgo(video.createdAt)}
                        </p>

                    </div>
                </div>

            </article>
        </Link>
    );
}