import api from "./api"

export const tweetApi = api.injectEndpoints({
    endpoints: (builder) => ({

        createTweet: builder.mutation({
            query: (content) => ({
                url: 'tweet/',
                method: 'POST',
                body: {content}
            }),
            invalidatesTags: ["Tweet"]
        }),

        getUserTweets: builder.query({
            query: (userId) => ({
                url: `/tweet/user/${userId}`,
                method: 'GET'
            }),
            providesTags: ["Tweet"]
        }),

        deleteTweet: builder.mutation({
            query: (tweetId) => ({
                url: `/tweet/${tweetId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ["Tweet"]
        }),

        updateTweet: builder.mutation({
            query: ({ tweetId, content }) => ({
                url: `/tweet/${tweetId}`,
                method: 'PATCH',
                body: { content }
            }),
            invalidatesTags: ["Tweet"]
        }),

    })

})

export const {
    useCreateTweetMutation,
    useGetUserTweetsQuery,
    useDeleteTweetMutation,
    useUpdateTweetMutation

} = tweetApi