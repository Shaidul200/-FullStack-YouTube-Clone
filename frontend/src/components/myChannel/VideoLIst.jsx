import React from 'react'
import { Loader, VideoCard } from "./index"
import {useGetVideoByUser} from "../../services/videoApi"
import { useNavigate } from 'react-router-dom'

export default function VideoList() {
    const navigate = useNavigate()
    const { data: videos, isLoading } = useGetVideoByUser();
    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader width={60} height={60} color="#a855f7" animationDuration={1} />
            </div>
        );
    }

    const videoList = videos || [];

    return (
        <div className="w-full">
            <div className="flex justify-between items-center max-sm:flex-col max-sm:items-start max-sm:gap-3">
                <h1 className="text-xl sm:text-2xl font-bold">Videos ({videoList.length})</h1>
                <button
                    onClick={() => navigate("/user-dashboard")}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors max-sm:w-full text-center text-sm font-medium"
                >
                    Upload Video
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mt-6">
                {videoList.map((video) => (
                    <VideoCard key={video._id || video.id} video={video} />
                ))}
            </div>
        </div>
    );
}

