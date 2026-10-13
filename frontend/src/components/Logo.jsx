import React from "react";
import logo from "../../public/logo.png"

export default function Logo({ width, height, className = "h-8 sm:h-10 w-auto" }) {
    const style = (width || height) ? { width, height } : undefined;
    return (
        <img
            src={logo}
            alt="logo"
            style={style}
            className={`object-contain ${className}`}
        />
    );
}