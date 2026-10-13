import { Outlet, useLocation, useNavigate } from "react-router-dom";
import React, { useEffect } from "react";
import Header from "../components/header/Header";
import Sidebar from "../components/sideBar/SideBar";
import BottomNav from "../components/bottomNav/BottomNav";
import { useDispatch } from "react-redux";
import { login, logout } from "../features/auth/authSlice";
import { Loader } from "../components";
import { useGetCurrentUserQuery } from "../services/userApi";

export default function MainLayout() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { data, isLoading, isError } = useGetCurrentUserQuery();

    useEffect(() => {
        if (data) {
            dispatch(login(data));
            if (location.pathname === "/" || location.pathname === "") {
                navigate("/home");
            }
        }

        if (isError) {
            dispatch(logout());
            navigate("/login");
        }
    }, [data, isError, dispatch, navigate, location.pathname]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader
                    width="80"
                    height="80"
                    color="#a855f7"
                    animationDuration="0.7"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white overflow-x-hidden">
            <Header />

            <div className="flex w-full">
                <Sidebar />

                <main className="min-w-0 flex-1 pt-16 ml-0 md:ml-56 lg:ml-64 pb-20 md:pb-6">
                    <Outlet />
                </main>
            </div>

            <BottomNav />
        </div>
    );
}
