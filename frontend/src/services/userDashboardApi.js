import api from "./api";


export const userDashboardApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getUserDashboardStats: builder.query({
            query: () => "/dashboard/stats",
            providesTags: ["Dashboard"]
        }),
        getUserChannelVideo: builder.query({
            query: () => "/dashboard/videos",
            providesTags: ["Dashboard"]
        }),

    }),
})

export const { useGetUserDashboardStatsQuery, useGetUserChannelVideoQuery } = userDashboardApi;

