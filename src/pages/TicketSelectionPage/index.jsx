import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import TicketSelectionItem from './TicketSelectionItem';
import OrderSummary from '../../features/event/BookingSummary';
import { useNavigate, useParams } from 'react-router-dom';
import { getEventById } from '@/services/eventService';
import { HttpStatusCode } from 'axios';
import { getEventSessionById } from '@/services/eventSessionService';
import { toast } from 'sonner';
import { createPendingBooking, deleteBookingById, getExistsPendingBooking } from '@/services/bookingService';
import { routes } from '@/config/routes';
import PendingBookingModal from './PendingBookingModal';
import { AttendeeType } from '@/utils/constant';

const TicketSelectionPage = () => {
    const [quantities, setQuantities] = useState({});
    const [event, setEvent] = useState(null);
    const [booking, setBooking] = useState(null);
    const [eventSession, setEventSession] = useState(null);
    const { eventId, eventSessionId } = useParams();
    const navigate = useNavigate()
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBookingTickets, setSelectedBookingTickets] = useState(null)

    useEffect(() => {
        const fetchEventById = async () => {
            try {
                const response = await getEventById({ id: eventId })
                if (response.code === HttpStatusCode.Ok) {
                    setEvent(response.result)
                }
            } catch (error) {
                console.log(error)
            }
        }
        fetchEventById()
    }, [eventId])


    useEffect(() => {
        const fetchEventSessionById = async () => {
            try {
                const response = await getEventSessionById({ id: eventSessionId })
                if (response.code === HttpStatusCode.Ok) {
                    setEventSession(response.result)
                }
            } catch (error) {
                console.log(error)
            }
        }

        const fetchExistsPendingBooking = async () => {
            try {
                const response = await getExistsPendingBooking({ eventSessionId: eventSessionId })
                if (response.code === HttpStatusCode.Ok) {
                    if (response.result != null) {
                        setBooking(response.result)
                        setIsModalOpen(true)
                        var mapTicket = {};
                        response.result.attendees.forEach(attendee => {
                            var oldQuantity = mapTicket[attendee.ticket.id]?.quantity ? mapTicket[attendee.ticket.id].quantity : 0
                            mapTicket[attendee.ticket.id] = { ...attendee.ticket, quantity: oldQuantity + 1 }
                        });
                        setSelectedBookingTickets(
                            Object.keys(mapTicket).map(
                                (key) => mapTicket[key]
                            ))
                    }
                }
            } catch (error) {
                console.log(error)
            }
        }
        fetchExistsPendingBooking()
        fetchEventSessionById()

    }, [eventSessionId])




    if (!event || !eventSession || (booking != null && !booking)) {
        return (
            <div className="flex justify-center items-center h-screen w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const totalAmount = eventSession.tickets.reduce((total, ticket) => {
        const qty = quantities[ticket.id] || 0;
        return total + (ticket.price * qty);
    }, 0);

    const selectedTickets = eventSession.tickets
        .filter(t => (quantities[t.id] || 0) > 0)
        .map(t => ({
            ...t,
            quantity: quantities[t.id]
        }));

    const handleQuantityChange = (ticketId, delta) => {
        setQuantities(prev => {
            const currentQty = prev[ticketId] || 0;
            const newQty = Math.max(0, currentQty + delta);

            // Logic check max quantity 
            const ticket = eventSession.tickets.find(t => t.id === ticketId);
            var soldQuantity = ticket.soldQuantity == null ? 0 : ticket.soldQuantity
            if (newQty > ticket.maximumPerPurchase || newQty > (ticket.quantity - soldQuantity)) return prev;

            return { ...prev, [ticketId]: newQty };
        });
    };

    const onSubmitCreatePendingBooking = async () => {
        try {
            const keysArray = Object.keys(quantities)
            const bookingTicketRequests = keysArray.map(
                (key) => {
                    return {
                        quantity: quantities[key],
                        ticketId: key
                    }
                }
            )
            if (quantities.length == 0) {
                toast.error("Phải chọn vé để có thể thanh toán")
                return;
            }

            const response = await createPendingBooking({
                bookingTicketRequests: bookingTicketRequests,
                type: AttendeeType.BUY
            })
            if (response.code == HttpStatusCode.Ok) {
                navigate(routes.payment.replace(":eventId", event.id).replace(":eventSessionId", eventSession.id)
                    .replace(":bookingId", response.result.id));
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleConfirmCancel = async () => {
        try {
            const response = await deleteBookingById({ id: booking.id });
            if (response.code == HttpStatusCode.Ok) {
                window.location.reload();

            }
        } catch (error) {
            console.error("Lỗi khi hủy đơn", error);
        }
    };

    const handleContinuePaymentBooking = async () => {
        navigate(routes.payment.replace(":eventId", event.id).replace(":eventSessionId", eventSession.id)
            .replace(":bookingId", booking.id))
    };
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans p-4 md:p-8">
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
                {/* Back Button & Title */}
                <div className="flex flex-col gap-2 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-primary font-medium text-sm hover:underline w-fit">
                        <ArrowLeft className="w-4 h-4" /> Quay lại sự kiện
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Chọn loại vé</h1>
                    <p className="text-gray-500">Chọn hạng vé và số lượng bạn muốn đặt mua.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* LEFT COLUMN: Ticket List */}
                    <div className="flex-1 flex flex-col gap-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                            <h2 className="text-xl font-bold mb-6">Danh sách hạng vé</h2>
                            <div className="flex flex-col gap-4">
                                {eventSession.tickets.map((ticket) => (
                                    <TicketSelectionItem
                                        key={ticket.id}
                                        ticket={ticket}
                                        quantity={quantities[ticket.id] || 0}
                                        onUpdateQuantity={handleQuantityChange}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Order Summary */}
                    <div className="w-full lg:w-[380px] shrink-0">
                        <div className="sticky top-4">
                            <OrderSummary
                                eventSession={eventSession}
                                event={event}
                                selectedTickets={selectedTickets}
                                totalAmount={totalAmount}
                                onSubmit={onSubmitCreatePendingBooking}
                                messageButton={"Tiếp tục"}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketSelectionPage;