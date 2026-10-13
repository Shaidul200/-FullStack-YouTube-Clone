import React from "react";
import { Input, Button } from "../components";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import {login as authLogin} from "../features/auth/authSlice"
import { useDispatch } from "react-redux";
import {useLoginMutation} from "../services/userApi"
import { useState } from "react";


export default function Login(){
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [ loginApi,{isLoading}]= useLoginMutation()
    
     const {
            register,
            handleSubmit,
        } = useForm();
        const [error, setError] = useState("")
    
        const login = async(data)=>{
            setError("")
            try{
                const response = await loginApi(data).unwrap()
                if(response){
                    dispatch(authLogin(response))
                    navigate("/home")
                }
                console.log("login response", response)
            }
            catch(error){
                setError(error?.data?.message || "Something went wrong")
                 
            }
        }
    

    return(
        <div className="flex min-h-screen items-center justify-center bg-black px-4 py-8 sm:px-6">
        
                    <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-6 sm:p-8 shadow-2xl">
        
                          <h1 className="mb-2 text-2xl font-bold text-white max-sm:text-xl">
                             Login your <span className="text-purple-500">account</span>
                  </h1>
        
                        <div className="mb-8 flex flex-col items-center"></div>
        
                        <form
                            onSubmit={handleSubmit(login)}
                            className="space-y-5"
                        >
                            <Input
                                label="Username"
                                type="text"
                                placeholder="Enter your username"
                                {...register("userName",{
                                    required : "Username is required",
                                    minLength : {
                                        value : 3,
                                        message : "Username must be at least 3 characters long"
                                    },
                                    maxLength : {
                                        value : 20,
                                        message : "Username must be at most 20 characters long"
                                    }
                                })}
                            />
                            <Input
                                label="Email"
                                type="email"
                                placeholder="Enter your email"
                                {...register("email",{
                                    required: "Email is required",
                                    pattern : {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Email is not valid"
                                    }
                                })}
                            />
        
                            <Input
                                label="Password"
                                type="password"
                                placeholder="Enter your password"
                                {...register("password",{
                                    required: "Password is required",
                                })}
                            />
        
                            <Button
                                type="submit"
                                disabled={isLoading}
 className="w-full rounded-md bg-purple-500 py-2.5 font-medium text-black hover:bg-purple-600 focus:outline-none"                               
                            >
                                {isLoading ? "Logging in..." : "Login"}
                            </Button>
        
                        </form>

                        {error && <p className="mt-4 text-sm text-red-500 text-center">{error}</p>}
                        <div className="mt-5 flex justify-center text-sm">
                            <p className="mr-2 text-gray-400">Don't have an account?</p>
                            <Link
                                to="/register"
                                className="font-semibold text-purple-500 hover:underline"
                            >
                                Sign up
                            </Link>
                        </div>
        
                    </div>
        
                </div>
            );
        }