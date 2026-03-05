import React, { useContext } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Ticket } from "lucide-react";
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DiscountType } from '@/utils/constant';
import { EventContext } from '@/context/EventContext';
import { formatDateTime } from '@/utils/format';
import VoucherStatusBadge from '@/components/VoucherStatusBadge';


const VoucherTable = ({ data, isLoading, onEdit, onDelete, onViewStats }) => {
    const { event } = useContext(EventContext);

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Đang tải danh sách voucher...</div>;
    if (!data || data.length === 0) return <div className="p-8 text-center text-muted-foreground">Chưa có voucher nào được tạo.
    </div>;

    return (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="w-[30%]">Mã & Chương trình</TableHead>
                        <TableHead>Mức giảm</TableHead>
                        <TableHead>Thời gian áp dụng</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((voucher, index) => (
                        <TableRow key={voucher.id || index} className="hover:bg-muted/50">

                            {/* Column 1: voucher info */}
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-slate-100 flex 
                                    items-center justify-center border">
                                        {voucher.avatarUrl ? (
                                            <img src={voucher.avatarUrl} alt={voucher.name} className="w-full h-full
                                             object-cover" />
                                        ) : (
                                            <img src={event.appUser.avatar} alt={voucher.name} className="w-full h-full 
                                            object-cover" />
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-primary uppercase text-sm border bg-primary/10 
                                            px-2 rounded">
                                                {voucher.code}
                                            </span>
                                            {voucher.hasPublic ? (
                                                <Badge variant="secondary" className="text-[10px] h-5 px-1.5">Công khai</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-[10px] h-5 px-1.5">Riêng tư</Badge>
                                            )}
                                        </div>
                                        <span className="text-sm font-medium text-foreground line-clamp-1" title={voucher.name}>
                                            {voucher.name}
                                        </span>
                                    </div>
                                </div>
                            </TableCell>

                            {/* Column 2: Value */}
                            <TableCell>
                                <div className="flex items-center gap-2 font-semibold text-rose-600">
                                    <Ticket size={16} />
                                    {voucher.discountType === DiscountType.FIXED_AMOUNT
                                        ? `${voucher.value?.toLocaleString('vi-VN')} đ`
                                        : `${voucher.value} %`
                                    }
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    SL: {voucher.maximumUsage || 'Không giới hạn'} đơn
                                </div>
                            </TableCell>

                            {/* Column 3: Time */}
                            <TableCell>
                                <div className="flex flex-col gap-1 text-sm">
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <span>Từ: {formatDateTime(voucher.startDateTime)}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <span>Đến: {formatDateTime(voucher.endDateTime)}</span>
                                    </div>
                                </div>
                            </TableCell>

                            {/* Column 4: Status  */}
                            <TableCell>
                                {VoucherStatusBadge({ start: voucher.startDateTime, end: voucher.endDateTime })}
                            </TableCell>

                            {/* Column 5: Actions */}
                            <TableCell className="text-right pr-4">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="ghost" className="h-8 w-8">
                                            <MoreVertical size={18} />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onViewStats(voucher)}>
                                            Xem thống kê
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onEdit(voucher)}>
                                            Xem chi tiết / Sửa
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-destructive focus:bg-destructive/10 focus:text-destructive 
                                            cursor-pointer font-medium"
                                            onClick={() => onDelete(voucher)}
                                        >
                                            Xóa voucher
                                        </DropdownMenuItem>
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

export default VoucherTable;