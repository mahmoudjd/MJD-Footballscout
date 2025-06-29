"use client";

import {useState} from "react";
import Link from "next/link";
import {registerUser} from "@/lib/hooks/register-user";
import {signIn} from "next-auth/react";
import Image from "next/image";

export default function SignupPage() {
    const [form, setForm] = useState({name: "", email: "", password: ""});
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({...form, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }
        if (!form.name || !form.password || !form.email) {
            setError("Please fill in all fields");
        }
        const registerData = await registerUser(form)
        if (registerData) {
            await signIn("credentials", {
                redirect: true,
                callbackUrl: "/",
                email: form.email,
                password: form.password,
            })
        }
    };

    return (
        <div
            className="max-w-md mx-auto flex flex-col justify-center items-center space-y-6 mt-16 p-4 sm:p-8 bg-white shadow-xl rounded-xl">
            <h2 className="text-2xl font-semibold">Create new account</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    name="name"
                    type="text"
                    placeholder="Name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 hover:border-gray-400 transition-colors duration-200 rounded"
                />
                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 hover:border-gray-400 transition-colors duration-200 rounded"
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 hover:border-gray-400 transition-colors duration-200 rounded"
                />
                <button type="submit"
                        className="w-full p-2 bg-cyan-600 cursor-pointer hover:bg-cyan-500 transition text-white rounded">Signup
                </button>
                {error && <p className="text-red-500 text-sm">{error}</p>}

            </form>
            <div className="w-full flex justify-between items-center space-x-4">
                <hr className="flex-grow border-t border-gray-300"/>
                <span className="text-gray-400 text-sm">OR</span>
                <hr className="flex-grow border-t border-gray-300"/>
            </div>
            <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="w-full flex items-center justify-center cursor-pointer space-x-2 p-2 bg-white border border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-colors duration-200 rounded"
            >
                <Image
                    src="/google-logo.png"
                    width={20}
                    height={20}
                    className="w-5 h-5 mr-2"
                    alt="google-logo"
                />
                <span className="text-sm font-medium text-gray-700">Register with Google</span>
            </button>

            <div className="w-full flex">
                <p>Already have an account,{" "}
                    <Link href="/login" className="text-cyan-600 hover:underline">login</Link></p>
            </div>
        </div>
    );
}
