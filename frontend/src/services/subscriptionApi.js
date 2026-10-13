import api from "./api";

export const subscriptionApi = api.injectEndpoints({
    endpoints: (builder) => ({
        toggleSubscription: builder.mutation({
            query: (channelId) => ({
                url: `/subscription/c/${channelId}`,
                method: "POST",
            }),
            invalidatesTags: ["Subscriptions"]
        }),

        getSubscribedChannels: builder.query({
            query: () => ({
                url: "/subscription/u/",
                method: "GET",
            }),
            providesTags: ["Subscriptions"]
        })
    })
})

export const { useToggleSubscriptionMutation, useGetSubscribedChannelsQuery } = subscriptionApi
