import { User, Lock, Bell, CreditCard, IdCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function ProfileSidebar() {
    const menuItems = [
        { icon: User, label: "Thông tin cá nhân", href: "#", active: false },
        { icon: IdCard, label: "Đăng ký BTC", href: "#", active: true },
        { icon: Lock, label: "Bảo mật & Đăng nhập", href: "#", active: false },
        { icon: Bell, label: "Thông báo", href: "#", active: false },
        { icon: CreditCard, label: "Thanh toán", href: "#", active: false },
    ];

    return (
        <aside className="w-full md:w-64 flex-shrink-0">
            <div className="sticky top-24">
                <h2 className="mb-4 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Cài đặt tài khoản
                </h2>
                <nav className="flex flex-col gap-1">
                    {menuItems.map((item, index) => (
                        <Button
                            key={index}
                            variant={item.active ? "secondary" : "ghost"}
                            asChild 
                            className={cn(
                                "w-full justify-start gap-3", 
                                item.active &&
                                "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:bg-blue-900/20 dark:text-blue-50 dark:hover:bg-blue-900/40"
                            )}
                        >
                            <a href={item.href}>
                                <item.icon
                                    className={cn("h-4 w-4", item.active && "fill-current")}
                                />
                                <span className="font-medium">{item.label}</span>
                            </a>
                        </Button>
                    ))}
                </nav>
            </div>
        </aside>
    );
}