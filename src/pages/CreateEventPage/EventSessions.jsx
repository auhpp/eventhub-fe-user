import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Ticket, Trash2, PlusCircle, CalendarClock, Link as LinkIcon, KeyRound, Video, ExternalLink } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns/format';
import { vi } from 'date-fns/locale/vi';
import DateTimePicker from '@/components/DateTimePicker';
import { MeetingPlatform, EventType } from '@/utils/constant'; 
import TicketModal from '@/features/tickets/TicketModal';
import TicketEditItem from '@/features/tickets/TicketEditItem';

const EventSessions = ({ sessions, setSessions, eventType }) => {
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [selectedSessionForTicket, setSelectedSessionForTicket] = useState(null);
    const [selectedTicketForEdit, setSelectedTicketForEdit] = useState(null);

    // Validate logic
    const validateSession = (session) => {
        const errors = {};
        const now = new Date();
        const start = session.startTime ? new Date(session.startTime) : null;
        const end = session.endTime ? new Date(session.endTime) : null;
        const checkin = session.checkinStartTime ? new Date(session.checkinStartTime) : null;

        // Validate Start/End Time
        if (start && start <= now) {
            errors.startTime = "Thời gian bắt đầu phải lớn hơn hiện tại";
        }
        if (start && end && end <= start) {
            errors.endTime = "Thời gian kết thúc phải lớn hơn thời gian bắt đầu";
        }

        // Validate Checkin Time
        if (checkin && start && checkin > start) {
            errors.checkinStartTime = "Thời gian check-in phải trước khi bắt đầu";
        }

        // Validate Online Info
        if (eventType === EventType.ONLINE.key) {
            // eslint-disable-next-line no-useless-escape
            const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
            if (!session.meetingUrl || !urlRegex.test(session.meetingUrl)) {
                errors.meetingUrl = "Đường dẫn cuộc họp không hợp lệ";
            }
        }

        return errors;
    };

    const detectPlatform = (url) => {
        if (!url) return null;
        const lowerUrl = url.toLowerCase();
        if (lowerUrl.includes('meet.google.com')) return MeetingPlatform.GOOGLE_MEET;
        if (lowerUrl.includes('zoom.us')) return MeetingPlatform.ZOOM;
        return null; 
    };

    const handleAddSession = () => {
        const newSessionId = `session-${Date.now()}`;
        const newSession = {
            id: newSessionId,
            checkinStartTime: '', 
            startTime: '',
            endTime: '',
            meetingUrl: '',
            meetingPassword: '',
            tickets: [],
            error: true,
            validationErrors: {}
        };
        setSessions([...sessions, newSession]);
        toast.success("Đã thêm khung giờ mới");
    };

    const handleRemoveSession = (id) => {
        if (sessions.length === 1) {
            toast.error("Sự kiện cần ít nhất một khung giờ");
            return;
        }
        const updatedSessions = sessions.filter(session => session.id !== id);
        setSessions(updatedSessions);
    };

    const handleSessionChange = (id, field, value) => {
        setSessions(prevSessions => prevSessions.map(session => {
            if (session.id !== id) return session;

            let updatedSession = { ...session, [field]: value };

            // Auto detect platform when enter URL
            if (field === 'meetingUrl') {
                updatedSession.meetingPlatform = detectPlatform(value);
            }

            const errors = validateSession(updatedSession);

            return {
                ...updatedSession,
                validationErrors: errors
            };
        }));
    };

    const formatHeadline = (start) => {
        if (!start) return "Vui lòng nhập thông tin khung giờ";
        const startDate = new Date(start);
        if (isNaN(startDate.getTime())) return "Thời gian không hợp lệ";
        return format(startDate, "dd/MM/yyyy - HH:mm", { locale: vi });
    };

    const formatSubHeadline = (end, tickets) => {
        if (!end) return "Chưa có thời gian kết thúc";
        if (tickets.length === 0) return "Vui lòng tạo ít nhất 1 loại vé";
        return `${tickets.length} Loại vé`;
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

    // Check all error of session to set flag error
    const checkErrorSession = () => {
        const hasChange = sessions.some(it => {
            const isMissingTime = !it.startTime || !it.endTime || !it.checkinStartTime;
            const isMissingOnlineInfo = eventType === EventType.ONLINE.key && !it.meetingUrl;
            const isMissingTicket = it.tickets.length === 0;
            const hasValidationErrors = it.validationErrors && Object.keys(it.validationErrors).length > 0;

            const newErrorState = isMissingTime || isMissingTicket || hasValidationErrors || isMissingOnlineInfo;
            return it.error !== newErrorState;
        });

        if (hasChange) {
            setSessions(prev => prev.map(it => {
                const isMissingTime = !it.startTime || !it.endTime || !it.checkinStartTime;
                const isMissingOnlineInfo = eventType === EventType.ONLINE.key && !it.meetingUrl;
                const isMissingTicket = it.tickets.length === 0;
                const hasValidationErrors = it.validationErrors && Object.keys(it.validationErrors).length > 0;

                return { ...it, error: isMissingTime || isMissingTicket || hasValidationErrors || isMissingOnlineInfo };
            }));
        }
    }

    useEffect(() => {
        checkErrorSession();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(sessions.map(s => ({
        t: s.tickets, s: s.startTime, e: s.endTime, c: s.checkinStartTime,
        mu: s.meetingUrl, v: s.validationErrors
    }))), eventType]); 


    const handleSaveTicket = (ticketData, session) => {
        setSessions(prev => prev.map((it) => {
            if (it.id === session.id) {
                const isEditing = ticketData.id && it.tickets.some(t => t.id === ticketData.id);

                let newTickets;
                if (isEditing) {
                    // Update
                    newTickets = it.tickets.map(t => t.id === ticketData.id ? { ...ticketData } : t);
                    toast.success("Đã cập nhật vé thành công");
                } else {
                    // Create
                    const newTicket = { ...ticketData, id: `ticket-${Date.now()}` };
                    newTickets = [...it.tickets, newTicket];
                    toast.success("Đã thêm loại vé mới");
                }
                return { ...it, tickets: newTickets };
            }
            return it;
        }));

        // Reset states 
        handleCloseTicketModal();
    };

    const openEditTicketModal = (ticket, session) => {
        setSelectedTicketForEdit(ticket);
        setSelectedSessionForTicket(session);
        setShowTicketModal(true);
    };

    const openCreateTicketModal = (session) => {
        if (!session.startTime || !session.endTime) {
            toast.error("Vui lòng chọn thời gian bắt đầu và kết thúc trước");
            return;
        }
        setSelectedTicketForEdit(null); 
        setSelectedSessionForTicket(session);
        setShowTicketModal(true);
    };
    const handleCloseTicketModal = () => {
        setShowTicketModal(false);
        setSelectedSessionForTicket(null);
        setSelectedTicketForEdit(null);
    }
    return (
        <Card className="rounded-2xl shadow-sm border-slate-200">
            <CardHeader className="border-b bg-slate-50/50 rounded-t-2xl pb-4 flex flex-row items-center justify-between">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <span className="size-7 rounded-lg bg-blue-600 text-white
                         flex items-center justify-center text-sm font-bold shadow-sm">{
                                eventType === EventType.ONLINE.key ? 3 : 4
                            }</span>
                        Quản lý khung giờ và vé
                    </CardTitle>
                    <CardDescription className="pl-9">
                        {eventType === EventType.ONLINE.key
                            ? "Cấu hình thời gian, link họp và vé cho từng buổi"
                            : "Quản lý thời gian check-in và vé cho từng buổi diễn"}
                    </CardDescription>
                </div>
                <Badge variant="secondary" className="h-7">
                    Tổng: {sessions.length} khung giờ
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
                                    <div className={cn("text-left flex gap-3 me-1 ",
                                        (session.startTime ? "items-start" : "items-center"))}>
                                        <div className="mt-1 bg-blue-50 text-blue-600 p-1.5 rounded-lg">
                                            <CalendarClock className="size-4" />
                                        </div>
                                        <div>
                                            <h4 className={cn("font-bold text-base text-slate-800",
                                                (!session.startTime || (eventType === 'ONLINE'
                                                    && !session.meetingUrl)) && " text-red-500"
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
                                    variant="ghost" size="icon" type="button"
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

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mx-1">
                                        <div>
                                            <DateTimePicker
                                                label="Bắt đầu Check-in"
                                                require={true}
                                                value={session.checkinStartTime}
                                                onChange={(val) => handleSessionChange(session.id, 'checkinStartTime', val)}
                                                error={session.validationErrors?.checkinStartTime}
                                            />
                                            <p className="text-xs text-muted-foreground mt-1 ml-1">
                                                Thời gian bắt đầu cho phép người tham gia vào cổng/phòng chờ.</p>
                                        </div>
                                        <DateTimePicker
                                            label="Bắt đầu sự kiện"
                                            require={true}
                                            value={session.startTime}
                                            onChange={(val) => handleSessionChange(session.id, 'startTime', val)}
                                            error={session.validationErrors?.startTime}
                                        />
                                        <DateTimePicker
                                            label="Kết thúc sự kiện"
                                            require={true}
                                            value={session.endTime}
                                            onChange={(val) => handleSessionChange(session.id, 'endTime', val)}
                                            error={session.validationErrors?.endTime}
                                        />
                                    </div>

                                    {/* ONLINE MEETING INFO */}
                                    {eventType === EventType.ONLINE.key && (
                                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                                                    <Video className="size-4" /> Thông tin phòng họp trực tuyến
                                                </div>

                                                {/*  Quick Links  */}
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-7 text-xs bg-white text-slate-600 border-slate-200 hover:text-blue-600 hover:border-blue-300"
                                                        onClick={() => window.open('https://meet.google.com/', '_blank')}
                                                    >
                                                        <img src="https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v6/web-24dp/logo_meet_2020q4_color_1x_web_24dp.png"
                                                            alt="Meet" className="w-4 h-4 mr-1.5" />
                                                        Tạo Google Meet
                                                        <ExternalLink className="size-3 ml-1 opacity-50" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-7 text-xs bg-white text-slate-600 border-slate-200 hover:text-blue-600 hover:border-blue-300"
                                                        onClick={() => window.open('https://zoom.us/meeting/schedule', '_blank')}
                                                    >
                                                        <img src="https://st1.zoom.us/static/6.3.10815/image/new/ZoomLogo.png"
                                                            alt="Zoom" className="h-3 w-auto mr-1.5" />
                                                        Tạo Zoom
                                                        <ExternalLink className="size-3 ml-1 opacity-50" />
                                                    </Button>
                                                </div>
                                                {/* ---------------------------------- */}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div className="space-y-2">
                                                    <Label className="text-sm">Đường dẫn (Link) <span className="text-red-500">*</span></Label>
                                                    <div className="relative">
                                                        <LinkIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                                        <Input
                                                            className="pl-9 bg-white"
                                                            placeholder="https://meet.google.com/..."
                                                            value={session.meetingUrl || ''}
                                                            onChange={(e) => handleSessionChange(session.id, 'meetingUrl', e.target.value)}
                                                        />
                                                    </div>
                                                    {session.validationErrors?.meetingUrl && <p className="text-xs text-red-500">{session.validationErrors.meetingUrl}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm">Mật khẩu (Optional)</Label>
                                                    <div className="relative">
                                                        <KeyRound className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                                        <Input
                                                            className="pl-9 bg-white"
                                                            placeholder="VD: 123456"
                                                            value={session.meetingPassword || ''}
                                                            onChange={(e) => handleSessionChange(session.id, 'meetingPassword', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Tickets */}
                                <div className="bg-slate-50 rounded-xl p-4 border space-y-3">
                                    <h5 className="font-bold text-sm flex items-center gap-2 text-slate-800">
                                        <Ticket className="size-4 text-blue-600" /> Danh sách Vé ({session.tickets.length})
                                    </h5>

                                    {session.tickets.length !== 0 && session.tickets.map((ticket) => (
                                        <TicketEditItem
                                            ticket={ticket}
                                            handleRemoveTicket={() => handleRemoveTicket(ticket.id, session)}
                                            openEditTicketModal={() => openEditTicketModal(ticket, session)}
                                        />
                                    ))}

                                    <div className="text-center py-4 border-2 border-dashed border-slate-200 rounded-lg">
                                        <Button
                                            variant="link" type="button"
                                            onClick={() => openCreateTicketModal(session)}
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
                    variant="outline" type="button"
                    onClick={handleAddSession}
                    className="w-full border-dashed border-2 py-6 text-muted-foreground hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50 transition-all"
                >
                    <div className="bg-slate-200 rounded-full p-0.5 mr-2">
                        <PlusCircle className="size-4" />
                    </div>
                    Tạo khung giờ mới
                </Button>
            </CardContent>

            {selectedSessionForTicket && (
                <TicketModal
                    isOpen={showTicketModal}
                    onClose={() => {
                        setShowTicketModal(false);
                        setSelectedSessionForTicket(null);
                    }}
                    ticketToEdit={selectedTicketForEdit}
                    session={selectedSessionForTicket}
                    setSessions={setSessions}
                    onSubmit={(values) => handleSaveTicket(values, selectedSessionForTicket)} />
            )}
        </Card>
    );
};

export default EventSessions;