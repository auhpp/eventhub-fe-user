import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
    Calendar, MapPin, CheckCircle2, XCircle, AlertCircle, Loader2,
    Ticket, User, ArrowRight, Flag,
    Ban,
    Timer
} from "lucide-react";
import { toast } from "sonner";

import { getEventById } from "@/services/eventService";
import {
    getEventInvitationByToken,
    acceptEventInvitation,
    rejectEventInvitation
} from "@/services/eventInvitationService";
import { formatCurrency, formatTime, displaySessionDate } from '@/utils/format';
import AcceptInvitationDialog from './AcceptInvitationDialog';
import RejectInvitationDialog from './RejectInvitationDialog';
import { InvitationStatus } from '@/utils/constant';


const InvitationResponsePage = () => {
    const [searchParams] = useSearchParams();

    const token = searchParams.get("token");
    const eventId = searchParams.get("eventId");

    const [invitation, setInvitation] = useState(null);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isProcessed, setIsProcessed] = useState(false);
    const [isAcceptOpen, setIsAcceptOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);

    // Fetch Data
    useEffect(() => {
        const fetchAllData = async () => {
            if (!token || !eventId) {
                toast.error("Đường dẫn không hợp lệ.");
                setLoading(false);
                return;
            }

            try {
                const [inviteRes, eventRes] = await Promise.all([
                    getEventInvitationByToken({ token }),
                    getEventById({ id: eventId })
                ]);

                // handle Invitation Data
                const inviteData = inviteRes.result || inviteRes;
                setInvitation(inviteData);

                if (inviteData.status !== InvitationStatus.PENDING) {
                    setIsProcessed(true);
                }

                // handle Event Data
                setEvent(eventRes.result || eventRes);

            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Không thể tải thông tin lời mời.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [token, eventId]);

    // Handlers
    const handleAccept = async () => {
        try {
            await acceptEventInvitation({ token });
            toast.success("Đã xác nhận tham gia! Vé đã được gửi tới email.");
            setIsProcessed(true);
            setIsAcceptOpen(false);
            // Reload data invitation 
            const res = await getEventInvitationByToken({ token });
            setInvitation(res.result || res);
        } catch (error) {
            console.error(error);
            toast.error("Xác nhận thất bại.");
        }
    };

    const handleReject = async (message) => {
        try {
            await rejectEventInvitation({ token, rejectionMessage: message });
            toast.info("Đã từ chối lời mời.");
            setIsProcessed(true);
            setIsRejectOpen(false);
            // Reload data
            const res = await getEventInvitationByToken({ token });
            setInvitation(res.result || res);
        } catch (error) {
            console.error(error);
            toast.error("Có lỗi xảy ra.");
        }
    };

    if (loading) {
        return <div className="h-screen w-full flex items-center justify-center bg-gray-50">
            <Loader2 className="animate-spin text-primary w-10 h-10" /></div>;
    }

    if (!event || !invitation) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center gap-4 text-muted-foreground bg-gray-50">
                <AlertCircle size={48} />
                <p>Thông tin lời mời không tồn tại hoặc đã bị xóa.</p>
            </div>
        );
    }

    const firstSession = event.eventSessions?.[0];
    const ticketInfo = invitation.ticket;

    return (
        <div className="min-h-screen bg-[#f8f9fc] py-10 px-4 flex justify-center items-center">
            <div className="w-full max-w-5xl bg-background rounded-[32px] shadow-2xl overflow-hidden border border-gray-100 p-6 md:p-8">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Image & Organizer */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        {/* Event Thumbnail */}
                        <div className="aspect-square w-full rounded-2xl overflow-hidden shadow-sm relative group">
                            <img
                                src={event.thumbnail}
                                alt={event.name}
                                className="w-full h-full object-cover"
                            />
                            {event.category && (
                                <Badge className="absolute top-4 left-4 bg-white/90 text-black hover:bg-white backdrop-blur-md shadow-sm">
                                    {event.category.name}
                                </Badge>
                            )}
                        </div>

                        {/* Organizer Info */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Được tổ chức bởi</h3>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                    <AvatarImage src={event.appUser?.avatar} />
                                    <AvatarFallback>{event.appUser?.fullName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold text-foreground text-lg">{event.appUser?.fullName}</p>
                                    <p className="text-sm text-muted-foreground">Ban tổ chức</p>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Additional Links */}
                        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                            <button className="flex items-center gap-2 hover:text-primary transition-colors text-left">
                                <User size={16} /> Liên hệ người tổ chức
                            </button>
                            <button className="flex items-center gap-2 hover:text-red-500 transition-colors text-left">
                                <Flag size={16} /> Báo cáo sự kiện
                            </button>
                        </div>
                    </div>

                    {/* Content & Action */}
                    <div className="lg:col-span-7 flex flex-col justify-between">

                        {/* Event Details */}
                        <div className="space-y-6">
                            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight">
                                {event.name}
                            </h1>

                            <div className="space-y-4">
                                {/* Date Block */}
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center text-primary shrink-0">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg text-foreground">
                                            {firstSession ? displaySessionDate({
                                                startDateTime: firstSession.startDateTime,
                                                endDateTime: firstSession.endDateTime
                                            }) : 'Chưa cập nhật'}
                                        </p>
                                        <p className="text-muted-foreground">
                                            {firstSession ? `${formatTime(firstSession.startDateTime)} - 
                                            ${formatTime(firstSession.endDateTime)}` : ''}
                                        </p>
                                    </div>
                                </div>

                                {/* Location Block */}
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center text-primary shrink-0">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg text-foreground">Địa điểm tổ chức</p>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {event.location}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* INVITATION ACTION BOX */}
                        <div className="mt-8 bg-gray-50/80 rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Ticket className="w-5 h-5 text-primary" />
                                    Thông tin vé mời
                                </h3>

                            </div>

                            {/* Ticket Row */}
                            <div className="bg-white rounded-xl p-4 flex items-center justify-between border border-gray-100 shadow-sm mb-6">
                                <div className="flex flex-col">
                                    <span className="font-bold text-gray-900 text-lg">
                                        {ticketInfo?.name || "Vé tham dự"}
                                    </span>
                                    <span className="text-sm text-primary font-medium">
                                        {formatCurrency(ticketInfo?.price)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-lg border">
                                    <span className="text-xs text-muted-foreground uppercase font-bold">Số lượng</span>
                                    <span className="text-lg font-bold text-foreground">{invitation.initialQuantity}</span>
                                </div>
                            </div>

                            {/* Message if any */}
                            {invitation.message && (
                                <div className="mb-6 text-sm text-gray-600 bg-blue-50/50 p-3 rounded-lg border border-blue-100 italic">
                                    " {invitation.message} "
                                </div>
                            )}

                            {/* Action Buttons */}
                            {!isProcessed ? (
                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        variant="outline"
                                        className="h-12 text-base font-semibold border-gray-300 hover:bg-gray-100 hover:text-red-600"
                                        onClick={() => setIsRejectOpen(true)}
                                    >
                                        Từ chối
                                    </Button>
                                    <Button
                                        className="h-12 text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                                        onClick={() => setIsAcceptOpen(true)}
                                    >
                                        Xác nhận tham gia <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="w-full bg-gray-100 py-3 rounded-xl text-center text-muted-foreground font-medium flex items-center justify-center gap-2">
                                    {invitation.status === InvitationStatus.ACCEPTED && (
                                        <><CheckCircle2 className="text-green-600" /> Hẹn gặp bạn tại sự kiện!</>
                                    )}
                                    {invitation.status === InvitationStatus.REJECTED && (
                                        <><XCircle className="text-red-500" /> Bạn đã từ chối tham gia.</>
                                    )}
                                    {invitation.status === InvitationStatus.REVOKED && (
                                        <><Ban className="text-slate-500" /> Lời mời đã bị thu hồi.</>
                                    )}
                                    {invitation.status === InvitationStatus.EXPIRED && (
                                        <><Timer className="text-gray-500" /> Lời mời đã hết hạn.</>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            {/* MODALS */}
            <AcceptInvitationDialog
                open={isAcceptOpen}
                onOpenChange={setIsAcceptOpen}
                onConfirm={handleAccept}
            />

            <RejectInvitationDialog
                open={isRejectOpen}
                onOpenChange={setIsRejectOpen}
                onConfirm={handleReject}
            />
        </div>
    );
};

export default InvitationResponsePage;