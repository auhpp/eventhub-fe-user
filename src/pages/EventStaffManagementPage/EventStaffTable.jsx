import React from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Mail, MoreVertical, Shield } from "lucide-react";
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EventStaffStatus, RoleName } from '@/utils/constant';
import EventStaffStatusBadge from '@/components/EventStaffStatusBadge';

const EventStaffTable = ({ data, isLoading, onViewDetail, onRevoke, onResend }) => {

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Đang tải danh sách nhân viên...</div>;
    if (!data || data.length === 0) return <div className="p-8 text-center text-muted-foreground">Chưa có nhân viên nào trong danh sách.</div>;

    return (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="w-[35%]">Nhân viên</TableHead>
                        <TableHead>Vai trò</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((staff, index) => (
                        <TableRow key={staff.id || index} className="hover:bg-muted/50">
                            {/* Email / User Info */}
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-full">
                                        <Mail size={16} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span>{staff.email}</span>
                                        {staff.user && <span className="text-xs text-muted-foreground">{staff.user.fullName}</span>}
                                    </div>
                                </div>
                            </TableCell>

                            {/* Role */}
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Shield size={14} className="text-muted-foreground" />
                                    <span className="font-medium">
                                        {RoleName[staff.role.name]?.label || staff.roleName}
                                    </span>
                                </div>
                            </TableCell>

                            {/* Status */}
                            <TableCell>
                                <EventStaffStatusBadge status={staff.status} />
                            </TableCell>

                            {/* Actions */}
                            <TableCell className="text-right pr-4">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="ghost" className="h-8 w-8">
                                            <MoreVertical size={18} />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onViewDetail(staff)}>
                                            Xem chi tiết & Lịch sử
                                        </DropdownMenuItem>
                                        {staff.status === EventStaffStatus.PENDING && (
                                            <DropdownMenuItem
                                                onClick={() => onResend(staff)}
                                                className="text">
                                                Gửi lại
                                            </DropdownMenuItem>
                                        )}
                                        {staff.status === EventStaffStatus.PENDING && (
                                            <DropdownMenuItem
                                                onClick={() => onRevoke(staff)}
                                                className="text-destructive">
                                                Thu hồi lời mời
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


export default EventStaffTable;