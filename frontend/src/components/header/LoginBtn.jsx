import React from "react";
import {Link} from "react-router-dom"

export default function LoginBtn (){
     return (
         
           <div className="flex items-center justify-center  bg-[#121216]"> 
             <Link to="/login">  
             <button
               type="button"
               className="
              px-2 py-1
                    text-white 
                    font-bold text-lg
                    hover:text-purple-400
                    transition-colors
                    max-sm:text-sm
                    max-sm:px-1
               "
             >
               Log in
             </button> </Link>
            </div>
           
         
       );
}