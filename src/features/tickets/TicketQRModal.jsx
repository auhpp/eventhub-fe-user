import React from "react";
import QRCode from "react-qr-code";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { displaySessionDate, formatTime } from "@/utils/format";
import { isExpiredEventSession } from "@/utils/eventUtils";
import { AttendeeStatus } from "@/utils/constant";

const TicketQRModal = ({ isOpen, onClose, ticketData }) => {
    if (!ticketData) return null;
    const { ticketCode, status, event, booking, eventSession } = ticketData;

    const eventName = event?.name || "Tên sự kiện";
    const userName = booking?.customerName || "Tên khách hàng";
    const userEmail = booking?.customerEmail || "email@example.com";

    // 1. Check condition to disable ticket
    const isPastEvent = isExpiredEventSession({ eventSession: eventSession });
    const isCancelled = status === AttendeeStatus.CANCELLED_BY_EVENT.key ||
        status === AttendeeStatus.CANCELLED_BY_USER.key; 
    const isCheckedIn = status === AttendeeStatus.CHECKED_IN.key; 

    const isUnusable = isPastEvent || isCancelled || isCheckedIn;

    // 2. Define content display
    let overlayText = "";
    if (isCancelled) overlayText = "ĐÃ HỦY";
    else if (isCheckedIn) overlayText = "ĐÃ CHECK-IN";
    else if (isPastEvent) overlayText = "ĐÃ KẾT THÚC";

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-sm p-0 gap-0 overflow-hidden bg-white dark:bg-slate-900 border-none shadow-2xl rounded-3xl">
                <DialogHeader className="sr-only">
                    <DialogTitle>Mã vé {ticketCode}</DialogTitle>
                </DialogHeader>

                {/* QR Code Section */}
                <div className="flex flex-col items-center justify-center pt-8 pb-6 bg-white dark:bg-slate-900">
                    <div className="relative p-2 rounded-lg border-2 border-slate-100 dark:border-slate-800 bg-white shadow-sm overflow-hidden">

                        <div
                            className={`transition-all duration-300 ${isUnusable ? 'blur-[4px] opacity-40' : ''}`}
                            style={{ height: "auto", margin: "0 auto", maxWidth: 200, width: "100%" }}
                        >
                            <QRCode
                                size={256}
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                value={ticketCode}
                                viewBox={`0 0 256 256`}
                                fgColor="#000000"
                                bgColor="#FFFFFF"
                            />
                        </div>

                        {/* Overlay */}
                        {isUnusable && (
                            <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/30 dark:bg-slate-900/30">
                                <div className="px-4 py-2 bg-slate-900/90 text-white font-bold rounded-lg transform -rotate-12 shadow-lg border border-white/20 tracking-wider text-sm backdrop-blur-sm">
                                    {overlayText}
                                </div>
                            </div>
                        )}
                    </div>

                    <p className={`mt-4 text-sm font-mono
                         font-bold tracking-widest ${isUnusable ? 'text-slate-300 line-through' : 'text-slate-500'}`}>
                        {ticketCode}
                    </p>
                </div>

                {/* Dashed line */}
                <div className="relative flex items-center justify-between w-full">
                    <div className="h-6 w-3 rounded-r-full bg-slate-100 dark:bg-black absolute left-0"></div>
                    <div className="w-full border-t-2 border-dashed border-slate-200 dark:border-slate-700 mx-4"></div>
                    <div className="h-6 w-3 rounded-l-full bg-slate-100 dark:bg-black absolute right-0"></div>
                </div>

                {/* Bottom content */}
                <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 className="text-xl text-center font-bold text-slate-900 dark:text-white mb-6 line-clamp-2">
                        {eventName}
                    </h3>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Khách hàng</span>
                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-200 truncate">{userName}</span>
                        </div>
                        <div className=" flex flex-col gap-1">
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Email nhận vé</span>
                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-200 truncate">{userEmail}</span>
                        </div>

                        <div className=" flex flex-col gap-1">
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Ngày diễn ra</span>
                            <div className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                                {displaySessionDate({
                                    startDateTime: ticketData.eventSession?.startDateTime,
                                    endDateTime: ticketData.eventSession?.endDateTime
                                })}
                            </div>
                        </div>
                        <div className=" flex flex-col gap-1">
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Thời gian</span>
                            <div className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                                {formatTime(ticketData.eventSession?.startDateTime)} -
                                {formatTime(ticketData.eventSession?.endDateTime)}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-slate-400">
                            {isUnusable
                                ? "Vé này không còn khả dụng để quét"
                                : "Đưa mã này cho nhân viên soát vé tại sự kiện"}
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TicketQRModal;