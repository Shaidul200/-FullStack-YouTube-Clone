import { useState } from "react";
import { useSelector } from "react-redux";
import {
    useCreateTweetMutation,
    useGetUserTweetsQuery,
    useDeleteTweetMutation,
    useUpdateTweetMutation,
} from "../services/tweetApi.js";
import { Loader } from "../components";
import { Pencil, Send, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "just now";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;

    const years = Math.floor(months / 12);
    return `${years} year${years === 1 ? "" : "s"} ago`;
}

const MyTweet = () => {
    const currentUserId = useSelector((state) => state.auth?.user?.data?._id);
    const currentUserFullName = useSelector(
        (state) => state.auth?.user?.data?.fullName
    );

    const { data: tweets, isLoading } = useGetUserTweetsQuery(currentUserId, {
        skip: !currentUserId,
    });

    const [createTweet, { isLoading: isCreating }] = useCreateTweetMutation();
    const [deleteTweet] = useDeleteTweetMutation();
    const [updateTweet, { isLoading: isUpdating }] = useUpdateTweetMutation();

    // The same composer is used for creating and editing tweets.
    const [content, setContent] = useState("");
    const [editingTweetId, setEditingTweetId] = useState(null);

    const tweetsData = tweets?.data?.[0]?.tweets ?? [];
    const userTweetsData = tweets?.data?.[0] ?? {};
    const isEditing = editingTweetId !== null;
    const isSubmitting = isCreating || isUpdating;

    const handleDelete = async (tweetId) => {
        try {
            await deleteTweet(tweetId).unwrap();
            if (editingTweetId === tweetId) cancelEdit();
            toast.success("Tweet deleted successfully");
        } catch (error) {
            console.error(error);
            toast.error(error?.data?.message || "Failed to delete tweet");
        }
    };

    const startEdit = (tweet) => {
        setEditingTweetId(tweet._id);
        setContent(tweet.content ?? "");
        // Move the composer into view when editing from the feed.
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const cancelEdit = () => {
        setEditingTweetId(null);
        setContent("");
    };

    const handleSubmit = async () => {
        const trimmedContent = content.trim();
        if (!trimmedContent) {
            toast.error("Tweet cannot be empty");
            return;
        }

        try {
            if (isEditing) {
                await updateTweet({
                    tweetId: editingTweetId,
                    content: trimmedContent,
                }).unwrap();
                toast.success("Tweet updated successfully");
                cancelEdit();
            } else {
                await createTweet(trimmedContent).unwrap();
                setContent("");
                toast.success("Tweet created successfully");
            }
        } catch (error) {
            console.error(error);
            toast.error(
                error?.data?.message ||
                    (isEditing ? "Failed to update tweet" : "Failed to create tweet")
            );
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader
                    width="50px"
                    hight="50px"
                    color="#8B5CF6"
                    animationDuration="1"
                />
            </div>
        );
    }

    return (
        <section className="mx-auto w-full max-w-3xl p-3 sm:p-5 lg:p-6 text-white">
            {/* Shared create/edit composer */}
            <div className="mb-6 rounded-2xl border border-neutral-800 bg-[#121212] p-4 sm:p-5">
                  <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold tracking-tight text-white max-sm:text-xl">
                    Your Community
                </h1>

                <p className="mt-1.5 max-w-xl text-sm leading-6 text-neutral-400">
                    Share your thoughts, post updates, and keep your
                    community connected. Your posts will appear here.
                </p>
            </div>
                <div className="overflow-hidden rounded-xl border border-neutral-700 bg-neutral-900">
                    {isEditing && (
                        <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2">
                            <span className="text-sm font-medium text-violet-300">
                                Editing tweet
                            </span>
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="flex items-center gap-1 text-sm text-gray-400 transition hover:text-white"
                            >
                                <X size={16} />
                                Cancel
                            </button>
                        </div>
                    )}
                      

                    <textarea
                        value={content}
                        onChange={(event) => setContent(event.target.value)}
                        placeholder={isEditing ? "Edit your tweet..." : "Write a tweet"}
                        rows={4}
                        maxLength={280}
                        className="w-full resize-none bg-transparent px-4 pt-4 text-white outline-none placeholder:text-gray-500"
                    />

                    <div className="flex items-center justify-between border-t border-neutral-800 px-4 py-3 max-sm:px-2.5 max-sm:py-2">
                        <span className="text-xs text-gray-500">
                            {content.length}/280
                        </span>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting || !content.trim()}
                            className="flex items-center gap-2 rounded-full bg-[#8B5CF6] px-5 py-2 font-semibold text-white transition hover:bg-[#7C3AED] disabled:cursor-not-allowed disabled:opacity-50 max-sm:px-4 max-sm:py-1.5 max-sm:text-sm"
                        >
                            {isEditing ? <Pencil size={17} /> : <Send size={17} />}
                            {isSubmitting
                                ? isEditing
                                    ? "Saving..."
                                    : "Sending..."
                                : isEditing
                                  ? "Save changes"
                                  : "Send"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Tweet feed */}
            <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-[#121212] divide-y divide-neutral-800">
                {tweetsData.length === 0 && (
                    <div className="px-5 py-12 text-center text-gray-400">
                        No tweets yet.
                    </div>
                )}

                {tweetsData.map((tweet) => (
                    <article
                        key={tweet._id}
                        className="bg-[#121212] px-5 py-5 transition hover:bg-neutral-900 max-sm:px-3 max-sm:py-4"
                    >
                        <div className="flex items-start gap-3">
                            <img
                                src={userTweetsData.avatar || "/default-avatar.png"}
                                alt={userTweetsData.userName || "User"}
                                className="h-11 w-11 shrink-0 rounded-full object-cover max-sm:h-9 max-sm:w-9"
                            />

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="truncate font-semibold text-white max-sm:text-sm">
                                        {currentUserFullName || "User"}
                                    </p>
                                    <span className="text-sm text-gray-500">·</span>
                                    <p className="shrink-0 text-sm text-gray-500 max-sm:text-xs">
                                        {formatTimeAgo(tweet.createdAt)}
                                    </p>
                                </div>
                                <p className="text-sm text-gray-500 max-sm:text-xs">
                                    @{userTweetsData.userName || "reactpatterns"}
                                </p>
                            </div>
                        </div>

                        <div className="ml-14 mt-3 max-sm:ml-0 max-sm:mt-2">
                            <p className="break-words whitespace-pre-wrap text-[15px] leading-6 text-gray-200 max-sm:text-sm">
                                {tweet.content}
                            </p>

                            <div className="mt-5 flex items-center gap-8 text-sm text-gray-500 max-sm:mt-3 max-sm:gap-5">
                                <button
                                    type="button"
                                    onClick={() => startEdit(tweet)}
                                    className="ml-auto flex items-center gap-2 transition hover:text-blue-400"
                                >
                                    <Pencil size={17} />
                                    <span>{editingTweetId === tweet._id ? "Editing" : "Edit"}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(tweet._id)}
                                    className="flex items-center gap-2 transition hover:text-red-400"
                                >
                                    <Trash2 size={17} />
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
};

export default MyTweet;
