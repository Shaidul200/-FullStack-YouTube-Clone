
import React from "react";
import { X, Plus, Check, ListVideo } from "lucide-react";

export default function SaveToPlaylist({
    open,
    onClose,
    playlists = [],
    selectedPlaylistIds = [],
    onSelectPlaylist,
    onCreatePlaylist,
}) {
    if (!open) return null;

    return (
        <div
            className="
                fixed
                inset-0
                z-50
                flex
                items-center
                justify-center
                bg-black/60
                px-4
                backdrop-blur-sm
            "
            onClick={onClose}
        >

            {/* Modal */}
            <div
                className="
                    w-full
                    max-w-md
                    max-h-[90vh]
                    flex
                    flex-col
                    overflow-hidden
                    rounded-2xl
                    border
                    border-white/10
                    bg-[#111111]/95
                    shadow-2xl
                    backdrop-blur-xl
                "
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header */}
                <div
                    className="
                        flex
                        items-center
                        justify-between
                        border-b
                        border-white/10
                        px-5
                        py-4
                    "
                >
                    <div className="flex items-center gap-3">

                        <div
                            className="
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-lg
                                bg-white/10
                                text-white
                            "
                        >
                            <ListVideo size={19} />
                        </div>

                        <div>
                            <h2 className="text-base font-semibold text-white">
                                Save to playlist
                            </h2>

                            <p className="text-xs text-neutral-500">
                                Choose where to save this video
                            </p>
                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            rounded-full
                            p-2
                            text-neutral-400
                            transition
                            hover:bg-white/10
                            hover:text-white
                        "
                    >
                        <X size={19} />
                    </button>
                </div>


                {/* Playlist list */}
                <div className="max-h-[360px] overflow-y-auto p-3">

                    {playlists.length > 0 ? (
                        <div className="space-y-1">

                            {playlists.map((playlist) => {

                                const isSelected =
                                    selectedPlaylistIds.includes(playlist._id);

                                return (
                                    <button
                                        key={playlist._id}
                                        type="button"
                                        onClick={() =>
                                            onSelectPlaylist(playlist._id)
                                        }
                                        className="
                                            flex
                                            w-full
                                            items-center
                                            gap-3
                                            rounded-xl
                                            px-3
                                            py-3
                                            text-left
                                            transition
                                            hover:bg-white/5
                                        "
                                    >

                                        {/* Checkbox */}
                                        <div
                                            className={`
                                                flex
                                                h-5
                                                w-5
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-md
                                                border
                                                transition
                                                ${
                                                    isSelected
                                                        ? "border-white bg-white text-black"
                                                        : "border-white/20 bg-white/5 text-transparent"
                                                }
                                            `}
                                        >
                                            <Check size={14} />
                                        </div>


                                        {/* Playlist icon */}
                                        <div
                                            className="
                                                flex
                                                h-10
                                                w-10
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-lg
                                                border
                                                border-white/10
                                                bg-white/5
                                                text-neutral-400
                                            "
                                        >
                                            <ListVideo size={18} />
                                        </div>


                                        {/* Playlist information */}
                                        <div className="min-w-0 flex-1">

                                            <p
                                                className="
                                                    truncate
                                                    text-sm
                                                    font-medium
                                                    text-white/90
                                                "
                                            >
                                                {playlist.name}
                                            </p>

                                            {playlist.description && (
                                                <p
                                                    className="
                                                        mt-0.5
                                                        truncate
                                                        text-xs
                                                        text-neutral-500
                                                    "
                                                >
                                                    {playlist.description}
                                                </p>
                                            )}

                                        </div>

                                    </button>
                                );
                            })}

                        </div>
                    ) : (
                        <div
                            className="
                                flex
                                flex-col
                                items-center
                                justify-center
                                px-6
                                py-10
                                text-center
                            "
                        >
                            <div
                                className="
                                    mb-3
                                    flex
                                    h-12
                                    w-12
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-white/5
                                    text-neutral-500
                                "
                            >
                                <ListVideo size={22} />
                            </div>

                            <p className="text-sm font-medium text-white">
                                No playlists yet
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                                Create a playlist to save this video.
                            </p>
                        </div>
                    )}

                </div>


                {/* Footer */}
                <div
                    className="
                        border-t
                        border-white/10
                        p-3
                    "
                >

                    <button
                        type="button"
                        onClick={onCreatePlaylist}
                        className="
                            flex
                            w-full
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            border
                            border-white/10
                            bg-white/5
                            px-4
                            py-2.5
                            text-sm
                            font-medium
                            text-white
                            transition
                            hover:bg-white/10
                        "
                    >
                        <Plus size={17} />
                        Create new playlist
                    </button>

                </div>

            </div>
        </div>
    );
}
