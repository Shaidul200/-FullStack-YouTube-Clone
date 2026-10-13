import api from "./api" 

export const likeApi = api.injectEndpoints({
    endpoints: (builder) => ({

        getLikedVideos: builder.query({
            query: () => `/like/videos`,
        }),
        
        toggleLikedVideo: builder.mutation({
            query: (videoId) => ({
                url: `/like/toggle/v/${videoId}`,
                method: 'POST'
            }),
            invalidatesTags: ["Like"]

        }),

        toggleLikedComment: builder.mutation({
            query: (commentId) => ({
                url: `/like/toggle/c/${commentId}`,
                method: 'POST'
            }) ,
            invalidatesTags: ["Like"]
        }),

        toggleLikedTweet: builder.mutation({
            query: (tweetId) => ({
                url: `/like/toggle/t/${tweetId}`,
                method: 'POST'
            }),
            invalidatesTags: ["Like"]
        })

    }),


});

export const {
    useGetLikedVideosQuery, 
    useToggleLikedVideoMutation, 
    useToggleLikedCommentMutation, 
    useToggleLikedTweetMutation 
} = likeApi;
