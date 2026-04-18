import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { MeetingPlatform, EventType, QAStatus } from '@/utils/constant';
import { HttpStatusCode } from 'axios';
import TicketModal from '@/features/tickets/TicketModal';
import { cancelEventSession, createTicket, deleteEventSession, updateEventSession } from '@/services/eventSessionService';
import { createEventSession } from '@/services/eventService';
import { deleteTicket, updateTicket } from '@/services/ticketService';
import { formatDateForBE, formatTime } from '@/utils/format';
import ConfirmDialog from '@/components/ConfirmDialog';
import EventSessionItem from './EventSessionItem';
import CreateEventSessionForm from './CreateEventSessionForm';

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
        qaStatus: QAStatus.DISABLED,
        allowAnonymous: false,
        requireModerationQuestion: false,
        tickets: [],
        validationErrors: {}
    });

    // --- STATE for TICKET MODAL ---
    const [ticketModalOpen, setTicketModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);

    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        type: null,
        id: null,
        parentId: null,
        title: '',
        description: '',
        variant: 'default'
    });

    const handleCancelSessionClick = (session) => {
        setConfirmDialog({
            open: true,
            type: 'cancel_session',
            id: session.id,
            title: 'Hủy khung giờ này?',
            description: `Bạn có chắc chắn muốn HỦY khung giờ ${formatTime(session.startTime)} - ${formatTime(session.endTime)}? Trạng thái sẽ chuyển sang Đã hủy và toàn bộ vé đã đặt sẽ bị hủy. Hành động này không thể hoàn tác.`,
            variant: 'destructive'
        });
    };

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
            } else if (confirmDialog.type === 'cancel_session') {
                const response = await cancelEventSession({ eventSessionId: confirmDialog.id });
                if (response.code === HttpStatusCode.Ok) {
                    toast.success("Đã hủy khung giờ thành công");
                    onRefresh();
                }
            }
        } catch (error) {
            console.error(error);
            const errorCode = error.response?.data?.code;

            if (errorCode === 'EVENT_ON_GOING') {
                toast.error("Không thể hủy: Sự kiện này đang diễn ra.");
            } else if (errorCode === 1009) {
                toast.error("Không thể xóa: Dữ liệu đang được sử dụng hoặc ràng buộc.");
            } else if (errorCode === 'FORBIDDEN') {
                toast.error("Bạn không có quyền thực hiện hành động này.");
            } else {
                toast.error("Đã có lỗi xảy ra.");
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
                qaStatus: s.qaStatus || QAStatus.DISABLED, // Map Q&A
                allowAnonymous: s.allowAnonymous || false,
                requireModerationQuestion: s.requireModerationQuestion || false,
                tickets: s.tickets || [],
                isDirty: false,
                validationErrors: {},
                status: s.status
            }));
            setLocalSessions(mappedSessions);
        }
    }, [eventData]);

    const validateSession = (session, isNewSession = false) => {
        const errors = {};
        const now = new Date();
        const start = session.startTime ? new Date(session.startTime) : null;
        const end = session.endTime ? new Date(session.endTime) : null;
        const checkin = session.checkinStartTime ? new Date(session.checkinStartTime) : null;

        if (isNewSession && start && start <= now) {
            errors.startTime = "Thời gian bắt đầu phải lớn hơn hiện tại";
        }
        if (start && end && end <= start) {
            errors.endTime = "Thời gian kết thúc phải lớn hơn thời gian bắt đầu";
        }
        if (checkin && start && checkin > start) {
            errors.checkinStartTime = "Thời gian check-in phải trước khi bắt đầu";
        }

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

    const handleSessionChange = (id, field, value) => {
        setLocalSessions(prev => prev.map(session => {
            if (session.id !== id) return session;

            let updatedSession = { ...session, [field]: value, isDirty: true };
            if (field === 'meetingUrl') updatedSession.meetingPlatform = detectPlatform(value);

            if (field === 'qaStatus' && value !== QAStatus.PRE_EVENT && value !== QAStatus.LIVE) {
                updatedSession.allowAnonymous = false;
                updatedSession.requireModerationQuestion = false;
            }

            updatedSession.validationErrors = validateSession(updatedSession, false);

            return updatedSession;
        }));
    };

    const handleSaveSession = async (session) => {
        const errors = validateSession(session, false);
        if (Object.keys(errors).length > 0) {
            setLocalSessions(prev => prev.map(s => s.id === session.id ? { ...s, validationErrors: errors } : s));
            toast.error("Vui lòng kiểm tra lại thông tin nhập liệu");
            return;
        }

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

    const handleNewSessionChange = (field, value) => {
        setNewSessionData(prev => {
            const updated = { ...prev, [field]: value };
            if (field === 'meetingUrl') updated.meetingPlatform = detectPlatform(value);

            if (field === 'qaStatus' && value !== QAStatus.PRE_EVENT && value !== QAStatus.LIVE) {
                updated.allowAnonymous = false;
                updated.requireModerationQuestion = false;
            }

            updated.validationErrors = validateSession(updated, true);
            return updated;
        });
    };

    const handleCreateSessionSubmit = async () => {
        const errors = validateSession(newSessionData, true);
        if (Object.keys(errors).length > 0) {
            setNewSessionData(prev => ({ ...prev, validationErrors: errors }));
            toast.error("Vui lòng kiểm tra lại thông tin nhập liệu");
            return;
        }

        if (!newSessionData.startTime || !newSessionData.endTime || !newSessionData.checkinStartTime) {
            toast.error("Vui lòng nhập đầy đủ thời gian");
            return;
        }

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
                qaStatus: newSessionData.qaStatus,
                allowAnonymous: newSessionData.allowAnonymous,
                requireModerationQuestion: newSessionData.requireModerationQuestion,
                ticketCreateRequests: newSessionData.tickets
            };

            const response = await createEventSession({ id: eventData.id, data: payload });

            if (response.code === HttpStatusCode.Ok) {
                toast.success("Tạo khung giờ và vé thành công!");
                setIsCreating(false);
                setNewSessionData({
                    checkinStartTime: null, startTime: null, endTime: null,
                    meetingUrl: '', qaStatus: QAStatus.DISABLED, allowAnonymous: false, requireModerationQuestion: false,
                    tickets: [], validationErrors: {}
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
        if (selectedSession?.isNewSession) {
            setNewSessionData(prev => {
                const tickets = [...prev.tickets];
                const existingIndex = tickets.findIndex(t => t.id === ticketData.id);

                if (existingIndex > -1) {
                    tickets[existingIndex] = { ...ticketData };
                    toast.success("Đã cập nhật thông tin vé");
                } else {
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
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {localSessions.map((session) => (
                        <EventSessionItem
                            key={session.id}
                            session={session}
                            eventData={eventData}
                            updatingSessionId={updatingSessionId}
                            onSessionChange={handleSessionChange}
                            onSaveSession={handleSaveSession}
                            onOpenCreateTicket={handleOpenCreateTicket}
                            onEditTicket={handleEditTicket}
                            onDeleteTicket={handleDeleteTicketClick}
                            onDeleteSession={handleDeleteSessionClick}
                            onCancelSession={handleCancelSessionClick}
                        />
                    ))}
                </Accordion>

                {isCreating ? (
                    <CreateEventSessionForm
                        eventData={eventData}
                        newSessionData={newSessionData}
                        isSubmittingNew={isSubmittingNew}
                        onCancel={() => setIsCreating(false)}
                        onChange={handleNewSessionChange}
                        onSubmit={handleCreateSessionSubmit}
                        onOpenCreateTicket={handleOpenCreateTicket}
                        onEditTicket={handleEditTicket}
                        onRemoveTempTicket={handleRemoveTempTicket}
                    />
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
                confirmLabel="Xác nhận"
                cancelLabel="Hủy"
            />
        </Card>
    );
};

export default EditEventSessions;