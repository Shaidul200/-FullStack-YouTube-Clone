import React from "react";
import { Input, Button } from "../components";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useRegisterMutation } from "../services/userApi";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login as authLogin } from "../features/auth/authSlice";
 
function Register() {

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm();
    const avatar = watch("avatar");

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [registerApi, { isLoading } ] = useRegisterMutation()
    const [error, setError] = useState("")
    
    
    const submit = async (data) => {
        setError("")
        const formData = new FormData()
            formData.append("fullName", data.fullName);
            formData.append("userName", data.userName);
            formData.append("email", data.email);
            formData.append("password", data.password);
            formData.append("avatar", data.avatar[0]);
         
        try {
            const response = await registerApi(formData).unwrap()
            console.log(response)
            if (response) {
                dispatch(authLogin(response))
                navigate("/home")
            }
        }
        catch (error) {
            setError(error?.data?.message || "Something went wrong")
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-black px-4 py-8 sm:px-6">
            <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-6 sm:p-8 shadow-2xl">

                  <h1 className="mb-2 text-2xl font-bold text-white max-sm:text-xl">
                        Create your <span className="text-purple-500">account</span>
                  </h1>
                  
                <form
                    onSubmit={handleSubmit(submit)}
                    className="space-y-5 mt-6"
                >
                    <div className="mb-8 flex flex-col items-center">
                        <label
                            htmlFor="avatar"
                            className="relative cursor-pointer"
                        >
                            <div className="relative">
    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-gray-700 bg-gray-900">
        {avatar?.[0] ? (
            <img
                src={URL.createObjectURL(avatar[0])}
                alt="Avatar preview"
                className="h-full w-full object-cover"
            />
        ) : (
            <span className="text-3xl text-gray-500">
                +
            </span>
        )}
    </div>

    <div className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 font-bold text-black">
        +
    </div>
</div>
                            <input
                                id="avatar"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                {...register("avatar")}
                            />

                            <p className="mt-2 text-sm text-gray-400">
                                Choose avatar
                            </p>
                        </label>
                    </div>

                    <Input
                        label="Full name"
                        placeholder="Enter your full name"
                        {...register("fullName", {
                            required : "Full name is required",
                            minLength : {
                                value : 3,
                                message : "Full name must be at least 3 characters long"
                            },
                            maxLength : {
                                value : 30,
                                message : "Full name must be at most 30 characters long"
                            }
                            
                        })}
                    />
                    {errors.fullName && (
                        <p className="text-sm text-red-500">{errors.fullName.message}</p>
                    )}
                    <Input
                        label="Username"
                        placeholder="Enter your username"
                        {...register("userName",{
                            required : "Username is required",
                            minLength : {
                                value : 3,
                                message : "Username must be at least 3 characters long"
                            },
                            maxLength : {
                                value : 25,
                                message : "Username must be at most 25 characters long"
                            },
                            pattern : {
                                value : /^[a-zA-Z0-9_]*$/,
                                message : "Username must be alphanumeric only"
                            }
                        }

                        )}
                    />
                    {errors.userName && (
                        <p className="text-sm text-red-500">{errors.userName.message}</p>
                    )}
                    <Input
                        label="Email"
                        type="email"
                        placeholder="Enter your email"
                        {...register("email", {
                            required : "Email is required",
                            pattern : {
                                value : /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message : "Email is not valid"
                            }
                        })}
                    />
                    {errors.email && (
                        <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                    <Input
                        label="Password"
                        type="password"
                        placeholder="Enter your password"
                        {...register("password", {
                            required : "Password is required",
                            minLength : {
                                value : 6,
                                message : "Password must be at least 6 characters long"
                            }
                        })}
                    />
                    {errors.password && (
                        <p className="text-sm text-red-500">{errors.password.message}</p>
                    )}
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full rounded-md bg-purple-500 py-2.5 font-medium text-black hover:bg-purple-600 focus:outline-none"
                    >
                        {isLoading ? "Creating account..." : "Sign up"}
                    </Button>

                    {error && <p className="mt-4 text-sm text-red-500 text-center">{error}</p>}
                    <div className="mt-2 flex justify-center text-sm">
                        <p className="mr-2 text-gray-400">Already have an account?</p>
                        <Link
                            to="/login"
                            className="font-semibold text-purple-500 hover:underline"
                        >
                            Login
                        </Link>
                    </div>

                </form>

            </div>

        </div>
    );
}

export default Register;