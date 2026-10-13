import api from "./api"

export const playlistApi = api.injectEndpoints({
    endpoints: (builder) => ({
        createPlaylist: builder.mutation({
            query: (body) => ({
                url: "/playlist/",
                method: "POST",
                body
            }),
            invalidatesTags: ["Playlist"]
        }),

        getPlaylistById: builder.query({
            query: (playlistId) => `/playlist/${playlistId}`,
            providesTags: ["Playlist"]
        }),

        getUserPlaylists: builder.query({
            query: (userId) => `/playlist/user/${userId}`,
            providesTags: ["Playlist"]
        }),

        addVideoToPlaylist: builder.mutation({
            query: ({ playlistId, videoId }) => ({
                url: `/playlist/add/${videoId}/${playlistId}`,
                method: "PATCH"
            }),
            invalidatesTags: ["Playlist"]
        }),

        removeVideoFromPlaylist: builder.mutation({
            query: ({ playlistId, videoId }) => ({
                url: `/playlist/remove/${videoId}/${playlistId}`,
                method: "PATCH"
            }),
            invalidatesTags: ["Playlist"]
        }),

        deletePlaylist: builder.mutation({
            query: (playlistId) => ({
                url: `/playlist/${playlistId}`,
                method: "DELETE"
            }),
            invalidatesTags: ["Playlist"]
        }),

        updatePlaylist: builder.mutation({
            query: ({ playlistId, name, description }) => ({
                url: `/playlist/${playlistId}`,
                method: "PATCH",
                body: { name, description }
            }),
            invalidatesTags: ["Playlist"]
        })
    })
})

export const { 
    useCreatePlaylistMutation, 
    useGetUserPlaylistsQuery, 
    useGetPlaylistByIdQuery,
    useAddVideoToPlaylistMutation,
    useRemoveVideoFromPlaylistMutation,
    useDeletePlaylistMutation,
    useUpdatePlaylistMutation
} = playlistApi
