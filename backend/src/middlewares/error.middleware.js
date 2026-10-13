import ApiError from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
    let error = err;

    if (!(error instanceof ApiError)) {
        error = new ApiError(
            error.statusCode || 500,
            error.message || "Something went wrong",
            error.errors || [],
            error.stack
        );
    }

    return res.status(error.statusCode).json({
        statusCode: error.statusCode,
        message: error.message,
        success: error.success,
        errors: error.errors,
    });
};

export { errorHandler };