import React from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Mail, MoreVertical, Ticket, CalendarClock } from "lucide-react";
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import InvitationStatusBadge from '@/components/InvitationStatusBadge';
import { formatDateTime } from '@/utils/format';
import { InvitationStatus } from '@/utils/constant';

const GuestTable = ({ data, isLoading, onViewDetail, onRevoke }) => {

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Đang tải danh sách khách mời...</div>;
    if (!data || data.length === 0) return <div className="p-8 text-center text-muted-foreground">Chưa có khách mời nào được mời.</div>;


    return (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="w-[30%]">Khách mời</TableHead>
                        <TableHead>Loại vé mời</TableHead>
                        <TableHead>Ngày gửi</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((invite, index) => (
                        <TableRow key={invite.id || index} className="hover:bg-muted/50">
                            {/* Email */}
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                                        <Mail size={16} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span>{invite.email}</span>
                                        {invite.user && <span className="text-xs text-muted-foreground">{invite.user.fullName}</span>}
                                    </div>
                                </div>
                            </TableCell>

                            {/* ticket */}
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Ticket size={14} className="text-muted-foreground" />
                                    <span className="font-medium">{invite.ticket?.name || "Vé thường"}</span>
                                    <Badge variant="secondary" className="text-[10px] h-5">x{invite.initialQuantity}</Badge>
                                </div>
                            </TableCell>

                            {/* createdAt */}
                            <TableCell className="text-muted-foreground text-sm">
                                <div className="flex items-center gap-1">
                                    <CalendarClock size={14} />
                                    {formatDateTime(invite.createdAt)}
                                </div>
                            </TableCell>

                            {/* Status */}
                            <TableCell>
                                <InvitationStatusBadge status={invite.status} />
                            </TableCell>

                            {/* Action */}
                            <TableCell className="text-right pr-4">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="ghost" className="h-8 w-8">
                                            <MoreVertical size={18} />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onViewDetail(invite)}>
                                            Xem chi tiết & Lịch sử
                                        </DropdownMenuItem>
                                        {invite.status === InvitationStatus.PENDING && (
                                            <DropdownMenuItem
                                                onClick={() => onRevoke(invite)}
                                                className="text-destructive">
                                                Hủy lời mời
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};



export default GuestTable;