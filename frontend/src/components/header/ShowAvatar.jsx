import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { Settings, Folder, ThumbsUp, User } from "lucide-react";

export default function ShowAvatar() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const user = useSelector((state) => state.auth.user?.data || state.auth.user);

    const menuItems = [
        { name: "Settings", icon: Settings, path: "/settings" },
        { name: "Playlists", icon: Folder, path: "/my-playlist" },
        { name: "Liked Videos", icon: ThumbsUp, path: "/liked-videos" },
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("touchstart", handleClickOutside);
            document.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500/60 p-0.5 transition-transform active:scale-95"
                aria-label="User account menu"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                {user?.avatar ? (
                    <img
                        src={user.avatar}
                        alt={user?.fullName || "Profile"}
                        className="
                            h-9
                            w-9
                            sm:h-10
                            sm:w-10
                            aspect-square
                            rounded-full
                            cursor-pointer
                            object-cover
                            border
                            border-neutral-700
                            hover:border-purple-400
                            transition-colors
                        "
                    />
                ) : (
                    <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 text-sm font-semibold cursor-pointer hover:border-purple-400 transition-colors">
                        {user?.fullName ? user.fullName[0].toUpperCase() : <User size={18} />}
                    </div>
                )}
            </button>

            {isOpen && (
                <div
                    className="
                        absolute
                        right-0
                        top-full
                        mt-2
                        w-60
                        max-w-[calc(100vw-1.5rem)]
                        rounded-2xl
                        border
                        border-neutral-800
                        bg-[#121214]/95
                        backdrop-blur-xl
                        shadow-2xl
                        z-50
                        overflow-hidden
                        py-1.5
                    "
                    role="menu"
                >
                    {user && (
                        <div className="px-4 py-3 border-b border-neutral-800/80">
                            <p className="text-sm font-semibold text-white truncate">
                                {user.fullName || "User"}
                            </p>
                            {user.userName ? (
                                <p className="text-xs text-neutral-400 truncate">
                                    @{user.userName}
                                </p>
                            ) : user.email ? (
                                <p className="text-xs text-neutral-400 truncate">
                                    {user.email}
                                </p>
                            ) : null}
                        </div>
                    )}

                    <div className="py-1">
                        {menuItems.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                        isActive
                                            ? "bg-purple-500/15 text-purple-400 font-medium"
                                            : "text-neutral-300 hover:bg-neutral-800/80 hover:text-white"
                                    }`
                                }
                                role="menuitem"
                            >
                                <item.icon size={18} className="shrink-0" />
                                <span className="truncate">{item.name}</span>
                            </NavLink>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}