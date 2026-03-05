import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Video } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { EventType, MeetingPlatform } from '@/utils/constant';
import EventStatusBadge from '@/components/EventStatusBadge';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/config/routes';

const EventCard = ({ event, showActionManage, onClick, userMode }) => {
    const isOnline = event.type === EventType.ONLINE.key
    const [displayPrice, setDisplayPrice] = useState();
    const navigate = useNavigate()
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
    const isEventEnded = event.eventSessions.every((it) => new Date(it.endDateTime) < new Date())

    return (
        <Card
            onClick={!showActionManage && onClick}
            className={`${!showActionManage ? 'cursor-pointer' : ''} flex flex-col rounded-xl overflow-hidden border-border/60
         shadow-sm hover:shadow-md transition-all duration-300 group`}>
            <div className="relative h-43 w-full bg-muted overflow-hidden">
                <img src={event.thumbnail} alt="" />
                <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm px-2.5
                 py-1 rounded-md text-xs font-bold uppercase tracking-wider shadow-sm">
                    {event.category.name}
                </div>
                {
                    (showActionManage || isEventEnded) &&
                    <div className="absolute top-3 right-3">
                        <EventStatusBadge eventSessions={event.eventSessions} status={event.status} />
                    </div>
                }
            </div>

            <div className="flex flex-col flex-1 p-2 gap-4">
                <div>
                    <h3 className="text-md font-bold line-clamp-1">{event.name}</h3>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        {
                            isOnline ? (
                                <>
                                    <div>
                                        <Video className="size-4" />
                                    </div>
                                    <span>{event.eventSessions.map(
                                        it =>
                                            it.meetingPlatform == MeetingPlatform.GOOGLE_MEET ? "Google meet" : "Zoom"
                                    ).join(", ")}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <MapPin className="size-4" />
                                    </div>
                                    <div>
                                        <p className='font-semibold'>{event.address}</p>
                                        <span className='line-clamp-1'>{event.location}</span>
                                    </div>
                                </>
                            )
                        }
                    </div>
                    {
                        userMode ?
                            <div className="mt-1 flex items-center gap-2 text-md font-semibold text-red-500
                            ">
                                <span>Từ {displayPrice}</span>
                            </div>
                            :
                            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="size-4" />
                                <span>
                                    Được tạo ngày: {formatDateTime(event.createdAt)}
                                </span>
                            </div>
                    }
                </div>
                {
                    showActionManage &&
                    <div className="mt-auto pt-4 border-t">
                        {/* <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-medium text-muted-foreground">Tiến độ bán vé</span>
                        <span className={`text-xs font-bold ${event.soldPercent === 100 ? 'text-green-600' : event.soldPercent === 0 ? 'text-muted-foreground' : 'text-brand'}`}>
                            {event.soldPercent === 100 ? 'Đã bán hết' : `${event.soldPercent}%`}
                        </span>
                    </div> */}
                        {/* <Progress value={event.soldPercent} className="h-2" indicatorClassName={event.soldPercent === 100 ? "bg-green-500" : event.soldPercent === 0 ? "bg-muted" : "bg-brand"} /> */}

                        <div className="mt-4 flex gap-2">
                            <Button variant="outline" className="flex-1 h-9 font-semibold"
                                onClick={() => navigate(routes.editEvent.replace(":id", event.id))}
                            >Chỉnh sửa</Button>
                            <Button className="flex-1 h-9 bg-brand/10 text-brand 
                            hover:bg-brand/20 font-semibold shadow-none"
                                onClick={() => navigate(routes.eventOverview.replace(":id", event.id))}
                            >Quản lý</Button>
                        </div>
                    </div>
                }
            </div>
        </Card>
    );
};

export default EventCard;