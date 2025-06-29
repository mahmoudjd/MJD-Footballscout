"use client";

import {signIn} from "next-auth/react";
import {useRouter, useSearchParams} from "next/navigation";
import {useState} from "react";
import Link from "next/link";
import {useToast} from "@/lib/hooks/use-toast";


export default function LoginPage() {
    const router = useRouter();
    const toast = useToast()
    const [form, setForm] = useState({email: "", password: ""});
    const [error, setError] = useState("");
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({...form, [e.target.name]: e.target.value});
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

    return (
        <div className="max-w-md mx-auto flex flex-col justify-center items-center space-y-6 mt-16 p-4 sm:p-8 bg-white shadow-xl rounded-xl">
            <h2 className="text-2xl font-semibold mb-4">Login</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                />
                <button type="submit"
                        className="w-full p-2 bg-cyan-600 hover:bg-cyan-500 transition text-white rounded">Login
                </button>
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <hr/>

                <div className="w-full flex">
                    <p>You do not have an account,
                        <Link href="/signup" className="text-cyan-600 hover:underline">Signup</Link></p>
                </div>
            </form>
        </div>
    );
}
