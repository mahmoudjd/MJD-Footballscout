"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/lib/hooks/use-toast";
import { OutlineIcons } from "@/components/outline-icons";
import Image from "next/image"; // Stelle sicher, dass dort ein Google-Icon existiert

export default function LoginPage() {
    const router = useRouter();
    const toast = useToast();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await signIn("credentials", {
            redirect: false,
            email: form.email,
            password: form.password,
        });

        if (res?.ok) {
            toast.success("Login successful");
            router.push(callbackUrl);
        } else {
            setError("Invalid credentials");
        }
    };

    const handleGoogleLogin = async () => {
        await signIn("google", { callbackUrl });
    };

    return (
        <div className="max-w-md mx-auto flex flex-col justify-center items-center space-y-6 mt-16 p-4 sm:p-8 bg-white shadow-xl rounded-xl">
            <h2 className="text-2xl font-semibold mb-4">Login</h2>

            <form onSubmit={handleSubmit} className="space-y-4 w-full">
                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 hover:border-gray-400 transition-colors duration-200 rounded"
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 hover:border-gray-400 transition-colors duration-200 rounded"
                />
                <button
                    type="submit"
                    className="w-full p-2 bg-cyan-600 hover:bg-cyan-500 transition cursor-pointer text-white rounded"
                >
                    Login
                </button>
                {error && <p className="text-red-500 text-sm">{error}</p>}
            </form>

            <div className="w-full flex justify-between items-center space-x-4">
                <hr className="flex-grow border-t border-gray-300" />
                <span className="text-gray-400 text-sm">OR</span>
                <hr className="flex-grow border-t border-gray-300" />
            </div>

            <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center cursor-pointer space-x-2 p-2 bg-white border border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-colors duration-200 rounded"
            >
                <Image
                    src="/google-logo.png"
                    width={20}
                    height={20}
                    className="w-5 h-5 mr-2"
                    alt="google-logo"
                />
                <span className="text-sm font-medium text-gray-700">Login with Google</span>
            </button>

            <div className="w-full flex justify-center mt-4">
                <p>
                    Don't have an account?{" "}
                    <Link href="/signup" className="text-cyan-600 hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
