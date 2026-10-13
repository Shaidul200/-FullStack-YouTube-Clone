import { configureStore } from "@reduxjs/toolkit";
import authSlice from "../features/auth/authSlice";
import api from "../services/api";


export const store = configureStore({
    reducer: {
        auth: authSlice,
        [api.reducerPath]: api.reducer,
    },

    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(api.middleware)
})

