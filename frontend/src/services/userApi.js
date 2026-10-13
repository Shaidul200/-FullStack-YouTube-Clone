import api from "./api"

const userApi = api.injectEndpoints({
    endpoints: (builder) => ({
        
        login: builder.mutation({
          query: (credentials) => ({
            url: '/users/login',
            method: 'POST',
            body: credentials,
          })
        }),

        register: builder.mutation({
            query: (formData) => ({
                url: "/users/register",
                method: "POST",
                body: formData,
            })
        }),

        getCurrentUser: builder.query({
            query: () => "/users/current-user",
            providesTags: ["User"]
        }),

        getChannelByUserName: builder.query({
            query: (userName) => `/users/c/${userName}`,
            providesTags: ["User"]
        }),

        logout: builder.mutation({
            query: () => ({
                url: "/users/logout",
                method: "POST"
            }),
            invalidatesTags: ["User"]
        }),

        watchHistory: builder.query({
            query: () => "/users/watch-history",
            providesTags: ["User"]
        }),

        addToWatchHistory: builder.mutation({
            query: (videoId) => ({
                url: `/users/watch-history/${videoId}`,
                method: "POST",
            }),
            invalidatesTags: ["User"]
        }),

        updateAvatar: builder.mutation({
            query: (avatar) => ({
                url: "/users/update-avatar",
                method: "PATCH",
                body: avatar,
            }),
            invalidatesTags: ["User"]
        }),

        updateCoverImage: builder.mutation({
            query: (coverImage) => ({
                url: "/users/update-coverImage",
                method: "PATCH",
                body: coverImage,
            }),
            invalidatesTags: ["User"]
        }),

        changePassword: builder.mutation({
            query: ({oldPassword, newPassword, confirmPassword}) => ({
                url: "/users/change-password",
                method: "PATCH",
                body: {oldPassword, newPassword, confirmPassword},
            }),
            invalidatesTags: ["User"]
        }),

        updateAccountDetails: builder.mutation({
            query: ({fullName, email}) => ({
                url: "/users/update-account",
                method: "PATCH",
                body: {fullName, email},
            }),
            invalidatesTags: ["User"]
        }),



    })
})

export const {
    useLoginMutation,
    useRegisterMutation,
    useGetCurrentUserQuery,
    useLogoutMutation,
    useWatchHistoryQuery,
    useAddToWatchHistoryMutation,
    useGetChannelByUserNameQuery,
    useUpdateAvatarMutation,
    useUpdateCoverImageMutation,
    useChangePasswordMutation,
    useUpdateAccountDetailsMutation
} = userApi

export default userApi.reducer