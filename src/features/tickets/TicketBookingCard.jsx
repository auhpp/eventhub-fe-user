import React, { useContext } from "react";
import { MapPin, Video, CalendarDays, CalendarPlus, Gift } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { routes } from "@/config/routes";
import { BookingType, MeetingPlatform } from "@/utils/constant";
import { formatTime, formatDate, formatCurrency } from "@/utils/format";
import { toast } from "sonner";
import DetailButton from "@/components/DetailButton";
import { AuthContext } from "@/context/AuthContex";
import TicketCountBadge from "@/components/TicketCountBadge";
import { connectAndAddEventGoogleCalendar } from "@/services/googleCalendarService";

const TicketBookingCard = ({ data }) => {
    const { id, createdAt, finalAmount, attendees, event, eventSession, appUser } = data;
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const isOnline = event?.type === "ONLINE";
    const eventStartTime = eventSession?.startDateTime;
    const isGifted = user && appUser && user.id !== appUser.id;
    const giverName = appUser?.email;
    const isInvited = data.type == BookingType.INVITE;

    const ticketCount = (attendees?.filter(attendee => attendee?.owner?.id === user?.id)?.length || 0);

    const handleAddToCalendar = () => {
        if (!eventSession?.startDateTime || !eventSession?.endDateTime) {
            toast.error("Sự kiện chưa có thông tin thời gian cụ thể.");
            return;
        }

        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!clientId) {
            toast.error("Lỗi cấu hình: Thiếu VITE_GOOGLE_CLIENT_ID");
            return;
        }

        // init Google Identity Services client
        const client = window.google.accounts.oauth2.initCodeClient({
            client_id: clientId,
            scope: "https://www.googleapis.com/auth/calendar.events",
            ux_mode: 'popup',
            callback: async (response) => {
                if (response.error) {
                    toast.error("Đăng nhập thất bại hoặc bị hủy.");
                    return;
                }

                const toastId = toast.loading("Đang đồng bộ sự kiện vào lịch của bạn...");

                try {
                    await connectAndAddEventGoogleCalendar({
                        authCode: response.code,
                        userId: user?.id,
                        eventSessionId: eventSession?.id,
                        ticketCount: ticketCount,
                        bookingId: id 
                    });

                    toast.success("Đã tự động lưu sự kiện vào Google Calendar!", { id: toastId });
                } catch (error) {
                    console.error("Add to calendar error:", error);
                    toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi lưu lịch từ máy chủ.", { id: toastId });
                }
            },
        });

        client.requestCode();
    };

    return (
        <Card className={`overflow-hidden hover:shadow-sm transition-all duration-200 ${isGifted ? 'border-green-100' : ''}`}>
            <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-[220px] h-40 md:h-auto shrink-0 bg-slate-100 relative">
                    <img
                        src={event?.poster}
                        alt={event?.name}
                        className="w-full h-full object-cover"
                    />
                    {isGifted && (
                        <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 
                        py-1 rounded shadow-md flex items-center gap-1">
                            <Gift className="w-3 h-3" /> Vé được tặng
                        </div>
                    )}
                </div>

                <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                        {!isGifted && (
                            <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                                <div className="text-sm text-slate-500">
                                    Mã đơn:
                                    <span className="font-medium text-slate-700"> #{id}</span> - {'Đặt lúc'}: {formatDate(createdAt)} {formatTime(createdAt)}
                                </div>
                            </div>
                        )}

                        <h3 className="text-lg font-bold text-slate-900 line-clamp-2 mb-3">
                            {event?.name}
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
                            <TicketCountBadge ticketCount={ticketCount} />

                            {eventStartTime && (
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <CalendarDays className="w-4 h-4 text-slate-400" />
                                    <span>
                                        {formatTime(eventStartTime)} - {formatDate(eventStartTime)}
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center gap-1.5 w-full mt-1">
                                {isOnline ? (
                                    <Video className="w-4 h-4 text-slate-400 shrink-0" />
                                ) : (
                                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                                )}
                                <span className="line-clamp-1">
                                    {isOnline
                                        ? (eventSession?.meetingPlatform === MeetingPlatform.GOOGLE_MEET ? "Google Meet" : "Zoom")
                                        : (`${event?.address}, ${event?.location}`)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex justify-between items-end">
                        <div>
                            {isGifted ? (
                                <div className="flex flex-col gap-1">
                                    <p className="text-xs text-slate-500">Loại thẻ vé</p>
                                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-medium text-sm flex items-center gap-1.5 py-1">
                                        <Gift className="w-4 h-4" />
                                        Được tặng từ {giverName}
                                    </Badge>
                                </div>
                            ) :
                                isInvited ?
                                    <div className="flex flex-col gap-1">
                                        <p className="text-xs text-slate-500">Loại thẻ vé</p>
                                        <Badge variant="secondary" className="bg-orange-100 text-orange-700 
                                        hover:bg-green-100 border-none font-medium text-sm flex items-center gap-1.5 py-1">
                                            <Gift className="w-4 h-4" />
                                            Được mời
                                        </Badge>
                                    </div>
                                    :
                                    (
                                        <div>
                                            <p className="text-sm text-slate-500 mb-0.5">Tổng thanh toán</p>
                                            <p className="text-lg font-bold text-red-600">
                                                {formatCurrency(finalAmount)}
                                            </p>
                                        </div>
                                    )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 text-slate-700 border-slate-200 hidden sm:flex hover:bg-slate-50"
                                onClick={handleAddToCalendar}
                            >
                                <CalendarPlus className="w-4 h-4" />
                                Lưu Lịch
                            </Button>
                            <DetailButton
                                onClick={() => navigate(routes.ticketDetail.replace(":id", id))}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default TicketBookingCard;