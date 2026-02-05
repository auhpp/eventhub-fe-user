import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChevronLeft, Calendar, MapPin, ArrowRight, User, Ticket, Clock, CheckCircle2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { createTicketGift } from '@/services/ticketGiftService';
import ConfirmDialog from '@/components/ConfirmDialog';
import { routes } from '@/config/routes';
import { HttpStatusCode } from 'axios';
import DefaultAvatar from '@/components/DefaultAvatar';
import { displaySessionDate, formatTime } from '@/utils/format';

const TicketGiftConfirmPage = () => {
    const navigate = useNavigate();

    // --- STATE ---
    const [giftSession, setGiftSession] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- EFFECT ---
    useEffect(() => {
        const storedSession = localStorage.getItem('gift_session_final');
        if (storedSession) {
            setGiftSession(JSON.parse(storedSession));
        } else {
            toast.error("Phiên giao dịch hết hạn");
            navigate(routes.order);
        }
    }, [navigate]);

    // --- HELPER: Group tickets ---
    const groupedTickets = useMemo(() => {
        if (!giftSession?.tickets) return [];
        const groups = {};
        giftSession.tickets.forEach(t => {
            const name = t.ticket?.name || "Vé sự kiện";
            const price = t.ticket?.price || 0;
            if (!groups[name]) groups[name] = { count: 0, price, codes: [] };
            groups[name].count++;
            groups[name].codes.push(t.ticketCode);
        });
        return Object.entries(groups).map(([name, data]) => ({ name, ...data }));
    }, [giftSession]);

    // --- ACTION ---
    const handleFinalSubmit = async () => {
        if (!giftSession) return;
        setIsSubmitting(true);
        try {
            const payload = {
                receiverId: giftSession.recipient.id,
                bookingId: giftSession.tickets[0].booking?.id,
                attendeeIds: giftSession.tickets.map(t => t.id)
            };
            const response = await createTicketGift(payload);
            if (response.code == HttpStatusCode.Ok) {
                toast.success("Tặng vé thành công!");
                localStorage.removeItem('gift_session_tickets');
                localStorage.removeItem('gift_session_final');
                navigate(routes.ticketGifts);
            }
        } catch (error) {
            console.error("Lỗi tặng vé:", error);
            toast.error(error.response?.data?.message || "Có lỗi xảy ra.");
            setIsConfirmOpen(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!giftSession) return null;

    const { recipient, tickets } = giftSession;
    const eventInfo = tickets[0]?.event || tickets[0]?.eventSession?.event || {};
    const bookingId = tickets[0]?.booking?.id;
    const eventSession = tickets[0]?.eventSession;

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12">

            {/* Header */}
            <div className="bg-white border-b border-gray-100 py-3 sticky top-0 z-10">
                <div className="mx-auto px-4 flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-8 w-8 -ml-2 text-gray-500 hover:text-gray-900">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-lg font-semibold text-gray-900">Xác nhận tặng vé</h1>
                </div>
            </div>

            <main className="mx-auto px-4 py-6 space-y-6">

                {/* user info */}
                <section>
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Người nhận vé</h2>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
                        <Avatar className="w-14 h-14 border border-gray-100 shadow-sm">
                            <DefaultAvatar user={recipient} />
                        </Avatar>

                        <div className="relative z-10">
                            <h3 className="font-bold text-gray-900 text-lg leading-tight">{recipient.fullName}</h3>
                            <p className="text-gray-500 text-sm font-medium">{recipient.email}</p>
                        </div>
                    </div>
                </section>

                {/* event and booking info */}
                <section>
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Thông tin sự kiện</h2>
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {/* Event Header */}
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-bold text-gray-900 text-lg leading-snug mb-2">
                                {eventInfo.name}
                            </h3>
                            <div className="flex flex-col gap-1.5 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <div className='flex flex-col'>
                                        <span>{displaySessionDate({
                                            startDateTime: eventSession.startDateTime,
                                            endDateTime: eventSession.endDateTime
                                        })}</span>
                                        <span>{formatTime(eventSession.startDateTime)} - {formatTime(eventSession.endDateTime)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <div className='flex flex-col'>
                                        <span className="truncate">{eventInfo.address || "Địa điểm chưa cập nhật"}</span>
                                        <span className="truncate">{eventInfo.location || "Địa điểm chưa cập nhật"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Info Bar */}
                        <div className="px-4 py-3 flex justify-between items-center text-sm">
                            <span className="text-gray-500">Mã đơn</span>
                            <span className="font-mono font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                                #{bookingId}
                            </span>
                        </div>
                    </div>
                </section>

                {/* ticket gift */}
                <section>
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                        Chi tiết vé tặng ({tickets.length})</h2>
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
                        {groupedTickets.map((group, idx) => (
                            <div key={idx} className="p-4 flex justify-between items-start">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 w-8 h-8 rounded-full 
                                    bg-blue-50 text-brand flex items-center justify-center shrink-0">
                                        <Ticket className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900 text-base">
                                            {group.name}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1 font-mono max-w-[200px] truncate">
                                            {group.codes.join(', ')}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="font-medium text-gray-900">
                                        x{group.count}
                                    </div>
                                    {/* <div className="text-sm text-gray-500">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(group.price)}
                                    </div> */}
                                </div>
                            </div>
                        ))}

                        {/* Summary Footer */}
                        <div className="p-4 bg-gray-50/50 flex justify-between items-center text-sm font-medium">
                            <span className="text-slate-800">Tổng số vé</span>
                            <span className="font-medium text-gray-900">{tickets.length} vé</span>
                        </div>
                    </div>
                </section>

                {/* action buttons) */}
                <div className="pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/orders')}
                        className="h-11 px-6 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        onClick={() => setIsConfirmOpen(true)}
                        className="h-11 px-8 rounded-lg bg-brand hover:bg-brand/90 text-white font-semibold shadow-sm hover:shadow active:scale-[0.98] transition-all"
                    >
                        Xác nhận tặng vé
                    </Button>
                </div>

            </main>

            {/* CONFIRM DIALOG */}
            <ConfirmDialog
                open={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                onConfirm={handleFinalSubmit}
                isLoading={isSubmitting}
                title="Xác nhận tặng vé"
                description={
                    <div className="space-y-2 mt-2">
                        <p>Bạn sắp chuyển <b>{tickets.length} vé</b> cho <b>{recipient.fullName}</b>.</p>
                        <p className="text-red-500 text-sm bg-red-50 p-2 rounded border border-red-100
                        flex gap-2 items-center">
                            <TriangleAlert className='size-8' />
                            <span>
                                Lưu ý: Sau khi người nhận xác nhận, quyền sở hữu vé sẽ được chuyển ngay lập tức và không thể hoàn tác.
                            </span>
                        </p>
                    </div>
                }
                confirmLabel="Đồng ý tặng"
                cancelLabel="Kiểm tra lại"
            />
        </div>
    );
};

export default TicketGiftConfirmPage;