import React from 'react';
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Video } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { displaySessionDate, formatCurrency, formatTime } from '@/utils/format';
import { EventType, MeetingPlatform } from '@/utils/constant';

const BookingSummary = ({ event, selectedTickets, totalAmount, eventSession, onSubmit,
    discountAmount = 0,
    finalAmount = totalAmount,
    messageButton, disabled
}) => {
    const isOnline = event.type == EventType.ONLINE.key;
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow
         border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Event Header Image */}
            <div className="relative h-32 w-full bg-gray-200">
                <img
                    src={event.thumbnail}
                    alt={event.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-white font-bold text-lg leading-snug truncate">
                        {event.name}
                    </h3>
                </div>
            </div>

            <div className="p-5 flex flex-col gap-4">
                {/* Event Details */}
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded bg-blue-50 dark:bg-blue-900/20 text-primary">
                        <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-bold text-sm text-gray-900 dark:text-gray-100">
                            {displaySessionDate({
                                startDateTime: eventSession.startDateTime,
                                endDateTime: eventSession.endDateTime
                            })}
                        </p>
                        <p className="text-sm text-gray-500">
                            {formatTime(eventSession.startDateTime) + " - " +
                                formatTime(eventSession.endDateTime)}

                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="p-2 rounded bg-blue-50 dark:bg-blue-900/20 text-primary">
                        {isOnline ?
                            <Video className="w-5 h-5" />
                            :
                            <MapPin className="w-5 h-5" />
                        }
                    </div>
                    {
                        isOnline ?
                            <div>
                                <p className="font-bold text-sm text-gray-900 dark:text-gray-100">
                                    {event.meetingPlatform == MeetingPlatform.ZOOM ? "Zoom" : "Google meet"}
                                </p>
                            </div> :
                            <div>
                                <p className="font-bold text-sm text-gray-900 dark:text-gray-100">
                                    {event.address}
                                </p>
                                <p className="text-sm text-gray-500 line-clamp-1">
                                    {event.location}
                                </p>
                            </div>
                    }
                </div>

                <Separator className="my-1" />

                {/* Selected Tickets List */}
                <div className="flex flex-col gap-3 min-h-[60px]">
                    {selectedTickets.length > 0 ? (
                        selectedTickets.map((item) => (
                            <div key={item.id} className="flex justify-between items-start text-sm">
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-800 dark:text-gray-200">{item.name}</span>
                                    <span className="text-sm text-gray-500">x {item.quantity}</span>
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(item.price * item.quantity)}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-sm text-gray-400 italic py-2">
                            Chưa có vé nào được chọn
                        </div>
                    )}
                </div>

                <Separator className="my-1" />

                {/* Total */}
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                        <span className="text-sm font-medium">Tạm tính</span>
                        <span className="text-base font-semibold">
                            {formatCurrency(totalAmount)}
                        </span>
                    </div>

                    {discountAmount > 0 && (
                        <div className="flex justify-between items-center text-green-600 dark:text-green-500 animate-in fade-in">
                            <span className="text-sm font-medium">Giảm giá voucher</span>
                            <span className="text-base font-semibold">
                                - {formatCurrency(discountAmount)}
                            </span>
                        </div>
                    )}

                    <Separator className="my-1 border-dashed" />

                    <div className="flex justify-between items-end pt-1">
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Tổng thanh toán</span>
                        <span className="text-2xl font-black text-red-500 tracking-tight">
                            {formatCurrency(finalAmount)}
                        </span>
                    </div>
                </div>

                {/* Submit Button */}
                <Button
                    className="w-full py-6 text-base font-bold shadow-lg shadow-blue-500/20 mt-2"
                    disabled={selectedTickets.length === 0 || disabled}
                    onClick={onSubmit}
                >
                    {messageButton}
                    {/* <ArrowRight className="ml-2 w-5 h-5" /> */}
                </Button>
            </div>
        </div>
    );
};

export default BookingSummary;