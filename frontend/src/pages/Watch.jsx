import React, {useEffect, useState, useRef} from "react";
import {useParams} from "react-router-dom"
import {useGetVideoByIdQuery, useGetAllVideosQuery} from "../services/videoApi";
import {Loader, VideoPlayer, VideoDetails, RecommendedVideos,Comments} from '../components'
import {useAddToWatchHistoryMutation} from "../services/userApi"

export default function Watch() {

    const {videoId} = useParams();

    const {data, isLoading, error} = useGetVideoByIdQuery(videoId);

    const [addToWatchHistory] = useAddToWatchHistoryMutation(videoId);

    const [page, setPage] = useState(1);
    const [allVideos, setAllVideos] = useState([]);

    const observerTarget = useRef(null);

    useEffect(() => {
        if (videoId) {
            addToWatchHistory(videoId);
        }
    }, [videoId, addToWatchHistory]);


    const {
        data: allVideosData,
        isLoading: videoLoading
    } = useGetAllVideosQuery({page});


    useEffect(() => {

        const newVideos = allVideosData?.data || [];
        console.log("The video data is", newVideos)

        if (newVideos.length > 0) {
            setAllVideos((prev) => [
                ...prev,
                ...newVideos
            ]);
        }

    }, [allVideosData]);

    useEffect(() => {

        const observer = new IntersectionObserver((entries) => {

            if (entries[0].isIntersecting) {
                setPage((prev) => prev + 1);
                console.log('was each')
            }

        });

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            observer.disconnect();
        };

    }, []);


    if (isLoading) {
        return (
            <div className="flex h-[75vh] items-center justify-center">
                <Loader
                    width="80px"
                    height="80px"
                    color="#a87ffb"
                    animationDuration="1"
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center p-4">
                <p className="text-red-400 text-sm sm:text-base">Error loading video.</p>
            </div>
        );
    }

    const recommendedVideos = allVideos.filter(
        (v) => v._id !== videoId
    );

    const video = data?.data?.video;
    const isSubscribed = data?.data?.isSubscribed;

    return (
        <>
            <div className="flex w-full flex-col lg:flex-row gap-6 p-3 sm:p-5 lg:p-6 max-w-[1800px] mx-auto">
                <section className="min-w-0 flex-1 w-full">
                    <VideoPlayer video={video} />

                    <VideoDetails
                        video={video}
                        isSubscribed={isSubscribed}
                        videoId={videoId}
                    />

                    <Comments videoId={videoId} />
                </section>

                <aside className="w-full lg:w-80 xl:w-96 shrink-0">
                    <h3 className="mb-3 text-base sm:text-lg font-semibold text-white">Recommended</h3>
                    <RecommendedVideos
                        recommendedVideos={recommendedVideos}
                    />
                </aside>
            </div>
            <div ref={observerTarget}></div>
        </>
    );
};