import React from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
    Calendar as CalendarIcon,
    List,
    ChevronRight,
    Ticket,
    Clock,
} from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '@/utils/format';

const TicketSelection = ({ sessions, onSelectTicket }) => {
    if (!sessions || sessions.length === 0) return null;

    const defaultVal = sessions[0]?.id.toString();
    const openSellTicket = (tickets) => {
        for (const element of tickets) {
            const openAt = new Date(element.openAt)
            const endAt = new Date(element.endAt)
            const currentDate = new Date()
            if (openAt < currentDate && endAt > currentDate) {
                return true
            }
        };
    }
    const notToTimeSellTicket = (tickets) => {
        for (const element of tickets) {
            const openAt = new Date(element.openAt)
            const currentDate = new Date()
            if (openAt > currentDate) {
                return false
            }
        }
    }
    return (
        <div className="flex flex-col gap-3" id="ticket-section">
            {/* Header Section */}
            <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-3 px-6
             rounded-t-xl rounded-b-md  shadow-sm border border-gray-200 ">
                <div className="flex flex-col gap-4">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Ticket className="text-blue-600" /> Đặt vé
                    </h3>
                </div>
                <div className="flex bg-white dark:bg-gray-700 rounded-md p-1 border border-gray-200 dark:border-gray-600">
                    <Button variant="ghost" size="icon" className="h-8 w-8 bg-gray-100 dark:bg-gray-600 rounded text-primary">
                        <List className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                        <CalendarIcon className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Accordion List Sessions */}
            <Accordion type="single" collapsible defaultValue={defaultVal} className="w-full space-y-2">
                {sessions.map((session) => (
                    <AccordionItem
                        key={session.id}
                        value={session.id.toString()}
                        className="border border-gray-200 rounded-lg bg-white dark:bg-gray-800 overflow-hidden
                        shadow-sm  px-0"
                    >
                        <AccordionTrigger className="px-6 py-4 hover:no-underline
                         hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors [&[data-state=open]>div>div>span]:text-primary">
                            <div className="flex items-center justify-between w-full pr-2 text-left">
                                {/* Left: Date & Time Info */}
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <div>
                                            <span className="text-sm font-bold text-primary">
                                                {formatTime(session.startDateTime)} - {formatTime(session.endDateTime)}
                                            </span>
                                            <p>
                                                {formatDate(session.startDateTime) == formatDate(session.endDateTime) ? formatDate(session.startDateTime) :
                                                    formatDate(session.startDateTime) - formatDate(session.endDateTime)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Pseudo Button "Mua vé ngay" */}
                                <div className="hidden sm:block">
                                    <div className="px-4 py-2 bg-primary/10 
                                    text-primary hover:bg-primary hover:text-white
                                     rounded font-bold text-sm transition-all duration-200">
                                        {
                                            openSellTicket(session.tickets) ? 'Mua vé ngay' :
                                                (notToTimeSellTicket(session.tickets) ? 'Chưa mở bán' :
                                                    'Đã nghĩ bán'
                                                )
                                        }
                                    </div>
                                </div>
                            </div>
                        </AccordionTrigger>

                        <AccordionContent className="px-4 pb-4 pt-2 bg-gray-50/50
                         dark:bg-gray-900/20 border-t border-gray-100 dark:border-gray-700">
                            <div className="mb-3 mt-2 text-sm font-bold text-gray-500 uppercase tracking-wider">
                                Thông tin vé
                            </div>

                            <div className="flex flex-col gap-3">
                                {session.tickets && session.tickets.length > 0 ? (
                                    session.tickets.map((ticket) => (
                                        <TicketRow
                                            key={ticket.id}
                                            ticket={ticket}
                                            onClick={() => onSelectTicket(session, ticket)}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-gray-500 italic">
                                        Chưa có vé mở bán cho suất này
                                    </div>
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
};

// child component
const TicketRow = ({ ticket, onClick }) => {
    const isSoldOut = ticket.quantity <= 0;

    return (
        <button
            onClick={isSoldOut ? undefined : onClick}
            disabled={isSoldOut}
            className={`
                group w-full flex items-center justify-between p-4 rounded-lg border text-left transition-all duration-200
                ${isSoldOut
                    ? 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'
                    : 'bg-white border-gray-200 hover:border-primary hover:shadow-md hover:bg-blue-50/30 cursor-pointer'
                }
            `}
        >
            <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-full ${isSoldOut ? 'bg-gray-200' : 'bg-gray-100 group-hover:bg-primary/20 group-hover:text-primary'}`}>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors">
                        {ticket.name}
                    </span>
                    {ticket.name.toLowerCase().includes('vip') && (
                        <span className="text-[10px] font-bold text-yellow-600 bg-yellow-100 w-fit px-1.5 py-0.5 rounded mt-0.5">
                            VIP
                        </span>
                    )}
                </div>
            </div>

            <div className="flex flex-col items-end gap-0.5">
                <span className={`font-bold text-base ${isSoldOut ? 'text-gray-500' : 'text-primary'}`}>
                    {formatCurrency(ticket.price)}
                </span>
                {!isSoldOut && ticket.quantity < 10 && (
                    <span className="text-[10px] text-red-500 font-medium">
                        Chỉ còn {ticket.quantity} vé
                    </span>
                )}
            </div>
        </button>
    )
}

export default TicketSelection;