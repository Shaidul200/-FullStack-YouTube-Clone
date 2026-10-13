
import { useParams } from "react-router-dom"
import { useGetChannelByUserNameQuery } from "../services/userApi"
import { Loader } from "../components"
import { useState } from "react";
import { useToggleSubscriptionMutation } from "../services/subscriptionApi"
import {VideoCard, TweetList} from "../components"


export default function ChannelProfile() {
    
    const {userName} = useParams()
    
    const [activeTab, setActiveTab] = useState("videos")
    
    const {data, isLoading} = useGetChannelByUserNameQuery(userName)
    const [toggleSubscription] = useToggleSubscriptionMutation()

    const channel = data?.data || []
    const isSubscribed = channel?.[0]?.isSubscribed
    const [subscribed, setSubscribed] = useState(isSubscribed);
    const videos = channel?.[0]?.videos || []

    const handleToggleSubscription = async () => {
        try {
            await toggleSubscription(channel?.[0]?._id);
            setSubscribed((prev) => !prev);
        } catch (error) {
            console.error(error);
        }
    };


    
    
    if(isLoading){
        return <Loader 
        width="100"
        hight="100"
        color="white"
        animationDuration="1"
        />
    }
     
    return (
        <main className="min-h-screen w-full bg-black text-white">
 
            <section className="w-full">

                
                <div className="relative h-48 w-full overflow-hidden sm:h-56 md:h-64 lg:h-72">
                    <img
                        src={channel?.[0]?.coverImage}
                        alt="Channel cover"
                        className="h-full w-full object-cover"
                    />
                </div>


                
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">

                    <div className="relative flex flex-col gap-5 py-6 sm:flex-row sm:items-center">

                         
                        <div className="shrink-0">
                            <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-black bg-gray-900 sm:h-32 sm:w-32">
                                <img
                                    src={channel?.[0]?.avatar}
                                    alt="Channel avatar"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </div>


                         
                        <div className="min-w-0 flex-1">

                            <h1 className="truncate text-2xl font-bold sm:text-3xl">
                                {channel?.[0]?.fullName}
                            </h1>

                            <p className="mt-1 text-sm text-gray-400 sm:text-base">
                                @{channel?.[0]?.userName}
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-400">
                                <span>
                                    {channel?.[0]?.subscribersCount} subscribers
                                </span>
 
                            </div>

                        </div>

                        <div className="shrink-0">
                            <button
                                type="button"
                                onClick={handleToggleSubscription}
                                className="
                                    w-full
                                    rounded-full
                                    bg-purple-500
                                    px-6
                                    py-2.5
                                    text-sm
                                    font-semibold
                                    text-black
                                    transition
                                    hover:bg-purple-400
                                    sm:w-auto
                                "
                            >
                               {subscribed ? "Subscribed" : "Subscribe"}
                            </button>
                        </div>

                    </div>

                </div>

            </section>


            <div className="border-b border-gray-800">

                <nav className="mx-auto flex w-full max-w-7xl px-4 sm:px-6 lg:px-8">

    <button
        type="button"
        onClick={() => setActiveTab("videos")}
        className={`
            border-b-2
            px-5
            py-4
            text-sm
            font-semibold
            sm:text-base
            ${
                activeTab === "videos"
                    ? "border-white text-white"
                    : "border-transparent text-gray-400 hover:border-gray-500 hover:text-white"
            }
        `}
    >
        Videos
    </button>

    <button
        type="button"
        onClick={() => setActiveTab("tweets")}
        className={`
            border-b-2
            px-5
            py-4
            text-sm
            font-semibold
            sm:text-base
            ${
                activeTab === "tweets"
                    ? "border-white text-white"
                    : "border-transparent text-gray-400 hover:border-gray-500 hover:text-white"
            }
        `}
    >
        Tweets
    </button>

</nav>
            </div>


            <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {activeTab === "videos" ? (
                    videos && videos.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {videos.map((video) => (
                                <VideoCard
                                    key={video._id}
                                    video={video}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-950 p-8 text-center text-neutral-400">
                            <p className="text-base font-medium text-white">No videos yet</p>
                            <p className="mt-1 text-sm text-neutral-500">This channel has not posted any videos.</p>
                        </div>
                    )
                ) : (
                    <div className="mx-auto max-w-3xl">
                        <TweetList userId={channel?.[0]?._id} />
                    </div>
                )}
            </section>

        </main>
    );
}

 