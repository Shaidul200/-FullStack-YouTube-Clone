import api from "./api";

export const VideoApi = api.injectEndpoints({
    endpoints: (builder) => ({

       publishVideo: builder.mutation({
    query: (data) => {
        const formData = new FormData();

        formData.append("title", data.title);
        formData.append("description", data.description);

        formData.append(
            "videoFile",
            data.videoFile[0]
        );

        formData.append(
            "thumbnail",
            data.thumbnail[0]
        );

        return {
            url: "/video/",
            method: "POST",
            body: formData,
        };
    },
    invalidatesTags: ["Video"]
}),

        getAllVideos: builder.query({
            query: ({page = 1, query= ''}) => ({
                url: `/video?page=${page}&query=${query}`,
            }),
            providesTags: ["Video"]
        }),

        getVideoById: builder.query({
            query: (videoId) => ({
                url: `/video/${videoId}`
            }),
            providesTags: ["Video"]
        }),

        deleteVideo: builder.mutation({
            query: (videoId) => ({
                url: `/video/${videoId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Video"]
        }),

        updateVideo: builder.mutation({
              query: (data) => ({
        url: `/video/${data.id}`,
        method: "PATCH",
        body: {
            title: data.title,
            description: data.description
        }
    }),
    invalidatesTags: ["Video"]
        }),

        videoTogglePublishedStatus: builder.mutation({
            query: (videoId) => ({
                url: `/video/toggle/publish/${videoId}`,
                method: "PATCH",
            }),
            invalidatesTags: ["Video"]
        })
        

    })
})

export const {usePublishVideoMutation, useGetAllVideosQuery, useGetVideoByIdQuery, useDeleteVideoMutation, useUpdateVideoMutation, useVideoTogglePublishedStatusMutation} = VideoApi