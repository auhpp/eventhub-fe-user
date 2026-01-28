import React, { useEffect, useState } from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatTime, formatCurrency, displaySessionDate } from '@/utils/format';

const EventHero = ({ event }) => {
    const firstSession = event.eventSessions?.[0];
    const [displayPrice, setDisplayPrice] = useState();

    // Find the lowest price to display "Giá từ..."
    useEffect(() => {
        if (!event || !event.eventSessions) return;

        let minPrice = Number.MAX_SAFE_INTEGER;
        let hasTicket = false;

        event.eventSessions.forEach(eventSession => {
            if (eventSession.tickets) {
                eventSession.tickets.forEach(ticket => {
                    hasTicket = true;
                    if (ticket.price < minPrice) {
                        minPrice = ticket.price
                    }
                });
            }
        });

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDisplayPrice(hasTicket && minPrice !== Number.MAX_SAFE_INTEGER ? formatCurrency(minPrice) : "Liên hệ");
    }, [event]);


    const getEventStatus = () => {
        if (!event.eventSessions || event.eventSessions.length === 0) {
            return { label: "Đang cập nhật", disabled: true };
        }

        const now = new Date();
        const sessions = event.eventSessions;

        // Check if ALL sessions have ended
        const allSessionsEnded = sessions.every(session => new Date(session.endDateTime) < now);
        if (allSessionsEnded) {
            return { label: "Sự kiện đã kết thúc", disabled: true };
        }

        // Check if ANY session is currently selling tickets
        let isSelling = false;
        sessions.forEach(session => {
            if (session.tickets) {
                const sessionSelling = session.tickets.some(t => {
                    const openAt = new Date(t.openAt);
                    const endAt = new Date(t.endAt);
                    // Check logic openAt and endDateTime
                    return now >= openAt && now <= endAt && t.quantity > 0 && new Date(session.endDateTime) > now;
                });
                if (sessionSelling) isSelling = true;
            }
        });

        if (isSelling) {
            return {
                label: sessions.length > 1 ? "Chọn ngày" : "Mua vé ngay",
                disabled: false
            };
        }

        // Aggregate checks for other statuses across all sessions
        let allTicketsSoldOut = true;
        let allTicketsUpcoming = true;

        // Flatten all tickets to check
        let totalTickets = 0;
        sessions.forEach(session => {
            if (session.tickets) {
                totalTickets += session.tickets.length;
                session.tickets.forEach(t => {
                    if (t.quantity > 0) allTicketsSoldOut = false;
                    if (new Date(t.openAt) <= now) allTicketsUpcoming = false;
                });
            }
        });

        if (totalTickets === 0) return { label: "Chưa có vé", disabled: true };
        if (allTicketsUpcoming) return { label: "Sắp mở bán", disabled: true };
        if (allTicketsSoldOut) return { label: "Hết vé", disabled: true };

        // Fallback: Sales stopped for active sessions
        return { label: "Ngừng bán", disabled: true };
    }

    const eventStatus = getEventStatus();

    return (
        <div className="w-full mb-8">
            {/* Main Container - Ticket Shape */}
            <div className="flex flex-col lg:flex-row w-full bg-[#38383d]
             rounded-3xl overflow-hidden min-h-[450px] relative">
                {/* Left Side: Info */}
                <div className="lg:w-[35%] p-8 flex flex-col 
                 justify-between relative z-10 border-r border-dashed border-gray-600/50">

                    <div className="space-y-6">
                        {/* Title */}
                        <h3 className="text-lg md:text-2xl font-extrabold leading-tight text-white">
                            {event.name}
                        </h3>

                        {/* Date & Time */}
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text- text-primary mt-0.5 shrink-0" />
                            <div>
                                <p className="font-bold text- text-white text-sm">
                                    {firstSession ? `${formatTime(firstSession.startDateTime)} - ${formatTime(firstSession.endDateTime)}` : ''}
                                    {firstSession ? `, ${displaySessionDate({
                                        startDateTime: firstSession.startDateTime,
                                        endDateTime: firstSession.endDateTime
                                    })}` : ''}
                                </p>
                                {
                                    event.eventSessions.length > 1 &&
                                    <Button size="xs" variant="outline"
                                        onClick={() => {
                                            document.getElementById('ticket-section')?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className="
                                     px-2 rounded-sm mt-1
                                      bg-transparent text-white border-white/20 hover:bg-white/10 hover:text-white">
                                        <span className='text-sm'>+ {event.eventSessions.length - 1} ngày khác</span>
                                    </Button>
                                }
                            </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                            <div>
                                <p className="text-white text-sm mt-1">
                                    {event.location}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Area */}
                    <div className="mt-8 space-y-4 pt-6 border-t border-gray-700">
                        <div className="flex items-center gap-2 group">
                            <span className="text-white font-medium">Giá từ</span>
                            <span className="text-2xl font-bold text-blue-400 ">
                                {displayPrice}
                            </span>
                        </div>

                        <Button
                            disabled={eventStatus.disabled}
                            className={`w-full font-bold h-12 text-lg rounded-xl shadow-lg transition-all
                                ${eventStatus.disabled
                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed shadow-none'
                                    : 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'
                                }
                            `}
                            onClick={() => {
                                if (!eventStatus.disabled) {
                                    document.getElementById('ticket-section')?.scrollIntoView({ behavior: 'smooth' });
                                }
                            }}
                        >
                            {eventStatus.label}
                        </Button>
                    </div>

                    {/* Decorative Circles */}
                    <div className="absolute -top-3 -right-3 w-6 h-6 bg-gray-50 dark:bg-black 
                     rounded-full z-20 hidden lg:block border"></div>
                    <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-gray-50 dark:bg-black
                      rounded-full z-20 hidden lg:block border"></div>
                </div>

                {/* Right Side: Image  */}
                <div className="lg:w-[65%] relative h-64 lg:h-auto bg-gray-800 ">
                    <img
                        src={event.thumbnail}
                        alt={event.name}
                        className={`w-full h-full object-cover object-center ${eventStatus.label === "Sự kiện đã kết thúc" ? 'grayscale' : ''}`}
                    />
                    {/* Badges on Image */}
                    <div className="absolute top-4 right-4 z-20 flex gap-2">
                        {event.category && (
                            <Badge variant="secondary" className="bg-white/90 text-black backdrop-blur-md shadow-sm">
                                {event.category.name}
                            </Badge>
                        )}
                        {eventStatus.label === "Sự kiện đã kết thúc" && (
                            <Badge variant="destructive" className="shadow-sm">
                                Đã kết thúc
                            </Badge>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventHero;