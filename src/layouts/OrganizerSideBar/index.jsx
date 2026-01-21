import React from "react";
import {
    Plus,
    CalendarDays,
    ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { Link, useNavigate } from "react-router-dom";

const OrganizerSidebar = () => {
    const navItems = [
        { label: "Sự kiện của tôi", icon: CalendarDays, href: routes.eventManagement, active: true },
    ];
    const navigate = useNavigate()

    return (
        <aside className="w-60 bg-card border-r border-border hidden lg:flex flex-col flex-shrink-0 h-screen sticky top-0">
            <div className="flex flex-col h-full p-4">
                {/* Logo Section */}
                <div className="flex items-center gap-3 px-2 mb-2 mt-2">
                    <div className="bg-primary rounded-xl size-10 shadow-sm flex items-center justify-center
                     text-primary-foreground font-bold text-xl">
                        EA
                    </div>
                    <h1 className="text-lg font-bold tracking-tight text-foreground">
                        EventAdmin
                    </h1>
                </div>
                <div className="py-2 mb-2">
                    <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-lg shadow-brand/30"
                        onClick={() => navigate(routes.createEvent)}
                    >


                        <Plus className="size-5" />
                        Tạo sự kiện mới
                    </Button>
                </div>
                {/* Navigation */}
                <nav className="flex flex-col gap-1.5 flex-1">
                    {navItems.map((item, index) => (
                        <Button
                            key={index}
                            variant={item.active ? "secondary" : "ghost"}
                            className={cn(
                                "w-full justify-start gap-3 h-10 font-medium",
                                item.active
                                    ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary font-bold" // Custom active style
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                            asChild
                        >
                            <Link to={item.href}>
                                <item.icon className={cn("size-5", item.active && "stroke-[2.5px]")} />

                                {item.label}
                            </Link>
                        </Button>
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div className="pt-2 border-t">
                    <Link
                        to={routes.home}
                        className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-brand bg-muted/50 hover:bg-brand/10 rounded-xl transition-all border border-transparent hover:border-brand/20 group">
                        <ArrowLeft className="size-5 group-hover:-translate-x-1 transition-transform" />
                        <div className="flex flex-col">
                            <span className="text-sm font-bold leading-none">Về trang chủ</span>
                            <span className="text-[10px] mt-1 opacity-70">Giao diện người dùng</span>
                        </div>
                    </Link>
                </div>
            </div>
        </aside>
    );
};

export default OrganizerSidebar;