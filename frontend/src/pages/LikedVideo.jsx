import { VideoCard, Loader } from "../components";
import { useGetLikedVideosQuery } from "../services/likeApi";

export default function LikedVideo() {
    
    const {
        data,
        isLoading,
        error,
    } = useGetLikedVideosQuery();
    console.log("The row data ",data)

    if (isLoading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center bg-black">
                <Loader
                    width="80"
                    height="80"
                    color="#a855f7"
                    animationDuration="1"
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black">
                <p className="text-red-400">
                    Error fetching liked videos
                </p>
            </div>
        );
    }

    const likedVideos = data?.message || [];
    const videos = likedVideos[0]?.likedVideos || [];
    console.log("The liked videos",likedVideos)
    console.log("The videos",videos)


    return (
        <main className="min-h-screen bg-black px-6 py-8 text-white max-sm:px-3 max-sm:py-4">

            <div className="mb-8 max-sm:mb-4">
                <h1 className="text-3xl font-bold max-sm:text-2xl">
                    Liked Videos
                </h1>

                <p className="mt-2 text-sm text-gray-400 max-sm:text-xs">
                    Videos you have liked
                </p>
            </div>

            {likedVideos.length === 0 && (
                <div className="
                    flex
                    min-h-[300px]
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-neutral-800
                    bg-neutral-950
                ">
                    <div className="text-center">

                        <h2 className="text-xl font-semibold text-white">
                            No liked videos
                        </h2>

                        <p className="mt-2 text-gray-500">
                            Videos you like will appear here.
                        </p>

                    </div>
                </div>
            )}

            {likedVideos.length > 0 && (
                <div className="
                    grid
                    grid-cols-1
                    gap-6
                    sm:grid-cols-2
                    lg:grid-cols-3
                    xl:grid-cols-4
                    max-sm:gap-4
                ">

                    {videos.map((video) => {
                        return (
                            <VideoCard
                                key={video._id}
                                video={video}
                            />
                        );
                    })}
                </div>
            )}

        </main>
    );
}