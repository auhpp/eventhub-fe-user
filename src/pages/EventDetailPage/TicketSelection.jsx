import React, { useState } from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion";
import { Button, buttonVariants } from "@/components/ui/button";
import {
    Calendar as CalendarIcon,
    List,
    ChevronRight,
    ChevronDown,
    Ticket,
    Clock,
    CheckCircle2
} from 'lucide-react';
import { displaySessionDate, formatCurrency, formatTime } from '@/utils/format';
import { routes } from '@/config/routes';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const TicketSelection = ({ sessions, event }) => {
    const navigate = useNavigate()
    const defaultVal = sessions[0]?.id.toString();

    const getSessionStatus = (session) => {
        const now = new Date();
        const sessionEnd = new Date(session.endDateTime);
        const tickets = session.tickets || [];

        if (now > sessionEnd) {
            return { label: 'Đã diễn ra', disabled: true, variant: 'secondary' };
        }

        const isSelling = tickets.some(t => {
            const openAt = new Date(t.openAt);
            const endAt = new Date(t.endAt);
            return now >= openAt && now <= endAt && t.quantity > 0;
        });

        if (isSelling) {
            return { label: 'Mua vé ngay', disabled: false, variant: 'default' };
        }

        const allUpcoming = tickets.every(t => new Date(t.openAt) > now);
        if (allUpcoming) return { label: 'Sắp mở bán', disabled: true, variant: 'outline' };

        const allSoldOut = tickets.every(t => t.quantity <= 0);
        if (allSoldOut) return { label: 'Hết vé', disabled: true, variant: 'secondary' };

        return { label: 'Ngừng bán', disabled: true, variant: 'secondary' };
    };

    return (
        <div className="flex flex-col gap-3" id="ticket-section">
            {/* Header Section */}
            <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-3 px-6 rounded-t-xl rounded-b-md shadow-sm border border-gray-200 ">
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
                {sessions.map((session) => {
                    const status = getSessionStatus(session);

                    return (
                        <AccordionItem
                            key={session.id}
                            value={session.id.toString()}
                            className="border border-gray-200 rounded-lg bg-white dark:bg-gray-800 overflow-hidden shadow-sm px-0"
                        >
                            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors [&[data-state=open]>div>div>span]:text-primary">
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
                                                    {displaySessionDate({
                                                        startDateTime: session.startDateTime,
                                                        endDateTime: session.endDateTime
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Action Button */}
                                    <div className="hidden sm:block">
                                        <div
                                            role="button"
                                            className={cn(
                                                buttonVariants({ variant: status.variant }),
                                                "px-4 py-2 rounded font-bold text-sm transition-all duration-200",
                                                status.disabled ? "opacity-70 cursor-not-allowed bg-gray-200 text-gray-500 hover:bg-gray-200" : "bg-primary/10 text-primary hover:bg-primary hover:text-white cursor-pointer"
                                            )}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (!status.disabled) {
                                                    navigate(routes.selectTicket.replace(":eventId", event.id).replace(":eventSessionId", session.id));
                                                }
                                            }}
                                        >
                                            {status.label}
                                        </div>
                                    </div>
                                </div>
                            </AccordionTrigger>

                            <AccordionContent className="px-4 pb-4 pt-2 bg-gray-50/50 dark:bg-gray-900/20 border-t border-gray-100 dark:border-gray-700">
                                <div className="mb-3 mt-2 text-sm font-bold text-gray-500 uppercase tracking-wider">
                                    Thông tin vé
                                </div>

                                <div className="flex flex-col gap-3">
                                    {session.tickets && session.tickets.length > 0 ? (
                                        session.tickets.map((ticket) => (
                                            <TicketRow
                                                key={ticket.id}
                                                ticket={ticket}
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
                    )
                })}
            </Accordion>
        </div>
    );
};

const TicketRow = ({ ticket }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isSoldOut = ticket.quantity <= 0;

    // Toggle description function
    const handleToggle = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div
            className={`
                group w-full flex flex-col rounded-lg border transition-all duration-200 overflow-hidden
                ${isSoldOut
                    ? 'bg-gray-100 border-gray-200 opacity-70'
                    : `bg-white border-gray-200 hover:border-blue-300 hover:shadow-md ${isExpanded ? 'border-blue-400 ring-1 ring-blue-100' : ''}`
                }
            `}
        >
            {/* Main Row Content - Click to Toggle */}
            <div
                onClick={handleToggle}
                className={`
                    flex items-center justify-between p-4 cursor-pointer
                    ${isSoldOut ? 'cursor-not-allowed' : ''}
                `}
            >
                {/* Left Side: Icon & Name */}
                <div className="flex items-center gap-3">
                    <div className={`
                        p-1.5 rounded-full transition-colors duration-200
                        ${isSoldOut ? 'bg-gray-200' : 'bg-gray-100 group-hover:bg-blue-50 text-gray-500 group-hover:text-blue-600'}
                    `}>
                        {isExpanded ? (
                            <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                        ) : (
                            <ChevronRight className="w-4 h-4 transition-transform duration-200" />
                        )}
                    </div>

                    <div className="flex flex-col">
                        <span className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors">
                            {ticket.name}
                        </span>
                    </div>
                </div>

                {/* Right Side: Price & Quantity */}
                <div className="flex flex-col items-end gap-0.5">
                    <span className={`font-bold text-base ${isSoldOut ? 'text-gray-500' : 'text-primary'}`}>
                        {formatCurrency(ticket.price)}
                    </span>
                    {!isSoldOut && ticket.quantity < 10 && (
                        <span className="text-[10px] text-red-500 font-medium bg-red-50 px-1 rounded">
                            Còn {ticket.quantity} vé
                        </span>
                    )}
                    {isSoldOut && (
                        <span className="text-[10px] text-gray-500 font-medium">Hết vé</span>
                    )}
                </div>
            </div>

            {/* Expanded Description Area */}
            {isExpanded && (
                <div className="bg-gray-50/80 dark:bg-gray-900/40 border-t border-dashed border-gray-200 p-4 animate-in slide-in-from-top-1 duration-200">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between">
                        {/* Description Content */}
                        <div className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-1 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> Mô tả vé:
                            </h4>
                            {ticket.description ? (
                                <div
                                    className="prose prose-sm max-w-none text-gray-600"
                                    dangerouslySetInnerHTML={{ __html: ticket.description }}
                                />
                            ) : (
                                <p className="italic text-gray-400">Không có mô tả chi tiết cho loại vé này.</p>
                            )}
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketSelection;