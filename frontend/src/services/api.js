import { createApi,
     fetchBaseQuery 
    } from "@reduxjs/toolkit/query/react";


const api = createApi({
    reducerPath: "api",

    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_API_URL}/api/v1`,
        credentials: "include"
    }),
    tagTypes: ["Playlist", "Video", "User", "Comment", "Like", "Subscription", "Tweet"],
    endpoints: () => ({}),
})

export default api