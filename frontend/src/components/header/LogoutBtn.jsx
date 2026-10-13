import React from "react";
import Button from "../Button";
import { useLogoutMutation } from "../../services/userApi"
import {useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux";
import {logout} from "../../features/auth/authSlice"

export default function LogoutBtn (){
    const [logoutApi] = useLogoutMutation();
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const handleLogout = async () => {
        try {
            const response = await logoutApi().unwrap();
            dispatch(logout());
            console.log("Logout response:", response);
        } catch (error) {
            console.log("Logout error:", error);
        }
        navigate("/login")
    }
    return (
        <Button
            onClick={handleLogout}
            className="rounded-md bg-purple-500 py-1.5 px-2.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-medium text-black hover:bg-purple-600 whitespace-nowrap"
        >
            Log Out
        </Button>
    );
}