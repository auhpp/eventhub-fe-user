import React, { useContext } from 'react';
import { Search, Calendar, Menu, Bell, LayoutDashboard, PlusCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContex';
import { routes } from '@/config/routes';
import { Role } from '@/utils/constant';

const DefaultHeader = () => {
    const { user, isLoading } = useContext(AuthContext);
    const navigate = useNavigate();
    const isOrganizer = user?.role.name === Role.ORGANIZER;
    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-8">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-foreground">EventHub</h2>
                    </Link>

                    {/* Search Bar */}
                    <div className="hidden md:flex items-center relative w-64 lg:w-96">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <input
                            type="text"
                            className="block w-full rounded-full border border-input bg-muted/50 py-1.5 pl-10 pr-4 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                            placeholder="Tìm sự kiện, địa điểm..."
                        />
                    </div>
                </div>

                {/* Navigation & Actions */}
                <div className="hidden flex-1 items-center justify-end gap-8 md:flex">
                    <nav className="flex items-center gap-6">
                        <a href="#" className="text-sm font-medium hover:text-brand transition-colors">Khám phá</a>
                        <a href="#" className="text-sm font-medium hover:text-brand transition-colors">Vé của tôi</a>
                        <a href="#" className="text-sm font-medium hover:text-brand transition-colors">Tổ chức sự kiện</a>
                    </nav>
                    <div className="flex gap-3">
                        {

                            isLoading ? (
                                <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-200" ></div>
                            ) :
                                user == null ? (<>
                                    <button
                                        onClick={() => navigate(routes.signin)}
                                        className="flex h-9 items-center justify-center rounded-lg px-4 text-sm font-bold
                                     text-foreground hover:bg-accent transition-colors">
                                        Đăng nhập
                                    </button>
                                    <button
                                        onClick={() => navigate(routes.signup)}
                                        className="flex h-9 items-center justify-center rounded-lg bg-brand px-4 text-sm 
                                    font-bold text-white hover:bg-brand-dark shadow-sm transition-colors">
                                        Đăng ký
                                    </button>
                                </>) : (
                                    <div className="flex items-center gap-4">
                                        {/* 3. BUTTON ĐIỀU HƯỚNG QUẢN LÝ (MỚI) */}
                                        {isOrganizer ? (
                                            <button
                                                // Thay thế đường dẫn này bằng route dashboard của bạn
                                                onClick={() => navigate(routes.eventManagement)}
                                                className="hidden sm:flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:border-brand hover:text-brand transition-all shadow-sm"
                                            >
                                                <LayoutDashboard className="h-4 w-4" />
                                                <span>Ban Tổ Chức</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => navigate(routes.organizerRegistration)}
                                                className="hidden sm:flex items-center gap-2 rounded-full bg-black px-4
                                                 py-1.5 text-sm font-medium text-white hover:bg-gray-800 transition-all
                                                  shadow-sm"
                                            >
                                                <PlusCircle className="h-4 w-4" />
                                                <span>Tạo sự kiện</span>
                                            </button>
                                        )}

                                        {/* Notification Icon */}
                                        <button className="relative p-1 text-gray-600 hover:text-brand transition-colors group">
                                            <Bell className="h-5 w-5" />
                                            <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white"></span>
                                        </button>

                                        {/* User Avatar Circle */}
                                        <div
                                            className="relative flex items-center gap-2 cursor-pointer"
                                            onClick={() => {
                                                // 4. Nên điều hướng về trang Profile cá nhân thay vì trang đăng ký
                                                navigate(routes.organizerRegistration);
                                            }}
                                        >
                                            <div className="h-9 w-9 rounded-full border border-gray-200 bg-gray-100 overflow-hidden flex items-center justify-center hover:ring-2 hover:ring-brand hover:ring-offset-1 transition-all">
                                                {user.avatarUrl ? (
                                                    <img
                                                        src={user.avatarUrl}
                                                        alt={user.fullName}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-sm font-bold text-gray-600">
                                                        {getInitials(user.fullName)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <button className="p-2 text-foreground">
                        <Menu className="h-6 w-6" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default DefaultHeader;