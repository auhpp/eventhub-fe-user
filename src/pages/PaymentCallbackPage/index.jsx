import React, { useEffect, useState } from 'react';
import {
    CheckCircle2,
    Home,
    Ticket,
    CalendarDays,
    MapPin,
    QrCode,
    Phone,
    Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation, useNavigate } from 'react-router-dom';
import { confirmPaymentBooking } from '@/services/paymentService';
import { HttpStatusCode } from 'axios';
import { routes } from '@/config/routes';
import { displaySessionDate, formatTime } from '@/utils/format';
import { BookingStatus } from '@/utils/constant';
import { getBookingById } from '@/services/bookingService';

const getTicketSummary = (attendees) => {
    if (!attendees || attendees.length === 0) return "Chưa có thông tin vé";

    var mapTicket = {};
    attendees.forEach(attendee => {
        var oldQuantity = mapTicket[attendee.ticket.id]?.quantity ? mapTicket[attendee.ticket.id].quantity : 0
        mapTicket[attendee.ticket.id] = { ...attendee.ticket, quantity: oldQuantity + 1 }
    });

    return Object.keys(mapTicket).map(
        (key) => mapTicket[key]
    )
};

const PaymentCallbackPage = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const vnpTxnRef = searchParams.get("vnp_TxnRef")
    const bookingId = searchParams.get("bookingId")
    const navigate = useNavigate()
    const [bookingData, setBookingData] = useState(null)
    const [eventSession, setEventSession] = useState(null)

    useEffect(
        () => {
            const checkPayment = async () => {
                if (bookingId) {
                    const response = await getBookingById({ id: Number(bookingId) });
                    const booking = response.result
                    const eventSessionId = booking.attendees[0].ticket.eventSessionId
                    const eventSessionRes = booking.event.eventSessions.find(it => it.id == eventSessionId)
                    setBookingData(booking)
                    setEventSession(eventSessionRes)
                }
                else {
                    const response = await confirmPaymentBooking({ vnpTxnRef: vnpTxnRef })
                    if (response.code == HttpStatusCode.Ok) {
                        if (response.result != null) {
                            const booking = response.result.booking
                            const eventSessionId = booking.attendees[0].ticket.eventSessionId
                            const eventSessionRes = booking.event.eventSessions.find(it => it.id == eventSessionId)
                            if (response.result.transactionCode == "00") {
                                setBookingData(booking)
                                setEventSession(eventSessionRes)
                            }
                            else {
                                navigate(routes.payment.replace(":eventId", booking.event.id)
                                    .replace(":eventSessionId", eventSessionId)
                                    .replace(":bookingId", booking.id));
                            }
                        }
                    }

                }
            }
            checkPayment()
        }, [vnpTxnRef, bookingId, navigate]
    )
    if (!bookingData || !eventSession) {
        return (
            <div className="flex justify-center items-center h-screen w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }
    return (
        <div className="min-h-screen bg-[#f6f6f8]
         dark:bg-[#101622] flex flex-col items-center justify-center font-sans">

            {/* Main Card */}
            <Card className="w-full max-w-3xl shadow-xl rounded-2xl 
            overflow-hidden border-none relative bg-white dark:bg-[#1a202c]">
                {/* Decorative Top Border Gradient */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-800"></div>

                <CardContent className="flex flex-col items-center pt-10 pb-8 px-6 md:px-12 text-center">

                    {/* Success Icon */}
                    <div className="mb-6 relative">
                        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-green-50 dark:bg-green-900/20 text-green-500 ring-1 ring-green-100 dark:ring-green-800">
                            <CheckCircle2 className="w-16 h-16" strokeWidth={3} />
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
                        Đặt vé thành công!
                    </div>

                    {/* Subtitle / Email confirmation */}
                    <p className="text-gray-500 dark:text-gray-400 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
                        Chúc mừng bạn! Vé của bạn đã được xác nhận. Thông tin chi tiết đã được gửi đến email <span className="font-bold text-gray-900 dark:text-white">{bookingData.customerEmail}</span>.
                    </p>

                    {/* Ticket Detail Box */}
                    <div className="w-full bg-gray-50 dark:bg-gray-800/40 rounded-xl p-5 border border-dashed border-gray-300 dark:border-gray-700 mb-10">
                        <div className="flex flex-col md:flex-row gap-5 items-center md:items-start text-left">

                            {/* Event Image */}
                            <div className="h-24 w-full md:w-36 shrink-0 rounded-lg overflow-hidden relative shadow-sm group">
                                <img
                                    src={bookingData.event.thumbnail || "https://placehold.co/600x400?text=Event+Image"}
                                    alt="Event Thumbnail"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            </div>

                            {/* Info Section */}
                            <div className="flex-1 w-full space-y-3">

                                {/* Header: Title + Status Badge */}
                                <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                        {bookingData.event.name}
                                    </h3>

                                    {bookingData.status === BookingStatus.PAID ? (
                                        <Badge variant="secondary"
                                            className="bg-green-100 text-green-700 hover:bg-green-100
                                             border-green-200 text-[10px]">
                                            <CheckCircle2 className="w-3 h-3 mr-1" /> Đã thanh toán
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
                                            {bookingData.status}
                                        </Badge>
                                    )}
                                </div>

                                <Separator className="bg-gray-200 dark:bg-gray-700" />

                                {/* Grid Details */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm text-gray-600 dark:text-gray-400">
                                    {/* Time */}
                                    <div className="flex items-center gap-2">
                                        <CalendarDays className="w-5 h-5 text-blue-600 shrink-0" />
                                        <span>{displaySessionDate({
                                            startDateTime: eventSession.startDateTime,
                                            endDateTime: eventSession.endDateTime
                                        })}</span>
                                        <span>{formatTime(eventSession.startDateTime) + " - "
                                            + formatTime(eventSession.endDateTime)}</span>
                                    </div>

                                    {/* Location */}
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
                                        <span className="truncate">{bookingData.event.location || "Địa điểm chưa cập nhật"}</span>
                                    </div>

                                    {/* Ticket Info */}
                                    <div className="flex items-start gap-2">
                                        <Ticket className="w-5 h-5 text-blue-600 shrink-0" />
                                        <div>
                                            {
                                                getTicketSummary(bookingData.attendees).map(
                                                    ticket => (
                                                        <p>{`${ticket.quantity} x ${ticket.name}`}</p>
                                                    )
                                                )
                                            }
                                        </div>
                                    </div>

                                    {/* Order ID */}
                                    <div className="flex items-center gap-2">
                                        <QrCode className="w-5 h-5 text-blue-600 shrink-0" />
                                        <span className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                            Mã đơn: #{bookingData.id}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            className="h-12 px-8 rounded-xl border-2 text-gray-700 font-bold hover:bg-gray-50 gap-2 min-w-[180px]"
                            onClick={() => navigate(routes.home, { replace: true })}
                        >
                            <Home className="w-4 h-4" />
                            Về trang chủ
                        </Button>

                        <Button
                            className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/30 gap-2 min-w-[180px]"
                            onClick={() => window.location.href = '/my-tickets'}
                        >
                            <Ticket className="w-4 h-4" />
                            Xem vé của tôi
                        </Button>
                    </div>

                </CardContent>

                {/* Footer Support */}
                <div className="bg-gray-50 dark:bg-gray-800/50 py-4 px-6 text-center border-t border-gray-100 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                        Cần hỗ trợ? Liên hệ <a href="#" className="text-blue-600 hover:underline font-medium">Trung tâm trợ giúp</a> hoặc gọi hotline
                        <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center ml-1">
                            <Phone className="w-3 h-3 mr-0.5" /> 1900 1234
                        </span>
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default PaymentCallbackPage;