import React from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreVertical, Ticket } from "lucide-react";
import AttendeeTypeBadges from '@/components/AttendeeTypeBadges';
import BookingStatusBadge from '@/components/BookingStatusBadge';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { BookingStatus } from '@/utils/constant';
import BoringAvatar from "boring-avatars";

const AttendeeTable = ({ data, isLoading, onViewDetail }) => {
    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Đang tải dữ liệu...</div>;
    if (!data || data.length === 0) return <div className="p-8 text-center text-muted-foreground">Không có dữ liệu.</div>;

    return (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="w-[30%]">Người tham gia</TableHead>
                        <TableHead>Loại</TableHead>
                        <TableHead>Thông tin vé</TableHead>
                        <TableHead>Tổng chi tiêu</TableHead>
                        <TableHead>Đơn hàng mới nhất</TableHead>
                        <TableHead className="text-right pr-4">Hành động</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item, index) => {
                        const user = item.user;
                        const bookings = item.bookings || [];

                        const sortedBookings = [...bookings].sort((a, b) =>
                            new Date(b.createdAt) - new Date(a.createdAt)
                        );

                        const latestBooking = sortedBookings.length > 0 ? sortedBookings[0] : null;

                        const totalSpent = bookings
                            .filter(b => b.status === BookingStatus.PAID)
                            .reduce((sum, b) => sum + (b.finalAmount || 0), 0);

                        const totalTickets = bookings
                            .filter(b => b.status === BookingStatus.PAID)
                            .reduce((sum, b) => sum + (b.attendees ? b.attendees.length : 0), 0);

                        return (
                            <TableRow key={user.id || index} className="group hover:bg-muted/50">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={user.avatar} alt={user.fullName} />
                                            <AvatarFallback className="bg-transparent p-0 overflow-hidden">
                                                <BoringAvatar
                                                    size="100%"
                                                    name={user.email}
                                                    variant="marble"
                                                />
                                            </AvatarFallback>
                                        </Avatar>

                                        <div>
                                            <p className="font-medium">{user.fullName}</p>
                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <AttendeeTypeBadges bookings={bookings} />
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-medium flex items-center gap-1">
                                            <Ticket size={14} className="text-blue-500" />
                                            {totalTickets} vé sở hữu
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            Tổng {bookings.length} lần đặt
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="font-medium text-green-700">
                                        {formatCurrency(totalSpent)}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {latestBooking ? (
                                        <div className="flex flex-col gap-1">
                                            <div>
                                                <BookingStatusBadge status={latestBooking.status} />
                                            </div>
                                            <span className="text-[10px] text-muted-foreground">
                                                {formatDateTime(latestBooking.createdAt)}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground">-</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right pr-4">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="icon" variant="ghost" className="h-8 w-8">
                                                <MoreVertical size={16} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onViewDetail(user.id)}>
                                                Xem chi tiết lịch sử
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};

export default AttendeeTable;