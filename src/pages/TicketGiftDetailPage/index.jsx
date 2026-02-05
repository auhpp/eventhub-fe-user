import React, { useEffect, useState, useMemo, useContext } from 'react';
import { useParams, } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
    Ticket, Clock, MapPin
} from "lucide-react";
import { toast } from "sonner";
import ConfirmDialog from '@/components/ConfirmDialog';

import {
    revokeTicketGift,
    getAttendeeTicketGifts,
    getTicketGiftById,
    acceptTicketGift,
    rejectTicketGift
} from '@/services/ticketGiftService';
import { TicketGiftStatus } from '@/utils/constant';
import RejectInvitationDialog from '../../components/RejectInvitationDialog';
import AcceptInvitationDialog from '../../components/AcceptInvitationDialog';
import { AuthContext } from '@/context/AuthContex';
import { displaySessionDate, formatTime } from '@/utils/format';
import DefaultAvatar from '@/components/DefaultAvatar';
import ButtonBack from '@/components/ButtonBack';
import { HttpStatusCode } from 'axios';
import TicketGiftStatusBadge from '@/components/TicketGiftStatusBadge';

const TicketGiftDetailPage = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);

    // --- STATE ---
    const [gift, setGift] = useState(null);
    const [attendees, setAttendees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal States
    const [isRevokeOpen, setIsRevokeOpen] = useState(false);
    const [isAcceptOpen, setIsAcceptOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);

    // Action Loading States
    const [isProcessing, setIsProcessing] = useState(false);

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                const giftResponse = await getTicketGiftById({ id });
                if (giftResponse.code == HttpStatusCode.Ok) {
                    setGift(giftResponse.result);
                }

                const attendeesResponse = await getAttendeeTicketGifts({ id });
                if (attendeesResponse.code == HttpStatusCode.Ok) {
                    setAttendees(attendeesResponse.result);
                }

            } catch (error) {
                console.error("Failed to load gift details", error);
                toast.error("Không thể tải thông tin quà tặng");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // --- HELPER: Group tickets ---
    const groupedTickets = useMemo(() => {
        if (!attendees || attendees.length === 0) return [];
        const groups = {};
        attendees.forEach(att => {
            const name = att.ticket?.name || "Vé sự kiện";
            const price = att.ticket?.price || 0;
            if (!groups[name]) groups[name] = { count: 0, price, codes: [] };
            groups[name].count++;
            groups[name].codes.push(att.ticketCode);
        });
        return Object.entries(groups).map(([name, data]) => ({ name, ...data }));
    }, [attendees]);

    // --- LOGIC: Check Status & Expired ---
    const isExpired = useMemo(() => {
        if (!gift) return false;
        if (gift.status === 'EXPIRED' || gift.status === TicketGiftStatus.EXPIRED) return true;
        if ((gift.status === 'PENDING' || gift.status === TicketGiftStatus.PENDING) && gift.expiredAt) {
            return new Date() > new Date(gift.expiredAt);
        }
        return false;
    }, [gift]);

    // --- PERMISSION CHECK ---
    const isSender = user?.id === gift?.sender?.id;
    const isReceiver = user?.id === gift?.receiver?.id;

    // --- HELPER: Render Status Badge ---


    // --- ACTIONS ---

    // 1. Sender Revoke
    const handleRevokeSubmit = async () => {
        setIsProcessing(true);
        try {
            await revokeTicketGift({ id: gift.id });
            toast.success("Đã thu hồi quà tặng thành công");
            setGift(prev => ({ ...prev, status: TicketGiftStatus.REVOKED }));
            setIsRevokeOpen(false);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Lỗi khi thu hồi");
        } finally {
            setIsProcessing(false);
        }
    };

    // 2. Receiver Accept
    const handleAcceptSubmit = async () => {
        setIsProcessing(true);
        try {
            await acceptTicketGift({ id: gift.id });
            toast.success("Đã nhận vé thành công! Kiểm tra ví của bạn.");
            setGift(prev => ({ ...prev, status: TicketGiftStatus.ACCEPTED }));
            setIsAcceptOpen(false);

            // Optional: Chuyển hướng về trang danh sách vé của tôi sau khi nhận
            // setTimeout(() => navigate('/my-tickets'), 1500); 
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Lỗi khi nhận vé");
        } finally {
            setIsProcessing(false);
        }
    };

    // 3. Receiver Reject
    const handleRejectSubmit = async (message) => {
        setIsProcessing(true);
        try {
            await rejectTicketGift({ id: gift.id, rejectionMessage: message });
            toast.success("Đã từ chối nhận vé.");
            setGift(prev => ({
                ...prev,
                status: TicketGiftStatus.REJECTED,
                rejectionMessage: message
            }));
            setIsRejectOpen(false);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Lỗi khi từ chối vé");
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Đang tải thông tin...</div>;
    if (!gift) return <div className="min-h-screen flex items-center justify-center text-gray-500">Không tìm thấy thông tin.</div>;


    // Data Mapping
    const eventInfo = gift.booking?.event || {};
    const eventSessionInfo = gift.booking?.eventSession || {};
    const recipient = gift.receiver || {};
    const sender = gift.sender || {};

    const bookingId = gift.booking?.id || "---";
    const isPending = (gift.status === 'PENDING' || gift.status === TicketGiftStatus.PENDING) && !isExpired;

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12">

            {/* Header */}
            <div className="bg-white border-b border-gray-100 py-3 sticky top-0 z-10">
                <div className="mx-auto px-4 flex items-center gap-3">
                    <ButtonBack />
                    <div className="flex flex-col">
                        <h1 className="text-lg font-semibold text-gray-900 leading-tight">Chi tiết tặng vé</h1>
                        {/* Hiển thị thời gian hết hạn nếu đang Pending */}
                        {isPending && gift.expiredAt && (
                            <span className="text-xs text-orange-600 font-medium">
                                Hết hạn: {new Date(gift.expiredAt).toLocaleString('vi-VN')}
                            </span>
                        )}
                    </div>
                    <TicketGiftStatusBadge status={gift.status} isExpired={isExpired} />

                </div>
            </div>

            <main className="mx-auto px-4 py-6 space-y-6">

                {/* user info */}
                <section>
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">{
                        isSender ? 'Người nhận vé' : 'Người gửi vé'}</h2>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
                        <Avatar className="w-14 h-14 border border-gray-100 shadow-sm">
                            <DefaultAvatar user={isSender ? recipient : sender} />
                        </Avatar>

                        <div className="relative z-10 overflow-hidden">
                            <h3 className="font-bold text-gray-900 text-lg leading-tight truncate">{isSender ?
                                recipient.fullName : sender.fullName}</h3>
                            <p className="text-gray-500 text-sm font-medium truncate">{isSender ? recipient.email :
                                sender.email}</p>
                        </div>
                    </div>
                </section>

                {/* envent and booking info */}
                <section>
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Thông tin sự kiện</h2>
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-bold text-gray-900 text-lg leading-snug mb-2">
                                {eventInfo.name}
                            </h3>
                            <div className="flex flex-col gap-1.5 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <div className='flex flex-col'>
                                        <span>
                                            {displaySessionDate({
                                                startDateTime: eventSessionInfo.startDateTime,
                                                endDateTime: eventSessionInfo.endDateTime
                                            })}
                                        </span>
                                        <span>
                                            {formatTime(eventSessionInfo.startDateTime)} -
                                            {formatTime(eventSessionInfo.endDateTime)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <div className='flex flex-col'>
                                        <span className="truncate">{eventInfo.address}</span>
                                        <span className="truncate">{eventInfo.location}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-4 py-3 flex justify-between items-center text-sm">
                            <span className="text-gray-500">Mã đơn hàng</span>
                            <span className="font-mono font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                                #{bookingId}
                            </span>
                        </div>
                    </div>
                </section>

                {/* tiket gift */}
                <section>
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                        Chi tiết vé tặng ({attendees.length})</h2>
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
                        {groupedTickets.map((group, idx) => (
                            <div key={idx} className="p-4 flex justify-between items-start">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 w-8 h-8 rounded-full bg-blue-50 text-brand flex items-center justify-center shrink-0">
                                        <Ticket className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900 text-base">
                                            {group.name}
                                        </div>
                                        {(isSender && gift.status !== TicketGiftStatus.ACCEPTED ||
                                            !isSender && gift.status === TicketGiftStatus.ACCEPTED
                                        ) && (
                                                <div className="text-xs text-gray-400 mt-1 font-mono break-all max-w-[200px] truncate">
                                                    {group.codes.join(', ')}
                                                </div>
                                            )}
                                    </div>
                                </div>
                                <div className="font-medium text-gray-900 whitespace-nowrap">
                                    x{group.count}
                                </div>
                            </div>
                        ))}

                        <div className="p-4 bg-gray-50/50 flex justify-between items-center text-sm font-medium">
                            <span className="text-slate-800">Tổng số vé</span>
                            <span className="font-medium text-gray-900">{attendees.length} vé</span>
                        </div>
                    </div>
                </section>

                {/*  REJECTION REASON */}
                {gift.status === TicketGiftStatus.REJECTED && gift.rejectionMessage && (
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-sm text-red-700">
                        <span className="font-bold block mb-1">Lý do từ chối:</span>
                        "{gift.rejectionMessage}"
                    </div>
                )}

                {/*  ACTION BUTTONS */}
                {isPending && (
                    <div className="pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">

                        {/* CASE 1: SENDER */}
                        {isSender && (
                            <Button
                                variant="destructive"
                                className="bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 shadow-sm"
                                onClick={() => setIsRevokeOpen(true)}
                            >
                                Thu hồi vé tặng
                            </Button>
                        )}

                        {/* CASE 2: RECEIVER */}
                        {isReceiver && (
                            <>
                                <Button
                                    variant="outline"
                                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                    onClick={() => setIsRejectOpen(true)}
                                >
                                    Từ chối
                                </Button>
                                <Button
                                    className="bg-brand hover:bg-brand/90 text-white shadow-md"
                                    onClick={() => setIsAcceptOpen(true)}
                                >
                                    Xác nhận nhận vé
                                </Button>
                            </>
                        )}
                    </div>
                )}

            </main>

            {/* --- DIALOGS --- */}

            {/* Sender Revoke Dialog */}
            <ConfirmDialog
                open={isRevokeOpen}
                onOpenChange={setIsRevokeOpen}
                onConfirm={handleRevokeSubmit}
                isLoading={isProcessing}
                title="Thu hồi quà tặng"
                description={
                    <div className="space-y-2 mt-2">
                        <p>Bạn có chắc chắn muốn thu hồi <b>{attendees.length} vé</b> đã gửi cho <b>{recipient.fullName}</b> không?</p>
                        <p className="text-gray-500 text-sm">
                            Hành động này sẽ hủy yêu cầu tặng vé và vé sẽ vẫn thuộc quyền sở hữu của bạn.
                        </p>
                    </div>
                }
                confirmLabel="Xác nhận thu hồi"
                confirmVariant="destructive"
                cancelLabel="Giữ lại"
            />

            {/* Receiver Accept Dialog */}
            <AcceptInvitationDialog
                open={isAcceptOpen}
                onOpenChange={setIsAcceptOpen}
                onConfirm={handleAcceptSubmit}
                title="Xác nhận nhận quà tặng"
                description={
                    <>
                        Bạn có chắc chắn muốn nhận tấm vé này không? <br />
                        Vé sẽ được chuyển vào <strong>Ví vé cá nhân</strong> của bạn ngay sau khi xác nhận.
                    </>
                }
            />

            {/* Receiver Reject Dialog */}
            <RejectInvitationDialog
                open={isRejectOpen}
                onOpenChange={setIsRejectOpen}
                onConfirm={handleRejectSubmit}
                title="Từ chối nhận vé"
                description={
                    <>
                        Bạn có chắc chắn không muốn nhận tấm vé này?<br />
                        Sau khi từ chối, vé sẽ được trả về ví của người gửi: <strong>{sender.email}</strong>.
                    </>
                }
            />

        </div>
    );
};

export default TicketGiftDetailPage;