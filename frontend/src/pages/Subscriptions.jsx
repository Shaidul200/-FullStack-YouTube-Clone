import React from "react";
import { useGetSubscribedChannelsQuery } from "../services/subscriptionApi";
import { Loader } from "../components";
import { Link } from "react-router-dom";



export default function Subscriptions() {
    const {data, isLoading} = useGetSubscribedChannelsQuery();
     
    const subscriptions = data?.data || [];
    console.log("the subscriptions data is", subscriptions)

    if(isLoading) return <Loader
        height={"100"}
        width={"100"}
        color={"#FFFFFF"}
        animationDuration={"0.5"}
    />;

    return (
    <main className="min-h-screen w-full bg-black px-4 py-6 text-white sm:px-6 lg:px-8">

        <div className="mb-6">
            <h1 className="text-2xl font-bold sm:text-3xl">
                Subscriptions
            </h1>

            <p className="mt-1 text-sm text-gray-400">
                Channels you are subscribed to
            </p>
        </div>


         
        {subscriptions.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {subscriptions.map((subscription) => (
                    <Link
                        key={subscription?.channel?.[0]?._id || subscription._id}
                        to={`/channel/${subscription?.channel?.[0]?.userName}`}
                        className="
                            flex
                            cursor-pointer
                            items-center
                            gap-4
                            rounded-xl
                            border
                            border-neutral-800
                            bg-neutral-950
                            p-4
                            transition
                            hover:bg-neutral-900
                        "
                    >
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full">
                            <img
                                src={subscription?.channel?.[0]?.avatar}
                                alt={subscription?.channel?.[0]?.userName}
                                className="h-full w-full object-cover"
                            />
                        </div>

                        <div className="min-w-0">
                            <h2 className="truncate text-sm font-semibold text-white sm:text-base">
                                {subscription?.channel?.[0]?.fullName}
                            </h2>

                            <p className="mt-1 truncate text-xs text-gray-400 sm:text-sm">
                                @{subscription?.channel?.[0]?.userName}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        ) : (
            <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/60 p-8 text-center">
                <p className="text-base font-medium text-gray-300">
                    You haven't subscribed to any channels yet.
                </p>
                <p className="mt-1 text-sm text-gray-500">
                    Subscribe to channels to see them here.
                </p>
                <Link
                    to="/home"
                    className="mt-5 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-500"
                >
                    Explore Channels
                </Link>
            </div>
        )}
    </main>
);
}