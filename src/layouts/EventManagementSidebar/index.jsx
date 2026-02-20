import React from "react";
import {
    ArrowLeft,
    Edit,
    GalleryHorizontalEnd,
    PanelsTopLeft,
    PersonStanding,
    User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { Link, useParams, useLocation } from "react-router-dom";
const EventManagementSidebar = () => {
    const { id } = useParams();
    const location = useLocation();

    const navItems = [
        { label: "Tổng quan", icon: PanelsTopLeft, href: routes.eventOverview.replace(":id", id) },
        { label: "Người tham gia", icon: PersonStanding, href: routes.eventAttendee.replace(":id", id) },
    ];
    const eventSettingnavItems = [
        { label: "Chỉnh sửa", icon: Edit, href: routes.editEvent.replace(":id", id) },
        { label: "Thành viên", icon: User, href: routes.eventStaffManagement.replace(":id", id) },
        { label: "Ảnh", icon: GalleryHorizontalEnd, href: routes.eventGallery.replace(":id", id) },


    ];
    return (
        <aside className="w-60 bg-card border-r border-border hidden lg:flex flex-col flex-shrink-0 h-screen sticky top-0">
            <div className="flex flex-col h-full p-4">
                {/* Logo Section */}
                <div className="flex items-center gap-3 px-2 mb-2 mt-2">
                    <div className="bg-primary rounded-xl size-10 shadow-sm
                     flex items-center justify-center text-primary-foreground font-bold text-xl">
                        EA
                    </div>
                    <h1 className="text-lg font-bold tracking-tight text-foreground">
                        EventAdmin
                    </h1>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-1.5 flex-1 mt-6">
                    {navItems.map((item, index) => {
                        const isActive = location.pathname.startsWith(item.href);

                        return (
                            <Button
                                key={index}
                                variant={isActive ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start gap-3 h-10 font-medium",
                                    isActive
                                        ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary font-bold"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                                asChild
                            >
                                <Link to={item.href}>
                                    <item.icon className={cn("size-5", isActive && "stroke-[2.5px]")} />
                                    {item.label}
                                </Link>
                            </Button>
                        )
                    })}
                    <div className="px-2 mb-2 text-sm font-medium text-muted-foreground">
                        Cài đặt sự kiện
                    </div>
                    {eventSettingnavItems.map((item, index) => {
                        const isActive = location.pathname.startsWith(item.href);

                        return (
                            <Button
                                key={index}
                                variant={isActive ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start gap-3 h-10 font-medium",
                                    isActive
                                        ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary font-bold"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                                asChild
                            >
                                <Link to={item.href}>
                                    <item.icon className={cn("size-5", isActive && "stroke-[2.5px]")} />
                                    {item.label}
                                </Link>
                            </Button>
                        )
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="pt-2 border-t">
                    <Link
                        to={routes.eventManagement}
                        className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-brand bg-muted/50 hover:bg-brand/10 rounded-xl transition-all border border-transparent hover:border-brand/20 group">
                        <ArrowLeft className="size-5 group-hover:-translate-x-1 transition-transform" />
                        <div className="flex flex-col">
                            <span className="text-sm font-bold leading-none">Về trang quản trị</span>
                        </div>
                    </Link>
                </div>
            </div>
        </aside>
    );
};

export default EventManagementSidebar;