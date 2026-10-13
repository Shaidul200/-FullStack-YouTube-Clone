import { useEffect } from "react";
import { usePublishVideoMutation } from "../../services/videoApi";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Upload, X, Image as ImageIcon, Video } from "lucide-react";

export default function UploadVideo({ onCancel }) {
    const [
        publishVideo,
        {
            isLoading,
        }
    ] = usePublishVideoMutation();

    const {
        register,
        handleSubmit,
        watch,
        reset,
    } = useForm({
        defaultValues: {
            title: "",
            description: "",
            videoFile: null,
            thumbnail: null,
        },
    });
    const videoFile = watch("videoFile");
    const thumbnail = watch("thumbnail");

    const selectedVideo = videoFile?.[0];

    const selectedThumbnail = thumbnail?.[0];

    const videoPreview = selectedVideo
        ? URL.createObjectURL(selectedVideo)
        : null;

    const thumbnailPreview = selectedThumbnail
        ? URL.createObjectURL(selectedThumbnail)
        : null;

    useEffect(() => {
        return () => {
            if (videoPreview) {
                URL.revokeObjectURL(videoPreview);
            }

            if (thumbnailPreview) {
                URL.revokeObjectURL(thumbnailPreview);
            }
        };
    }, [videoPreview, thumbnailPreview]);


    const submitHandler = async (data) => {
        if (!data.videoFile?.[0]) {
            toast.error("Please select a video.");
            return;
        }

        if (!data.thumbnail?.[0]) {
            toast.error("Please select a thumbnail.");
            return;
        }

        try {
            await publishVideo(data).unwrap();

            toast.success("Video published successfully!");

            reset();

            if (onCancel) {
                onCancel();
            }
        } catch (error) {
            console.error("Video upload failed:", error);

            toast.error(
                error?.data?.message ||
                error?.message ||
                "Failed to publish video."
            );
        }
    };


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-sm">

            <div className="
                flex
                max-h-[90vh]
                w-full
                max-w-2xl
                flex-col
                overflow-hidden
                rounded-xl
                border
                border-neutral-700
                bg-neutral-900
                max-sm:max-h-[96vh]
                max-sm:rounded-lg
            ">

                {/* ================= HEADER ================= */}

                <div className="
                    flex
                    shrink-0
                    items-center
                    justify-between
                    border-b
                    border-neutral-700
                    px-6
                    py-4
                    max-sm:px-4
                    max-sm:py-3
                ">

                    <h2 className="text-xl font-semibold text-white max-sm:text-lg">
                        Upload Video
                    </h2>

                    <div className="flex items-center gap-3 max-sm:gap-2">

                        {/* Close */}
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isLoading}
                            className="
                                rounded-full
                                p-2
                                text-gray-400
                                transition
                                hover:bg-neutral-800
                                hover:text-white
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >
                            <X size={20} />
                        </button>


                        {/* Save */}
                        <button
                            type="submit"
                            form="upload-video-form"
                            disabled={isLoading}
                            className="
                                rounded-full
                                bg-[#a87ffb]
                                px-5
                                py-2
                                font-semibold
                                text-black
                                transition
                                hover:bg-[#b592fc]
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                                max-sm:px-4
                                max-sm:py-1.5
                                max-sm:text-sm
                            "
                        >
                            {isLoading ? "Uploading..." : "Save"}
                        </button>

                    </div>

                </div>

                <div className="overflow-y-auto p-6 max-sm:p-3">

                    <form
                        id="upload-video-form"
                        onSubmit={handleSubmit(submitHandler)}
                        className="flex flex-col gap-6 max-sm:gap-4"
                    >

                        <div className="
                            overflow-hidden
                            rounded-xl
                            border-2
                            border-dashed
                            border-neutral-700
                            bg-neutral-950
                        ">

                            {selectedVideo ? (

                                <div className="relative">

                                    <video
                                        src={videoPreview}
                                        controls
                                        className="
                                            aspect-video
                                            w-full
                                            bg-black
                                            object-contain
                                        "
                                    />

                                    <label className="
                                        absolute
                                        bottom-4
                                        right-4
                                        cursor-pointer
                                        rounded-full
                                        bg-black/80
                                        px-4
                                        py-2
                                        text-sm
                                        font-semibold
                                        text-white
                                        backdrop-blur
                                        transition
                                        hover:bg-black
                                    ">
                                        Change video

                                        <input
                                            type="file"
                                            accept="video/*"
                                            {...register("videoFile")}
                                            className="hidden"
                                        />
                                    </label>

                                </div>

                            ) : (

                                <div className="
                                    flex
                                    flex-col
                                    items-center
                                    justify-center
                                    px-6
                                    py-12
                                    text-center
                                ">

                                    <div className="
                                        mb-4
                                        flex
                                        h-14
                                        w-14
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-neutral-800
                                    ">
                                        <Upload
                                            size={28}
                                            className="text-[#a87ffb]"
                                        />
                                    </div>

                                    <h3 className="
                                        text-lg
                                        font-semibold
                                        text-white
                                    ">
                                        Upload your video
                                    </h3>

                                    <p className="
                                        mt-1
                                        text-sm
                                        text-gray-400
                                    ">
                                        Select a video file from your computer
                                    </p>

                                    <label className="
                                        mt-5
                                        cursor-pointer
                                        rounded-full
                                        bg-[#a87ffb]
                                        px-5
                                        py-2.5
                                        font-semibold
                                        text-black
                                        transition
                                        hover:bg-[#b592fc]
                                    ">
                                        Select Video

                                        <input
                                            type="file"
                                            accept="video/*"
                                            {...register("videoFile")}
                                            className="hidden"
                                        />
                                    </label>

                                </div>
                            )}

                            {selectedVideo && (
                                <div className="
                                    flex
                                    items-center
                                    gap-2
                                    border-t
                                    border-neutral-800
                                    px-4
                                    py-3
                                ">
                                    <Video
                                        size={18}
                                        className="shrink-0 text-[#a87ffb]"
                                    />

                                    <p className="
                                        truncate
                                        text-sm
                                        text-gray-300
                                    ">
                                        {selectedVideo.name}
                                    </p>
                                </div>
                            )}

                        </div>


                        <div className="flex flex-col gap-3">

                            <label className="
                                font-medium
                                text-white
                            ">
                                Thumbnail
                            </label>

                            {selectedThumbnail ? (

                                <div className="
                                    overflow-hidden
                                    rounded-xl
                                    border
                                    border-neutral-700
                                    bg-neutral-950
                                ">

                                    <div className="relative">

                                        <img
                                            src={thumbnailPreview}
                                            alt="Video thumbnail preview"
                                            className="
                                                aspect-video
                                                w-full
                                                object-cover
                                            "
                                        />

                                        <label className="
                                            absolute
                                            bottom-4
                                            right-4
                                            cursor-pointer
                                            rounded-full
                                            bg-black/80
                                            px-4
                                            py-2
                                            text-sm
                                            font-semibold
                                            text-white
                                            backdrop-blur
                                            transition
                                            hover:bg-black
                                        ">
                                            Change thumbnail

                                            <input
                                                type="file"
                                                accept="image/*"
                                                {...register("thumbnail")}
                                                className="hidden"
                                            />
                                        </label>

                                    </div>

                                    <div className="
                                        flex
                                        items-center
                                        gap-2
                                        border-t
                                        border-neutral-800
                                        px-4
                                        py-3
                                    ">

                                        <ImageIcon
                                            size={18}
                                            className="shrink-0 text-[#a87ffb]"
                                        />

                                        <p className="
                                            truncate
                                            text-sm
                                            text-gray-300
                                        ">
                                            {selectedThumbnail.name}
                                        </p>

                                    </div>

                                </div>

                            ) : (

                                <label className="
                                    flex
                                    cursor-pointer
                                    items-center
                                    justify-between
                                    rounded-lg
                                    border
                                    border-neutral-700
                                    bg-neutral-800
                                    px-4
                                    py-3
                                    transition
                                    hover:border-neutral-500
                                ">

                                    <div className="
                                        flex
                                        min-w-0
                                        items-center
                                        gap-3
                                    ">

                                        <ImageIcon
                                            size={20}
                                            className="shrink-0 text-[#a87ffb]"
                                        />

                                        <span className="
                                            truncate
                                            text-sm
                                            text-gray-400
                                        ">
                                            Choose a thumbnail
                                        </span>

                                    </div>

                                    <span className="
                                        shrink-0
                                        rounded-md
                                        bg-neutral-700
                                        px-3
                                        py-1.5
                                        text-sm
                                        font-medium
                                        text-white
                                    ">
                                        Choose File
                                    </span>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        {...register("thumbnail")}
                                        className="hidden"
                                    />

                                </label>
                            )}

                        </div>

                        <div className="flex flex-col gap-2">

                            <label
                                htmlFor="title"
                                className="font-medium text-white"
                            >
                                Title
                            </label>

                            <input
                                id="title"
                                type="text"
                                placeholder="Enter your video title"
                                {...register("title", {
                                    required: "Title is required",
                                })}
                                className="
                                    w-full
                                    rounded-lg
                                    border
                                    border-neutral-700
                                    bg-neutral-800
                                    px-4
                                    py-3
                                    text-white
                                    outline-none
                                    placeholder:text-gray-500
                                    focus:border-[#a87ffb]
                                "
                            />

                        </div>

                        <div className="flex flex-col gap-2">

                            <label
                                htmlFor="description"
                                className="font-medium text-white"
                            >
                                Description
                            </label>

                            <textarea
                                id="description"
                                rows={6}
                                placeholder="Tell viewers about your video..."
                                {...register("description", {
                                    required: "Description is required",
                                })}
                                className="
                                    w-full
                                    resize-none
                                    rounded-lg
                                    border
                                    border-neutral-700
                                    bg-neutral-800
                                    px-4
                                    py-3
                                    text-white
                                    outline-none
                                    placeholder:text-gray-500
                                    focus:border-[#a87ffb]
                                "
                            />

                        </div>

                    </form>

                </div>

            </div>
        </div>
    );
}