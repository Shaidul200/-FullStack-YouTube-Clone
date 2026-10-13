import React from "react";
import Input from "../Input";
import {useForm} from "react-hook-form"
import { useNavigate } from "react-router-dom";

export default function SearchBar ({onSearch}){
    const navigate = useNavigate();
     const {
         register,
         handleSubmit
     } = useForm()
     
     const queryHandler = (data) => {
       navigate(`/home?query=${encodeURIComponent(data.query)}`);
     }
    return (
        <form onSubmit={handleSubmit(queryHandler)}>  
        <Input
        type="text"
        placeholder="Search"
        {...register("query")}
        />
        </form>
    )
    
}