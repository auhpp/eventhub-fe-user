import React from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Ticket } from "lucide-react";

import BookingStatusBadge from '@/components/BookingStatusBadge'; 
import { formatCurrency, formatDateTime } from '@/utils/format';
import AttendeeTypeBadges from '@/components/AttendeeTypeBadges';

const OrderTable = ({ data, isLoading, onViewDetail }) => {
    if (isLoading) return <div className="p-8 text-center text-muted-foreground bg-card border rounded-xl">Đang tải danh sách đơn hàng...</div>;
    if (!data || data.length === 0) return <div className="p-8 text-center text-muted-foreground bg-card border rounded-xl">Không tìm thấy đơn hàng nào.</div>;

    return (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden w-full">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="w-[120px]">Mã đơn</TableHead>
                        <TableHead>Khách hàng</TableHead>
                        <TableHead>Ngày đặt</TableHead>
                        <TableHead className="text-center">Số lượng vé</TableHead>
                        <TableHead className="text-left">Loại</TableHead>
                        <TableHead className="text-right">Tổng tiền</TableHead>
                        <TableHead className="w-[180px]">Trạng thái</TableHead>
                        <TableHead className="text-right pr-4">Hành động</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((booking, index) => {
                        const name = booking.customerName || booking.appUser?.fullName || null;
                        const email = booking.customerEmail || booking.appUser?.email || "Không có email";
                        const ticketCount = booking.attendees ? booking.attendees.length : 0;

                        return (
                            <TableRow key={booking.id || index} className="group hover:bg-muted/50">
                                <TableCell className="font-medium text-primary">
                                    #{booking.id}
                                </TableCell>

                                <TableCell>
                                    <div>
                                        {
                                            name &&
                                            <p className="font-semibold text-foreground">{name}</p>
                                        }
                                        <p className="text-sm text-muted-foreground">{email}</p>
                                        {booking.customerPhone && (
                                            <p className="text-sm text-muted-foreground">{booking.customerPhone}</p>
                                        )}
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <span className="text-sm">
                                        {formatDateTime(booking.createdAt)}
                                    </span>
                                </TableCell>

                                <TableCell className="text-center">
                                    <span className="inline-flex items-center
                                     gap-1.5 text-sm font-medium bg-secondary
                                      text-secondary-foreground px-2 py-1 rounded-md">
                                        <Ticket size={14} />
                                        {ticketCount}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <AttendeeTypeBadges attendees={booking.attendees} />
                                </TableCell>

                                <TableCell className="text-right">
                                    <span className="font-bold text-red-500 dark:text-red-500">
                                        {formatCurrency(booking.finalAmount || 0)}
                                    </span>
                                </TableCell>

                                <TableCell>
                                    <BookingStatusBadge status={booking.status} />
                                </TableCell>

                                <TableCell className="text-right pr-4">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="icon" variant="ghost" className="h-8 w-8">
                                                <MoreVertical size={16} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-[160px]">
                                            <DropdownMenuItem
                                                className="cursor-pointer"
                                                onClick={() => onViewDetail(booking.id)}>
                                                Xem chi tiết đơn
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

export default OrderTable;