import React, { useState } from "react";
// THÊM MỚI: Import thêm CalendarPlus để dùng cho nút Add to Calendar
import { Calendar, CalendarPlus, MapPin, Video, QrCode, Clock, Loader2, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AttendeeStatus, MeetingPlatform } from "@/utils/constant";
import { displaySessionDate, formatTime } from "@/utils/format";
import TicketQRModal from "./TicketQRModal";
import { useNavigate } from "react-router-dom";
import { routes } from "@/config/routes";
import { getMeetingUrl } from "@/services/attendeeService";
import { toast } from "sonner";

const TicketCard = ({ data }) => {
    const { id, ticketCode, status, ticket, event, eventSession } = data;
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const navigate = useNavigate();

    const statusStyle = AttendeeStatus[status] || AttendeeStatus.PENDING;
    const isOnline = event?.type === "ONLINE";
    const [isJoining, setIsJoining] = useState(false);

    const handleJoinEvent = async () => {
        const now = new Date();
        const startTime = new Date(eventSession.checkingStartTime);
        const canJoinTime = new Date(startTime.getTime() - 15 * 60000);

        if (eventSession.checkingStartTime && (now < canJoinTime)) {
            toast.warning(`Sự kiện chưa bắt đầu. Vui lòng quay lại vào lúc ${formatTime(canJoinTime)}`);
            return;
        }

        setIsJoining(true);
        try {
            const responseResult = await getMeetingUrl({ attendeeId: id });
            const meetingLink = responseResult.result;

            if (meetingLink) {
                window.open(meetingLink, '_blank');
            } else {
                toast.error("Không tìm thấy link tham gia.");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi lấy link tham gia");
        } finally {
            setIsJoining(false);
        }
    };

    // Format to UTC standard of Google Calendar (YYYYMMDDTHHMMSSZ)
    const formatGoogleCalendarDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        // Convert to ISO: 2026-10-20T02:00:00.000Z 
        return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    };

    // Create link and open Google Calendar
    const handleAddToCalendar = () => {
        if (!eventSession?.startDateTime || !eventSession?.endDateTime) {
            toast.error("Sự kiện chưa có thông tin thời gian cụ thể.");
            return;
        }

        const title = encodeURIComponent(event?.name || "Sự kiện của tôi");
        const details = encodeURIComponent(`Bạn đã đặt vé tham gia sự kiện này.\n- Loại vé: ${ticket?.name
            || "Vé thường"}\n- Mã vé của bạn: ${ticketCode || "N/A"}\n\nXem chi tiết: http://localhost:3000/my-tickets/${id}.`);

        const locationText = isOnline
            ? (eventSession.meetingPlatform === MeetingPlatform.GOOGLE_MEET ? "Google Meet" : "Zoom")
            : (event?.location || "Đang cập nhật địa điểm");
        const location = encodeURIComponent(locationText);

        const startDate = formatGoogleCalendarDate(eventSession.startDateTime);
        const endDate = formatGoogleCalendarDate(eventSession.endDateTime);

        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}
        &dates=${startDate}/${endDate}&details=${details}&location=${location}`;

        window.open(url, '_blank');
    };

    return (
        <>
            <Card className="overflow-hidden border-l-4 hover:shadow-md transition-all duration-200 mb-4 group border-l-primary/80">
                <div className="flex flex-col md:flex-row">
                    {/* left column: image */}
                    <div className="w-full md:w-48 h-32 md:h-auto relative shrink-0">
                        <img
                            src={event?.poster || 'https://placehold.co/600x400'}
                            alt={event?.name}
                            className="w-full h-full object-cover "
                        />

                        <div className="absolute bottom-2 right-2 md:hidden">
                            <span className={`rounded px-2 py-0.5 text-[10px] font-bold shadow-sm bg-white border ${statusStyle.color}`}>
                                {statusStyle.label}
                            </span>
                        </div>
                    </div>

                    {/* right column: content */}
                    <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start">
                                <div className="flex-1 mr-2">

                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 hover:bg-primary/10 rounded-sm text-[11px] px-2 py-0.5 font-semibold uppercase">
                                            {ticket?.name || "Vé thường"}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                            {event?.category?.name}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-1 
                                    ">
                                        {event?.name || "Tên sự kiện chưa cập nhật"}
                                    </h3>
                                    {
                                        !isOnline &&
                                        <p className="text-xs text-slate-500 font-mono mt-1">
                                            Mã vé: <span className="font-bold text-slate-700">#{ticketCode}</span>
                                        </p>
                                    }
                                </div>

                                <div className="hidden md:block shrink-0">
                                    <span className={`inline-block rounded px-2.5 py-0.5 text-[11px] font-bold border ${statusStyle.color} bg-opacity-10`}>
                                        {statusStyle.label}
                                    </span>
                                </div>
                            </div>

                            {/*Location & Time */}
                            <div className="flex flex-col sm:flex-row gap-y-2 gap-x-6 text-sm text-gray-600 mt-3">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-primary shrink-0" />
                                    <span className="whitespace-nowrap">
                                        {displaySessionDate({
                                            startDateTime: eventSession?.startDateTime,
                                            endDateTime: eventSession?.endDateTime
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {isOnline ? (
                                        <Video className="w-4 h-4 text-primary shrink-0" />
                                    ) : (
                                        <MapPin className="w-4 h-4 text-primary shrink-0" />
                                    )}
                                    <span className="truncate max-w-[200px]">
                                        {isOnline ? (
                                            eventSession.meetingPlatform == MeetingPlatform.GOOGLE_MEET ? "Google meet" : "Zoom"
                                        ) : (event?.location || "Chưa cập nhật")}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Footer: Actions */}
                        <div className="mt-4 md:mt-2">
                            <Separator className="my-3 md:hidden" />
                            <div className="flex flex-wrap justify-between items-end gap-3">
                                {/* Left: Time range detail */}
                                <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-slate-50 px-2 py-1 rounded">
                                    <Clock className="w-3.5 h-3.5" />
                                    {formatTime(eventSession?.startDateTime)} - {formatTime(eventSession?.endDateTime)}
                                </div>

                                {/* Right: Buttons */}
                                <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-1">

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAddToCalendar}
                                        className="gap-1 hidden sm:flex border-slate-200 hover:bg-slate-100"
                                    >
                                        <CalendarPlus className="w-4 h-4 text-slate-600" />
                                        <span>Lưu Lịch</span>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate(routes.ticketDetail.replace(":id", id))}
                                        className="gap-1 hidden sm:flex border-slate-200"
                                    >
                                        Chi tiết
                                    </Button>

                                    {
                                        isOnline ? <Button
                                            size="sm"
                                            onClick={handleJoinEvent}
                                            disabled={isJoining}
                                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 w-full md:w-auto font-bold"
                                        >
                                            {isJoining ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                : <ExternalLink className="w-4 h-4 mr-2" />}
                                            Vào sự kiện ngay
                                        </Button> :
                                            <Button
                                                size="sm"
                                                onClick={() => setIsQRModalOpen(true)}
                                                className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm w-full sm:w-auto"
                                            >
                                                <QrCode className="w-3.5 h-3.5" />
                                                <span>Mã Check-in</span>
                                            </Button>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <TicketQRModal
                isOpen={isQRModalOpen}
                onClose={() => setIsQRModalOpen(false)}
                ticketData={data}
            />
        </>
    );
};

export default TicketCard;