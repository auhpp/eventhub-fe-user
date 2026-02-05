import React, { useEffect, useState } from 'react';
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Loader2, Shield, CheckCircle2, XCircle, Send,
    Clock, Copy, TimerOff, AlertCircle, Ban,
} from "lucide-react";
import { getEventStaffById } from '@/services/eventStaffService';
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { isPast } from "date-fns";
import { formatDateTime } from '@/utils/format';
import { EventStaffStatus, RoleName } from '@/utils/constant';
import TimelineItem from '@/features/attendee/TimelineItem';
import EventSessionStatusBadge from '@/components/EventSessionStatusBadge';
import EventStaffStatusBadge from '@/components/EventStaffStatusBadge';

const StaffInvitationDetail = ({ isOpen, onClose, id }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && id) {
            fetchDetail();
        } else {
            setData(null);
        }
    }, [isOpen, id]);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const res = await getEventStaffById({ id: id });
            setData(res.result || res);
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải chi tiết nhân viên.");
        } finally {
            setLoading(false);
        }
    };

    const copyLink = () => {
        const link = `${window.location.origin}/invitation/event-staff/response?token=${data?.token}`;
        navigator.clipboard.writeText(link);
        toast.success("Đã sao chép link lời mời tham gia BTC");
    };

    const isExpired = data?.expiredAt ? isPast(new Date(data.expiredAt)) : false;
    const displayStatus = (data?.status === EventStaffStatus.PENDING && isExpired) ? 'EXPIRED' : data?.status;

    const isOwner = data?.role.name === RoleName.EVENT_OWNER.key;

    if (!data && !loading) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="sm:max-w-[500px] w-full p-0 bg-background flex flex-col h-full">

                {/* Header */}
                <SheetHeader className="p-6 border-b">
                    <SheetTitle className="flex items-center gap-2 text-xl">
                        Chi tiết nhân sự
                        {/* Render Badge Status */}
                        {isOwner ? (
                            <Badge className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100 hover:text-purple-700">
                                OWNER
                            </Badge>
                        ) : (
                            <EventStaffStatusBadge status={displayStatus} />
                        )}
                    </SheetTitle>
                    <SheetDescription>
                        Mã nhân sự: <span className="font-mono text-xs">#{data?.id}</span>
                    </SheetDescription>
                </SheetHeader>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-6 space-y-8">

                            {/* User Info Section */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                    <Avatar className={cn("h-14 w-14 border-2", isOwner ? "border-purple-100"
                                        : "border-indigo-100")}>
                                        <AvatarFallback className={cn("text-lg font-bold", isOwner ?
                                            "bg-purple-50 text-purple-600" : "bg-indigo-50 text-indigo-600")}>
                                            {data?.email?.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm text-muted-foreground font-medium">Email nhân viên</p>
                                        <p className="text-lg font-semibold">{data?.email}</p>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                            {isOwner ? <Shield size={14} className="text-purple-600" /> : <Shield size={14} />}
                                            <span>Vai trò: <span className="font-medium text-foreground">
                                                {RoleName[data?.role.name]?.label || data?.roleName}</span></span>
                                        </div>
                                    </div>
                                </div>

                                {!isOwner && (
                                    <div className={cn(
                                        "flex items-center justify-between p-3 rounded-md border text-sm",
                                        isExpired ? "bg-gray-100 border-gray-200 text-gray-500"
                                            : "bg-indigo-50 border-indigo-100 text-indigo-700"
                                    )}>
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} />
                                            <span className="font-medium">Hạn xác nhận:</span>
                                        </div>
                                        <span className="font-mono font-bold">
                                            {formatDateTime(data?.expiredAt)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Timeline */}
                            <div>
                                <h4 className="text-sm font-semibold mb-6 uppercase tracking-wider text-muted-foreground">Tiến trình</h4>
                                <div className="pl-2">

                                    {/* --- OWNER --- */}
                                    {isOwner ? (
                                        <TimelineItem
                                            icon={Shield}
                                            colorClass="text-purple-600 border-purple-200 bg-purple-50"
                                            title="Chủ sở hữu sự kiện"
                                            time={data?.createdAt}
                                            description="Người tạo sự kiện, có toàn quyền quản lý hệ thống."
                                            isLast={true}
                                        />
                                    ) : (
                                        /* --- STAFF  --- */
                                        <>
                                            {/* Send invite */}
                                            <TimelineItem
                                                icon={Send}
                                                colorClass="text-blue-600 border-blue-200 bg-blue-50"
                                                title="Đã gửi lời mời"
                                                time={data?.createdAt}
                                                description="Email mời tham gia ban tổ chức đã được gửi."
                                                isLast={false}
                                            />

                                            {/* CASE: PENDING */}
                                            {data?.status === EventStaffStatus.PENDING && !isExpired && (
                                                <TimelineItem
                                                    icon={Clock}
                                                    colorClass="text-yellow-600 border-yellow-200 bg-yellow-50"
                                                    title="Đang chờ phản hồi"
                                                    description={
                                                        <div className="mt-2 space-y-3">
                                                            <div className="flex items-center gap-2 text-xs
                                                             text-orange-600 font-medium bg-orange-50 p-2 rounded w-fit">
                                                                <AlertCircle size={12} />
                                                                Hết hạn lúc {formatDateTime(data?.expiredAt)}
                                                            </div>
                                                            <div className="p-3 bg-muted/50 rounded-md text-sm
                                                             border border-dashed">
                                                                <span className="italic text-muted-foreground">
                                                                    Lời nhắn: "{data?.message || 'Không có lời nhắn'}"</span>
                                                                <div className="mt-3">
                                                                    <Button size="sm" variant="outline"
                                                                        className="h-7 gap-2 text-xs" onClick={copyLink}>
                                                                        <Copy size={12} /> Sao chép Link
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    }
                                                    isLast={true}
                                                />
                                            )}

                                            {/* CASE: EXPIRED */}
                                            {displayStatus === 'EXPIRED' && (
                                                <TimelineItem
                                                    icon={TimerOff}
                                                    colorClass="text-gray-500 border-gray-300 bg-gray-100"
                                                    title="Lời mời hết hạn"
                                                    time={data?.expiredAt}
                                                    description="Nhân viên chưa phản hồi trong thời gian quy định."
                                                    isLast={true}
                                                />
                                            )}

                                            {/* CASE: ACTIVE (Accepted) */}
                                            {data?.status === EventStaffStatus.ACTIVE && (
                                                <TimelineItem
                                                    icon={CheckCircle2}
                                                    colorClass="text-green-600 border-green-200 bg-green-50"
                                                    title="Đã tham gia"
                                                    time={data?.updatedAt}
                                                    description="Nhân viên đã chấp nhận lời mời và được kích hoạt quyền hạn."
                                                    isLast={true}
                                                />
                                            )}

                                            {/* CASE: REJECTED */}
                                            {data?.status === EventStaffStatus.REJECTED && (
                                                <TimelineItem
                                                    icon={XCircle}
                                                    colorClass="text-red-600 border-red-200 bg-red-50"
                                                    title="Đã từ chối"
                                                    time={data?.updatedAt}
                                                    description={`Lý do: "${data?.rejectionMessage || '...'}"`}
                                                    isLast={true}
                                                />
                                            )}

                                            {/* CASE: REVOKED */}
                                            {data?.status === EventStaffStatus.REVOKED && (
                                                <TimelineItem
                                                    icon={Ban}
                                                    colorClass="text-slate-600 border-slate-200 bg-slate-50"
                                                    title="Đã thu hồi"
                                                    time={data?.updatedAt}
                                                    description="Quản trị viên đã thu hồi quyền truy cập."
                                                    isLast={true}
                                                />
                                            )}
                                        </>
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

export default StaffInvitationDetail;