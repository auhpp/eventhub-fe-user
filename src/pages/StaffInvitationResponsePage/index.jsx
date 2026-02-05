import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
    Calendar, MapPin, CheckCircle2, XCircle, AlertCircle, Loader2,
    ShieldCheck, User, Flag, Ban, Timer, Video
} from "lucide-react";
import { toast } from "sonner";

import { getEventById } from "@/services/eventService";

import { formatTime, displaySessionDate } from '@/utils/format';
import { EventStaffStatus, EventType, InvitationStatus, RoleName } from '@/utils/constant';
import RejectInvitationDialog from '../../components/RejectInvitationDialog';
import AcceptInvitationDialog from '../../components/AcceptInvitationDialog';
import { acceptEventStaff, getEventStaffByToken, rejectEventStaff } from '@/services/eventStaffService';
import { AuthContext } from '@/context/AuthContex';
import { routes } from '@/config/routes';
import { HttpStatusCode } from 'axios';
import DefaultAvatar from '@/components/DefaultAvatar';

const StaffInvitationResponsePage = () => {
    const [searchParams] = useSearchParams();
    const { user } = useContext(AuthContext)

    const token = searchParams.get("token");
    const eventId = searchParams.get("eventId");

    const [invitation, setInvitation] = useState(null);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isProcessed, setIsProcessed] = useState(false);
    const [isAcceptOpen, setIsAcceptOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);

    const navigate = useNavigate()
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
                    getEventStaffByToken({ token }),
                    getEventById({ id: eventId })
                ]);

                // handle Invitation Data
                if (inviteRes.code == HttpStatusCode.Ok) {
                    const inviteData = inviteRes.result;
                    setInvitation(inviteData);

                    if (inviteData.status !== InvitationStatus.PENDING) {
                        setIsProcessed(true);
                    }
                }
                // handle Event Data
                if (eventRes.code == HttpStatusCode.Ok) {
                    setEvent(eventRes.result || eventRes);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Không thể tải thông tin lời mời.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [token, eventId]);

    const fetchEventStaffByToken = async () => {
        try {
            const res = await getEventStaffByToken({ token });
            if (res.code == HttpStatusCode.Ok) {
                setInvitation(res.result);
            }
        } catch (error) {
            console.log(error)
        }
    }

    // Handlers
    const handleAccept = async () => {
        if (!user) {
            toast.info("Vui lòng đăng nhập hoặc đăng ký để tiếp nhận quyền quản lý.");

            const currentPath = location.pathname + location.search;
            const targetEmail = invitation?.email || "";
            const loginUrl =
                `${routes.signin}?redirect=${encodeURIComponent(currentPath)}&email=${encodeURIComponent(targetEmail)}`;
            navigate(loginUrl);
            return;
        }

        // compare invitation email and current user email
        if (invitation?.email && user.email && invitation.email !== user.email) {
            toast.error(`Lời mời gửi tới ${invitation.email}, nhưng bạn đang đăng nhập bằng ${user.email}.`);
            return;
        }

        // call Api
        try {
            const acceptResponse = await acceptEventStaff({ token });
            if (acceptResponse.code == HttpStatusCode.Ok) {
                toast.success("Đã chấp nhận lời mời! Bạn đã trở thành điều hành viên.");
                setIsProcessed(true);
                setIsAcceptOpen(false);
                await fetchEventStaffByToken()
            }

        } catch (error) {
            console.error(error);
            toast.error("Xác nhận thất bại hoặc lời mời không còn hiệu lực.");
        }
    };

    const handleReject = async (message) => {
        try {
            const response = await rejectEventStaff({ token, rejectionMessage: message });
            if (response.code == HttpStatusCode.Ok) {
                toast.info("Đã từ chối lời mời cộng tác.");
                setIsProcessed(true);
                setIsRejectOpen(false);
                await fetchEventStaffByToken()
            }
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
    const isOnline = event.type === EventType.ONLINE;

    return (
        <div className="min-h-screen bg-[#f8f9fc] py-10 px-4 flex justify-center items-center">
            <div className="w-full max-w-5xl bg-background rounded-[32px] shadow-2xl overflow-hidden border border-gray-100 p-6 md:p-8">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* --- LEFT COLUMN: Event Visuals & Organizer --- */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        {/* Event Thumbnail */}
                        <div className="aspect-square w-full rounded-2xl overflow-hidden shadow-sm relative group">
                            <img
                                src={event.poster}
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
                                    <DefaultAvatar user={event.appUser} />
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

                    {/* --- RIGHT COLUMN: Content & Moderator Invite Action --- */}
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
                                        <p className="font-bold text-lg text-foreground">Địa điểm chính</p>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {event.location}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* MODERATOR INVITATION ACTION BOX */}
                        <div className="mt-8 bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-xl flex items-center gap-2 text-indigo-950">
                                        <ShieldCheck className="w-6 h-6 text-indigo-600" />
                                        Lời mời tham gia Ban Điều Hành
                                    </h3>
                                    <p className="text-sm text-indigo-600/80 mt-1">
                                        Bạn được mời trở thành một phần của đội ngũ tổ chức sự kiện này.
                                    </p>
                                </div>
                            </div>

                            {/* Role & Sessions Card */}
                            <div className="bg-white rounded-xl overflow-hidden border border-indigo-100 shadow-sm mb-6">
                                {/* Header Card */}
                                <div className="bg-indigo-600 p-4 flex items-center justify-between text-white">
                                    <span className="font-semibold text-lg">Vai trò</span>
                                    <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
                                        {RoleName[invitation.role.name].label}
                                    </Badge>
                                </div>

                                <div className="p-4">
                                    <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase text-xs">
                                        Danh sách khung giờ cần quản lý
                                    </p>

                                    <div className="flex flex-col gap-3 max-h-[200px] overflow-y-auto pr-2">
                                        {event.eventSessions?.map((session) => {

                                            return (
                                                <div
                                                    key={session.id}
                                                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors"
                                                >
                                                    {/* --- ICON LOGIC --- */}
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 
                        ${isOnline
                                                            ? 'bg-blue-100 text-blue-600'
                                                            : 'bg-orange-100 text-orange-600'
                                                        }`}
                                                    >
                                                        {isOnline ? <Video size={18} /> : <MapPin size={18} />}
                                                    </div>

                                                    {/* --- INFO LOGIC --- */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-gray-900 truncate">
                                                            {session.name}
                                                        </p>

                                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mt-0.5">
                                                            {/* date */}
                                                            <span>
                                                                {displaySessionDate({
                                                                    startDateTime: session.startDateTime,
                                                                    endDateTime: session.endDateTime
                                                                })}
                                                            </span>

                                                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>

                                                            {/* time */}
                                                            <span className="font-medium text-gray-600">
                                                                {formatTime(session.startDateTime)} - {formatTime(session.endDateTime)}
                                                            </span>

                                                            {isOnline && session.meetingPlatform && (
                                                                <>
                                                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                                    <span className="text-blue-600 truncate max-w-[80px]">
                                                                        {session.meetingPlatform}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* --- BADGE LOGIC --- */}
                                                    <Badge
                                                        variant="outline"
                                                        className={`shrink-0 text-[10px] px-2 py-0.5 h-6 
                            ${isOnline
                                                                ? 'border-blue-200 text-blue-700 bg-blue-50'
                                                                : 'border-orange-200 text-orange-700 bg-orange-50'
                                                            }`}
                                                    >
                                                        {isOnline ? 'Online' : 'Offline'}
                                                    </Badge>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Message from Organizer */}
                            {invitation.message && (
                                <div className="mb-6 text-sm text-gray-600 bg-white p-4 rounded-lg border border-gray-200 italic relative">
                                    <span className="absolute -top-2 left-4 bg-gray-200 text-gray-500 text-[10px] px-2 rounded-full">Lời nhắn</span>
                                    " {invitation.message} "
                                </div>
                            )}

                            {/* Action Buttons */}
                            {!isProcessed ? (
                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        variant="outline"
                                        className="h-12 text-base font-semibold border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                        onClick={() => setIsRejectOpen(true)}
                                    >
                                        Từ chối
                                    </Button>
                                    <Button
                                        className="h-12 text-base font-semibold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                                        onClick={() => setIsAcceptOpen(true)}
                                    >
                                        Chấp nhận tham gia
                                    </Button>
                                </div>
                            ) : (
                                <div className="w-full bg-white py-4 rounded-xl text-center font-medium flex items-center justify-center gap-2 border border-gray-100 shadow-sm">
                                    {invitation.status === EventStaffStatus.ACTIVE && (
                                        <div className='flex flex-col items-center gap-1'>
                                            <div className="flex items-center gap-2 text-green-600 text-lg font-bold">
                                                <CheckCircle2 /> Chào mừng thành viên mới!
                                            </div>
                                            <p className="text-sm text-muted-foreground">Bạn đã chính thức là điều hành viên của sự kiện này.</p>
                                        </div>

                                    )}
                                    {invitation.status === EventStaffStatus.REJECTED && (
                                        <><XCircle className="text-red-500" /> Bạn đã từ chối lời mời cộng tác.</>
                                    )}
                                    {invitation.status === EventStaffStatus.REVOKED && (
                                        <><Ban className="text-slate-500" /> Lời mời đã bị thu hồi.</>
                                    )}
                                    {invitation.status === EventStaffStatus.EXPIRED && (
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
                title="Xác nhận tham gia Ban Điều Hành"
                description="Bạn sẽ được cấp quyền quản lý các phiên sự kiện được chỉ định. Hành động này không thể hoàn tác."
            />

            <RejectInvitationDialog
                open={isRejectOpen}
                onOpenChange={setIsRejectOpen}
                onConfirm={handleReject}
            />
        </div>
    );
};

export default StaffInvitationResponsePage;