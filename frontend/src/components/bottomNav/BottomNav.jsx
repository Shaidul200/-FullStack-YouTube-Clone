import React from "react";
import { NavLink } from "react-router-dom";
import { Home, UserCheck, Users, Video, History } from "lucide-react";

export default function BottomNav() {
    const bottomRoutes = [
        { name: "Home", icon: Home, path: "/home" },
        { name: "Subscriptions", icon: UserCheck, path: "/subscriptions" },
        { name: "Community", icon: Users, path: "/community" },
        { name: "Dashboard", icon: Video, path: "/user-dashboard" },
        { name: "History", icon: History, path: "/video-history" },
    ];

    return (
        <nav
            aria-label="Mobile Navigation"
            className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-black/95 backdrop-blur-md border-t border-neutral-800 md:hidden"
        >
            <div className="grid grid-cols-5 h-full max-w-lg mx-auto items-center px-1">
                {bottomRoutes.map((route) => (
                    <NavLink
                        key={route.name}
                        to={route.path}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center h-full py-1 px-0.5 rounded-lg transition-colors ${
                                isActive
                                    ? "text-purple-400 font-semibold"
                                    : "text-neutral-400 hover:text-white"
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <route.icon
                                    size={20}
                                    className={`shrink-0 transition-transform ${
                                        isActive ? "scale-110 text-purple-400" : "text-neutral-400"
                                    }`}
                                />
                                <span className="text-[10px] leading-tight truncate max-w-full text-center mt-1">
                                    {route.name}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
