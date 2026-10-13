import React,{useState, useEffect, useRef} from "react";
import { VideoCard} from "../components";
import {useGetAllVideosQuery} from "../services/videoApi"
import { Loader } from "../components";
import { useSearchParams } from "react-router-dom";

export default function Home(){
     const [page,setPage] = useState(1);
     const [videos, setVideos] = useState([]);
     const [searchParams] = useSearchParams();

    const query = searchParams.get("query") || "";
    const observerTarget = useRef(null);
    const {data, isLoading, error} = useGetAllVideosQuery({page, query})
    
    const allVideos = data?.data || []
    useEffect(() => {
        if (allVideos) {
            setVideos((prev) => [
            ...prev,
            ...allVideos,
        ]);
        }
    }, [data, query]);
    console.log("The query is :", query)

    useEffect(() => {

    const observer = new IntersectionObserver((entries) => {

        if (entries[0].isIntersecting) {
            setPage((prev) => prev + 1);
        }

    });

    if (observerTarget.current) {
        observer.observe(observerTarget.current);
    }

    return () => {
        observer.disconnect();
    };

}, []);
 
    if(isLoading){
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <Loader
                    height={80}
                    width={80}
                    color={"#a855f7"}
                    animationDuration={1}
                />
            </div>
        );
    }

    if(error){
        return (
            <div className="flex min-h-[50vh] items-center justify-center p-4">
                <p className="text-red-400 text-sm sm:text-base">Failed to load videos.</p>
            </div>
        );
    }
     
    return(
        <section className="w-full px-3 py-4 sm:px-6 sm:py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {videos.map((video) => (
                    <VideoCard
                        key={video._id}
                        video={video}
                    />
                ))}
            </div>
             
            <div ref={observerTarget}></div>
        </section>
    )
}
