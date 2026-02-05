import React, { useMemo } from 'react';
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    ArrowRight,
    ArrowUpRight,
    ArrowDownLeft,
    Ticket
} from "lucide-react";
import { TicketGiftStatus } from '@/utils/constant';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/config/routes';
import DefaultAvatar from '@/components/DefaultAvatar';
import TicketGiftStatusBadge from '@/components/TicketGiftStatusBadge';
import { formatDateTime } from '@/utils/format';


const TicketGiftItem = ({ data, isSentType }) => {
    const { status, sender, receiver, booking, createdAt, expiredAt, id } = data;
    const attendees = booking?.attendees || [];
    const navigate = useNavigate();

    const isExpired = useMemo(() => {
        if (status === TicketGiftStatus.EXPIRED) return true;
        if (status === TicketGiftStatus.PENDING && expiredAt) {
            return new Date() > new Date(expiredAt);
        }
        return false;
    }, [status, expiredAt]);

    const effectiveStatus = isExpired ? TicketGiftStatus.EXPIRED : status;

    const displayUser = isSentType ? receiver : sender;
    const actionLabel = isSentType ? "Đã gửi tới" : "Nhận từ";
    const DirectionIcon = isSentType ? ArrowUpRight : ArrowDownLeft;

    const ticketSummary = useMemo(() => {
        const summary = {};
        attendees.forEach(att => {
            const name = att.ticket?.name || "Vé sự kiện";
            summary[name] = (summary[name] || 0) + 1;
        });
        return Object.entries(summary).map(([name, count]) => `${name} (x${count})`).join(', ');
    }, [attendees]);

    return (
        <Card className="group relative overflow-hidden transition-all hover:shadow-md border-gray-200 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">

                {/* user info */}
                <div className="flex items-center gap-3 min-w-[180px]">
                    <div className={`relative p-2 rounded-full ${isSentType ? 'bg-blue-50' : 'bg-purple-50'}`}>
                        <DirectionIcon className={`w-5 h-5 ${isSentType ? 'text-blue-600' : 'text-purple-600'}`} />
                    </div>
                    <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10 border border-gray-100">
                            <DefaultAvatar user={displayUser} />
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">{actionLabel}</span>
                            <span className="text-sm font-semibold
                             text-gray-900 truncate max-w-[120px]" title={displayUser?.fullName}>
                                {displayUser?.fullName}
                            </span>
                            <span className="text-sm 
                             text-gray-700 truncate max-w-[120px]" title={displayUser?.email}>
                                {displayUser?.email}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ticket and booking info */}
                <div className="flex-1 flex flex-col gap-1 border-l border-gray-100 pl-0 sm:pl-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Ticket className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900 text-sm line-clamp-1">
                            {ticketSummary || "Chi tiết vé không có sẵn"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Đơn hàng #{booking?.id}</span>
                        <span>•</span>
                        <span>{formatDateTime(createdAt)}</span>
                    </div>
                </div>

                {/* status and action */}
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 min-w-[140px]">
                    <TicketGiftStatusBadge status={effectiveStatus} />

                    {effectiveStatus === TicketGiftStatus.PENDING && expiredAt && (
                        <span className="text-[12px] text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded-full">
                            Hết hạn: {formatDateTime(expiredAt)}
                        </span>
                    )}

                    {effectiveStatus === TicketGiftStatus.EXPIRED && expiredAt && (
                        <span className="text-[12px] text-gray-400 font-medium">
                            {formatDateTime(expiredAt)}
                        </span>
                    )}

                    <div className='flex items-center gap-4'>
                        <Button
                            variant="outline"
                            size="sm"
                            className="group/btn gap-2"
                            onClick={() => navigate(routes.ticketGiftDetail.replace(':id', id))}
                        >
                            Chi tiết
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default TicketGiftItem;