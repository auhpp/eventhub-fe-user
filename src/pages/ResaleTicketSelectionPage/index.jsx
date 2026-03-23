import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Plus, Minus, Tag, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { HttpStatusCode } from 'axios';

import { Button } from "@/components/ui/button";
import { routes } from '@/config/routes';
import { formatCurrency } from '@/utils/format';
import { getResalePostById } from '@/services/resalePostService';
import { getEventById } from '@/services/eventService';
import { getEventSessionById } from '@/services/eventSessionService';
import { createResalePendingBooking, deleteBookingById, getExistsPendingResaleBooking } from '@/services/bookingService';
import PendingBookingModal from '../TicketSelectionPage/PendingBookingModal';
import BookingSummary from '@/features/event/BookingSummary';
import { AttendeeStatus, BookingType } from '@/utils/constant';

const ResaleTicketSelectionPage = () => {
    const { resalePostId } = useParams();
    const navigate = useNavigate();

    // States
    const [resalePost, setResalePost] = useState(null);
    const [event, setEvent] = useState(null);
    const [eventSession, setEventSession] = useState(null);
    const [quantity, setQuantity] = useState(0);

    // Booking states
    const [booking, setBooking] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBookingTickets, setSelectedBookingTickets] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // handle logic get attendees valid
    const availableAttendees = useMemo(() => {
        if (!resalePost?.attendees) return [];
        return resalePost.attendees.filter(a => a.status === AttendeeStatus.ON_RESALE.key);
    }, [resalePost]);

    const maxQuantity = availableAttendees.length;
    const ticketInfo = resalePost?.attendees?.[0]?.ticket;

    // Fetch data
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch Resale Post
                const postRes = await getResalePostById({ id: resalePostId });
                const postData = postRes.result;
                setResalePost(postData);

                // init quantity
                const availableCount = postData?.attendees?.filter(a => a.status === AttendeeStatus.ON_RESALE).length || 0;
                if (availableCount > 0) {
                    setQuantity(postData.hasRetail ? 1 : availableCount);
                }

                // 2. get eventId & eventSessionId from first ticket
                const firstTicket = postData?.attendees?.[0]?.ticket;
                if (firstTicket) {
                    const [eventRes, sessionRes] = await Promise.all([
                        getEventById({ id: firstTicket.eventId }),
                        getEventSessionById({ id: firstTicket.eventSessionId })
                    ]);

                    if (eventRes?.result) setEvent(eventRes.result);
                    if (sessionRes?.result) setEventSession(sessionRes.result);
                }

                // 3. check pending booking for this resale post
                const pendingRes = await getExistsPendingResaleBooking({ resalePostId });
                if (pendingRes?.result) {
                    setBooking(pendingRes.result);
                    setIsModalOpen(true);

                    // Format ticket for Pending Modal display
                    const mapTicket = {};
                    pendingRes.result.attendees.forEach(attendee => {
                        const oldQuantity = mapTicket[attendee.ticket.id]?.quantity ? mapTicket[attendee.ticket.id].quantity : 0;

                        mapTicket[attendee.ticket.id] = {
                            ...attendee.ticket,
                            price: postData.pricePerTicket,
                            quantity: oldQuantity + 1
                        };
                    });
                    setSelectedBookingTickets(Object.values(mapTicket));
                }


            } catch (error) {
                console.error("Lỗi khi tải dữ liệu trang:", error);
                toast.error("Không thể tải thông tin vé bán lại.");
            } finally {
                setIsLoading(false);
            }
        };

        if (resalePostId) {
            fetchInitialData();
        }
    }, [resalePostId]);


    const handleQuantityChange = (delta) => {
        if (!resalePost.hasRetail) return;

        setQuantity(prev => {
            const newQty = prev + delta;
            if (newQty < 1) return 1;
            if (newQty > maxQuantity) return maxQuantity;
            return newQty;
        });
    };

    const onSubmitCreatePendingBooking = async () => {
        if (quantity <= 0 || quantity > maxQuantity) {
            toast.error("Số lượng vé không hợp lệ.");
            return;
        }

        setIsSubmitting(true);
        try {
            // get n ID of attendees
            const selectedAttendeeIds = availableAttendees.slice(0, quantity).map(a => a.id);

            const response = await createResalePendingBooking({
                attendeeIds: selectedAttendeeIds,
                type: BookingType.RESALE,
                resalePostId: resalePostId
            });

            if (response.code === HttpStatusCode.Ok) {
                const bookingId = response.result?.id;
                navigate(routes.payment
                    .replace(":eventId", event.id)
                    .replace(":eventSessionId", eventSession.id)
                    .replace(":bookingId", bookingId)
                );
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Lỗi khi tạo đơn hàng thanh toán.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handlers for Pending Modal
    const handleConfirmCancel = async () => {
        try {
            const response = await deleteBookingById({ id: booking.id });
            if (response.code === HttpStatusCode.Ok) {
                window.location.reload();
            }
        } catch (error) {
            console.error("Lỗi khi hủy đơn", error);
            toast.error("Lỗi khi hủy đơn hàng.");
        }
    };

    const handleContinuePaymentBooking = async () => {
        navigate(routes.payment
            .replace(":eventId", event.id)
            .replace(":eventSessionId", eventSession.id)
            .replace(":bookingId", booking.id)
        );
    };

    // prepare data for OrderSummary
    const totalAmount = quantity * (resalePost?.pricePerTicket || 0);
    const selectedTicketsForSummary = useMemo(() => {
        if (!ticketInfo || quantity <= 0) return [];
        return [{
            ...ticketInfo,
            price: resalePost.pricePerTicket,
            quantity: quantity,
            name: `${ticketInfo.name} (Vé bán lại)`
        }];
    }, [ticketInfo, quantity, resalePost]);


    if (isLoading || !event || !eventSession || !resalePost) {
        return (
            <div className="flex justify-center items-center h-screen w-full bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans p-4 md:p-8 pb-20">
            <PendingBookingModal
                booking={booking}
                isOpen={isModalOpen}
                onCancel={handleConfirmCancel}
                onContinue={handleContinuePaymentBooking}
                event={event}
                eventSession={eventSession}
                selectedTickets={selectedBookingTickets}
            />

            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col gap-2 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-primary font-medium text-sm hover:underline w-fit">
                        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mua vé bán lại</h1>
                    <p className="text-gray-500">Chọn số lượng vé bạn muốn mua từ người bán này.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* LEFT COLUMN: Resale Ticket Item */}
                    <div className="flex-1 flex flex-col gap-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700
                         p-6 shadow-sm">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Tag className="w-5 h-5 text-primary" /> Thông tin vé
                            </h2>

                            {maxQuantity === 0 ? (
                                <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                    <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                    <h3 className="text-lg font-bold text-gray-700">Vé đã được bán hết</h3>
                                    <p className="text-gray-500 text-sm mt-1">Bài đăng này không còn vé nào khả dụng.</p>
                                </div>
                            ) : (
                                <div className={`p-4 rounded-xl border-2 transition-all ${quantity > 0 ?
                                    'border-primary bg-primary/5' : 'border-gray-200'}`}>
                                    <div className="flex flex-col sm:flex-row justify-between gap-4">

                                        {/* Ticket Details */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="text-lg font-bold text-gray-900">
                                                    {ticketInfo?.name || "Vé sự kiện"}
                                                </h3>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold
                                                     ${resalePost.hasRetail ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-orange-100 text-orange-700'}`}>
                                                    {resalePost.hasRetail ? "Có bán lẻ" : "Bán cả cụm (Combo)"}
                                                </span>
                                            </div>

                                            <p className="text-sm text-gray-500 mb-4">
                                                Người bán đang đăng bán tổng cộng <strong className="text-gray-900">
                                                    {maxQuantity} vé</strong>.
                                                {!resalePost.hasRetail && " Bạn phải mua toàn bộ số vé này cùng lúc."}
                                            </p>

                                            <div className="sm:hidden text-lg font-bold text-primary mb-2">
                                                {formatCurrency(resalePost.pricePerTicket)} / vé
                                            </div>
                                        </div>

                                        {/* Quantity & Price Controller */}
                                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between 
                                        sm:justify-center gap-3 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-200">
                                            <div className="hidden sm:block text-xl font-bold text-primary">
                                                {formatCurrency(resalePost.pricePerTicket)} <span className="text-sm
                                                 font-normal text-gray-500">/ vé</span>
                                            </div>

                                            <div className={`flex items-center gap-3 rounded-lg border p-1 bg-white 
                                                ${!resalePost.hasRetail && 'opacity-70 bg-gray-50'}`}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-md hover:bg-gray-100 text-gray-600 
                                                    disabled:opacity-30"
                                                    onClick={() => handleQuantityChange(-1)}
                                                    disabled={!resalePost.hasRetail || quantity <= 1}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>

                                                <span className="w-8 text-center font-bold text-gray-900">
                                                    {quantity}
                                                </span>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-md bg-gray-100 text-primary hover:bg-gray-200 
                                                    disabled:opacity-30 disabled:bg-transparent"
                                                    onClick={() => handleQuantityChange(1)}
                                                    disabled={!resalePost.hasRetail || quantity >= maxQuantity}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Order Summary */}
                    <div className="w-full lg:w-[380px] shrink-0">
                        <div className="sticky top-4">
                            <BookingSummary
                                eventSession={eventSession}
                                event={event}
                                selectedTickets={selectedTicketsForSummary}
                                totalAmount={totalAmount}
                                onSubmit={onSubmitCreatePendingBooking}
                                messageButton={isSubmitting ? "Đang xử lý..." : "Tiến hành thanh toán"}
                                disabled={maxQuantity === 0 || isSubmitting}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResaleTicketSelectionPage;