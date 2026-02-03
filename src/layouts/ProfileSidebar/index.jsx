import { IdCard, Ticket, ClipboardList, User, Key, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { Link } from "react-router-dom";

export default function ProfileSidebar() {
    const menuItems = [
        { icon: User, label: "Tài khoản", href: routes.profile },
        { icon: IdCard, label: "Đăng ký BTC", href: routes.organizerRegistration },
        { icon: Ticket, label: "Vé của tôi", href: routes.myTicket },
        { icon: ClipboardList, label: "Đơn hàng", href: routes.order },
        { icon: KeyRound, label: "Đổi mật khẩu", href: routes.changePassword },

    ];

    return (
        <aside className="w-full md:w-60 flex-shrink-0">
            <div className="sticky top-24">
                <h2 className="mb-4 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Cài đặt tài khoản
                </h2>
                <nav className="flex flex-col gap-1">
                    {menuItems.map((item, index) => {
                        const isActive = location.pathname.startsWith(item.href);

                        return <Button
                            key={index}
                            variant={isActive ? "secondary" : "ghost"}
                            asChild
                            className={cn(
                                "w-full justify-start gap-3",
                                isActive &&
                                "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:bg-blue-900/20 dark:text-blue-50 dark:hover:bg-blue-900/40"
                            )}
                        >
                            <Link to={item.href}>
                                <item.icon className={cn("size-5", isActive && "stroke-[2.5px]")} />

                                <span className="font-medium">{item.label}</span>
                            </Link>
                        </Button>
                    }
                    )}
                </nav>
            </div>
        </aside>
    );
}