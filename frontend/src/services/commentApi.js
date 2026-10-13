import api from "./api";

export const commentApi = api.injectEndpoints({
    endpoints: (builder) => ({
        addComment: builder.mutation({
            query: ({ videoId, content }) => ({
                url: `/comment/${videoId}`,
                method: "POST",
                body: { content },
            }),
            invalidatesTags: ["comments"],
        }),

        getComment: builder.query({
            query: ({ videoId }) => ({
                url: `/comment/${videoId}`,
                method: "GET",
            }),
            providesTags: ["comments"],
        }),
    }),
});

export const { useAddCommentMutation, useGetCommentQuery } = commentApi;
