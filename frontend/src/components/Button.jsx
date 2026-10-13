import React from "react";

export default function Button ({children,
    type="button",
    className = "", ...props})
{
    return (
        <button type={type}
        className={` 
           w-full rounded-md bg-purple-500 py-2.5 text-black font-medium hover:bg-purple-600 focus:outline-none ${className}`}
        {...props}>
        {children}
        </button>
    )
}