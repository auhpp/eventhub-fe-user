import React from 'react';
import { Calendar, MapPin, Clock, ArrowRight, Plus } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatTime, formatCurrency } from '@/utils/format';

const EventHero = ({ event }) => {
    const firstSession = event.eventSessions?.[0];

    // find the lowest price to display "Giá từ..."
    const minPrice = event.eventSessions?.reduce((min, session) => {
        const sessionMin = session.tickets?.reduce((sMin, ticket) =>
            ticket.price < sMin ? ticket.price : sMin, Infinity) || Infinity;
        return sessionMin < min ? sessionMin : min;
    }, Infinity);

    const displayPrice = minPrice !== Infinity ? formatCurrency(minPrice) : "Đang cập nhật";
    const openSellTicket = (tickets) => {
        for (const element of tickets) {
            const openAt = new Date(element.openAt)
            const endAt = new Date(element.endAt)
            const currentDate = new Date()
            if (openAt < currentDate && endAt > currentDate) {
                return true
            }
        };
    }
    const notToTimeSellTicket = (tickets) => {
        for (const element of tickets) {
            const openAt = new Date(element.openAt)
            const currentDate = new Date()
            if (openAt > currentDate) {
                return false
            }
        }
    }
    const isSellTicketTilte = () => {
        for (const session of event.eventSessions) {
            if (openSellTicket(session.tickets)) {
                return event.eventSessions.length == 1 ? "Mua vé ngay" : "Chọn ngày"
            }
        }
        for (const session of event.eventSessions) {
            if (!notToTimeSellTicket(session.tickets)) {
                return "Đã nghĩ bán"
            }
        }
        return "Chưa mở bán"
    }

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
                                    {`${formatTime(firstSession.startDateTime)} -
                                     ${formatTime(firstSession.endDateTime)}`}
                                    , {formatDate(firstSession.startDateTime) == formatDate(firstSession.endDateTime) ?
                                        formatDate(firstSession.startDateTime) :
                                        formatDate(firstSession.startDateTime) - formatDate(firstSession.endDateTime)}
                                </p>
                                {
                                    event.eventSessions.length > 1 &&
                                    <Button size="xs" variant="outline"
                                        onClick={() => {
                                            document.getElementById('ticket-section')?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className="
                                    px-2 rounded-sm mt-1
                                     bg-transparent text-white">
                                        <span className='text-sm'>+ {event.eventSessions.length - 1} ngày khác</span>
                                    </Button>
                                }
                            </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                            <div>
                                {/* <p className="font-bold text-emerald-400 text-base uppercase">
                                    {event.location?.split(',')[0]}
                                </p> */}
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
                            className="w-full bg-primary
                             hover:bg-primary text-white font-bold h-12 text-lg rounded-xl shadow-lg shadow-primary/20"
                            onClick={() => {
                                document.getElementById('ticket-section')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            {isSellTicketTilte()}
                        </Button>
                    </div>

                    {/* Decorative Circles (Ticket Stub Effect) - Top & Bottom */}
                    <div className="absolute -top-3 -right-3 w-6 h-6 bg-gray-50 dark:bg-black 
                    rounded-full z-20 hidden lg:block"></div>
                    <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-gray-50 dark:bg-black
                     rounded-full z-20 hidden lg:block"></div>
                </div>

                {/* Right Side: Image  */}
                <div className="lg:w-[65%] relative h-64 lg:h-auto bg-gray-800">
                    <img
                        src={event.thumbnail}
                        alt={event.name}
                        className="w-full h-full object-cover object-center"
                    />
                    {/* Badges on Image */}
                    <div className="absolute top-4 right-4 z-20 flex gap-2">
                        {event.category && (
                            <Badge variant="secondary" className="bg-white/90 text-black backdrop-blur-md shadow-sm">
                                {event.category.name}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventHero;