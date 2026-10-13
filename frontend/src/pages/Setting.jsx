import React, { useEffect, useState } from "react";
import { Mail, Upload, Check } from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
    useUpdateAvatarMutation,
    useUpdateCoverImageMutation,
    useChangePasswordMutation,
    useUpdateAccountDetailsMutation,
} from "../services/userApi";

export default function Setting() {
    const user = useSelector((state) => state.auth?.user?.data);

    const [updateAvatar] = useUpdateAvatarMutation();
    const [updateCoverImage] = useUpdateCoverImageMutation();
    const [changePassword] = useChangePasswordMutation();
    const [updateAccountDetails] = useUpdateAccountDetailsMutation();

    // Account details
    const [updatedFullName, setUpdatedFullName] = useState(
        user?.fullName ?? ""
    );
    const [updatedEmail, setUpdatedEmail] = useState(
        user?.email ?? ""
    );

    // Image files and previews
    const [avatarFile, setAvatarFile] = useState(null);
    const [coverImageFile, setCoverImageFile] = useState(null);

    const [avatarPreview, setAvatarPreview] = useState(null);
    const [coverImagePreview, setCoverImagePreview] = useState(null);

    // Password fields
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [isSaving, setIsSaving] = useState(false);

    // Synchronize account fields if the user data loads asynchronously.
    useEffect(() => {
        setUpdatedFullName(user?.fullName ?? "");
        setUpdatedEmail(user?.email ?? "");
    }, [user?.fullName, user?.email]);

    // Release temporary browser URLs when previews change or the
    // component unmounts.
    useEffect(() => {
        return () => {
            if (avatarPreview) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);

    useEffect(() => {
        return () => {
            if (coverImagePreview) {
                URL.revokeObjectURL(coverImagePreview);
            }
        };
    }, [coverImagePreview]);

    // Preview a newly selected avatar without uploading it.
    const handleAvatarChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    // Preview a newly selected cover image without uploading it.
    const handleCoverImageChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        setCoverImageFile(file);
        setCoverImagePreview(URL.createObjectURL(file));
    };

    const saveAccountDetails = async (event) => {
        event.preventDefault();

        if (isSaving) return;

        // Determine whether the password section was used.
        const passwordFieldsFilled = [
            currentPassword,
            newPassword,
            confirmPassword,
        ].some((value) => value.trim() !== "");

        // Validate the password fields before sending any API requests.
        if (passwordFieldsFilled) {
            if (
                !currentPassword.trim() ||
                !newPassword.trim() ||
                !confirmPassword.trim()
            ) {
                toast.error("Please complete all three password fields.");
                return;
            }

            if (newPassword !== confirmPassword) {
                toast.error("New password and confirmation do not match.");
                return;
            }

            if (newPassword === currentPassword) {
                toast.error(
                    "Your new password must differ from your current password."
                );
                return;
            }
        }

        const accountDetailsChanged =
            updatedFullName !== user?.fullName ||
            updatedEmail !== user?.email;

        const passwordChanged = passwordFieldsFilled;

        const hasChanges =
            accountDetailsChanged ||
            avatarFile !== null ||
            coverImageFile !== null ||
            passwordChanged;

        if (!hasChanges) {
            toast("No changes to save.", {
                icon: "ℹ️",
            });
            return;
        }

        setIsSaving(true);

        try {
            // 1. Update account details only if a field changed.
            if (accountDetailsChanged) {
                await updateAccountDetails({
                    fullName: updatedFullName,
                    email: updatedEmail,
                }).unwrap();
            }

            // 2. Update the avatar only if a new file was selected.
            if (avatarFile) {
                const formData = new FormData();
                formData.append("avatar", avatarFile);

                await updateAvatar(formData).unwrap();

                setAvatarFile(null);
                setAvatarPreview(null);
            }

            // 3. Update the cover image only if a new file was selected.
            if (coverImageFile) {
                const formData = new FormData();
                formData.append("coverImage", coverImageFile);

                await updateCoverImage(formData).unwrap();

                setCoverImageFile(null);
                setCoverImagePreview(null);
            }

            // 4. Change the password only when the password fields are filled.
            if (passwordChanged) {
                await changePassword({
                    oldPassword: currentPassword,
                    newPassword,
                    confirmPassword,
                }).unwrap();

                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }

            toast.success("Settings updated successfully.");
        } catch (error) {
            toast.error(
                error?.data?.message ||
                    error?.message ||
                    "Failed to update settings."
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 px-4 py-4 text-white sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
                <form
                    onSubmit={saveAccountDetails}
                    className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl"
                >
                    {/* Public profile */}
                    <div className="border-b border-zinc-800 px-6 py-5">
                        <h2 className="text-lg font-semibold">
                            Public profile
                        </h2>
                        <p className="mt-1 text-sm text-zinc-400">
                            Update how other people see you.
                        </p>
                    </div>

                    {/* Cover image and avatar */}
                    <div className="relative">
                        <div className="group relative h-48 overflow-hidden bg-zinc-800 sm:h-60">
                            <img
                                src={
                                    coverImagePreview ||
                                    user?.coverImage ||
                                    ""
                                }
                                alt="Cover image preview"
                                className="h-full w-full object-cover"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 to-transparent" />

                            <label className="absolute right-3 top-3 sm:right-4 sm:top-4 inline-flex cursor-pointer items-center gap-1.5 sm:gap-2 rounded-lg border border-white/10 bg-zinc-950/80 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-white backdrop-blur transition hover:bg-zinc-800">
                                <Upload size={15} className="sm:w-[17px] sm:h-[17px]" strokeWidth={1.8} />
                                <span>Change cover</span>

                                <input
                                    type="file"
                                    name="coverImage"
                                    accept="image/*"
                                    onChange={handleCoverImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        <div className="relative px-4 sm:px-6 pb-6">
                            <div className="-mt-12 sm:-mt-16 flex flex-col gap-4 sm:flex-row sm:items-end">
                                <div className="group relative h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 shrink-0 rounded-full border-4 border-zinc-900 bg-zinc-800">
                                    <img
                                        src={
                                            avatarPreview ||
                                            user?.avatar ||
                                            "/default-avatar.png"
                                        }
                                        alt="Avatar preview"
                                        className="h-full w-full rounded-full object-cover"
                                    />

                                    <label
                                        title="Change avatar"
                                        className="absolute bottom-1 right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-zinc-900 bg-violet-600 text-white shadow-lg transition hover:bg-violet-500"
                                    >
                                        <Upload
                                            size={17}
                                            strokeWidth={1.8}
                                        />

                                        <input
                                            type="file"
                                            name="avatar"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                <div className="min-w-0 pb-1">
                                    <h3 className="truncate text-xl font-semibold">
                                        {updatedFullName || "Your name"}
                                    </h3>
                                    <p className="mt-1 text-sm text-zinc-400">
                                        @{user?.userName}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Personal information */}
                    <div className="border-t border-zinc-800 px-6 py-6 sm:px-8">
                        <h2 className="text-lg font-semibold">
                            Personal information
                        </h2>
                        <p className="mt-1 text-sm text-zinc-400">
                            Keep your account details up to date.
                        </p>

                        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="fullName"
                                    className="mb-2 block text-sm font-medium text-zinc-300"
                                >
                                    Full name
                                </label>

                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    value={updatedFullName}
                                    onChange={(event) =>
                                        setUpdatedFullName(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter your full name"
                                    autoComplete="name"
                                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-medium text-zinc-300"
                                >
                                    Email address
                                </label>

                                <div className="relative">
                                    <Mail
                                        className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500"
                                        strokeWidth={1.8}
                                    />

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={updatedEmail}
                                        onChange={(event) =>
                                            setUpdatedEmail(
                                                event.target.value
                                            )
                                        }
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Change password */}
                    <div className="border-t border-zinc-800 px-6 py-6 sm:px-8">
                        <h2 className="text-lg font-semibold">
                            Change password
                        </h2>
                        <p className="mt-1 text-sm text-zinc-400">
                            Use a strong password you do not use elsewhere.
                        </p>

                        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="currentPassword"
                                    className="mb-2 block text-sm font-medium text-zinc-300"
                                >
                                    Current password
                                </label>

                                <input
                                    id="currentPassword"
                                    name="currentPassword"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(event) =>
                                        setCurrentPassword(
                                            event.target.value
                                        )
                                    }
                                    autoComplete="current-password"
                                    placeholder="Enter current password"
                                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="newPassword"
                                    className="mb-2 block text-sm font-medium text-zinc-300"
                                >
                                    New password
                                </label>

                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(event) =>
                                        setNewPassword(event.target.value)
                                    }
                                    autoComplete="new-password"
                                    placeholder="Enter new password"
                                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label
                                    htmlFor="confirmPassword"
                                    className="mb-2 block text-sm font-medium text-zinc-300"
                                >
                                    Confirm new password
                                </label>

                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(event) =>
                                        setConfirmPassword(
                                            event.target.value
                                        )
                                    }
                                    autoComplete="new-password"
                                    placeholder="Re-enter your new password"
                                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                                />

                                {confirmPassword &&
                                    newPassword !== confirmPassword && (
                                        <p className="mt-2 text-sm text-red-400">
                                            Passwords do not match.
                                        </p>
                                    )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col-reverse gap-3 border-t border-zinc-800 bg-zinc-950/50 px-4 py-4 sm:px-8 sm:py-5 sm:flex-row sm:items-center sm:justify-end">
                        <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => {
                                setUpdatedFullName(user?.fullName ?? "");
                                setUpdatedEmail(user?.email ?? "");

                                setAvatarFile(null);
                                setAvatarPreview(null);

                                setCoverImageFile(null);
                                setCoverImagePreview(null);

                                setCurrentPassword("");
                                setNewPassword("");
                                setConfirmPassword("");
                            }}
                            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-zinc-700 px-5 py-2.5 sm:py-3 text-sm font-medium text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 sm:py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Check
                                className="h-4 w-4"
                                strokeWidth={1.8}
                            />

                            {isSaving ? "Saving changes..." : "Save changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}