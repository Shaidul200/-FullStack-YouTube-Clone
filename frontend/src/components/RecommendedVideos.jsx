import React from "react";
import VideoCard from "./VideoCard";


export default function RecommendedVideos({ recommendedVideos }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {recommendedVideos.map((video) => (
                <VideoCard
                    key={video._id}
                    video={video}
                />
            ))}
        </div>
    );
}