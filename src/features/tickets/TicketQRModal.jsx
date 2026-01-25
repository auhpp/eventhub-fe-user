import React from "react";
import QRCode from "react-qr-code";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { displaySessionDate, formatTime } from "@/utils/format";

const TicketQRModal = ({ isOpen, onClose, ticketData }) => {
    if (!ticketData) return null;

    const eventName = ticketData.event?.name || "Tên sự kiện";
    const userName = ticketData.booking?.customerName || "Tên khách hàng";
    const userEmail = ticketData.booking?.customerEmail || "email@example.com";
    const ticketCode = ticketData.ticketCode || "NO-CODE";

    const qrValue = JSON.stringify({
        code: ticketCode,
        eventId: ticketData.event?.id,
    });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-sm p-0 gap-0 overflow-hidden bg-white dark:bg-slate-900
             border-none shadow-2xl rounded-3xl">
                <DialogHeader className="sr-only">
                    <DialogTitle>Mã vé {ticketCode}</DialogTitle>
                </DialogHeader>

                {/* QR Code */}
                <div className="flex flex-col items-center justify-center pt-8 pb-6 bg-white dark:bg-slate-900">
                    <div className="p-2 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-white shadow-sm">
                        <div style={{ height: "auto", margin: "0 auto", maxWidth: 200, width: "100%" }}>
                            <QRCode
                                size={256}
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                value={qrValue}
                                viewBox={`0 0 256 256`}
                                fgColor="#000000"
                                bgColor="#FFFFFF"
                            />
                        </div>
                    </div>
                    <p className="mt-4 text-sm font-mono font-bold text-slate-400 tracking-widest">
                        {ticketCode}
                    </p>
                </div>

                {/* The dashed line separates them. */}
                <div className="relative flex items-center justify-between w-full">
                    {/*Left half circle */}
                    <div className="h-6 w-3 rounded-r-full bg-slate-100 dark:bg-black absolute left-0"></div>

                    {/* the dashed line */}
                    <div className="w-full border-t-2 border-dashed border-slate-200 dark:border-slate-700 mx-4"></div>

                    {/*right half circle */}
                    <div className="h-6 w-3 rounded-l-full bg-slate-100 dark:bg-black absolute right-0"></div>
                </div>

                {/* bottom content */}
                <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 className="text-xl text-center font-bold text-slate-900 dark:text-white mb-6 line-clamp-2">
                        {eventName}
                    </h3>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Khách hàng
                            </span>
                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-200 truncate">
                                {userName}
                            </span>
                        </div>
                        <div className=" flex flex-col gap-1">
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Email nhận vé
                            </span>
                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-200 truncate">
                                {userEmail}
                            </span>
                        </div>

                        <div className=" flex flex-col gap-1">
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Ngày diễn ra
                            </span>
                            <div className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                                {displaySessionDate({
                                    startDateTime: ticketData.eventSession?.startDateTime,
                                    endDateTime: ticketData.eventSession?.endDateTime
                                })}
                            </div>
                        </div>
                        <div className=" flex flex-col gap-1">
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Thời gian
                            </span>
                            <div className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                                {formatTime(ticketData.eventSession?.startDateTime)} -
                                {formatTime(ticketData.eventSession?.endDateTime)}

                            </div>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-slate-400">
                            Đưa mã này cho nhân viên soát vé tại sự kiện
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TicketQRModal;