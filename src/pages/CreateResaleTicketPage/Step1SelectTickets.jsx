import React from 'react';
import { Ticket, CheckCircle2, ArrowRight } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/utils/format';

export default function Step1SelectTickets({
    bookingData,
    groupedAttendees,
    selectedTicketId,
    selectedAttendees,
    toggleAttendeeSelection,
    onNextStep
}) {
    const firstAttendee = bookingData?.attendees?.[0];
    const sessionStart = firstAttendee?.eventSession?.startDateTime;

    return (
        <div className="animate-in fade-in duration-500">
            {/* head: commom event info */}
            <div className="bg-blue-50/50 border-b border-blue-100 p-6 flex flex-col sm:flex-row justify-between
             items-start sm:items-center gap-4">
                <div className="space-y-3">
                    <h2 className="text-lg font-bold text-blue-800 uppercase">
                        {bookingData?.event?.name}
                    </h2>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-3 py-1.5 
                        rounded-md border border-slate-200 shadow-sm w-fit">
                            <span>Mã đơn hàng: <strong className="text-slate-900">{bookingData?.id || "N/A"}</strong></span>
                        </div>

                        {sessionStart && (
                            <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-3 
                            py-1.5 rounded-md border border-slate-200 shadow-sm w-fit">
                                <span>Khung giờ: <strong className="text-slate-900">{formatDateTime(sessionStart)}</strong></span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-sm font-medium text-slate-600 bg-slate-100 px-4 py-2 rounded-lg whitespace-nowrap">
                    Đã chọn: <span className="text-blue-600 font-bold text-lg">{selectedAttendees.length}</span> vé
                </div>
            </div>

            {/* ticket */}
            <div className="p-6 space-y-8">
                {Object.values(groupedAttendees).map(({ ticket, attendees }) => {
                    const isGroupDisabled = selectedTicketId && selectedTicketId !== ticket.id;
                    const selectedInGroupCount = attendees.filter(a => selectedAttendees.includes(a.id)).length;

                    return (
                        <div key={ticket.id} className={`transition-opacity duration-300 ${isGroupDisabled ? "opacity-40 grayscale" : ""}`}>
                            {/* Header of ticket group */}
                            <div className="flex justify-between items-end mb-4 border-b border-slate-100 pb-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 rounded-md">
                                        <Ticket className="w-5 h-5 text-slate-700" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-800">{ticket.name}</h3>
                                        <p className="text-sm text-red-500">
                                            {formatCurrency(ticket.price)}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                                    Đã chọn {selectedInGroupCount} / {attendees.length}
                                </span>
                            </div>

                            {/* display Grid Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {attendees.map(attendee => {
                                    const isChecked = selectedAttendees.includes(attendee.id);
                                    const ticketCode = attendee.ticketCode;

                                    return (
                                        <div
                                            key={attendee.id}
                                            onClick={() => !isGroupDisabled && toggleAttendeeSelection(attendee)}
                                            className={`relative group p-4 rounded-xl cursor-pointer transition-all
                                                 border-2 flex flex-col justify-center ${isChecked
                                                    ? "bg-blue-50 border-blue-500 shadow-sm"
                                                    : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-md"
                                                }`}
                                        >
                                            {/* check button */}
                                            <div className="absolute top-3 right-3">
                                                {isChecked ? (
                                                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover:border-blue-400" />
                                                )}
                                            </div>

                                            {/* content card */}
                                            <div className="mt-1">
                                                <span className="text-[11px] text-slate-400 uppercase tracking-widest block mb-1.5 font-semibold">Mã vé</span>
                                                <span className="font-mono font-bold text-base text-slate-900 bg-slate-100 px-2 py-1 rounded border border-slate-200 inline-block">
                                                    {ticketCode}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-end rounded-b-2xl">
                <button
                    disabled={selectedAttendees.length === 0}
                    onClick={onNextStep}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                    Tiếp tục cấu hình giá <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}