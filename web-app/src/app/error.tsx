'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';

export default function GlobalError({
                                        error,
                                        reset,
                                    }: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const [isResetting, setIsResetting] = useState(false);

    useEffect(() => {
        console.error('Global Error:', error);

        // Automatisches Signout bei 401
        if (error.message.includes('401')) {
            signOut({ callbackUrl: '/login' }); // Leitet nach Logout zur Login-Seite
        }
    }, [error]);

    const handleReset = () => {
        setIsResetting(true);
        reset();
    };

    return (
        <div className="flex justify-center items-center w-full p-8">
            <div className="max-w-md w-full rounded-lg shadow-lg bg-white p-6 text-center border border-red-300">
                <h2 className="text-3xl font-bold mb-4">💥 Oops! Something went wrong</h2>
                <p className="mb-4 text-base">{error.message}</p>
                {error.digest && (
                    <p className="mb-4 text-xs text-red-500">Error Code: {error.digest}</p>
                )}
                <button
                    onClick={handleReset}
                    disabled={isResetting}
                    className={`px-5 py-2.5 rounded-lg font-semibold transition-colors cursor-pointer
            ${isResetting
                        ? 'bg-red-300 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 text-white'}
          `}
                >
                    {isResetting ? 'Retrying...' : 'Try Again'}
                </button>
            </div>
        </div>
    );
}
