import React from "react";
import { Link } from "react-router-dom";

export default function AuthHeader() {
    return (
        <header className="h-16 w-full bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 px-6 lg:px-10 flex items-center justify-between sticky top-0 z-50">
            {/* Logo Section */}
            <Link to="/" className="flex items-center gap-3">
                <div className="text-blue-600">
                    <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-8 h-8"
                    >
                        <path
                            d="M12 2L2 7L12 12L22 7L12 2Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M2 17L12 22L22 17"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M2 12L12 17L22 12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    EventHub
                </span>
            </Link>
        </header>
    );
};