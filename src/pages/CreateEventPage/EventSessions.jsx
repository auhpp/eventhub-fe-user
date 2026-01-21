import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Ticket, Trash2, PlusCircle, Edit2, CalendarClock } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import CreateTicketModal from '@/components/CreateTicketModal';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const EventSessions = ({ sessions, setSessions }) => {
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [selectedSessionForTicket, setSelectedSessionForTicket] = useState(null);

    const validateDates = (start, end) => {
        const errors = {};
        const now = new Date();
        const startDate = start ? new Date(start) : null;
        const endDate = end ? new Date(end) : null;

        if (startDate && startDate <= now) {
            errors.startTime = "Thời gian bắt đầu phải lớn hơn thời gian hiện tại";
        }

        if (startDate && endDate && endDate <= startDate) {
            errors.endTime = "Thời gian kết thúc phải lớn hơn thời gian bắt đầu";
        }

        return errors;
    };

    const handleAddSession = () => {
        const newSessionId = `session-${Date.now()}`;
        const newSession = {
            id: newSessionId,
            startTime: '',
            endTime: '',
            tickets: [],
            error: true,
            validationErrors: {}
        };
        setSessions([...sessions, newSession]);
        toast.success("Đã thêm suất diễn mới");
    };

    const handleRemoveSession = (id) => {
        if (sessions.length === 1) {
            toast.error("Sự kiện cần ít nhất một suất diễn");
            return;
        }
        const updatedSessions = sessions.filter(session => session.id !== id);
        setSessions(updatedSessions);
    };

    const handleSessionChange = (id, field, value) => {
        setSessions(prevSessions => prevSessions.map(session => {
            if (session.id !== id) return session;

            const updatedSession = { ...session, [field]: value };

            const errors = validateDates(updatedSession.startTime, updatedSession.endTime);

            return {
                ...updatedSession,
                validationErrors: errors
            };
        }));
    };

    const formatSubHeadline = (end, tickets) => {
        if (!end) return "Vui lòng nhập thông tin suất diễn";
        if (tickets.length === 0) return "Vui lòng tạo ít nhất 1 loại vé";
        return `${tickets.length} Loại vé`;
    };

    const formatHeadline = (start) => {
        if (!start) return "Vui lòng nhập thông tin suất diễn";
        const startDate = new Date(start);
        if (isNaN(startDate.getTime())) return "Thời gian không hợp lệ";

        const dateStr = startDate.toLocaleDateString('vi-VN');
        const timeStart = startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        return `${dateStr} • ${timeStart}`;
    };

    const handleRemoveTicket = (id, session) => {
        if (session.tickets.length === 1) {
            toast.error("Sự kiện cần ít nhất một vé");
            return;
        }
        const updatedTickets = session.tickets.filter(ticket => ticket.id !== id);
        setSessions(prev => prev.map(
            (it) => it.id === session.id ? { ...it, tickets: updatedTickets } : it
        ));
    };

    const checkErrorSession = () => {
        const hasChange = sessions.some(it => {
            const isMissingData = !it.startTime || !it.endTime || it.tickets.length === 0;
            const hasValidationErrors = it.validationErrors && Object.keys(it.validationErrors).length > 0;
            const newErrorState = isMissingData || hasValidationErrors;
            return it.error !== newErrorState;
        });

        if (hasChange) {
            setSessions(prev => prev.map(it => {
                const isMissingData = !it.startTime || !it.endTime || it.tickets.length === 0;
                const hasValidationErrors = it.validationErrors && Object.keys(it.validationErrors).length > 0;
                return { ...it, error: isMissingData || hasValidationErrors };
            }));
        }
    }

    useEffect(() => {
        checkErrorSession();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(sessions.map(s => ({ t: s.tickets, s: s.startTime, e: s.endTime, v: s.validationErrors })))]);

    const createTicket = (values, session) => {
        var newTicket = { ...values, id: `ticket-${Date.now()}` };
        setSessions(prev => prev.map((it) => {
            if (it.id === session.id) {
                return { ...it, tickets: [...it.tickets, newTicket] };
            }
            return it;
        }));
        setShowTicketModal(false);
        setSelectedSessionForTicket(null);
    };

    return (
        <Card className="rounded-2xl shadow-sm border-slate-200">
            <CardHeader className="border-b bg-slate-50/50 rounded-t-2xl pb-4 flex flex-row items-center justify-between">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <span className="size-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">3</span>
                        Quản lý Suất diễn
                    </CardTitle>
                    <CardDescription className="pl-9">Quản lý thời gian và vé cho từng buổi diễn</CardDescription>
                </div>
                <Badge variant="secondary" className="h-7">
                    Tổng: {sessions.length} suất
                </Badge>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">

                <Accordion type="single" collapsible className="w-full space-y-4" defaultValue={sessions[0]?.id}>
                    {sessions.map((session) => (
                        <AccordionItem key={session.id} value={session.id}
                            className={cn(
                                "border rounded-xl px-4 bg-card transition-all hover:shadow-sm",
                                session.error && "border-red-400 bg-red-50/10"
                            )}
                        >
                            <div className="flex items-center justify-between py-2">
                                <AccordionTrigger className="hover:no-underline flex-1 py-2">
                                    <div className={cn("text-left flex gap-3 me-1 ", (session.startTime ? "items-start" : "items-center"))}>
                                        <div className="mt-1 bg-blue-50 text-blue-600 p-1.5 rounded-lg">
                                            <CalendarClock className="size-4" />
                                        </div>
                                        <div>
                                            <h4 className={cn("font-bold text-base text-slate-800",
                                                !session.startTime && " text-red-500"
                                            )}>
                                                {formatHeadline(session.startTime)}
                                            </h4>
                                            {session.startTime &&
                                                <p className={cn("text-xs text-muted-foreground font-medium mt-0.5",
                                                    (!session.endTime || session.tickets.length == 0) && " text-red-500"

                                                )}>
                                                    {formatSubHeadline(session.endTime, session.tickets)}
                                                </p>
                                            }
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveSession(session.id);
                                    }}
                                    className="text-muted-foreground hover:text-red-500 hover:bg-red-50 ml-2 h-8 w-8"
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>

                            <AccordionContent className="pb-4 pt-2 space-y-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mx-1">
                                        {/* START TIME INPUT */}
                                        <div className="space-y-2">
                                            <Label className={cn("text-xs uppercase font-bold", session.validationErrors?.startTime ? "text-red-500" : "text-muted-foreground")}>
                                                Bắt đầu
                                            </Label>
                                            <Input
                                                type="datetime-local"
                                                className={cn(
                                                    "h-10 pr-10 relative [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:cursor-pointer",
                                                    session.validationErrors?.startTime && "border-red-500 focus-visible:ring-red-500"
                                                )}
                                                value={session.startTime}
                                                onChange={(e) => handleSessionChange(session.id, 'startTime', e.target.value)}
                                            />
                                            {session.validationErrors?.startTime && (
                                                <p className="text-[0.8rem] font-medium text-red-500">
                                                    {session.validationErrors.startTime}
                                                </p>
                                            )}
                                        </div>

                                        {/* END TIME INPUT */}
                                        <div className="space-y-2">
                                            <Label className={cn("text-xs uppercase font-bold", session.validationErrors?.endTime ? "text-red-500" : "text-muted-foreground")}>
                                                Kết thúc
                                            </Label>
                                            <Input
                                                type="datetime-local"
                                                className={cn(
                                                    "h-10 pr-10 relative [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:cursor-pointer",
                                                    session.validationErrors?.endTime && "border-red-500 focus-visible:ring-red-500"
                                                )}
                                                value={session.endTime}
                                                onChange={(e) => handleSessionChange(session.id, 'endTime', e.target.value)}
                                            />
                                            {session.validationErrors?.endTime && (
                                                <p className="text-[0.8rem] font-medium text-red-500">
                                                    {session.validationErrors.endTime}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Tickets */}
                                <div className="bg-slate-50 rounded-xl p-4 border space-y-3">
                                    <h5 className="font-bold text-sm flex items-center gap-2 text-slate-800">
                                        <Ticket className="size-4 text-blue-600" /> Danh sách Vé ({session.tickets.length})
                                    </h5>

                                    {session.tickets.length !== 0 && session.tickets.map((ticket) => (
                                        <div key={ticket.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border bg-white shadow-sm hover:border-blue-300 transition-colors group">
                                            <div className="flex items-center gap-3 mb-2 sm:mb-0">
                                                <div className="size-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                    <Ticket className="size-5" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-sm">{ticket.name}</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground font-medium mt-0.5">{ticket.price} đ</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button variant="ghost"
                                                    type="button"
                                                    size="icon" className="h-8
                                                 w-8 text-muted-foreground hover:text-blue-600"><Edit2 className="size-4" /></Button>
                                                <Button variant="ghost"
                                                    type="button"
                                                    onClick={() => handleRemoveTicket(ticket.id, session)}
                                                    size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-600"><Trash2 className="size-4" /></Button>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="text-center py-4 border-2 border-dashed border-slate-200 rounded-lg">
                                        <Button
                                            variant="link"
                                            type="button"
                                            onClick={() => {
                                                if (!session.startTime || !session.endTime) {
                                                    toast.error("Vui lòng chọn thời gian bắt đầu và kết thúc trước");
                                                } else if (session.validationErrors?.startTime || session.validationErrors?.endTime) {
                                                    toast.error("Vui lòng sửa lỗi thời gian trước khi tạo vé");
                                                } else {
                                                    setSelectedSessionForTicket(session);
                                                    setShowTicketModal(true);
                                                }
                                            }}
                                            className="text-blue-600 font-bold text-xs h-auto p-0"
                                        >
                                            <PlusCircle className="size-4 mr-1.5" /> Tạo loại vé mới
                                        </Button>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>

                <Button
                    variant="outline"
                    type="button"
                    onClick={handleAddSession}
                    className="w-full border-dashed border-2 py-6 text-muted-foreground hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50 transition-all"
                >
                    <div className="bg-slate-200 rounded-full p-0.5 mr-2">
                        <PlusCircle className="size-4" />
                    </div>
                    Tạo suất diễn mới
                </Button>
            </CardContent>

            {selectedSessionForTicket && (
                <CreateTicketModal
                    isOpen={showTicketModal}
                    onClose={() => {
                        setShowTicketModal(false);
                        setSelectedSessionForTicket(null);
                    }}
                    session={selectedSessionForTicket}
                    setSessions={setSessions}
                    onSubmit={(values) => createTicket(values, selectedSessionForTicket)}
                />
            )}
        </Card>
    );
};

export default EventSessions;