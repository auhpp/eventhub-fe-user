import React, { useEffect, useState } from "react";
import {
    CalendarDays,
    AlertCircle
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { formatDate, formatCurrency, formatDateTime } from "@/utils/format";
import { getEventById } from "@/services/eventService";
import { getEventSessionById } from "@/services/eventSessionService";
import { routes } from "@/config/routes";
import { HttpStatusCode } from "axios";
import ResalePostStatusBadge from "@/components/ResalePostStatusBadge";
import { ResalePostStatus } from "@/utils/constant";
import DetailButton from "@/components/DetailButton";
import ResalePostHasRetailBadge from "@/components/ResalePostHasRetailBadge";
import TicketCountBadge from "@/components/TicketCountBadge";

const ResaleCard = ({ data }) => {
    const {
        id, createdAt, pricePerTicket, status, hasRetail,
        rejectionMessage, attendees
    } = data;

    const navigate = useNavigate();

    // State for event info
    const [event, setEvent] = useState(null);
    const [eventSession, setEventSession] = useState(null);
    const [isLoadingEvent, setIsLoadingEvent] = useState(true);

    // get ticket info from attendee list
    const firstAttendee = attendees?.[0];
    const ticketInfo = firstAttendee?.ticket;
    const ticketQuantity = attendees?.length || 0;

    // Fetch Event Info
    useEffect(() => {
        const fetchEventDetails = async () => {
            if (!ticketInfo?.eventId) {
                setIsLoadingEvent(false);
                return;
            }
            try {
                const [eventRes, sessionRes] = await Promise.all([
                    getEventById({ id: ticketInfo.eventId }),
                    getEventSessionById({ id: ticketInfo.eventSessionId })
                ]);

                if (eventRes.code == HttpStatusCode.Ok) setEvent(eventRes.result);
                if (sessionRes.code == HttpStatusCode.Ok) setEventSession(sessionRes.result);
            } catch (error) {
                console.error("Error fetching event details for resale card", error);
            } finally {
                setIsLoadingEvent(false);
            }
        };

        fetchEventDetails();
    }, [ticketInfo]);

    const eventStartTime = eventSession?.startDateTime;
    const originalPrice = ticketInfo?.price || 0;


    return (
        <Card className="overflow-hidden hover:shadow-sm transition-all duration-200">
            <div className="flex flex-col md:flex-row">
                {/* image column */}
                <div className="w-full md:w-[220px] h-40 md:h-auto shrink-0 bg-slate-100 relative">
                    {isLoadingEvent ? (
                        <div className="w-full h-full flex items-center justify-center bg-slate-200 animate-pulse">
                            <span className="text-slate-400 text-sm">Đang tải ảnh...</span>
                        </div>
                    ) : (
                        <img
                            src={event?.poster}
                            alt={event?.name}
                            className="w-full h-full object-cover"
                        />
                    )}
                    <div className="absolute top-2 left-2">
                        <ResalePostStatusBadge status={status} />
                    </div>
                </div>

                {/* info column */}
                <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                            <div className="text-sm text-slate-500">
                                Mã bài đăng: <span className="font-medium text-slate-700">
                                    #{id}</span> - Tạo lúc: {formatDate(createdAt)}
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 line-clamp-1 mb-1">
                            {isLoadingEvent ? "Đang tải thông tin sự kiện..." : event?.name}
                        </h3>
                        <p className="text-sm font-medium text-blue-600 mb-3 line-clamp-1">
                            Loại vé: {ticketInfo?.name || "Đang tải..."}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">

                            <TicketCountBadge ticketCount={ticketQuantity} />

                            <ResalePostHasRetailBadge hasRetail={hasRetail} />

                            {eventStartTime && (
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <CalendarDays className="w-4 h-4 text-slate-400" />
                                    <span>
                                        {formatDateTime(eventStartTime)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Show the reason for rejection, if any. */}
                    {status === ResalePostStatus.REJECTED && rejectionMessage && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-md text-sm text-red-600 
                        flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span><strong>Lý do từ chối:</strong> {rejectionMessage}</span>
                        </div>
                    )}

                    <Separator className="my-4" />

                    <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
                        <div className="flex gap-6">
                            <div>
                                <p className="text-xs text-slate-500 mb-0.5">Giá gốc (1 vé)</p>
                                <p className="text-sm font-medium text-slate-700 line-through">
                                    {formatCurrency(originalPrice)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-0.5">Giá pass (1 vé)</p>
                                <p className="text-lg font-bold text-red-600">
                                    {formatCurrency(pricePerTicket)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <DetailButton
                                onClick={() => navigate(routes.resaleDetailProfile.replace(":id", id))}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default ResaleCard;