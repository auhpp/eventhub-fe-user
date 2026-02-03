import React, { useEffect, useState } from 'react';
import {
    Calendar, MapPin, Clock, Download, ArrowLeft, Info,
    FileText, Video, Loader2, CircleX, Send, UserCheck, ExternalLink,
    MonitorPlay
} from 'lucide-react';
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNavigate, useParams } from 'react-router-dom';
import { getAttendeeById, assignAttendeeEmail, getMeetingUrl } from '@/services/attendeeService';
import { HttpStatusCode } from 'axios';
import { routes } from '@/config/routes';
import { displaySessionDate, formatTime } from '@/utils/format';
import QRCode from 'react-qr-code';
import { toast } from 'sonner';

const TicketDetailPage = () => {
    const [attendee, setAttendee] = useState(null);
    const [loading, setLoading] = useState(true);

    const [recipientEmail, setRecipientEmail] = useState("");
    const [isAssigning, setIsAssigning] = useState(false);

    const [isJoining, setIsJoining] = useState(false);

    const { id } = useParams();
    const navigate = useNavigate();

    const fetchAttendeeById = async () => {
        try {
            const response = await getAttendeeById({ id: id });
            if (response.code === HttpStatusCode.Ok) {
                setAttendee(response.result);
            }
        } catch (error) {
            console.log(error);
            toast.error("Không thể tải thông tin vé");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendeeById();
    }, [id]);

    const handleAssignTicket = async () => {
        if (!recipientEmail || !recipientEmail.includes('@')) {
            toast.error("Vui lòng nhập email hợp lệ");
            return;
        }

        setIsAssigning(true);
        try {
            await assignAttendeeEmail({ attendeeId: id, email: recipientEmail });
            toast.success(`Đã gửi vé thành công cho ${recipientEmail}`);
            setRecipientEmail("");
            fetchAttendeeById();
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi gửi vé");
        } finally {
            setIsAssigning(false);
        }
    };

    const handleJoinEvent = async () => {
        const now = new Date();
        const startTime = new Date(attendee.eventSession.checkingStartTime);
        const canJoinTime = new Date(startTime.getTime() - 15 * 60000);

        if (attendee.eventSession.checkingStartTime && (now < canJoinTime)) {
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

    if (loading || !attendee) {
        return (
            <div className="flex justify-center items-center h-screen w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const isOnlineEvent = attendee.event.type === 'ONLINE';
    const assignedUserEmail = attendee.ownerEmail;

    return (
        <div className="min-h-screen bg-slate-50/50 pb-12 font-sans text-slate-900">
            {/* Header Button */}
            <div className="container pt-4">
                <Button variant="ghost" className="pl-0 text-slate-500 hover:text-primary mb-2" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
                </Button>
            </div>

            <main className="container">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* --- LEFT COLUMN: EVENT INFO --- */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Banner & Title */}
                        <div className="relative rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-white group">
                            <div className="h-64 sm:h-80 w-full relative overflow-hidden">
                                <img src={attendee.event.thumbnail} alt="Event Banner" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 p-6 sm:p-8 w-full">
                                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md mb-3">
                                        {attendee.event.category?.name}
                                    </Badge>
                                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-2">
                                        {attendee.event.name}
                                    </h1>
                                    <p className="text-slate-300 font-medium text-lg truncate">
                                        {attendee.eventSession.name}
                                    </p>
                                </div>
                            </div>

                            <CardContent className="p-3 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Thời gian</p>
                                        <p className="text-md font-bold text-slate-900">
                                            {displaySessionDate({
                                                startDateTime: attendee.eventSession.startDateTime,
                                                endDateTime: attendee.eventSession.endDateTime
                                            })}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-slate-600 mt-1 font-medium">
                                            <Clock className="w-4 h-4" />
                                            {formatTime(attendee.eventSession.startDateTime)} - {formatTime(attendee.eventSession.endDateTime)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                        {isOnlineEvent ? <Video className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                            {isOnlineEvent ? 'Nền tảng' : 'Địa điểm'}
                                        </p>
                                        <p className="text-md font-bold text-slate-900">
                                            {attendee.event.location}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </div>

                        {/* --- JOIN BUTTON FOR ONLINE EVENT --- */}
                        {isOnlineEvent && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6 shadow-sm">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                                            <Video className="w-5 h-5" /> Sự kiện Online
                                        </h3>
                                        <p className="text-blue-700 text-sm mt-1">
                                            Link tham gia sẽ khả dụng khi sự kiện bắt đầu.
                                        </p>
                                    </div>
                                    <Button
                                        size="lg"
                                        onClick={handleJoinEvent}
                                        disabled={isJoining}
                                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 w-full md:w-auto font-bold"
                                    >
                                        {isJoining ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ExternalLink className="w-4 h-4 mr-2" />}
                                        Vào sự kiện ngay
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* --- RIGHT COLUMN: TICKET ACTIONS --- */}
                    <div className="lg:col-span-4 sticky top-24 space-y-6">

                        {/* Ticket Card */}
                        <div className="bg-white rounded-xl shadow-xl shadow-slate-200 border border-slate-200 overflow-hidden relative">
                            {/* Decorative Top Bar */}
                            <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600"></div>

                            <div className="p-4 flex flex-col items-center text-center">

                                {!isOnlineEvent ? (
                                    <>
                                        <p className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase mb-6">CHECK-IN CODE</p>
                                        <div className="p-4 rounded-xl border-2 border-slate-100 bg-white shadow-sm mb-6">
                                            <div style={{ height: "auto", margin: "0 auto", maxWidth: 200, width: "100%" }}>
                                                <QRCode
                                                    size={256}
                                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                                    value={attendee.ticketCode}
                                                    viewBox={`0 0 256 256`}
                                                />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-6 flex flex-col items-center justify-center">
                                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-600 ring-4 ring-blue-50/50">
                                            <MonitorPlay className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
                                            VÉ TRỰC TUYẾN
                                        </h3>
                                        <p className="text-xs text-slate-500 max-w-[220px] mb-4">
                                            Sự kiện này diễn ra online. Bạn không cần mã QR để check-in tại quầy.
                                        </p>
                                    </div>
                                )}

                                {/* ticket code */}
                                <div className="flex items-center gap-3 mb-6 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                    <span className="text-2xl font-mono font-bold text-slate-900 tracking-wider">
                                        {attendee.ticketCode}
                                    </span>
                                </div>

                                {/* Owner Info */}
                                <div className="w-full bg-slate-50 rounded-lg p-3 mb-4 border border-slate-100 flex items-center justify-between">
                                    <span className="text-xs text-slate-500 font-medium uppercase">Người sở hữu</span>
                                    <div className="flex items-center gap-2">
                                        <UserCheck className="w-4 h-4 text-green-600" />
                                        <span className="text-sm font-bold text-slate-800 truncate max-w-[150px]"
                                            title={assignedUserEmail}>
                                            {assignedUserEmail || "Chưa gán"}
                                        </span>
                                    </div>
                                </div>

                                <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 rounded-xl font-bold shadow-lg">
                                    <Download className="w-4 h-4 mr-2" /> Tải vé PDF
                                </Button>
                            </div>
                        </div>

                        {/* --- ASSIGN TICKET SECTION --- */}
                        {
                            !assignedUserEmail &&
                            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                                <h3 className="text-md font-bold text-slate-900 mb-3 flex items-center gap-2">
                                    <Send className="w-4 h-4 text-primary" />
                                    Gửi vé cho bạn bè
                                </h3>
                                <p className="text-xs text-slate-500 mb-4">
                                    Nhập email của người nhận. Vé sẽ được chuyển sang tài khoản của họ.
                                </p>

                                <div className="space-y-3">
                                    <Input
                                        placeholder="nhap_email_ban_be@example.com"
                                        value={recipientEmail}
                                        onChange={(e) => setRecipientEmail(e.target.value)}
                                        className="h-10 text-sm"
                                    />
                                    <Button
                                        onClick={handleAssignTicket}
                                        disabled={isAssigning || !recipientEmail}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                                    >
                                        {isAssigning ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Gửi vé ngay"}
                                    </Button>
                                </div>
                            </div>
                        }

                        <div className="text-center">
                            <Button
                                variant="outline"
                                className="w-full border-dashed border-blue-300 bg-blue-50/50 text-blue-700 hover:bg-blue-100 h-11 rounded-xl"
                                onClick={() => navigate(routes.orderDetail.replace(':id', attendee.booking.id))}
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                Đơn hàng #{attendee.booking.id}
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TicketDetailPage;