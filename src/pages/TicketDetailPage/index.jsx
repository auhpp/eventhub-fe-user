import React, { useEffect, useState } from 'react';
import {
    Calendar,
    MapPin,
    Clock,
    Download,
    ArrowLeft,
    Info,
    FileText,
    Video,
    Loader2,
    CircleX
} from 'lucide-react';
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useParams } from 'react-router-dom';
import { getAttendeeById } from '@/services/attendeeService';
import { HttpStatusCode } from 'axios';
import { routes } from '@/config/routes';
import { displaySessionDate, formatTime } from '@/utils/format';
import QRCode from 'react-qr-code';

const TicketDetailPage = () => {
    const [attendee, setAttendee] = useState(null)
    const { id } = useParams();
    const navigate = useNavigate()

    useEffect(() => {
        const fetchAttendeeById = async () => {
            try {
                const response = await getAttendeeById({ id: id })
                if (response.code === HttpStatusCode.Ok) {
                    setAttendee(response.result)
                }
            } catch (error) {
                console.log(error)
            }
        }
        fetchAttendeeById()
    }, [id])

    if (!attendee) {
        return (
            <div className="flex justify-center items-center h-screen w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const handleGoToOrder = () => {
        navigate(routes.orderDetail.replace(':id', attendee.booking.id))
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-12 font-sans text-slate-900">
            {/* --- HEADER --- */}
            <Button variant="ghost" className="pl-0 text-slate-500 hover:text-primary mb-2" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
            </Button>

            <main className="container">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* --- LEFT COLUMN: EVENT INFO --- */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Banner & Title Card */}
                        <div className="relative rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-white group">
                            <div className="h-64 sm:h-80 w-full relative overflow-hidden">
                                <img
                                    src={attendee.event.thumbnail}
                                    alt="Event Banner"
                                    className="w-full h-full object-cover"
                                />
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
                                {/* Time */}
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-2xl
                                     bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-500 
                                        uppercase tracking-wider mb-1">Thời gian</p>
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

                                {/* Location */}
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                        {attendee.event.type === 'ONLINE' ?
                                            <Video className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                            {attendee.event.type === 'ONLINE' ? 'Nền tảng' : 'Địa điểm'}
                                        </p>
                                        <p className="text-md font-bold text-slate-900">
                                            {attendee.event.location}
                                        </p>
                                        {attendee.event.type === 'OFFLINE' && (
                                            <p className="text-slate-600 mt-1 text-sm">
                                                {attendee.event.locationCoordinates?.address}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </div>

                        {/* Important Info Section */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Info className="w-5 h-5 text-blue-600" />
                                Thông tin quan trọng
                            </h3>
                            <div className="prose prose-slate text-slate-600 text-sm">
                                <ul className="space-y-2 list-disc pl-5">
                                    <li>Vui lòng xuất trình mã QR Code này tại quầy check-in để đổi thẻ tham dự.</li>
                                    <li>Vé này dành cho 01 người và chỉ có giá trị sử dụng một lần.</li>
                                    <li>Vui lòng mang theo giấy tờ tùy thân (CCCD/CMND) để đối chiếu khi cần thiết.</li>
                                    <li>Không hoàn/hủy vé sau khi sự kiện đã bắt đầu.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT COLUMN: TICKET CARD --- */}
                    <div className="lg:col-span-4 sticky top-24 space-y-6">

                        {/* Ticket Card */}
                        <div className="bg-white rounded-xl shadow-xl 
                        shadow-slate-200 border border-slate-200 overflow-hidden relative group">
                            {/* Decorative Top Bar */}
                            <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600"></div>

                            <div className="p-4 flex flex-col items-center text-center">
                                <p className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase mb-6">
                                    CHECK-IN CODE
                                </p>

                                {/* QR Code Placeholder */}
                                <div className="flex flex-col items-center
                                 justify-center bg-white dark:bg-slate-900">
                                    <div className="p-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-white shadow-sm">
                                        <div style={{ height: "auto", margin: "0 auto", maxWidth: 200, width: "100%" }}>
                                            <QRCode
                                                size={256}
                                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                                value={attendee.ticketCode}
                                                viewBox={`0 0 256 256`}
                                                fgColor="#000000" 
                                                bgColor="#FFFFFF" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Ticket Code */}
                                <div className="flex
                                mt-2
                                items-center gap-3 mb-6 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                    <span className="text-2xl font-mono font-bold text-slate-900 tracking-wider">
                                        {attendee.ticketCode}
                                    </span>
                                </div>

                                {/* User & Ticket Type info */}
                                <div className="w-full space-y-3 mb-6">
                                    <div className="flex justify-between items-center p-3
                                     rounded-xl bg-blue-50 border border-blue-100">
                                        <span className="text-xs text-blue-600 font-medium uppercase">Loại vé</span>
                                        <span className="text-sm font-bold text-blue-700">{attendee.ticket.name}</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="w-full space-y-3">
                                    <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 rounded-xl font-bold shadow-lg shadow-slate-900/10">
                                        <Download className="w-4 h-4 mr-2" /> Tải vé PDF
                                    </Button>
                                    {/* <div className="grid grid-cols-2 gap-3">
                                        <Button variant="outline" className="h-10 rounded-xl border-slate-200">
                                            <Share2 className="w-4 h-4 mr-2" /> Chia sẻ
                                        </Button>
                                        <Button variant="outline" className="h-10 rounded-xl border-slate-200">
                                            <ExternalLink className="w-4 h-4 mr-2" /> Ví Apple
                                        </Button>
                                    </div> */}
                                </div>
                            </div>


                        </div>
                        <div className="bg-red-50 rounded-xl border border-red-200 p-4 shadow-sm">
                            <h3 className="text-md font-bold text-red-600 mb-1 flex items-center gap-2">
                                Quản lý đặt chỗ
                            </h3>
                            <div className="prose prose-slate text-slate-600 text-sm flex flex-col items-center">
                                <p className='text-xs'>Nếu bạn không tham gia, hãy hủy vé sớm để nhường cơ hội cho người khác</p>
                                <Button className='bg-white hover:bg-red-500 mt-1 
                                text-red-500 border hover:text-white border-red-500'>
                                    <CircleX className="w-4 h-4 mr-2" />
                                    Hủy vé tham gia</Button>
                            </div>
                        </div>
                        {/* Navigation to Order Detail (New Feature) */}
                        <div className="text-center">
                            <p className="text-sm text-slate-500 mb-3">Bạn muốn kiểm tra lại thanh toán?</p>
                            <Button
                                variant="outline"
                                className="w-full border-dashed border-blue-300 bg-blue-50/50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 h-11 rounded-xl"
                                onClick={handleGoToOrder}
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                Xem chi tiết đơn hàng #{attendee.booking.id}
                            </Button>
                        </div>

                    </div>

                </div>
            </main>
        </div>
    );
};

export default TicketDetailPage;