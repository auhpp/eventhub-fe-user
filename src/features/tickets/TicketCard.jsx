import React, { useState } from "react";
import { QrCode, ExternalLink, Loader2, User, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AttendeeStatus, EventType } from "@/utils/constant";
import TicketQRModal from "./TicketQRModal";
import { getMeetingUrl } from "@/services/attendeeService";
import { toast } from "sonner";
import { formatTime } from "@/utils/format";
import SourceTypeBadge from "@/components/SourceTypeBadge";
import AttendeeStatusBadge from "@/components/AttendeeStatusBadge";

const TicketCard = ({ attendee, event, eventSession, booking, currentUser }) => {
    const { id, status, ticket, owner, sourceType } = attendee;
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);

    const isOnline = event?.type === EventType.ONLINE.key;
    const [isJoining, setIsJoining] = useState(false);
    const isInvalid = status !== AttendeeStatus.VALID.key;

    const isGiftedAway = currentUser && owner && currentUser.id !== owner.id;

    const handleJoinEvent = async () => {
        if (isGiftedAway) {
            toast.error("Bạn không thể tham gia vì vé này đã được tặng cho người khác.");
            return;
        }

        const now = new Date();
        const startTime = new Date(eventSession?.checkingStartTime);
        const canJoinTime = new Date(startTime.getTime() - 15 * 60000);

        if (eventSession?.checkingStartTime && (now < canJoinTime)) {
            toast.warning(`Sự kiện chưa bắt đầu. Vui lòng quay lại vào lúc ${formatTime(canJoinTime)}`);
            return;
        }

        setIsJoining(true);
        try {
            const responseResult = await getMeetingUrl({ attendeeId: id });
            const meetingLink = responseResult.result;

            if (meetingLink) window.open(meetingLink, '_blank');
            else toast.error("Không tìm thấy link tham gia.");
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi lấy link tham gia");
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <>
            <div className={`relative bg-white rounded-lg shadow-sm border flex flex-col transition-all group 
                ${isGiftedAway ? 'border-slate-200 opacity-90' : 'border-slate-200 hover:shadow-md'}`}>

                {/* --- top part --- */}
                <div className={`p-4 pb-2 rounded-t-2xl relative overflow-hidden ${isGiftedAway ? 'bg-slate-50' : ''}`}>
                    <div className="flex items-center justify-end gap-2">
                        {
                            !isGiftedAway &&
                            <AttendeeStatusBadge status={status} />
                        }
                        <SourceTypeBadge sourceType={sourceType} isSender={booking.appUser.id === currentUser?.id} />
                    </div>
                    <div className="flex justify-between items-start mb-1 mt-2">
                        <div className="flex flex-col gap-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loại vé</span>
                            <span className="text-md font-bold text-slate-800 uppercase">
                                {ticket?.name}
                            </span>
                        </div>
                    </div>

                    <div className={`flex items-center gap-2 text-sm p-2.5 rounded-lg border 
                        ${isGiftedAway ? 'bg-green-50 border-green-100 text-green-700' :
                            'bg-slate-50 border-slate-100 text-slate-600'}`}>
                        {isGiftedAway ? <Gift className="w-4 h-4 text-green-500" /> :
                            <User className="w-4 h-4 text-slate-400" />}
                        <span className="truncate font-medium" title={owner?.email}>
                            {owner?.email ? owner.email : "Chưa gắn người sở hữu"}
                        </span>
                    </div>
                </div>

                {/* --- Dotted line for tearing tickets --- */}
                <div className={`relative flex items-center h-6 ${isGiftedAway ? 'bg-slate-50' : 'bg-white'}`}>
                    <div className={`absolute -left-3 w-6 h-6 border-r border-slate-300 rounded-full z-10 
                        ${isGiftedAway ? 'bg-slate-50' : 'bg-white'}`}></div>
                    <div className="w-full border-t-2 border-dashed border-slate-200 mx-4"></div>
                    <div className={`absolute -right-3 w-6 h-6 border-l border-slate-300 rounded-full z-10 
                        ${isGiftedAway ? 'bg-slate-50' : 'bg-white'}`}></div>
                </div>

                {/* --- Bottom part --- */}
                <div className={`p-4 pt-2 rounded-b-2xl flex flex-col items-center 
                    ${isGiftedAway ? 'bg-slate-50' : 'bg-white'}`}>

                    <div className="w-full flex flex-col gap-2.5 mt-2">
                        {isGiftedAway ? (
                            <div className="w-full h-11 bg-slate-100 border border-dashed border-slate-300 
                            rounded-lg flex items-center justify-center text-sm font-medium text-slate-500">
                                Vé đã được chuyển quyền sở hữu
                            </div>
                        ) : (
                            isOnline ? (
                                <Button
                                    onClick={handleJoinEvent}
                                    disabled={isJoining || isInvalid}
                                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                                >
                                    {isJoining ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ExternalLink className="w-4 h-4 mr-2" />}
                                    Vào sự kiện
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => setIsQRModalOpen(true)}
                                    disabled={isInvalid}
                                    className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-md"
                                >
                                    <QrCode className="w-4 h-4 mr-2" />
                                    Xem mã QR Check-in
                                </Button>
                            )
                        )}
                    </div>
                </div>
            </div>

            {!isGiftedAway && (
                <TicketQRModal
                    isOpen={isQRModalOpen}
                    onClose={() => setIsQRModalOpen(false)}
                    ticketData={{ ...attendee, event, eventSession }}
                />
            )}
        </>
    );
};

export default TicketCard;