import {
    Eye,
    Users,
    Heart,
    Upload,
    Video
} from "lucide-react";

import {
    useGetUserDashboardStatsQuery,
    useGetUserChannelVideoQuery
} from "../services/userDashboardApi";

import UploadVideo from "../components/myChannel/UploadVideo";

import { useEffect, useState } from "react";

import { Loader } from "../components";

import {
    useDeleteVideoMutation,
    useVideoTogglePublishedStatusMutation,
    useUpdateVideoMutation
} from "../services/videoApi";


function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();

    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) {
        return "just now";
    }

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
        return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 30) {
        return `${days} day${days === 1 ? "" : "s"} ago`;
    }

    const months = Math.floor(days / 30);

    if (months < 12) {
        return `${months} month${months === 1 ? "" : "s"} ago`;
    }

    const years = Math.floor(months / 12);

    return `${years} year${years === 1 ? "" : "s"} ago`;
}


export default function UserDashboard() {

    const {
        data: stat,
        isLoading: statsLoading
    } = useGetUserDashboardStatsQuery();


    const {
        data: video
    } = useGetUserChannelVideoQuery();


    // Local copy of videos
    const [videos, setVideos] = useState([]);


    // Message shown to the user
    const [message, setMessage] = useState({
        type: "",
        text: ""
    });


    const statValue = stat?.data || [];


    // Publish / Unpublish mutation
    const [
        videoTogglePublishedStatus
    ] = useVideoTogglePublishedStatusMutation();


    // Delete mutation
    const [
        deleteVideo
    ] = useDeleteVideoMutation();


    // Update mutation
    const [
        videoUpdate
    ] = useUpdateVideoMutation();


    // Upload modal
    const [open, setOpen] = useState(false);


    // Publish / Unpublish loading state
    const [
        togglingVideoId,
        setTogglingVideoId
    ] = useState(null);


    // Currently editing video
    const [
        editingVideo,
        setEditingVideo
    ] = useState(null);


    // Update form
    const [
        editForm,
        setEditForm
    ] = useState({
        title: "",
        description: ""
    });


    // Update loading state
    const [
        updatingVideo,
        setUpdatingVideo
    ] = useState(false);


    // Keep local videos synchronized with API data
    useEffect(() => {
        setVideos(video?.data || []);
    }, [video]);


    const stats = [
        {
            title: "Total Views",
            value: statValue?.totalViews,
            icon: Eye,
        },
        {
            title: "Total Subscribers",
            value: statValue?.totalSubscribers,
            icon: Users,
        },
        {
            title: "Total Likes",
            value: statValue?.totalLikes,
            icon: Heart,
        },
        {
            title: "Total Video",
            value: statValue?.totalVideos,
            icon: Video
        }
    ];


    // Publish / Unpublish
    const handleToggel = async (videoId) => {

        try {

            setTogglingVideoId(videoId);

            await videoTogglePublishedStatus(videoId).unwrap();


            // Immediately update the UI
            setVideos((prev) =>
                prev.map((video) =>
                    video._id === videoId
                        ? {
                            ...video,
                            isPublished: !video.isPublished
                        }
                        : video
                )
            );


            setMessage({
                type: "success",
                text: "Video status updated successfully."
            });


        } catch (error) {

            console.log(error);

            setMessage({
                type: "error",
                text:
                    error?.data?.message ||
                    "Failed to update video status."
            });

        } finally {

            setTogglingVideoId(null);

        }
    };


    // Open edit modal
    const handleEdit = (video) => {

        // Store the selected video
        setEditingVideo(video);

        // Empty form because we are NOT pre-filling
        // the existing title and description
        setEditForm({
            title: "",
            description: ""
        });

    };


    // Handle edit form changes
    const handleEditChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setEditForm((prev) => ({
            ...prev,
            [name]: value
        }));

    };


    // Update video
    const handleUpdate = async (e) => {

        e.preventDefault();
       


        if (!editingVideo) {
            return;
        }


        try {

            setUpdatingVideo(true);


            await videoUpdate({
                id: editingVideo._id,
                title: editForm.title,
                description: editForm.description
            }).unwrap();


            // Immediately update the UI
            setVideos((prev) =>
                prev.map((video) =>
                    video._id === editingVideo._id
                        ? {
                            ...video,
                            title: editForm.title,
                            description: editForm.description
                        }
                        : video
                )
            );


            setMessage({
                type: "success",
                text: "Video updated successfully."
            });


            // Close edit modal
            setEditingVideo(null);


            // Clear form
            setEditForm({
                title: "",
                description: ""
            });


        } catch (error) {

            console.log(error);

            setMessage({
                type: "error",
                text:
                    error?.data?.message ||
                    "Failed to update the video."
            });

        } finally {

            setUpdatingVideo(false);

        }
    };


    // Delete video
    const handleDelete = async (videoId) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this video?"
        );


        if (!confirmed) {
            return;
        }


        try {

            await deleteVideo(videoId).unwrap();


            // Immediately remove the video from the UI
            setVideos((prev) =>
                prev.filter((video) => video._id !== videoId)
            );


            setMessage({
                type: "success",
                text: "Video deleted successfully."
            });


        } catch (error) {

            console.log(error);

            setMessage({
                type: "error",
                text:
                    error?.data?.message ||
                    "Failed to delete the video."
            });

        }
    };


    return (
        <>

            {statsLoading && (
                <Loader
                    width={100}
                    hight={100}
                    color="#ff0000"
                    animationDuration="1s"
                />
            )}


            {/* Success / Error Message */}
            {message.text && (
                <div
                    className={`
                        fixed
                        right-5
                        top-20
                        z-50
                        rounded-lg
                        border
                        px-4
                        py-3
                        text-sm
                        shadow-lg
                        ${
                            message.type === "success"
                                ? "border-green-500/40 bg-green-500/10 text-green-400"
                                : "border-red-500/40 bg-red-500/10 text-red-400"
                        }
                    `}
                >
                    {message.text}
                </div>
            )}


            <main
                className="
                    min-h-screen
                    bg-[#0D0D0D]
                    px-6
                    py-8
                    text-white
                    lg:px-10
                    max-sm:px-3
                    max-sm:py-4
                "
            >


                {/* Header */}
                <section
                    className="
                        mb-10
                        flex
                        flex-col
                        justify-between
                        gap-6
                        border-b
                        border-neutral-800
                        pb-8
                        sm:flex-row
                        sm:items-center
                        max-sm:mb-6
                        max-sm:gap-4
                        max-sm:pb-4
                    "
                >

                    <div>

                        <h1
                            className="
                                text-2xl
                                font-semibold
                                tracking-tight
                                sm:text-3xl
                                max-sm:text-xl
                            "
                        >
                            Welcome Back!!!
                        </h1>


                        <p
                            className="
                                mt-2
                                text-sm
                                text-white
                                sm:text-base
                                max-sm:text-xs
                            "
                        >
                            Seamless Video Management, Elevated Results.
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="
                            inline-flex
                            items-center
                            justify-center
                            gap-2
                            rounded-lg
                            bg-white
                            px-5
                            py-2.5
                            text-sm
                            font-medium
                            text-black
                            transition
                            hover:bg-neutral-200
                            max-sm:w-full
                        "
                    >

                        <Upload size={18} />

                        Upload Video

                    </button>


                    {open && <UploadVideo onCancel={() => setOpen(false)} />}

                </section>



                {/* Statistics */}
                <section
                    className="
                        mb-8
                        grid
                        grid-cols-1
                        gap-4
                        sm:grid-cols-2
                        lg:grid-cols-4
                    "
                >

                    {stats.map((stat) => {

                        const Icon = stat.icon;


                        return (
                            <div
                                key={stat.title}
                                className="
                                    rounded-xl
                                    border
                                    border-neutral-800
                                    bg-[#111111]
                                    p-5
                                "
                            >

                                <div className="flex items-start justify-between">

                                    <div>

                                        <p className="text-sm text-white">
                                            {stat.title}
                                        </p>


                                        <p
                                            className="
                                                mt-2
                                                text-2xl
                                                font-semibold
                                                tracking-tight
                                                text-white
                                            "
                                        >
                                            {stat.value}
                                        </p>

                                    </div>


                                    <div
                                        className="
                                            rounded-lg
                                            border
                                            border-neutral-800
                                            bg-neutral-900
                                            p-2.5
                                        "
                                    >

                                        <Icon
                                            size={19}
                                            className="text-white"
                                        />

                                    </div>

                                </div>

                            </div>
                        );

                    })}

                </section>



                {/* Uploaded Videos */}
                <section
                    className="
                        overflow-hidden
                        rounded-xl
                        border
                        border-neutral-800
                        bg-[#111111]
                        max-sm:rounded-lg
                    "
                >


                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            border-b
                            border-neutral-800
                            px-5
                            py-5
                            max-sm:px-3
                            max-sm:py-3
                        "
                    >

                        <div>

                            <h2 className="text-lg font-semibold">
                                Uploaded Videos
                            </h2>


                            <p className="mt-1 text-sm text-neutral-500">
                                Manage your uploaded content.
                            </p>

                        </div>


                        <span className="text-sm text-neutral-500">
                            {videos.length} videos
                        </span>

                    </div>



                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[640px] sm:min-w-[750px] lg:min-w-full text-left">

                            <thead>

                                <tr
                                    className="
                                        border-b
                                        border-neutral-800
                                        text-xs
                                        uppercase
                                        tracking-wider
                                        text-neutral-500
                                    "
                                >

                                    <th className="px-5 py-4 font-medium">
                                        Status
                                    </th>


                                    <th className="px-5 py-4 font-medium">
                                        Video
                                    </th>


                                    <th className="px-5 py-4 font-medium">
                                        Upload Date
                                    </th>


                                    <th className="px-5 py-4 font-medium">
                                        Action
                                    </th>

                                </tr>

                            </thead>



                            <tbody>

                                {videos.map((video) => (

                                    <tr
                                        key={video._id}
                                        className="
                                            border-b
                                            border-neutral-800/70
                                            transition
                                            hover:bg-neutral-900/50
                                        "
                                    >


                                        {/* Status */}
                                        <td className="px-5 py-5">

                                            <div className="flex items-center gap-3">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleToggel(video._id)
                                                    }
                                                    disabled={
                                                        togglingVideoId ===
                                                        video._id
                                                    }
                                                    aria-label={
                                                        video.isPublished
                                                            ? "Unpublish video"
                                                            : "Publish video"
                                                    }
                                                    className={`
                                                        relative
                                                        h-5
                                                        w-9
                                                        shrink-0
                                                        rounded-full
                                                        transition-all
                                                        duration-300
                                                        disabled:cursor-not-allowed
                                                        disabled:opacity-70
                                                        ${
                                                            video.isPublished
                                                                ? "bg-white"
                                                                : "bg-neutral-700"
                                                        }
                                                    `}
                                                >

                                                    <span
                                                        className={`
                                                            absolute
                                                            top-0.5
                                                            h-4
                                                            w-4
                                                            rounded-full
                                                            transition-all
                                                            duration-300
                                                            ${
                                                                video.isPublished
                                                                    ? "left-4 bg-black"
                                                                    : "left-0.5 bg-neutral-400"
                                                            }
                                                            ${
                                                                togglingVideoId ===
                                                                video._id
                                                                    ? "scale-75 animate-pulse"
                                                                    : ""
                                                            }
                                                        `}
                                                    />

                                                </button>



                                                {/* Status Badge */}
                                                <span
                                                    className={`
                                                        rounded-full
                                                        border
                                                        px-2.5
                                                        py-1
                                                        text-xs
                                                        font-medium
                                                        transition-all
                                                        duration-300
                                                        ${
                                                            togglingVideoId ===
                                                            video._id
                                                                ? "border-yellow-500/40 text-yellow-400"
                                                                : video.isPublished
                                                                    ? "border-green-500/40 text-green-400"
                                                                    : "border-red-500/40 text-red-400"
                                                        }
                                                    `}
                                                >

                                                    {
                                                        togglingVideoId ===
                                                        video._id
                                                            ? "Updating..."
                                                            : video.isPublished
                                                                ? "Published"
                                                                : "Unpublished"
                                                    }

                                                </span>

                                            </div>

                                        </td>



                                        {/* Video */}
                                        <td className="px-5 py-5">

                                            <div className="flex items-center gap-4">

                                                <img
                                                    src={video.thumbnail}
                                                    alt={video.title}
                                                    className="
                                                        h-16
                                                        w-28
                                                        rounded-lg
                                                        object-cover
                                                        ring-1
                                                        ring-neutral-800
                                                    "
                                                />


                                                <p
                                                    className="
                                                        max-w-sm
                                                        text-sm
                                                        font-medium
                                                        text-white
                                                    "
                                                >
                                                    {video.title}
                                                </p>

                                            </div>

                                        </td>



                                        {/* Upload Date */}
                                        <td
                                            className="
                                                whitespace-nowrap
                                                px-5
                                                py-5
                                                text-sm
                                                text-neutral-500
                                            "
                                        >
                                            {formatTimeAgo(video.createdAt)}
                                        </td>



                                        {/* Action */}
                                        <td className="px-5 py-5">

                                            <div className="flex items-center gap-2">

                                                {/* Edit */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleEdit(video)
                                                    }
                                                    className="
                                                        rounded-lg
                                                        border
                                                        border-neutral-700
                                                        px-3
                                                        py-1.5
                                                        text-sm
                                                        text-white
                                                        transition
                                                        hover:border-neutral-500
                                                        hover:bg-neutral-800
                                                    "
                                                >
                                                    Edit
                                                </button>


                                                {/* Delete */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(video._id)
                                                    }
                                                    className="
                                                        rounded-lg
                                                        border
                                                        border-red-500/40
                                                        px-3
                                                        py-1.5
                                                        text-sm
                                                        text-red-400
                                                        transition
                                                        hover:border-red-500
                                                        hover:bg-red-500/10
                                                    "
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                </section>

            </main>



            {/* Edit Video Modal */}
            {editingVideo && (

                <div
                    className="
                        fixed
                        inset-0
                        z-[100]
                        flex
                        items-center
                        justify-center
                        bg-black/70
                        p-4
                        backdrop-blur-sm
                    "
                >

                    <div
                        className="
                            w-full
                            max-w-lg
                            max-h-[90vh]
                            overflow-y-auto
                            rounded-xl
                            border
                            border-neutral-800
                            bg-[#111111]
                            p-4
                            sm:p-6
                            shadow-2xl
                        "
                    >

                        {/* Modal Header */}
                        <div
                            className="
                                mb-6
                                flex
                                items-center
                                justify-between
                            "
                        >

                            <div>

                                <h2 className="text-lg font-semibold text-white">
                                    Edit Video
                                </h2>


                                <p className="mt-1 text-sm text-neutral-500">
                                    Update your video's title and description.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={() => setEditingVideo(null)}
                                disabled={updatingVideo}
                                className="
                                    text-2xl
                                    leading-none
                                    text-neutral-500
                                    transition
                                    hover:text-white
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
                            >
                                ×
                            </button>

                        </div>



                        {/* Edit Form */}
                        <form
                            onSubmit={handleUpdate}
                            className="space-y-5"
                        >

                            {/* Title */}
                            <div>

                                <label
                                    htmlFor="edit-title"
                                    className="
                                        mb-2
                                        block
                                        text-sm
                                        font-medium
                                        text-white
                                    "
                                >
                                    New Title
                                </label>


                                <input
                                    id="edit-title"
                                    name="title"
                                    type="text"
                                    value={editForm.title}
                                    onChange={handleEditChange}
                                    disabled={updatingVideo}
                                    required
                                    className="
                                        w-full
                                        rounded-lg
                                        border
                                        border-neutral-800
                                        bg-[#0D0D0D]
                                        px-4
                                        py-3
                                        text-sm
                                        text-white
                                        outline-none
                                        transition
                                        placeholder:text-neutral-600
                                        focus:border-neutral-500
                                        disabled:cursor-not-allowed
                                        disabled:opacity-60
                                    "
                                    placeholder="Enter new video title"
                                />

                            </div>



                            {/* Description */}
                            <div>

                                <label
                                    htmlFor="edit-description"
                                    className="
                                        mb-2
                                        block
                                        text-sm
                                        font-medium
                                        text-white
                                    "
                                >
                                    New Description
                                </label>


                                <textarea
                                    id="edit-description"
                                    name="description"
                                    value={editForm.description}
                                    onChange={handleEditChange}
                                    disabled={updatingVideo}
                                    required
                                    rows={6}
                                    className="
                                        w-full
                                        resize-none
                                        rounded-lg
                                        border
                                        border-neutral-800
                                        bg-[#0D0D0D]
                                        px-4
                                        py-3
                                        text-sm
                                        text-white
                                        outline-none
                                        transition
                                        placeholder:text-neutral-600
                                        focus:border-neutral-500
                                        disabled:cursor-not-allowed
                                        disabled:opacity-60
                                    "
                                    placeholder="Enter new video description"
                                />

                            </div>



                            {/* Modal Buttons */}
                            <div
                                className="
                                    flex
                                    justify-end
                                    gap-3
                                    pt-2
                                "
                            >

                                <button
                                    type="button"
                                    onClick={() => setEditingVideo(null)}
                                    disabled={updatingVideo}
                                    className="
                                        rounded-lg
                                        border
                                        border-neutral-800
                                        px-4
                                        py-2.5
                                        text-sm
                                        font-medium
                                        text-white
                                        transition
                                        hover:bg-neutral-800
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    disabled={updatingVideo}
                                    className="
                                        rounded-lg
                                        bg-white
                                        px-5
                                        py-2.5
                                        text-sm
                                        font-medium
                                        text-black
                                        transition
                                        hover:bg-neutral-200
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
                                >
                                    {
                                        updatingVideo
                                            ? "Updating..."
                                            : "Update Video"
                                    }
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </>
    );
}