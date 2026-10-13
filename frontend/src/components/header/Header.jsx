import React from "react";
import Logo from "../Logo";
import SearchBar from "./SearchBar";
import LogoutBtn from "../header/LogoutBtn"
import ShowAvatar from "./ShowAvatar";


export default function Header() {
    return (
        <header className="fixed top-0 left-0 z-50 flex h-16 w-full items-center justify-between border-b border-neutral-800 bg-black px-3 sm:px-5 sm:grid sm:grid-cols-3">
            <div className="justify-self-start shrink-0">
                <Logo className="h-7 sm:h-9 md:h-10 w-auto" />
            </div>

            <div className="w-full max-w-xl justify-self-center px-2 sm:px-4 min-w-0 flex-1 sm:flex-initial">
                <SearchBar />
            </div>

            <div className="flex items-center justify-self-end gap-2 sm:gap-4 shrink-0">
                <LogoutBtn />
                <div className="shrink-0">
                    <ShowAvatar />
                </div>
            </div>
        </header>
    );
}        