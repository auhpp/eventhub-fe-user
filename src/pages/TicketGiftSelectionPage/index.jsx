import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2, ArrowRight, Gift } from "lucide-react";
import TicketGroup from './TicketGroup';
import { getBookingById, groupAttendeesByTicket } from '@/services/bookingService';
import { routes } from '@/config/routes';
import { HttpStatusCode } from 'axios';

const TicketGiftSelectionPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getBookingById({ id });
                if (data.code == HttpStatusCode.Ok) {
                    setBooking(data.result);
                }
            } catch (error) {
                console.error("Lỗi tải đơn hàng:", error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchData();
    }, [id]);

    //handle choose ticket
    const handleToggleItem = (attendeeId) => {
        setSelectedIds(prev =>
            prev.includes(attendeeId)
                ? prev.filter(id => id !== attendeeId)
                : [...prev, attendeeId]
        );
    };

    const groupedTickets = useMemo(() =>
        groupAttendeesByTicket(booking?.attendees),
        [booking]);

    const handleContinue = () => {
        const selectedAttendees = booking.attendees.filter(a => selectedIds.includes(a.id));
        localStorage.setItem('gift_session_tickets', JSON.stringify(selectedAttendees));
        navigate(routes.ticketGiftReceiver.replace(":id", booking.id));
    };

    if (loading) return (
        <div className="h-[50vh] flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-brand" />
        </div>
    );

    if (!booking) return <div className="p-10 text-center text-sm text-gray-500">Không tìm thấy đơn hàng</div>;

    return (
        <div className="flex flex-col min-h-screen relative bg-gray-50/50">

            {/* Header */}
            <div className="bg-white border-b border-gray-100 py-3 sticky top-0 z-10">
                <div className="mx-auto px-4 flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="h-8 w-8 -ml-2 text-gray-500 hover:text-gray-900"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-lg font-semibold text-gray-900">Chọn vé tặng</h1>
                </div>
            </div>

            <div className="flex-1 mx-auto w-full px-4 py-6">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <h2 className="text-base font-bold text-gray-900 line-clamp-1">
                            {booking.event?.name}
                        </h2>
                        <div className="text-xs text-gray-500 mt-1">
                            Mã đơn: <span className="font-mono text-gray-700">#{booking.id}</span>
                        </div>
                    </div>
                    <div className="hidden sm:block">
                        <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center text-brand">
                            <Gift className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* ticket list */}
                <div className="space-y-2">
                    {Object.keys(groupedTickets).map(ticketId => (
                        <TicketGroup
                            key={ticketId}
                            groupData={groupedTickets[ticketId]}
                            selectedIds={selectedIds}
                            onToggleItem={handleToggleItem}
                        />
                    ))}
                </div>
            </div>

            {/* --- FOOTER --- */}
            <div className="sticky bottom-0 z-20 bg-white border-t border-gray-200 py-3 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wide">Đã chọn</span>
                        <div className="flex items-baseline gap-1 text-brand">
                            <span className="text-xl font-bold leading-none">
                                {selectedIds.length}
                            </span>
                            <span className="text-xs font-medium">vé</span>
                        </div>
                    </div>

                    <Button
                        onClick={handleContinue}
                        disabled={selectedIds.length === 0}
                        size="sm"
                        className="h-10 px-6 rounded-lg font-medium bg-brand hover:bg-brand/90 text-white min-w-[140px]"
                    >
                        Tiếp tục <ArrowRight className="ml-1.5 w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TicketGiftSelectionPage;