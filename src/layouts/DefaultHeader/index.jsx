import React, { useContext } from 'react';
import { Search, Calendar, Menu, Bell, LayoutDashboard, PlusCircle, Ticket, User, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContex';
import { routes } from '@/config/routes';
import { Role } from '@/utils/constant';
import BoringAvatar from "boring-avatars";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import DefaultAvatar from '@/components/DefaultAvatar';

const DefaultHeader = () => {
    const { user, isLoading, logoutAuth } = useContext(AuthContext);
    const navigate = useNavigate();
    const isOrganizer = user?.role.name === Role.ORGANIZER;

    const handleLogout = () => {
        if (logoutAuth) logoutAuth();
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
                        <a href="#" className="text-sm font-medium hover:text-brand transition-colors">Tổ chức sự kiện</a>
                    </nav>
                    <div className="flex gap-3">
                        {isLoading ? (
                            <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-200" ></div>
                        ) : user == null ? (
                            <>
                                <button
                                    onClick={() => navigate(routes.signin)}
                                    className="flex h-9 items-center justify-center rounded-lg px-4 text-sm font-bold text-foreground hover:bg-accent transition-colors">
                                    Đăng nhập
                                </button>
                                <button
                                    onClick={() => navigate(routes.signup)}
                                    className="flex h-9 items-center justify-center rounded-lg bg-brand px-4 text-sm font-bold text-white hover:bg-brand-dark shadow-sm transition-colors">
                                    Đăng ký
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                {isOrganizer ? (
                                    <button
                                        onClick={() => navigate(routes.eventManagement)}
                                        className="hidden sm:flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:border-brand hover:text-brand transition-all shadow-sm"
                                    >
                                        <LayoutDashboard className="h-4 w-4" />
                                        <span>Ban Tổ Chức</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => navigate(routes.organizerRegistration)}
                                        className="hidden sm:flex items-center gap-2 rounded-full bg-black px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800 transition-all shadow-sm"
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

                                {/* --- USER DROPDOWN SECTION --- */}
                                <div className="group relative">
                                    {/* Avatar Trigger */}
                                    <div className="relative flex items-center gap-2 cursor-pointer py-1
                                    hover:bg-gray-100 px-1 rounded-lg">
                                        <Avatar className="h-9 w-9 rounded-full border
                                         border-gray-200 bg-gray-100 overflow-hidden flex items-center
                                          justify-center transition-all">
                                            <DefaultAvatar user={user} />
                                        </Avatar>
                                        <span className="text-sm font-medium text-gray-700 hidden lg:block max-w-[100px] truncate">
                                            {user.fullName || "Tài khoản"}
                                        </span>
                                    </div>

                                    {/* Dropdown Menu Popup */}
                                    <div className="absolute right-0 top-full mt-1 w-60 origin-top-right rounded-xl border border-gray-200 bg-white p-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">

                                        <Link to="/profile" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-brand transition-colors">
                                            <User className="h-4 w-4" />
                                            Tài khoản của tôi
                                        </Link>


                                        <Link to={routes.myTicket} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-brand transition-colors">
                                            <Ticket className="h-4 w-4" />
                                            Vé của tôi
                                        </Link>


                                        <div className="my-1 border-t border-gray-100"></div>

                                        <button
                                            onClick={handleLogout}
                                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Đăng xuất
                                        </button>
                                    </div>
                                </div>
                                {/* --- END USER DROPDOWN --- */}

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