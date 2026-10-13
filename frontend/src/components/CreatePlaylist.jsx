import React, { useState } from "react";
import { X, Plus, Check, ListVideo, ArrowLeft, Loader2, LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
    useCreatePlaylistMutation,
    useAddVideoToPlaylistMutation,
    useRemoveVideoFromPlaylistMutation,
    useGetUserPlaylistsQuery,
} from "../services/playlistApi";

export default function CreatePlaylist({
    open,
    onClose,
    videoId,
    initialMode = "select", // "select" or "create"
}) {
    const [mode, setMode] = useState(initialMode);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [statusMessage, setStatusMessage] = useState(null);

    const user = useSelector((state) => state.auth.user?.data || state.auth.user);
    const userId = user?._id;
    const isAuthenticated = useSelector((state) => state.auth.status) || !!userId;

    const { data: userPlaylistsData, isLoading: isPlaylistsLoading } =
        useGetUserPlaylistsQuery(userId, { skip: !userId });

    const [createPlaylist, { isLoading: isCreating }] = useCreatePlaylistMutation();
    const [addVideoToPlaylist] = useAddVideoToPlaylistMutation();
    const [removeVideoFromPlaylist] = useRemoveVideoFromPlaylistMutation();

    const playlists = userPlaylistsData?.data || [];

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm();

    const handleClose = () => {
        setMode(initialMode);
        setStatusMessage(null);
        reset();
        onClose();
    };

    const isVideoInPlaylist = (playlist) => {
        if (!videoId || !playlist?.videos) return false;
        return playlist.videos.some((v) => {
            if (typeof v === "string") return v === videoId;
            return v?._id === videoId || v?._id?.toString() === videoId;
        });
    };

    const handleTogglePlaylist = async (playlist) => {
        if (!videoId || actionLoadingId) return;

        const playlistId = playlist._id;
        const alreadyIn = isVideoInPlaylist(playlist);
        setActionLoadingId(playlistId);
        setStatusMessage(null);

        try {
            if (alreadyIn) {
                await removeVideoFromPlaylist({ videoId, playlistId }).unwrap();
                setStatusMessage({ type: "success", text: `Removed from "${playlist.name}"` });
            } else {
                await addVideoToPlaylist({ videoId, playlistId }).unwrap();
                setStatusMessage({ type: "success", text: `Added to "${playlist.name}"` });
            }
        } catch (error) {
            console.error("Error updating playlist:", error);
            setStatusMessage({
                type: "error",
                text: error?.data?.message || "Failed to update playlist",
            });
        } finally {
            setActionLoadingId(null);
        }
    };

    const onSubmit = async (formData) => {
        try {
            const res = await createPlaylist({
                name: formData.name.trim(),
                description: formData.description?.trim() || "",
            }).unwrap();

            const newPlaylist = res?.data;

            if (videoId && newPlaylist?._id) {
                await addVideoToPlaylist({
                    playlistId: newPlaylist._id,
                    videoId,
                }).unwrap();
            }

            reset();
            setMode("select");
            setStatusMessage({
                type: "success",
                text: `Playlist "${formData.name}" created successfully!`,
            });

            if (!videoId) {
                handleClose();
            }
        } catch (error) {
            console.error("Create playlist error:", error);
            setStatusMessage({
                type: "error",
                text: error?.data?.message || "Failed to create playlist",
            });
        }
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm transition-all"
            onClick={handleClose}
        >
            <div
                className="w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#121214] shadow-2xl transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Unauthenticated View */}
                {!isAuthenticated ? (
                    <div className="p-6 text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20 text-purple-400">
                            <LogIn size={24} />
                        </div>
                        <h2 className="text-lg font-semibold text-white">Sign in to use Playlists</h2>
                        <p className="mt-2 text-sm text-neutral-400">
                            You need to be logged in to create playlists or save videos.
                        </p>
                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-neutral-300 hover:bg-white/10"
                            >
                                Cancel
                            </button>
                            <Link
                                to="/login"
                                onClick={handleClose}
                                className="flex-1 rounded-xl bg-purple-600 py-2.5 text-sm font-semibold text-white hover:bg-purple-500 text-center"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                ) : mode === "select" && videoId ? (
                    /* Playlist Selection View */
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
                                    <ListVideo size={20} />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-white">
                                        Save to playlist
                                    </h2>
                                    <p className="text-xs text-neutral-400">
                                        Select playlists to add or remove this video
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleClose}
                                className="rounded-full p-2 text-neutral-400 hover:bg-white/10 hover:text-white"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Status Message */}
                        {statusMessage && (
                            <div
                                className={`mx-4 mt-3 rounded-lg px-3 py-2 text-xs font-medium ${
                                    statusMessage.type === "success"
                                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                        : "bg-red-500/15 text-red-400 border border-red-500/30"
                                }`}
                            >
                                {statusMessage.text}
                            </div>
                        )}

                        {/* Playlists List */}
                        <div className="max-h-[320px] overflow-y-auto p-3">
                            {isPlaylistsLoading ? (
                                <div className="flex flex-col items-center justify-center py-8 text-neutral-400">
                                    <Loader2 className="animate-spin mb-2" size={24} />
                                    <p className="text-xs">Loading your playlists...</p>
                                </div>
                            ) : playlists.length > 0 ? (
                                <div className="space-y-1">
                                    {playlists.map((playlist) => {
                                        const isSelected = isVideoInPlaylist(playlist);
                                        const isActionPending = actionLoadingId === playlist._id;

                                        return (
                                            <button
                                                key={playlist._id}
                                                type="button"
                                                onClick={() => handleTogglePlaylist(playlist)}
                                                disabled={isActionPending}
                                                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                                                    isSelected
                                                        ? "bg-purple-500/10 border border-purple-500/30"
                                                        : "hover:bg-white/5 border border-transparent"
                                                }`}
                                            >
                                                {/* Checkbox */}
                                                <div
                                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                                                        isSelected
                                                            ? "border-purple-500 bg-purple-600 text-white"
                                                            : "border-white/25 bg-white/5 text-transparent"
                                                    }`}
                                                >
                                                    {isActionPending ? (
                                                        <Loader2 size={12} className="animate-spin text-white" />
                                                    ) : (
                                                        <Check size={14} className={isSelected ? "opacity-100" : "opacity-0"} />
                                                    )}
                                                </div>

                                                {/* Playlist Info */}
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium text-white">
                                                        {playlist.name}
                                                    </p>
                                                    <p className="truncate text-xs text-neutral-400">
                                                        {playlist.videos?.length || 0} video{playlist.videos?.length === 1 ? "" : "s"}
                                                        {playlist.description ? ` • ${playlist.description}` : ""}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
                                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-neutral-400">
                                        <ListVideo size={24} />
                                    </div>
                                    <p className="text-sm font-medium text-white">No playlists yet</p>
                                    <p className="mt-1 text-xs text-neutral-400">
                                        Create your first playlist to save this video.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer / Create Button */}
                        <div className="border-t border-white/10 p-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setStatusMessage(null);
                                    setMode("create");
                                }}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
                            >
                                <Plus size={18} />
                                Create new playlist
                            </button>
                        </div>
                    </>
                ) : (
                    /* Create Playlist Form View */
                    <>
                        {/* Header */}
                        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
                            {videoId && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStatusMessage(null);
                                        setMode("select");
                                    }}
                                    className="rounded-full p-2 text-neutral-400 hover:bg-white/10 hover:text-white"
                                >
                                    <ArrowLeft size={18} />
                                </button>
                            )}

                            <div>
                                <h2 className="text-base font-semibold text-white">
                                    Create new playlist
                                </h2>
                                <p className="text-xs text-neutral-400">
                                    Organize your favorite videos
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleClose}
                                className="ml-auto rounded-full p-2 text-neutral-400 hover:bg-white/10 hover:text-white"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Status Message */}
                        {statusMessage && (
                            <div
                                className={`mx-5 mt-3 rounded-lg px-3 py-2 text-xs font-medium ${
                                    statusMessage.type === "success"
                                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                        : "bg-red-500/15 text-red-400 border border-red-500/30"
                                }`}
                            >
                                {statusMessage.text}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-5">
                            <div>
                                <label
                                    htmlFor="playlist-name"
                                    className="mb-1.5 block text-sm font-medium text-white"
                                >
                                    Playlist Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    id="playlist-name"
                                    type="text"
                                    placeholder="Enter playlist title (e.g. Favorites)"
                                    {...register("name", {
                                        required: "Playlist name is required",
                                        validate: (v) => v.trim().length > 0 || "Playlist name cannot be empty",
                                    })}
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:border-purple-500 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-xs text-red-400">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="playlist-description"
                                    className="mb-1.5 block text-sm font-medium text-white"
                                >
                                    Description <span className="text-xs text-neutral-500">(Optional)</span>
                                </label>
                                <textarea
                                    id="playlist-description"
                                    rows={3}
                                    placeholder="What is this playlist about?"
                                    {...register("description")}
                                    className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:border-purple-500 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                {videoId ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setStatusMessage(null);
                                            setMode("select");
                                        }}
                                        className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-neutral-300 hover:bg-white/10"
                                    >
                                        Back
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-neutral-300 hover:bg-white/10"
                                    >
                                        Cancel
                                    </button>
                                )}

                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-600 py-2.5 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-50"
                                >
                                    {isCreating && <Loader2 size={16} className="animate-spin" />}
                                    {isCreating ? "Creating..." : "Create Playlist"}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}