import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
    Trash2, 
    Play, 
    ListVideo, 
    Clock, 
    Eye, 
    ArrowLeft, 
    Loader2, 
    Share2,
    Check
} from "lucide-react";
import { useSelector } from "react-redux";
import { Loader } from "../components";
import { 
    useGetPlaylistByIdQuery, 
    useRemoveVideoFromPlaylistMutation,
    useDeletePlaylistMutation
} from "../services/playlistApi";

function formatDuration(seconds) {
    if (!seconds || seconds < 0) return "0:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
    }
    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function formatTimeAgo(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    const years = Math.floor(months / 12);
    return `${years}y ago`;
}

export default function PlaylistVideo() {
    const { playlistId } = useParams();
    const navigate = useNavigate();

    const currentUser = useSelector((state) => state.auth.user?.data || state.auth.user);
    const currentUserId = currentUser?._id;

    const { data, isLoading, error } = useGetPlaylistByIdQuery(playlistId);
    const [removeVideoFromPlaylist, { isLoading: isRemovingVideo }] = useRemoveVideoFromPlaylistMutation();
    const [deletePlaylist, { isLoading: isDeletingPlaylist }] = useDeletePlaylistMutation();

    const [removingVideoId, setRemovingVideoId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [copied, setCopied] = useState(false);

    const playlist = data?.data;
    const videos = playlist?.videos || [];

    const isOwner = playlist?.owner?._id 
        ? playlist.owner._id === currentUserId 
        : playlist?.owner === currentUserId;

    const handleRemoveVideo = async (e, videoId) => {
        e.preventDefault();
        e.stopPropagation();

        if (removingVideoId) return;

        try {
            setRemovingVideoId(videoId);
            await removeVideoFromPlaylist({ videoId, playlistId }).unwrap();
        } catch (err) {
            console.error("Failed to remove video from playlist:", err);
        } finally {
            setRemovingVideoId(null);
        }
    };

    const handleDeletePlaylist = async () => {
        try {
            await deletePlaylist(playlistId).unwrap();
            navigate("/my-playlist");
        } catch (err) {
            console.error("Failed to delete playlist:", err);
        }
    };

    const handleCopyShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader width="80px" height="80px" color="#a87ffb" animationDuration="1" />
            </div>
        );
    }

    if (error || !playlist) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
                    <ListVideo size={32} />
                </div>
                <h2 className="text-xl font-bold text-white">Playlist not found</h2>
                <p className="mt-2 text-sm text-neutral-400">
                    This playlist might have been deleted or does not exist.
                </p>
                <Link
                    to="/my-playlist"
                    className="mt-6 flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-500"
                >
                    <ArrowLeft size={18} />
                    Back to Playlists
                </Link>
            </div>
        );
    }

    const firstVideoThumbnail = videos[0]?.thumbnail;

    return (
        <div className="min-h-screen w-full px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center gap-3">
                <Link
                    to="/my-playlist"
                    className="flex items-center gap-2 text-sm font-medium text-neutral-400 transition hover:text-white"
                >
                    <ArrowLeft size={18} />
                    <span>Back to Playlists</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                {/* Playlist Sidebar / Banner Card */}
                <div className="lg:col-span-4 xl:col-span-4">
                    <div className="sticky top-20 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#1c1a24] to-[#121214] p-6 shadow-2xl backdrop-blur-xl">
                        {/* Cover Image */}
                        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-neutral-900 border border-white/10 shadow-lg">
                            {firstVideoThumbnail ? (
                                <img
                                    src={firstVideoThumbnail}
                                    alt={playlist.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-900/40 via-purple-600/20 to-black">
                                    <ListVideo size={48} className="text-purple-400" />
                                </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-semibold text-white">
                                <span className="rounded-md bg-black/60 px-2 py-1 backdrop-blur-md">
                                    {videos.length} {videos.length === 1 ? "video" : "videos"}
                                </span>
                            </div>
                        </div>

                        {/* Title & Description */}
                        <div className="mt-5">
                            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl break-words">
                                {playlist.name}
                            </h1>

                            <p className="mt-2 text-xs font-medium text-purple-400">
                                {playlist.owner?.fullName ? `Created by ${playlist.owner.fullName}` : "Your Playlist"}
                            </p>

                            {playlist.description && (
                                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-300 break-words">
                                    {playlist.description}
                                </p>
                            )}

                            <div className="mt-4 flex items-center gap-2 text-xs text-neutral-500">
                                <Clock size={14} />
                                <span>Updated {formatTimeAgo(playlist.updatedAt || playlist.createdAt)}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 flex flex-wrap gap-2.5">
                            {videos.length > 0 && (
                                <Link
                                    to={`/watch/${videos[0]._id}`}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-neutral-200"
                                >
                                    <Play size={17} fill="currentColor" />
                                    Play All
                                </Link>
                            )}

                            <button
                                type="button"
                                onClick={handleCopyShare}
                                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm font-medium text-neutral-300 transition hover:bg-white/10 hover:text-white"
                                title="Share Playlist"
                            >
                                {copied ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
                                <span>{copied ? "Copied" : "Share"}</span>
                            </button>

                            {isOwner && (
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/20 hover:text-red-300"
                                    title="Delete entire playlist"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>

                        {/* Delete Playlist Confirmation */}
                        {showDeleteConfirm && (
                            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5">
                                <p className="text-xs font-medium text-red-300">
                                    Are you sure you want to delete this entire playlist?
                                </p>
                                <div className="mt-3 flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="flex-1 rounded-lg border border-white/10 bg-white/5 py-1.5 text-xs font-medium text-neutral-300 hover:bg-white/10"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDeletePlaylist}
                                        disabled={isDeletingPlaylist}
                                        className="flex-1 rounded-lg bg-red-600 py-1.5 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50"
                                    >
                                        {isDeletingPlaylist ? "Deleting..." : "Delete"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Video List */}
                <div className="lg:col-span-8 xl:col-span-8">
                    {videos.length === 0 ? (
                        <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-neutral-500">
                                <ListVideo size={32} />
                            </div>
                            <h3 className="text-lg font-semibold text-white">No videos in this playlist</h3>
                            <p className="mt-1.5 max-w-sm text-sm text-neutral-400">
                                Add videos while browsing or watching by clicking the Save button.
                            </p>
                            <Link
                                to="/home"
                                className="mt-5 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-500"
                            >
                                Explore Videos
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between pb-2 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                                <span># Video Title</span>
                                <span>Action</span>
                            </div>

                            {videos.map((video, index) => {
                                const isBeingRemoved = removingVideoId === video._id;

                                return (
                                    <div
                                        key={video._id || index}
                                        className="group relative flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-[#141416]/80 p-2.5 transition-all hover:border-white/15 hover:bg-white/5"
                                    >
                                        <Link
                                            to={`/watch/${video._id}`}
                                            className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3.5"
                                        >
                                            {/* Index / Number */}
                                            <span className="hidden sm:inline-block w-5 shrink-0 text-center text-xs font-semibold text-neutral-500 group-hover:text-purple-400">
                                                {index + 1}
                                            </span>

                                            {/* Thumbnail */}
                                            <div className="relative aspect-video w-24 sm:w-36 md:w-40 shrink-0 overflow-hidden rounded-lg bg-neutral-900">
                                                <img
                                                    src={video.thumbnail}
                                                    alt={video.title}
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                                <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] font-medium text-white">
                                                    {formatDuration(video.duration)}
                                                </span>
                                            </div>

                                            {/* Details */}
                                            <div className="min-w-0 flex-1">
                                                <h3 className="line-clamp-2 text-sm font-semibold text-white/90 group-hover:text-purple-300 transition-colors">
                                                    {video.title}
                                                </h3>
                                                <p className="mt-1 truncate text-xs text-neutral-400">
                                                    {video.owner?.fullName || video.owner?.userName || "Creator"}
                                                </p>
                                                <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                                                    <span className="flex items-center gap-1">
                                                        <Eye size={12} />
                                                        {video.views || 0} views
                                                    </span>
                                                    <span>•</span>
                                                    <span>{formatTimeAgo(video.createdAt)}</span>
                                                </div>
                                            </div>
                                        </Link>

                                        {/* Remove Video from Playlist Button */}
                                        {isOwner && (
                                            <button
                                                type="button"
                                                onClick={(e) => handleRemoveVideo(e, video._id)}
                                                disabled={isBeingRemoved}
                                                className="shrink-0 rounded-lg p-2.5 text-neutral-400 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                                                title="Remove from playlist"
                                            >
                                                {isBeingRemoved ? (
                                                    <Loader2 size={18} className="animate-spin text-red-400" />
                                                ) : (
                                                    <Trash2 size={18} />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}