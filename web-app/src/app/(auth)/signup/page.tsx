"use client";

import {useRouter} from "next/navigation";
import {useState} from "react";
import Link from "next/link";
import {registerUser} from "@/lib/hooks/register-user";
import {signIn} from "next-auth/react";

export default function SignupPage() {
    const router = useRouter();
    const [form, setForm] = useState({name: "", email: "", password: ""});
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({...form, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
                    value={form.name}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                />
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
                        className="w-full p-2 bg-cyan-600 cursor-pointer hover:bg-cyan-500 transition text-white rounded">Signup
                </button>
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <hr/>

                <div className="w-full flex">
                    <p>Already have an account,{" "}
                        <Link href="/login" className="text-cyan-600 hover:underline">login</Link></p>
                </div>
            </form>
        </div>
    );
}
