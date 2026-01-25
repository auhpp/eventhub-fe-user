import React, { useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Minus, Clock, AlertCircle, CalendarOff } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/utils/format';

const TicketSelectionItem = ({ ticket, quantity, onUpdateQuantity }) => {
    const ticketStatus = useMemo(() => {
        const now = new Date();
        const openDate = new Date(ticket.openAt);
        const endDate = new Date(ticket.endAt);

        if (now < openDate) {
            return {
                code: 'UPCOMING',
                label: 'Sắp mở bán',
                color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
                icon: Clock,
                isBuyable: false
            };
        }

        if (now > endDate) {
            return {
                code: 'ENDED',
                label: 'Đã kết thúc',
                color: 'text-gray-500 bg-gray-100 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
                icon: CalendarOff,
                isBuyable: false
            };
        }


        if (ticket.isSoldOut || (ticket.remainingQuantity !== undefined && ticket.remainingQuantity <= 0)) {
            return {
                code: 'SOLDOUT',
                label: 'Đã hết vé',
                color: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
                icon: AlertCircle,
                isBuyable: false
            };
        }

        return {
            code: 'AVAILABLE',
            label: 'Đang mở bán',
            color: 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
            isBuyable: true
        };
    }, [ticket]);

    const StatusIcon = ticketStatus.icon;

    return (
        <div className={`
            p-5 rounded-xl border transition-all duration-200 relative overflow-hidden
            ${quantity > 0 && ticketStatus.isBuyable
                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
            }
            ${!ticketStatus.isBuyable ? 'opacity-75' : 'hover:border-primary/50'}
        `}>
            <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
                {/* Ticket Info */}
                <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {ticket.name}
                        </h3>

                        {/* Status Badge */}
                        {ticketStatus.code !== 'AVAILABLE' && (
                            <span className={`
                                inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border w-fit
                                ${ticketStatus.color}
                            `}>
                                {StatusIcon && <StatusIcon className="w-3 h-3" />}
                                {ticketStatus.label}
                                {ticketStatus.code === 'UPCOMING' && (
                                    <span className="hidden sm:inline"> - {formatDateTime(ticket.openAt)}</span>
                                )}
                            </span>
                        )}
                    </div>

                    <div className="flex justify-between items-center sm:hidden mb-2">
                        <div className={`font-bold text-lg ${!ticketStatus.isBuyable ? 'text-gray-400 line-through' : 'text-primary'}`}>
                            {formatCurrency(ticket.price)}
                        </div>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {ticket.description}
                    </p>
                </div>

                {/* Price & Counter */}
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 min-w-[120px] pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-700">
                    <div className={`text-xl font-bold hidden sm:block ${!ticketStatus.isBuyable ? 'text-gray-400' : 'text-primary'}`}>
                        {formatCurrency(ticket.price)}
                    </div>

                    <div className={`
                        flex items-center gap-3 rounded-lg border p-1 shadow-sm
                        ${!ticketStatus.isBuyable
                            ? 'bg-gray-50 border-gray-100 dark:bg-gray-800 dark:border-gray-700 cursor-not-allowed'
                            : 'bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-600'
                        }
                    `}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-md hover:bg-gray-100 text-gray-500 disabled:opacity-30"
                            onClick={() => onUpdateQuantity(ticket.id, -1)}
                            disabled={!ticketStatus.isBuyable || quantity <= 0}
                        >
                            <Minus className="h-4 w-4" />
                        </Button>

                        <span className={`w-8 text-center font-bold select-none ${!ticketStatus.isBuyable ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                            {quantity}
                        </span>

                        <Button
                            variant="ghost"
                            size="icon"
                            className={`
                                h-8 w-8 rounded-md 
                                ${!ticketStatus.isBuyable
                                    ? 'bg-transparent text-gray-300'
                                    : 'bg-gray-100 dark:bg-gray-800 text-primary hover:bg-gray-200'
                                }
                            `}
                            onClick={() => onUpdateQuantity(ticket.id, 1)}
                            disabled={!ticketStatus.isBuyable || quantity >= ticket.maximumPerPurchase}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketSelectionItem;