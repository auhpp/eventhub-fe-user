import React, { useContext, useEffect, useState } from 'react';
import {
    Calendar, MapPin, Video, Loader2, Ticket,
    FileText, Gift, Store 
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from 'react-router-dom';
import { getBookingById } from '@/services/bookingService';
import { HttpStatusCode } from 'axios';
import { routes } from '@/config/routes';
import { displaySessionDate, formatTime } from '@/utils/format';
import { toast } from 'sonner';
import ReviewSection from '@/features/review/ReviewSection';
import { AuthContext } from '@/context/AuthContex';
import { isExpiredEventSession } from '@/utils/eventUtils';
import TicketCard from '@/features/tickets/TicketCard';
import ButtonBack from '@/components/ButtonBack';

const TicketDetailPage = () => {
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    const { id } = useParams();
    const navigate = useNavigate();

    const fetchBookingDetails = async () => {
        try {
            const response = await getBookingById({ id: id });
            if (response.code === HttpStatusCode.Ok || response.data) {
                setBooking(response.data || response.result);
            }
        } catch (error) {
            console.log(error);
            toast.error("Không thể tải thông tin đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookingDetails();
    }, [id]);

    if (loading || !booking) {
        return (
            <div className="flex justify-center items-center h-[70vh] w-full">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const { event, attendees } = booking;
    const eventSession = attendees[0]?.eventSession;
    const isOnlineEvent = event?.type === 'ONLINE';
    const isEventExpired = isExpiredEventSession({ endDateTime: eventSession?.endDateTime });

    const hasCheckedInTicket = attendees?.some(att => att.status === 'CHECKED_IN');
    const canReview = isEventExpired && hasCheckedInTicket;

    return (
        <div className="min-h-screen pb-20 font-sans text-slate-900">
            {/* --- TOP BAR --- */}
            <div className="bg-white sticky top-0 z-10">
                <div className="container mx-auto h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <ButtonBack />
                        <span className='text-lg font-bold'>Chi tiết vé</span>
                    </div>

                </div>
            </div>

            <main className="container mx-auto">

                {/* --- 1. EVENT BANNER & INFO (HERO SECTION) --- */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-8">
                    <div className="h-48 md:h-64 w-full relative">
                        <img
                            src={event?.thumbnail || 'https://placehold.co/1200x400'}
                            alt={event?.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-6 w-full">
                            <Badge className="bg-blue-600 text-white border-none mb-3">
                                {event?.category?.name || "Sự kiện"}
                            </Badge>
                            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                                {event?.name}
                            </h1>
                        </div>
                    </div>

                    <div className="p-6 flex flex-col md:flex-row gap-6 md:gap-12 bg-white">
                        <div className="flex items-start gap-4 flex-1">
                            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Thời gian</p>
                                <p className="text-base font-bold text-slate-900">
                                    {eventSession?.startDateTime && displaySessionDate({
                                        startDateTime: eventSession?.startDateTime,
                                        endDateTime: eventSession?.endDateTime
                                    })}
                                </p>
                                <p className="text-sm text-slate-600 font-medium">
                                    {eventSession?.startDateTime && formatTime(eventSession?.startDateTime)} -
                                    {eventSession?.endDateTime && formatTime(eventSession?.endDateTime)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 flex-1">
                            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                {isOnlineEvent ? <Video className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                    {isOnlineEvent ? 'Nền tảng' : 'Địa điểm'}
                                </p>
                                <p className="text-base font-bold text-slate-900 line-clamp-1">
                                    {isOnlineEvent ? 'Trực tuyến' : event?.address}
                                </p>
                                {!isOnlineEvent && (
                                    <p className="text-sm text-slate-600 line-clamp-1">{event?.location}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 2. TICKET LIST & ACTIONS --- */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Ticket className="w-6 h-6 text-blue-600" />
                            Vé của bạn ({attendees?.length || 0})
                        </h2>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                            <Button
                                variant="outline"
                                className="gap-2 bg-white border-slate-300 hover:bg-slate-50 flex-1 md:flex-none"
                                onClick={() => navigate(routes.orderDetail.replace(':id', booking.id))}
                            >
                                <FileText className="w-4 h-4 text-slate-600" />
                                <span className="hidden sm:inline">Chi tiết đơn hàng #{booking.id}
                                </span>
                            </Button>

                            {!isEventExpired && (
                                <>
                                    <Button
                                        variant="outline"
                                        className="gap-2 bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 flex-1 md:flex-none shadow-sm"
                                        onClick={() => navigate(routes.ticketGiftSelection.replace(":id", booking.id))}
                                    >
                                        <Gift className="w-4 h-4" />
                                        Tặng vé
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="gap-2 bg-white border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 flex-1 md:flex-none shadow-sm"
                                        onClick={() => navigate(routes.createResale.replace(":bookingId", booking.id))}
                                    >
                                        <Store className="w-4 h-4" />
                                        Bán lại vé
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* tickets */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {attendees?.map((attendee) => (
                            <TicketCard
                                key={attendee.id}
                                attendee={attendee}
                                event={event}
                                eventSession={eventSession}
                                booking={booking}
                                currentUser={user}
                            />
                        ))}
                    </div>
                </div>

                {/* --- 3. REVIEW SECTION --- */}
                {isEventExpired && (
                    <ReviewSection
                        eventSessionId={eventSession?.id}
                        bookingId={booking.id}
                        canReview={canReview}
                        currentUserId={user.id}
                    />
                )}
            </main>
        </div>
    );
};

export default TicketDetailPage;