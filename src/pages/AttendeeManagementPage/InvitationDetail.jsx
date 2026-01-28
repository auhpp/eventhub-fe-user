import React, { useEffect, useState } from 'react';
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Loader2, Ticket, CheckCircle2, XCircle, Send,
    Clock, Copy,
    TimerOff,
    AlertCircle,
    Ban
} from "lucide-react";
import { getEventInvitationByToken } from '@/services/eventInvitationService';
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { isPast } from "date-fns";
import InvitationStatusBadge from '@/components/InvitationStatusBadge';
import { formatDateTime } from '@/utils/format';
import TimelineItem from '@/features/attendee/TimelineItem';
import { InvitationStatus } from '@/utils/constant';

const InvitationDetail = ({ isOpen, onClose, token }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && token) {
            fetchDetail();
        } else {
            setData(null);
        }
    }, [isOpen, token]);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const res = await getEventInvitationByToken({ token: token });
            setData(res.result || res);
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải chi tiết lời mời.");
        } finally {
            setLoading(false);
        }
    };

    const copyLink = () => {
        const link = `${window.location.origin}/invitation/response?token=${data?.token}&eventId=${data?.ticket.eventId}`;
        navigator.clipboard.writeText(link);
        toast.success("Đã sao chép link lời mời");
    };

    const isExpired = data?.expiredAt ? isPast(new Date(data.expiredAt)) : false;
    const displayStatus = (data?.status === InvitationStatus.PENDING && isExpired) ? InvitationStatus.EXPIRED : data?.status;
    if (!data && !loading) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="sm:max-w-[500px] w-full p-0 bg-background flex flex-col h-full">

                {/* Header */}
                <SheetHeader className="p-6 border-b">
                    <SheetTitle className="flex items-center gap-2 text-xl">
                        Chi tiết lời mời
                        <InvitationStatusBadge status={displayStatus} />
                    </SheetTitle>
                    <SheetDescription>
                        Mã: <span className="font-mono text-xs">#{data?.id}</span>
                    </SheetDescription>
                </SheetHeader>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-6 space-y-8">

                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-14 w-14 border-2 border-primary/10">
                                        <AvatarFallback className="bg-primary/5 text-primary text-lg font-bold">
                                            {data?.email?.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm text-muted-foreground font-medium">Người được mời</p>
                                        <p className="text-lg font-semibold">{data?.email}</p>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                            <Ticket size={14} />
                                            <span>Vé: {data?.ticket?.name}</span>
                                            <Badge variant="secondary" className="text-[10px]">x{data?.initialQuantity}</Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className={cn(
                                    "flex items-center justify-between p-3 rounded-md border text-sm",
                                    isExpired ? "bg-gray-100 border-gray-200 text-gray-500"
                                        : "bg-blue-50 border-blue-100 text-blue-700"
                                )}>
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} />
                                        <span className="font-medium">Thời hạn xác nhận:</span>
                                    </div>
                                    <span className="font-mono font-bold">
                                        {formatDateTime(data?.expiredAt)}
                                    </span>
                                </div>
                            </div>

                            <Separator />

                            {/* Timeline */}
                            <div>
                                <h4 className="text-sm font-semibold mb-6 uppercase tracking-wider text-muted-foreground">Tiến trình</h4>
                                <div className="pl-2">
                                    {/* send */}
                                    <TimelineItem
                                        icon={Send}
                                        colorClass="text-blue-600 border-blue-200 bg-blue-50"
                                        title="Đã gửi lời mời"
                                        time={data?.createdAt}
                                        description={"Email đã gửi thành công."}
                                        isLast={false}
                                    />


                                    {/* CASE: PENDING */}
                                    {data?.status === InvitationStatus.PENDING && !isExpired && (
                                        <TimelineItem
                                            icon={Clock}
                                            colorClass="text-yellow-600 border-yellow-200 bg-yellow-50"
                                            title="Đang chờ phản hồi"
                                            description={
                                                <div className="mt-2 space-y-3">
                                                    <div className="flex items-center gap-2 text-xs text-orange-600 font-medium bg-orange-50 p-2 rounded w-fit">
                                                        <AlertCircle size={12} />
                                                        Sẽ hết hạn lúc {formatDateTime(data?.expiredAt)}
                                                    </div>

                                                    <div className="p-3 bg-muted/50 rounded-md text-sm border border-dashed">
                                                        <span className="italic text-muted-foreground">"{data?.message || 'Không có lời nhắn'}"</span>
                                                        <div className="mt-3">
                                                            <Button size="sm" variant="outline" className="h-7 gap-2 text-xs" onClick={copyLink}>
                                                                <Copy size={12} /> Sao chép Link mời
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                            isLast={true}
                                        />
                                    )}

                                    {/* CASE: EXPIRED */}
                                    {(displayStatus === InvitationStatus.EXPIRED) && (
                                        <TimelineItem
                                            icon={TimerOff}
                                            colorClass="text-gray-500 border-gray-300 bg-gray-100"
                                            title="Lời mời đã hết hạn"
                                            time={data?.expiredAt}
                                            description="Khách mời chưa phản hồi trong thời gian quy định. Link mời đã bị vô hiệu hóa."
                                            isLast={true}
                                        />
                                    )}

                                    {/* CASE: ACCEPTED */}
                                    {displayStatus === InvitationStatus.ACCEPTED && (
                                        <TimelineItem
                                            icon={CheckCircle2}
                                            colorClass="text-green-600 border-green-200 bg-green-50"
                                            title="Đã chấp nhận"
                                            time={data?.updatedAt}
                                            description={data?.booking ? `Đơn hàng #${data.booking.id}` : "Đã xác nhận tham gia."}
                                            isLast={true}
                                        />
                                    )}

                                    {/* CASE: REJECTED */}
                                    {displayStatus === InvitationStatus.REJECTED && (
                                        <TimelineItem
                                            icon={XCircle}
                                            colorClass="text-red-600 border-red-200 bg-red-50"
                                            title="Đã từ chối"
                                            time={data?.updatedAt}
                                            description={`Lý do: "${data?.rejectionMessage || '...'}"`}
                                            isLast={true}
                                        />
                                    )}

                                    {/* CASE: REVOKED*/}
                                    {(displayStatus === InvitationStatus.REVOKED) && (
                                        <TimelineItem
                                            icon={Ban}
                                            colorClass="text-slate-600 border-slate-200 bg-slate-50"
                                            title="Đã thu hồi"
                                            time={data?.updatedAt}
                                            description="Người tổ chức đã thu hồi lời mời này. Link mời không còn hiệu lực."
                                            isLast={true}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
};

export default InvitationDetail;