import React from 'react';
import { MapPin, Ticket, ArrowRight, Video } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDateTime } from '@/utils/format';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/config/routes';
import BookingStatusBadge from '@/components/BookingStatusBadge';
import { EventType, MeetingPlatform } from '@/utils/constant';


const OrderCard = ({ booking }) => {
    const {
        id,
        finalAmount,
        status,
        createdAt,
        attendees,
        event
    } = booking;

    const ticketCount = attendees ? attendees.length : 0;
    const navigate = useNavigate()

    const eventImage = event?.poster || "https://placehold.co/600x400?text=Event+Image";
    const eventName = event?.name || "Sự kiện không xác định";
    const eventLocation = event?.location || "Online / Chưa cập nhật";

    const isOnline = event.type == EventType.ONLINE.key

    return (
        <Card className="overflow-hidden border-l-4 hover:shadow-md transition-all duration-200 mb-4 group border-l-primary/80">
            <div className="flex flex-col md:flex-row">

                {/* Thumbnail */}
                <div className="w-full md:w-48 h-32 md:h-auto relative shrink-0">
                    <img
                        src={eventImage}
                        alt={eventName}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* main content */}
                <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-muted-foreground font-medium mb-1">
                                    Mã đơn: #{id} - Đặt lúc: {formatDateTime(createdAt)}
                                </p>
                                <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-2">
                                    {eventName}
                                </h3>
                            </div>
                            {/* Badge status */}
                            <BookingStatusBadge status={status} />

                        </div>

                        <div className="flex flex-col sm:flex-row gap-y-2 gap-x-6 text-sm text-gray-600 mt-1">
                            <div className="flex items-center gap-1.5">
                                {
                                    isOnline ? (
                                        <>
                                            <div>
                                                <Video className="w-4 h-4 text-primary" />
                                            </div>
                                            <span className="truncate max-w-[200px]">{event.eventSessions.map(
                                                it =>
                                                    it.meetingPlatform == MeetingPlatform.GOOGLE_MEET ? "Google meet" : "Zoom"
                                            ).join(", ")}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <MapPin className="w-4 h-4 text-primary" />
                                            </div>
                                            <span className="truncate max-w-[200px]">{eventLocation}</span>
                                        </>
                                    )
                                }

                            </div>
                            <div className="flex items-center gap-1.5">
                                <Ticket className="w-4 h-4 text-primary" />
                                <span>{ticketCount} vé</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 md:mt-2">
                        <Separator className="my-3 md:hidden" />
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-xs text-muted-foreground">Tổng thanh toán</p>
                                <p className="text-xl font-bold text-primary">
                                    {formatCurrency(finalAmount)}
                                </p>
                            </div>

                            <Button variant="outline" size="sm" className="group/btn gap-2"
                                onClick={() => navigate(routes.orderDetail.replace(':id', id))}>
                                Chi tiết
                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default OrderCard;