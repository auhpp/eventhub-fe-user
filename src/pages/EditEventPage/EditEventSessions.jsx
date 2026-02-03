import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Ticket, Edit2, CalendarClock, Save, Loader2, PlusCircle, Trash2, X, Video, Link as LinkIcon, KeyRound, ExternalLink, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import DateTimePicker from '@/components/DateTimePicker';
import { MeetingPlatform, EventType } from '@/utils/constant';
import { HttpStatusCode } from 'axios';
import TicketModal from '@/features/tickets/TicketModal';
import { createTicket, deleteEventSession, updateEventSession } from '@/services/eventSessionService';
import { createEventSession } from '@/services/eventService';
import { deleteTicket, updateTicket } from '@/services/ticketService';
import { isExpiredEventSession } from '@/utils/eventUtils';
import EventSessionStatusBadge from '@/components/EventSessionStatusBadge';
import { displaySessionDate, formatDateForBE, formatTime } from '@/utils/format';
import TicketEditItem from '@/features/tickets/TicketEditItem';
import ConfirmDialog from '@/components/ConfirmDialog';

const EditEventSessions = ({ eventData, onRefresh }) => {
    // --- STATE for LIST SESSIONS ---
    const [localSessions, setLocalSessions] = useState([]);
    const [updatingSessionId, setUpdatingSessionId] = useState(null);

    // --- STATE for CREATE NEW SESSION ---
    const [isCreating, setIsCreating] = useState(false);
    const [isSubmittingNew, setIsSubmittingNew] = useState(false);
    const [newSessionData, setNewSessionData] = useState({
        checkinStartTime: null,
        startTime: null,
        endTime: null,
        meetingUrl: '',
        meetingPlatform: '',
        meetingPassword: '',
        tickets: [],
        validationErrors: {}
    });

    // --- STATE for TICKET MODAL ---
    const [ticketModalOpen, setTicketModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);

    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        type: null,    // 'session' | 'ticket'
        id: null,      // ID of object need delete
        parentId: null,
        title: '',
        description: '',
        variant: 'default'
    });
    const handleDeleteTicketClick = (session, ticket) => {
        if (session.isNewSession || String(ticket.id).startsWith('temp-')) {
            handleRemoveTempTicket(ticket.id);
            return;
        }

        if (session.tickets.length <= 1) {
            toast.error("Không thể xóa. Khung giờ phải có ít nhất 1 loại vé.");
            return;
        }

        if (ticket.soldQuantity > 0) {
            toast.error("Không thể xóa vé đã có người mua.");
            return;
        }

        // Open popup
        setConfirmDialog({
            open: true,
            type: 'ticket',
            id: ticket.id,
            parentId: session.id,
            title: 'Xóa loại vé này?',
            description: `Bạn có chắc chắn muốn xóa vé "${ticket.name}"? Hành động này không thể hoàn tác.`,
            variant: 'destructive'
        });
    };

    const handleDeleteSessionClick = (session) => {

        if (localSessions.length <= 1) {
            toast.error("Sự kiện phải có ít nhất 1 khung giờ tổ chức.");
            return;
        }

        const hasSoldTicket = session.tickets.some(t => t.soldQuantity > 0);
        if (hasSoldTicket) {
            toast.error("Không thể xóa khung giờ đã có vé bán ra.");
            return;
        }

        // open popup confirm
        setConfirmDialog({
            open: true,
            type: 'session',
            id: session.id,
            title: 'Xóa khung giờ này?',
            description: `Bạn sắp xóa khung giờ ${formatTime(session.startTime)} - ${formatTime(session.endTime)}. Toàn bộ vé trong khung giờ này cũng sẽ bị xóa.`,
            variant: 'destructive'
        });
    };

    const handleConfirmAction = async () => {
        try {
            if (confirmDialog.type === 'ticket') {
                const response = await deleteTicket({ id: confirmDialog.id });
                if (response.code === HttpStatusCode.Ok) {
                    toast.success("Đã xóa vé thành công");
                    setLocalSessions(prev => prev.map(s => {
                        if (s.id === confirmDialog.parentId) {
                            return { ...s, tickets: s.tickets.filter(t => t.id !== confirmDialog.id) };
                        }
                        return s;
                    }));
                }
            } else if (confirmDialog.type === 'session') {
                const response = await deleteEventSession({ id: confirmDialog.id });
                if (response.code === HttpStatusCode.Ok) {
                    toast.success("Đã xóa khung giờ thành công");
                    setLocalSessions(prev => prev.filter(s => s.id !== confirmDialog.id));
                    onRefresh();
                }
            }
        } catch (error) {
            console.error(error);
            const errorCode = error.response?.data?.code;
            if (errorCode === 1009) {
                toast.error("Không thể xóa: Dữ liệu đang được sử dụng hoặc ràng buộc.");
            } else {
                toast.error("Đã có lỗi xảy ra khi xóa.");
            }
        } finally {
            setConfirmDialog(prev => ({ ...prev, open: false }));
        }
    };

    useEffect(() => {
        if (eventData?.eventSessions) {
            const mappedSessions = eventData.eventSessions.map(s => ({
                id: s.id,
                checkinStartTime: s.checkinStartTime ? new Date(s.checkinStartTime) : null,
                startTime: s.startDateTime ? new Date(s.startDateTime) : null,
                endTime: s.endDateTime ? new Date(s.endDateTime) : null,
                meetingUrl: s.meetingUrl || '',
                meetingPlatform: s.meetingPlatform || '',
                meetingPassword: s.meetingPassword || '',
                tickets: s.tickets || [],
                isDirty: false,
                validationErrors: {}
            }));
            setLocalSessions(mappedSessions);
        }
    }, [eventData]);

    // --- VALIDATION LOGIC ---
    const validateSession = (session, isNewSession = false) => {
        const errors = {};
        const now = new Date();
        const start = session.startTime ? new Date(session.startTime) : null;
        const end = session.endTime ? new Date(session.endTime) : null;
        const checkin = session.checkinStartTime ? new Date(session.checkinStartTime) : null;

        // Validate Start/End Time
        if (isNewSession && start && start <= now) {
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
        if (eventData?.type === EventType.ONLINE.key) {
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
        return MeetingPlatform.OTHER;
    };

    // --- LOGIC handle UPDATE SESSION ---
    const handleSessionChange = (id, field, value) => {
        setLocalSessions(prev => prev.map(session => {
            if (session.id !== id) return session;

            let updatedSession = { ...session, [field]: value, isDirty: true };
            if (field === 'meetingUrl') updatedSession.meetingPlatform = detectPlatform(value);

            // Trigger validate when change
            updatedSession.validationErrors = validateSession(updatedSession, false); // false = existing session

            return updatedSession;
        }));
    };

    const handleSaveSession = async (session) => {
        // 1. Run Validation before save
        const errors = validateSession(session, false);
        if (Object.keys(errors).length > 0) {
            setLocalSessions(prev => prev.map(s => s.id === session.id ? { ...s, validationErrors: errors } : s));
            toast.error("Vui lòng kiểm tra lại thông tin nhập liệu");
            return;
        }

        // 2. Validate Tickets exists
        if (!session.tickets || session.tickets.length === 0) {
            toast.error("Khung giờ này chưa có vé nào. Vui lòng tạo vé trước.");
            return;
        }

        try {
            setUpdatingSessionId(session.id);
            const payload = {
                ...session,
                startDateTime: session.startTime,
                endDateTime: session.endTime
            };

            const response = await updateEventSession({ id: session.id, data: payload });
            if (response.code === HttpStatusCode.Ok) {
                toast.success("Cập nhật khung giờ thành công");
                onRefresh();
            }
        } catch (error) {
            console.log(error)
            toast.error("Lỗi khi cập nhật khung giờ");
        } finally {
            setUpdatingSessionId(null);
        }
    };

    // --- LOGIC handle CREATE NEW SESSION ---
    const handleNewSessionChange = (field, value) => {
        setNewSessionData(prev => {
            const updated = { ...prev, [field]: value };
            if (field === 'meetingUrl') updated.meetingPlatform = detectPlatform(value);

            // Validate
            updated.validationErrors = validateSession(updated, true); // true = new session

            return updated;
        });
    };

    const handleCreateSessionSubmit = async () => {
        // 1. Run full validation
        const errors = validateSession(newSessionData, true);
        if (Object.keys(errors).length > 0) {
            setNewSessionData(prev => ({ ...prev, validationErrors: errors }));
            toast.error("Vui lòng kiểm tra lại thông tin nhập liệu");
            return;
        }

        // 2. Validate Require Fields (Check null)
        if (!newSessionData.startTime || !newSessionData.endTime || !newSessionData.checkinStartTime) {
            toast.error("Vui lòng nhập đầy đủ thời gian");
            return;
        }

        // 3. Validate Tickets
        if (newSessionData.tickets.length === 0) {
            toast.error("Bạn phải tạo ít nhất 1 loại vé cho khung giờ này trước khi lưu.");
            return;
        }

        try {
            setIsSubmittingNew(true);
            const payload = {
                checkinStartTime: formatDateForBE(newSessionData.checkinStartTime),
                startDateTime: formatDateForBE(newSessionData.startTime),
                endDateTime: formatDateForBE(newSessionData.endTime),
                meetingUrl: newSessionData.meetingUrl,
                meetingPlatform: newSessionData.meetingPlatform || null,
                meetingPassword: newSessionData.meetingPassword,
                ticketCreateRequests: newSessionData.tickets
            };

            const response = await createEventSession({ id: eventData.id, data: payload });

            if (response.code === HttpStatusCode.Ok) {
                toast.success("Tạo khung giờ và vé thành công!");
                setIsCreating(false);
                setNewSessionData({
                    checkinStartTime: null, startTime: null, endTime: null,
                    meetingUrl: '', tickets: [], validationErrors: {}
                });
                onRefresh();
            }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi tạo khung giờ mới");
        } finally {
            setIsSubmittingNew(false);
        }
    };

    // --- LOGIC TICKET MODAL & HELPERS ---
    const handleOpenCreateTicket = (session, isForNewSession = false) => {
        const sessionContext = isForNewSession ? { ...session, isNewSession: true } : session;
        setSelectedSession(sessionContext);
        setSelectedTicket(null);
        setTicketModalOpen(true);
    };

    const handleEditTicket = (session, ticket) => {
        setSelectedSession(session);
        setSelectedTicket(ticket);
        setTicketModalOpen(true);
    };

    const handleTicketModalSubmit = async (ticketData) => {
        // create new session
        if (selectedSession?.isNewSession) {
            setNewSessionData(prev => {
                const tickets = [...prev.tickets];
                // check exists
                const existingIndex = tickets.findIndex(t => t.id === ticketData.id);

                if (existingIndex > -1) {
                    // Update
                    tickets[existingIndex] = { ...ticketData };
                    toast.success("Đã cập nhật thông tin vé");
                } else {
                    // Create
                    const newTempTicket = {
                        ...ticketData,
                        id: `temp-${Date.now()}`,
                        sold: 0
                    };
                    tickets.push(newTempTicket);
                    toast.success("Đã thêm vé vào danh sách chờ");
                }

                return { ...prev, tickets };
            });
            setTicketModalOpen(false);
            return;
        }

        // Update exists Session
        try {
            if (!selectedTicket) {
                const res = await createTicket({ id: selectedSession.id, data: ticketData });
                if (res.code === HttpStatusCode.Ok) {
                    toast.success("Tạo vé mới thành công");
                    onRefresh();
                    setTicketModalOpen(false);
                }
            } else {
                const res = await updateTicket({ id: ticketData.id, data: ticketData });
                if (res.code === HttpStatusCode.Ok) {
                    toast.success("Cập nhật vé thành công");
                    onRefresh();
                    setTicketModalOpen(false);
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi lưu vé");
        }
    };

    const handleRemoveTempTicket = (tempId) => {
        setNewSessionData(prev => ({
            ...prev,
            tickets: prev.tickets.filter(t => t.id !== tempId)
        }));
    };


    return (
        <Card className="rounded-2xl shadow-sm border-slate-200">
            <CardHeader className="border-b bg-slate-50/50 rounded-t-2xl pb-4">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <span className="size-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-bold">4</span>
                            Quản lý khung giờ và vé
                        </CardTitle>
                        <CardDescription className="mt-1">
                            Cập nhật thời gian tổ chức và thông tin các hạng vé.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
                {/* --- LIST EXISTING SESSIONS --- */}
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {localSessions.map((session) => {
                        const expiredEventSession = isExpiredEventSession({ eventSession: session });
                        const hasError = Object.keys(session.validationErrors || {}).length > 0;

                        return (
                            <AccordionItem key={session.id} value={String(session.id)}
                                className={cn(
                                    "border rounded-xl px-4 bg-card transition-all hover:shadow-sm data-[state=open]:border-blue-200",
                                    hasError && "border-red-500"
                                )}>

                                <AccordionTrigger className="hover:no-underline flex-1 py-2">
                                    <div className="flex gap-3 text-left items-start">
                                        <div className="mt-1 bg-blue-50 text-blue-600 p-1.5 rounded-lg">
                                            <CalendarClock className="size-4" />
                                        </div>
                                        <div>
                                            <div className='flex gap-4'>
                                                <h4 className={cn("font-bold text-base text-slate-800", hasError && "text-red-500")}>
                                                    {displaySessionDate({
                                                        startDateTime: session.startTime,
                                                        endDateTime: session.endTime
                                                    })}
                                                </h4>
                                                <EventSessionStatusBadge eventSession={session} />
                                            </div>
                                            <h4 className="font-bold text-md text-slate-800">
                                                {formatTime(session.startTime)} - {formatTime(session.endTime)}
                                            </h4>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {session.tickets.length} loại vé - ID: {session.id}
                                            </p>
                                        </div>
                                    </div>
                                </AccordionTrigger>

                                <AccordionContent className="pb-4 pt-2 space-y-6">
                                    {/* Form Update Session */}
                                    <div className="space-y-4 border-b pb-6 border-dashed">
                                        <div className="flex items-center justify-between">
                                            <h5 className="font-bold text-sm text-slate-700 flex items-center gap-2">
                                                <Clock className="size-4 text-blue-600" /> Thiết lập thời gian
                                            </h5>
                                            {!expiredEventSession && (
                                                <Button size="sm" onClick={() => handleSaveSession(session)}
                                                    disabled={updatingSessionId === session.id || !session.isDirty || hasError}
                                                    className={cn("transition-all", session.isDirty && !hasError ? "bg-blue-600" : "bg-slate-200 text-slate-500")}>
                                                    {updatingSessionId === session.id ? <Loader2 className="animate-spin size-4 mr-1" /> : <Save className="size-4 mr-1" />}
                                                    {session.isDirty ? "Lưu thay đổi" : "Đã lưu"}
                                                </Button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <DateTimePicker
                                                    label="Bắt đầu Check-in"
                                                    value={session.checkinStartTime}
                                                    onChange={(val) => handleSessionChange(session.id, 'checkinStartTime', val)}
                                                    error={session.validationErrors?.checkinStartTime}
                                                />
                                                <p className="text-xs text-muted-foreground mt-1 ml-1">
                                                    Thời gian bắt đầu cho phép người tham gia vào cổng/phòng chờ.</p>
                                            </div>
                                            <DateTimePicker
                                                label="Bắt đầu sự kiện"
                                                value={session.startTime}
                                                onChange={(val) => handleSessionChange(session.id, 'startTime', val)}
                                                error={session.validationErrors?.startTime}
                                            />
                                            <DateTimePicker
                                                label="Kết thúc sự kiện"
                                                value={session.endTime}
                                                onChange={(val) => handleSessionChange(session.id, 'endTime', val)}
                                                error={session.validationErrors?.endTime}
                                            />
                                        </div>

                                        {/* Update Online Meeting Info */}
                                        {eventData?.type === EventType.ONLINE.key && (
                                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-4 mt-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                                                        <Video className="size-4" /> Thông tin phòng họp trực tuyến
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button type="button" variant="outline" size="sm" onClick={() => window.open('https://meet.google.com/', '_blank')} disabled={expiredEventSession} className="h-7 text-xs bg-white text-slate-600 border-slate-200 hover:text-blue-600">
                                                            Tạo Google Meet <ExternalLink className="size-3 ml-1 opacity-50" />
                                                        </Button>
                                                        <Button type="button" variant="outline" size="sm" onClick={() => window.open('https://zoom.us/meeting/schedule', '_blank')} disabled={expiredEventSession} className="h-7 text-xs bg-white text-slate-600 border-slate-200 hover:text-blue-600">
                                                            Tạo Zoom <ExternalLink className="size-3 ml-1 opacity-50" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm">Đường dẫn (Link) <span className="text-red-500">*</span></Label>
                                                        <div className="relative">
                                                            <LinkIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                                            <Input
                                                                className={cn("pl-9 bg-white", session.validationErrors?.meetingUrl && "border-red-500 focus-visible:ring-red-500")}
                                                                placeholder="https://meet.google.com/..."
                                                                value={session.meetingUrl || ''}
                                                                disabled={expiredEventSession}
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
                                                                disabled={expiredEventSession}
                                                                onChange={(e) => handleSessionChange(session.id, 'meetingPassword', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Ticket Section */}
                                    <div className="bg-slate-50 rounded-xl p-4 border space-y-3">
                                        <div className="flex justify-between items-center">
                                            <h5 className="font-bold text-sm text-slate-700 flex items-center gap-2">
                                                <Ticket className="size-4 text-blue-600" /> Danh sách Vé ({session.tickets.length})
                                            </h5>
                                            {!expiredEventSession && (
                                                <Button variant="ghost" size="sm" onClick={() => handleOpenCreateTicket(session, false)} className="text-blue-600 text-xs font-bold hover:bg-blue-50">
                                                    <PlusCircle className="size-3 mr-1" /> Thêm vé mới
                                                </Button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 gap-3">
                                            {session.tickets.map(t => (
                                                <TicketEditItem
                                                    ticket={t}
                                                    openEditTicketModal={() => handleEditTicket(session, t)}
                                                    handleRemoveTicket={() => handleDeleteTicketClick(session, t)}
                                                    expiredEventSession={expiredEventSession}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    {!expiredEventSession && (
                                        <div className="border-t border-red-100 pt-4 mt-6">
                                            <div className="flex items-center justify-between p-4 bg-red-50/50 rounded-xl border border-red-100">
                                                <div>
                                                    <h6 className="text-sm font-bold text-red-700 flex items-center gap-2">
                                                        <AlertTriangle className="size-4" /> Xóa khung giờ này
                                                    </h6>
                                                    <p className="text-xs text-red-600/80 mt-1">
                                                        Hành động này sẽ xóa khung giờ và tất cả các vé bên trong.
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="bg-white border-2 border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                                                    onClick={() => handleDeleteSessionClick(session)}
                                                >
                                                    <Trash2 className="size-4 mr-2" /> Xóa Session
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                        )
                    })}
                </Accordion>

                {/* --- FORM CREATE NEW SESSION --- */}
                {isCreating ? (
                    <div className="border-2 border-blue-100 bg-blue-50/30 rounded-xl p-4 space-y-5 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex justify-between items-center border-b border-blue-100 pb-3">
                            <h4 className="font-bold text-blue-700 flex items-center gap-2">
                                <PlusCircle className="size-5" /> Tạo Khung Giờ Mới
                            </h4>
                            <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-red-500">
                                <X className="size-4" /> Hủy
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <DateTimePicker
                                label="Bắt đầu Check-in"
                                value={newSessionData.checkinStartTime}
                                onChange={(val) => handleNewSessionChange('checkinStartTime', val)}
                                error={newSessionData.validationErrors?.checkinStartTime}
                            />
                            <DateTimePicker
                                label="Bắt đầu sự kiện"
                                value={newSessionData.startTime}
                                onChange={(val) => handleNewSessionChange('startTime', val)}
                                error={newSessionData.validationErrors?.startTime}
                            />
                            <DateTimePicker
                                label="Kết thúc sự kiện"
                                value={newSessionData.endTime}
                                onChange={(val) => handleNewSessionChange('endTime', val)}
                                error={newSessionData.validationErrors?.endTime}
                            />
                        </div>

                        {eventData?.type === EventType.ONLINE.key && (
                            <div className="bg-white p-4 rounded-xl border space-y-4">
                                <div className="flex items-center justify-between">
                                    <h5 className="font-bold text-sm text-blue-700 flex items-center gap-2">
                                        <Video className="size-4" /> Online Meeting Info
                                    </h5>
                                    <div className="flex gap-2">
                                        <Button type="button" variant="outline" size="sm" onClick={() => window.open('https://meet.google.com/', '_blank')} className="h-7 text-xs">
                                            Tạo Google Meet <ExternalLink className="size-3 ml-1 opacity-50" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Link phòng họp <span className="text-red-500">*</span></Label>
                                        <Input
                                            placeholder="https://..."
                                            value={newSessionData.meetingUrl}
                                            onChange={(e) => handleNewSessionChange('meetingUrl', e.target.value)}
                                            className={cn(newSessionData.validationErrors?.meetingUrl && "border-red-500 focus-visible:ring-red-500")}
                                        />
                                        {newSessionData.validationErrors?.meetingUrl && <p className="text-xs text-red-500">{newSessionData.validationErrors.meetingUrl}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Mật khẩu (Optional)</Label>
                                        <Input placeholder="123456" value={newSessionData.meetingPassword} onChange={(e) => handleNewSessionChange('meetingPassword', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Ticket Section for New Session */}
                        <div className="bg-white p-4 rounded-lg border border-slate-200">
                            <div className="flex justify-between items-center mb-3">
                                <Label className="text-slate-700 font-bold">Vé bán trong khung giờ này <span className="text-red-500">*</span></Label>
                                <Button size="sm" variant="outline"
                                    onClick={() => handleOpenCreateTicket(newSessionData, true)} className="text-xs h-8">
                                    <PlusCircle className="size-3 mr-1" /> Thêm loại vé
                                </Button>
                            </div>
                            {newSessionData.tickets.length === 0 ? (
                                <div className="text-center py-4 text-sm text-slate-400 border border-dashed rounded bg-slate-50">
                                    Cần ít nhất 1 loại vé để tạo khung giờ
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {newSessionData.tickets.map((t) => (
                                        <TicketEditItem
                                            key={t.id}
                                            ticket={t}
                                            openEditTicketModal={() => handleEditTicket({ ...newSessionData, isNewSession: true }, t)}
                                            handleRemoveTicket={() => handleRemoveTempTicket(t.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleCreateSessionSubmit} disabled={isSubmittingNew}>
                            {isSubmittingNew && <Loader2 className="animate-spin size-4 mr-2" />}
                            Lưu Khung Giờ & Vé
                        </Button>
                    </div>
                ) : (
                    <Button variant="outline" onClick={() => setIsCreating(true)} className="w-full border-dashed border-2 py-6 text-muted-foreground hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50">
                        <div className="bg-slate-200 rounded-full p-0.5 mr-2"><PlusCircle className="size-4" /></div>
                        Tạo khung giờ mới
                    </Button>
                )}
            </CardContent>

            {ticketModalOpen && (
                <TicketModal
                    isOpen={ticketModalOpen}
                    onClose={() => { setTicketModalOpen(false); setSelectedTicket(null); }}
                    session={selectedSession}
                    ticketToEdit={selectedTicket}
                    onSubmit={handleTicketModalSubmit}
                />
            )}
            <ConfirmDialog
                open={confirmDialog.open}
                onOpenChange={(val) => setConfirmDialog(prev => ({ ...prev, open: val }))}
                onConfirm={handleConfirmAction}
                title={confirmDialog.title}
                description={confirmDialog.description}
                variant={confirmDialog.variant}
                confirmLabel="Xóa ngay"
                cancelLabel="Hủy"
            />
        </Card >
    );
};

export default EditEventSessions;