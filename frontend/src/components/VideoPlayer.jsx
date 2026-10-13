import React from "react";


export default function VideoPlayer({ video }) {
    if (!video?.videoFile) return null;

    return (
        <div className="w-full overflow-hidden rounded-xl max-sm:rounded-none bg-black shadow-lg">
            <video
                src={video.videoFile}
                controls
                autoPlay
                className="w-full aspect-video object-contain"
            />
        </div>
    );
};