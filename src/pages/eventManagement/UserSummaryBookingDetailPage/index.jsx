import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, CalendarCheck, Mail, Phone, CheckCircle, ArrowLeft } from "lucide-react";
import { getUserSummaryBooking } from '@/services/bookingService';
import { checkInManual } from '@/services/attendeeService';
import { toast } from "sonner";
import { formatCurrency } from '@/utils/format';
import AttendeeBookingCard from '@/features/attendee/AttendeeBookingCard';
import { BookingStatus, SourceType, AttendeeStatus, ActionType } from '@/utils/constant';
import DefaultAvatar from '@/components/DefaultAvatar';
import ConfirmDialog from '@/components/ConfirmDialog';
import { EventContext } from '@/context/EventContext';
import { isExpiredEventSession } from '@/utils/eventUtils';

const UserSummaryBookingDetailPage = () => {
    const navigate = useNavigate();

    const { eventSessionId, userId } = useParams();
    const { event } = useContext(EventContext);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    // State for manual check-in/out
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedAttendee, setSelectedAttendee] = useState(null);
    const [actionTypeConfirm, setActionTypeConfirm] = useState(null);

    const [totalTickets, setTotalTickets] = useState(0);
    const [checkedInTickets, setCheckedInTickets] = useState(0);
    const [currentSession, setCurrentSession] = useState()

    useEffect(() => {
        if (eventSessionId && userId) fetchDetail();
        else setData(null);
    }, [eventSessionId, userId]);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const res = await getUserSummaryBooking({ eventSessionId: Number(eventSessionId), userId: Number(userId) });
            setData(res.result);
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải chi tiết lịch sử đặt vé.");
        } finally {
            setLoading(false);
        }
    };

    const user = data?.user;
    const bookings = (data?.bookings || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const totalSpent = bookings
        .filter(b => b.status === BookingStatus.PAID)
        .reduce((sum, b) => sum + (b.finalAmount || 0), 0);

    useEffect(() => {
        if (data?.user) {
            let totalTicketsTmp = 0;
            let checkInTmp = 0;

            bookings.forEach(booking => {
                booking.attendees.forEach(attendee => {
                    if (attendee.owner?.email === user.email) {
                        totalTicketsTmp++;
                        if (attendee.status === AttendeeStatus.CHECKED_IN?.key || attendee.status === 'CHECKED_IN') {
                            checkInTmp++;
                        }
                    }
                });
            });
            setTotalTickets(totalTicketsTmp);
            setCheckedInTickets(checkInTmp);
        }
    }, [bookings, user, data]);

    const totalBooking = bookings.filter(b => b.sourceType === SourceType.PURCHASE).length;

    const handleManualCheckIn = async () => {
        if (!selectedAttendee || !actionTypeConfirm) return;

        setIsCheckingIn(true);
        const actionLabel = actionTypeConfirm === 'IN' ? 'Check-in (Vào)' : 'Check-out (Ra)';
        const toastId = toast.loading(`Đang xử lý ${actionLabel}...`);

        try {
            await checkInManual({
                attendeeId: selectedAttendee.id,
                actionType: actionTypeConfirm,
                eventId: event.id
            });

            toast.success(`${actionLabel} thành công!`, { id: toastId });

            setIsConfirmOpen(false);
            setSelectedAttendee(null);
            setActionTypeConfirm(null);

            fetchDetail();
        } catch (error) {
            toast.error(error?.response?.data?.message || `Lỗi khi ${actionLabel}.`, { id: toastId });
        } finally {
            setIsCheckingIn(false);
        }
    };


    const handleOpenConfirmDialog = (attendee, actionType) => {
        setSelectedAttendee(attendee);
        setActionTypeConfirm(actionType);
        setIsConfirmOpen(true);
    };

    useEffect(() => {
        const session = event.eventSessions.find(es => es.id == eventSessionId)
        setCurrentSession(session)
    }, [event, eventSessionId])

    const isFullyCheckedIn = checkedInTickets >= totalTickets && totalTickets > 0;
    const eventSession = event.eventSessions.find(es => es.id == eventSessionId);
    const isEndedSession = isExpiredEventSession({ endDateTime: eventSession?.endDateTime });

    // create label and description for confirm dialog based on actionTypeConfirm and selectedAttendee
    const confirmTitle = actionTypeConfirm === ActionType.IN ? "Xác nhận Check-in" : "Xác nhận Check-out";
    const confirmDesc = actionTypeConfirm === ActionType.IN
        ? `Xác nhận Check-in (Vào) cho vé của ${selectedAttendee?.owner?.fullName || "khách hàng này"}?`
        : `Xác nhận Check-out (Ra) cho vé của ${selectedAttendee?.owner?.fullName || "khách hàng này"}?`;

    return (
        <div className="w-full space-y-6 pb-10">
            {/* Header Area with Back Button */}
            <div className="flex items-start gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(-1)}
                    className="mt-1"
                >
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        Chi tiết lịch sử tham gia
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Thông tin chi tiết các lần mua vé của người dùng trong sự kiện này.
                    </p>
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : !data ? (
                <div className="p-10 text-center text-muted-foreground bg-gray-50 border rounded-xl">
                    Không có dữ liệu hoặc không tìm thấy người dùng.
                </div>
            ) : (
                <div className="space-y-6">
                    {/* User Profile Card */}
                    <Card className="shadow-sm bg-background overflow-hidden">
                        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
                                <Avatar className="h-16 w-16 border">
                                    <DefaultAvatar user={user} />
                                </Avatar>
                                <div className="flex-1 space-y-1.5">
                                    <h3 className="font-bold text-xl text-foreground">{user?.fullName}</h3>
                                    <div className="flex flex-col sm:flex-row gap-x-6 gap-y-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Mail size={16} /> {user?.email}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone size={16} /> {user?.phone || "Chưa cập nhật"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {isFullyCheckedIn && (
                                <div className="shrink-0 text-sm font-semibold text-green-700 flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
                                    <CheckCircle size={18} /> Đã điểm danh đủ
                                </div>
                            )}
                        </CardContent>

                        {/* Mini Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 border-t bg-muted/20 divide-y md:divide-y-0 md:divide-x">
                            <div className="p-4 text-center">
                                <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Tổng chi tiêu</div>
                                <div className="text-base font-bold text-red-500">{formatCurrency(totalSpent)}</div>
                            </div>
                            <div className="p-4 text-center">
                                <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Tổng vé</div>
                                <div className="text-base font-bold">{totalTickets} vé</div>
                            </div>
                            <div className="p-4 text-center bg-blue-50/50">
                                <div className="text-xs text-blue-700 uppercase tracking-wider font-semibold mb-1">Đã điểm danh</div>
                                <div className="text-base font-bold text-blue-700">{checkedInTickets} vé</div>
                            </div>
                            <div className="p-4 text-center">
                                <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Số lần đặt</div>
                                <div className="text-base font-bold">{totalBooking} lần</div>
                            </div>
                        </div>
                    </Card>

                    <Separator className="my-2" />

                    <div className="flex items-center justify-between">
                        <h4 className="text-lg font-bold text-foreground">
                            Danh sách đơn hàng <span className="text-muted-foreground font-normal text-base">({bookings.length})</span>
                        </h4>
                    </div>

                    {/* Bookings List */}
                    <div className="grid grid-cols-1 gap-4">
                        {bookings.map((booking) => (
                            <AttendeeBookingCard
                                key={booking.id}
                                booking={booking}
                                onCheckInClick={handleOpenConfirmDialog} // Đã truyền được cả attendee và actionType
                                isSessionEnded={isEndedSession}
                                eventSession={currentSession}
                            />
                        ))}
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={isConfirmOpen}
                onOpenChange={(isOpen) => {
                    setIsConfirmOpen(isOpen);
                    if (!isOpen) {
                        setSelectedAttendee(null);
                        setActionTypeConfirm(null);
                    }
                }}
                onConfirm={handleManualCheckIn}
                title={confirmTitle}
                description={confirmDesc}
                confirmLabel="Xác nhận"
                cancelLabel="Hủy"
                isLoading={isCheckingIn}
            />
        </div>
    );
};

export default UserSummaryBookingDetailPage;