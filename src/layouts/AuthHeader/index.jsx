import { Ticket } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

export default function AuthHeader() {
    return (
        <header className="h-16 w-full bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 px-6 lg:px-10 flex items-center justify-between sticky top-0 z-50">
            {/* Logo Section */}
            <Link to="/" className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
                    <Ticket className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    EventHub
                </span>
            </Link>
        </header>
    );
};