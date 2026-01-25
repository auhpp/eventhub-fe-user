import React, { useContext } from "react";
import { Bell, Loader2 } from "lucide-react";
import { AuthContext } from "@/context/AuthContex";


const OrganizerHeader = () => {
    const { user, isLoading } = useContext(AuthContext)
    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
    };

    return (
        <header className="h-16 bg-card border-b border-border flex items-center justify-end px-6 shrink-0 transition-colors sticky top-0 z-20">
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="relative p-2 text-muted-foreground hover:bg-accent rounded-full transition-colors">
                    <Bell size={24} />
                    <span className="absolute top-2 right-2 size-2 bg-destructive rounded-full border-2 border-card"></span>
                </button>

                {/* Divider */}
                <div className="h-8 w-[1px] bg-border mx-1"></div>

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-2">
                    {
                        isLoading ? (
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        ) : (
                            <>
                                <div className="flex flex-col items-end hidden sm:flex">
                                    <p className="text-sm font-bold text-foreground leading-none">
                                        {user.fullName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {user.email}
                                    </p>
                                </div>
                                <div className="h-9 w-9 rounded-full border border-gray-200 bg-gray-100 overflow-hidden flex items-center justify-center hover:ring-2 hover:ring-brand hover:ring-offset-1 transition-all">
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.fullName}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-sm font-bold text-gray-600">
                                            {getInitials(user.fullName)}
                                        </span>
                                    )}

                                </div>
                            </>
                        )
                    }

                </div>
            </div>
        </header>
    );
};

export default OrganizerHeader