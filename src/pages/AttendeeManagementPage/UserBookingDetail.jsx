import React, { useEffect, useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, CalendarCheck, Mail, Phone } from "lucide-react";
import { getUserSummaryBooking } from '@/services/bookingService';
import { toast } from "sonner";
import { formatCurrency } from '@/utils/format';
import AttendeeBookingCard from '@/features/attendee/AttendeeBookingCard';
import { BookingStatus } from '@/utils/constant';

const UserBookingDetail = ({ isOpen, onClose, eventSessionId, userId }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && eventSessionId && userId) {
            fetchDetail();
        } else {
            setData(null);
        }
    }, [isOpen, eventSessionId, userId]);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const res = await getUserSummaryBooking({ eventSessionId: eventSessionId, userId: userId });
            setData(res.result);
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải chi tiết lịch sử đặt vé.");
        } finally {
            setLoading(false);
        }
    };
    const user = data?.user;
    const bookings = (data?.bookings || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const totalSpent = bookings
        .filter(b => b.status === BookingStatus.PAID)
        .reduce((sum, b) => sum + (b.finalAmount || 0), 0);

    const totalTickets = bookings
        .filter(b => b.status === BookingStatus.PAID)
        .reduce((sum, b) => sum + (b.attendees?.length || 0), 0);

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="sm:max-w-[700px] w-full p-0 flex flex-col gap-0 bg-gray-50">
                {/* Header Section */}
                <SheetHeader className="p-6 bg-background border-b">
                    <SheetTitle className="flex items-center gap-2">
                        <CalendarCheck className="w-5 h-5 text-primary" />
                        Chi tiết lịch sử tham gia
                    </SheetTitle>
                    <SheetDescription>
                        Thông tin chi tiết các lần mua vé của người dùng trong ngày sự kiện này.
                    </SheetDescription>
                </SheetHeader>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : !data ? (
                    <div className="p-6 text-center text-muted-foreground">Không có dữ liệu</div>
                ) : (
                    <ScrollArea className="flex-1 px-6 py-6 h-full">
                        <div className="space-y-6 pb-10">

                            {/* User Profile Card */}
                            <Card className="shadow-sm border-none bg-background">
                                <CardContent className="p-4 flex items-start sm:items-center gap-4 flex-col sm:flex-row">
                                    <Avatar className="w-16 h-16 border-2 border-background shadow-sm">
                                        <AvatarImage src={user?.avatar} />
                                        <AvatarFallback className="text-lg bg-primary/10 text-primary">
                                            {user?.fullName?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1">
                                        <h3 className="font-bold text-lg text-foreground">{user?.fullName}</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Mail size={14} /> {user?.email}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone size={14} /> {user?.phone || "Chưa cập nhật"}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                {/* Mini Stats */}
                                <div className="grid grid-cols-3 border-t bg-muted/30 divide-x">
                                    <div className="p-3 text-center">
                                        <div className="text-xs text-muted-foreground uppercase font-semibold">Tổng chi tiêu</div>
                                        <div className="text-sm font-bold text-primary">{formatCurrency(totalSpent)}</div>
                                    </div>
                                    <div className="p-3 text-center">
                                        <div className="text-xs text-muted-foreground uppercase font-semibold">Tổng vé sở hữu</div>
                                        <div className="text-sm font-bold">{totalTickets} vé</div>
                                    </div>
                                    <div className="p-3 text-center">
                                        <div className="text-xs text-muted-foreground uppercase font-semibold">Số lần đặt</div>
                                        <div className="text-sm font-bold">{bookings.length} lần</div>
                                    </div>
                                </div>
                            </Card>

                            <Separator />

                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                Danh sách đơn hàng ({bookings.length})
                            </h4>

                            {/* Bookings List */}
                            <div className="space-y-4">
                                {bookings.map((booking) => (
                                    <AttendeeBookingCard key={booking.id} booking={booking} />
                                ))}
                            </div>
                        </div>
                    </ScrollArea>
                )}
            </SheetContent>
        </Sheet>
    );
};

export default UserBookingDetail;