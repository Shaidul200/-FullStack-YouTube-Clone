import React from "react";
import Button from "../Button";
import {Link} from "react-router-dom";

export default function SignupBu (){
     return (
    <div className="flex items-center justify-center bg-[#121216]">
      <div className="relative inline-block bg-[#3a3a3a] rounded-sm">
        <Link to="/register">
        <Button
          type="button"
          className="
            relative
            block
            -translate-x-1.5 -translate-y-1.5
            active:translate-x-0 active:translate-y-0
            bg-[#a87ffb] hover:bg-[#b592fc]
            text-black font-bold text-lg
            px-3 py-2.5
            rounded-sm
            transition-transform duration-75 ease-out
            select-none cursor-pointer
            max-sm:text-xs
            max-sm:px-2
            max-sm:py-1.5
          "
        >
          Sign up
        </Button> </Link>
      </div>
    </div>
  );
}