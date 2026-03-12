import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Video } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatTime, formatCurrency, displaySessionDate } from '@/utils/format';

const EventHero = ({ event }) => {
    const firstSession = event.eventSessions?.[0];
    const [displayPrice, setDisplayPrice] = useState();
    const isOnline = event.type === 'ONLINE';
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

        const activeSessions = sessions.filter(session => new Date(session.endDateTime) > now);

        if (activeSessions.length === 0) {
            return { label: "Sự kiện đã kết thúc", disabled: true };
        }

        let isSelling = false;
        let hasUpcoming = false;
        let isAllSoldOut = true;
        let totalActiveTickets = 0;

        activeSessions.forEach(session => {
            if (session.tickets) {
                totalActiveTickets += session.tickets.length;
                session.tickets.forEach(t => {
                    const openAt = new Date(t.openAt);
                    const endAt = new Date(t.endAt);

                    if (now >= openAt && now <= endAt && t.quantity > 0) {
                        isSelling = true;
                    }

                    if (openAt > now) {
                        hasUpcoming = true;
                    }

                    if (t.quantity > 0) {
                        isAllSoldOut = false;
                    }
                });
            }
        });

        if (isSelling) {
            return {
                label: sessions.length > 1 ? "Chọn ngày" : "Mua vé ngay",
                disabled: false
            };
        }

        if (totalActiveTickets === 0) return { label: "Chưa có vé", disabled: true };

        if (hasUpcoming) {
            return {
                label: "Sắp mở bán",
                disabled: false
            };
        }

        if (isAllSoldOut) return { label: "Hết vé", disabled: true };

        return { label: "Ngừng bán", disabled: true };
    }

    const eventStatus = getEventStatus();

    return (
        <div className="w-full mb-8 drop-shadow-md">
            <style>{`
                @media (min-width: 1024px) {
                    .ticket-mask {
                         /* Tính toán đục lỗ ngay vị trí 35% từ bên trái (mép phân chia 2 cột) */
                        -webkit-mask-image: 
                            radial-gradient(circle 12px at 35% 0px, transparent 12px, black 13px), 
                            radial-gradient(circle 12px at 35% 100%, transparent 12px, black 13px);
                        -webkit-mask-size: 100% 50%, 100% 50%;
                        -webkit-mask-position: top left, bottom left;
                        -webkit-mask-repeat: no-repeat;
                    }
                }
            `}</style>

            <div className="flex flex-col lg:flex-row w-full bg-white 
             border border-gray-200 rounded-xl overflow-hidden min-h-[450px] relative ticket-mask">

                {/* Left Side: Info */}
                <div className="lg:w-[35%] p-8 flex flex-col 
                 justify-between relative z-10 border-r border-dashed border-gray-300">

                    <div className="space-y-6">
                        {/* Title */}
                        <h3 className="text-lg md:text-2xl font-extrabold leading-tight text-gray-900">
                            {event.name}
                        </h3>

                        {/* Date & Time */}
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                            <div>
                                <p className="font-bold text-gray-800 text-sm">
                                    {firstSession ? `${formatTime(firstSession.startDateTime)} -
                                     ${formatTime(firstSession.endDateTime)}` : ''}
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
                                        className="px-2 rounded-sm mt-1 bg-transparent text-gray-600 border-gray-300 
                                        hover:bg-gray-100 hover:text-gray-900">
                                        <span className='text-sm'>+ {event.eventSessions.length - 1} ngày khác</span>
                                    </Button>
                                }
                            </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-start gap-3">
                            {isOnline ? (
                                <Video className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                            ) : (
                                <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                            )}

                            <div>
                                <p className="text-gray-800 text-sm font-medium">
                                    {!isOnline && event.address}
                                </p>
                                <p className="text-gray-800 text-sm mt-1 font-medium">
                                    {isOnline ? "Sự kiện Online" : event.location}
                                </p>
                                {isOnline && firstSession?.meetingPlatform && (
                                    <p className="text-gray-500 text-xs mt-0.5">
                                        Nền tảng: {firstSession.meetingPlatform.replace(/_/g, ' ')}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Area */}
                    <div className="mt-8 space-y-4 pt-6 border-t border-gray-200">
                        <div className="flex items-center gap-2 group">
                            <span className="text-gray-500 font-medium">Giá từ</span>
                            <span className="text-2xl font-bold text-blue-600">
                                {displayPrice}
                            </span>
                        </div>

                        <Button
                            disabled={eventStatus.disabled}
                            className={`w-full font-bold h-12 text-lg rounded-xl shadow-md transition-all
                                ${eventStatus.disabled
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none hover:bg-gray-200'
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
                </div>

                {/* Right Side: Image  */}
                <div className="lg:w-[65%] relative h-64 lg:h-auto bg-gray-100">
                    <img
                        src={event.thumbnail}
                        alt={event.name}
                        className={`w-full h-full object-cover object-center`}
                    />
                    {/* Badges on Image */}
                    <div className="absolute top-4 right-4 z-20 flex gap-2">
                        {isOnline && (
                            <Badge className="bg-blue-600 text-white shadow-sm border-none">
                                Online
                            </Badge>
                        )}
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