import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ThumbsUp, History, Video, Folder, UserCheck, Settings, Users } from 'lucide-react';

export default function SideBar() {
    const routes = [
        { name: "Home", icon: Home, path: "/home" },
        { name: "Subscriptions", icon: UserCheck, path: "/subscriptions" },
        { name: "Community", icon: Users, path: "/community" },
        { name: "Dashboard", icon: Video, path: "/user-dashboard" },
        { name: "History", icon: History, path: "/video-history" },
        { name: "Liked", icon: ThumbsUp, path: "/liked-videos" },
        { name: "Playlists", icon: Folder, path: "/my-playlist" },
        { name: "Setting", icon: Settings, path: "/settings" }
    ];

    return (
        <aside className="hidden md:flex md:flex-col fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-56 lg:w-64 bg-black p-2 border-r border-neutral-900 overflow-y-auto">
            {routes.map((route) => (
                <NavLink
                    key={route.name}
                    to={route.path}
                    className={({ isActive }) =>
                        `flex items-center gap-x-3 p-3 mb-1.5 rounded-xl transition-colors ${
                            isActive
                                ? "bg-purple-600 text-white font-medium shadow-md shadow-purple-600/20"
                                : "text-white/80 hover:bg-neutral-800 hover:text-white"
                        }`
                    }
                >
                    <route.icon size={20} className="shrink-0" />
                    <span className="text-sm font-medium">
                        {route.name}
                    </span>
                </NavLink>
            ))}
        </aside>
    );
}

