import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MapPin } from 'lucide-react';
import EventStatusBadge from './EventStatusBadge';
import { formatDateTime } from '@/utils/format';

const EventCard = ({ event, showActionManage, onClick }) => {
    console.log(event)
    return (
        <Card
            onClick={onClick}
            className="cursor-pointer flex flex-col rounded-2xl overflow-hidden border-border/60
         shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="relative h-43 w-full bg-muted overflow-hidden">
                <img src={event.thumbnail} alt="" />

                <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider shadow-sm">
                    {event.category.name}
                </div>
                {
                    showActionManage &&
                    <div className="absolute top-3 right-3">
                        <EventStatusBadge eventSessions={event.eventSessions} status={event.status} />
                    </div>
                }
            </div>

            <div className="flex flex-col flex-1 p-5 gap-4">
                <div>
                    <h3 className="text-lg font-bold line-clamp-1">{event.name}</h3>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <div>
                            <MapPin className="size-4" />
                        </div>
                        <span>{event.location}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="size-4" />
                        <span>
                            Được tạo ngày: {formatDateTime(event.createdAt)}
                        </span>
                    </div>
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
                            <Button variant="outline" className="flex-1 h-9 font-semibold">Chỉnh sửa</Button>
                            <Button className="flex-1 h-9 bg-brand/10 text-brand hover:bg-brand/20 font-semibold shadow-none">Quản lý</Button>
                        </div>
                    </div>
                }
            </div>
        </Card>
    );
};

export default EventCard;