import React, { useEffect, useState } from 'react';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { routes } from '@/config/routes';
import { formatCurrency } from '@/utils/format';

const PendingBookingModal = ({
    isOpen,
    booking,
    onContinue,
    onCancel,
    eventSession,
    event,
    selectedTickets
}) => {
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        if (!booking) return;

        const calculateTimeLeft = () => {
            const expiredTime = new Date(booking.expiredAt).getTime();
            const currentTime = new Date().getTime();
            const secondsRemaining = Math.floor((expiredTime - currentTime) / 1000);
            return secondsRemaining > 0 ? secondsRemaining : 0;
        };

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTimeLeft(calculateTimeLeft());

        const timerId = setInterval(() => {
            const remaining = calculateTimeLeft();
            setTimeLeft(remaining);

            if (remaining <= 0) {
                clearInterval(timerId);
            }
        }, 1000);

        // Cleanup
        return () => clearInterval(timerId);
    }, [booking]); 

    useEffect(() => {
        if (timeLeft === 0 && event && eventSession) {
            const redirectUrl = routes.selectTicket
                .replace(":eventId", event.id)
                .replace(":eventSessionId", eventSession.id);

            navigate(redirectUrl, { replace: true });
        }
    }, [timeLeft, event, eventSession, navigate]);


    const formatTimeLeft = (seconds) => {
        if (seconds === null) return "--:--";
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    if (!booking) {
        return null;
    }

    return (
        <AlertDialog open={isOpen}>
            <AlertDialogContent className="max-w-[400px] rounded-xl bg-white p-0 overflow-hidden shadow-2xl border-0">
                {/* Header Section */}
                <div className="p-6 pb-2 text-center">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-bold text-gray-900 text-center mb-2">
                            Đơn hàng chưa hoàn thành
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-600 text-center text-base">
                            Bạn đang có đơn hàng chưa hoàn tất. <br />
                            Bạn có muốn tiếp tục?
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {/* Ticket Summary List */}
                    <div className="mt-6 space-y-2">
                        <div className="flex flex-col gap-3 min-h-[60px]">
                            {selectedTickets && selectedTickets.length > 0 ? (
                                selectedTickets.map((item) => (
                                    <div key={item.id} className="flex justify-between items-start text-sm">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{item.name}</span>
                                            <span className="text-start text-xs text-gray-500">x {item.quantity}</span>
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
                    </div>
                </div>

                {/* Footer / Actions Section */}
                <div className="p-6 pt-2 flex flex-col gap-3">
                    <Button
                        onClick={() => onContinue(booking)}
                        disabled={timeLeft === 0}
                        className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold text-base py-6 rounded-lg shadow-md transition-all"
                    >
                        Quay lại đơn cũ ({formatTimeLeft(timeLeft)})
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={() => onCancel(booking.id)}
                        className="w-full text-[#22c55e] hover:text-[#16a34a] hover:bg-green-50 font-bold text-base py-6"
                    >
                        Hủy đơn, Mua vé mới
                    </Button>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default PendingBookingModal;