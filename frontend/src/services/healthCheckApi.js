import api from "./api";

export const healthCheckApi = api.injectEndpoints({
    endpoints: (builder) => ({
        healthCheck: builder.query({
            query: () => "/healthcheck/",
        }),
    }),
});

export const { useHealthCheckQuery } = healthCheckApi;