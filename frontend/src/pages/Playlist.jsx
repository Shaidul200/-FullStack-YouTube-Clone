import React, { useState } from "react";
import { useGetUserPlaylistsQuery, useDeletePlaylistMutation } from "../services/playlistApi";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { 
    Plus, 
    ListVideo, 
    Trash2, 
    Play, 
    Folder, 
    LogIn, 
    Loader2 
} from "lucide-react";
import CreatePlaylist from "../components/CreatePlaylist";
import Loader from "../components/Loader";

export default function Playlist() {
    const user = useSelector((state) => state.auth.user?.data || state.auth.user);
    const userId = user?._id;
    const isAuthenticated = useSelector((state) => state.auth.status) || !!userId;

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [deletingPlaylistId, setDeletingPlaylistId] = useState(null);

    const { data: playlists, isLoading, error } = useGetUserPlaylistsQuery(userId, {
        skip: !userId,
    });
    const [deletePlaylist] = useDeletePlaylistMutation();

    const playlistData = playlists?.data || [];

    const handleDeletePlaylist = async (e, playlistId) => {
        e.preventDefault();
        e.stopPropagation();

        if (window.confirm("Are you sure you want to delete this playlist?")) {
            try {
                setDeletingPlaylistId(playlistId);
                await deletePlaylist(playlistId).unwrap();
            } catch (err) {
                console.error("Failed to delete playlist:", err);
            } finally {
                setDeletingPlaylistId(null);
            }
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400">
                    <LogIn size={32} />
                </div>
                <h2 className="text-xl font-bold text-white">Sign in to view playlists</h2>
                <p className="mt-2 max-w-sm text-sm text-neutral-400">
                    Sign in to create, organize, and manage your custom video playlists.
                </p>
                <Link
                    to="/login"
                    className="mt-6 rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-500"
                >
                    Sign In
                </Link>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <Loader width="80px" height="80px" color="#a87ffb" animationDuration="1" />
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen px-4 py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
                        <Folder size={22} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                            My Playlists
                        </h1>
                        <p className="text-xs text-neutral-400">
                            {playlistData.length} {playlistData.length === 1 ? "playlist" : "playlists"} available
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-500"
                >
                    <Plus size={18} />
                    <span>Create Playlist</span>
                </button>
            </div>

            {/* Playlists Grid */}
            {playlistData.length === 0 ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-neutral-500">
                        <ListVideo size={36} />
                    </div>
                    <h2 className="text-lg font-semibold text-white">No Playlists Found</h2>
                    <p className="mt-1.5 max-w-sm text-sm text-neutral-400">
                        Create custom playlists to organize your favorite videos for quick access.
                    </p>
                    <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="mt-6 flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-500"
                    >
                        <Plus size={18} />
                        <span>Create Your First Playlist</span>
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {playlistData.map((playlist) => {
                        const videoCount = playlist.videos?.length || 0;
                        const firstThumbnail = playlist.videos?.[0]?.thumbnail;
                        const isDeleting = deletingPlaylistId === playlist._id;

                        return (
                            <div
                                key={playlist._id}
                                className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#141416] shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/40 hover:shadow-purple-500/10"
                            >
                                <Link to={`/playlist/${playlist._id}`} className="block flex-1">
                                    {/* Thumbnail Banner */}
                                    <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
                                        {firstThumbnail ? (
                                            <img
                                                src={firstThumbnail}
                                                alt={playlist.name}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-900/40 via-neutral-900 to-black">
                                                <ListVideo size={36} className="text-purple-400/60" />
                                            </div>
                                        )}

                                        {/* Overlay & Video Count */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                        
                                        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 rounded-lg bg-black/80 px-2 py-1 text-xs font-medium text-white backdrop-blur-md">
                                            <Play size={12} fill="currentColor" />
                                            <span>{videoCount} {videoCount === 1 ? "video" : "videos"}</span>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <h3 className="line-clamp-1 text-base font-semibold text-white transition-colors group-hover:text-purple-300">
                                            {playlist.name}
                                        </h3>
                                        {playlist.description && (
                                            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-neutral-400">
                                                {playlist.description}
                                            </p>
                                        )}
                                    </div>
                                </Link>

                                {/* Delete Playlist Action */}
                                <div className="border-t border-white/5 px-4 py-2.5 flex items-center justify-between text-xs text-neutral-400">
                                    <Link
                                        to={`/playlist/${playlist._id}`}
                                        className="font-medium text-purple-400 hover:text-purple-300"
                                    >
                                        View Playlist →
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={(e) => handleDeletePlaylist(e, playlist._id)}
                                        disabled={isDeleting}
                                        className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                                        title="Delete Playlist"
                                    >
                                        {isDeleting ? (
                                            <Loader2 size={15} className="animate-spin text-red-400" />
                                        ) : (
                                            <Trash2 size={15} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Playlist Modal */}
            {isCreateModalOpen && (
                <CreatePlaylist
                    open={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    initialMode="create"
                />
            )}
        </div>
    );
}
