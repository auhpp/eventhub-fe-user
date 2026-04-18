import React from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { MoreVertical, Ticket } from "lucide-react";
import AttendeeTypeBadges from '@/components/AttendeeTypeBadges';
import DefaultAvatar from '@/components/DefaultAvatar';
import { AttendeeStatus } from '@/utils/constant';

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
                        <TableHead>Đã check-in</TableHead>
                        <TableHead className="text-right pr-4">Hành động</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item, index) => {
                        const user = item.user;
                        const attendees = item.attendees
                        const totalTickets = attendees.filter(a => a.status !== AttendeeStatus.RESOLD.key &&
                            a.status !== AttendeeStatus.ON_RESALE
                        ).length
                        const checkInQuantity = attendees.filter(a => a.status == AttendeeStatus.CHECKED_IN.key).length
                        return (
                            <TableRow key={user.id || index} className="group hover:bg-muted/50">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <DefaultAvatar user={user} />

                                        </Avatar>

                                        <div>
                                            <p className="font-medium">{user.fullName}</p>
                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <AttendeeTypeBadges attendees={attendees} />
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-medium flex items-center gap-1">
                                            <Ticket size={14} className="text-blue-500" />
                                            {totalTickets} vé sở hữu
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm font-medium">
                                    {checkInQuantity} vé
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