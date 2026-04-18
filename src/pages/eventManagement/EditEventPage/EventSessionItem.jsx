import React from 'react';
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CalendarClock, Clock, Save, Loader2, Video, ExternalLink, Link as LinkIcon, KeyRound, Ticket, PlusCircle, AlertTriangle, Trash2, Ban, MessageSquareQuote } from 'lucide-react';
import { cn } from '@/lib/utils';
import DateTimePicker from '@/components/DateTimePicker';
import EventSessionStatusBadge from '@/components/EventSessionStatusBadge';
import TicketEditItem from '@/features/tickets/TicketEditItem';
import { EventSessionStatus, EventType, QAStatus } from '@/utils/constant';
import { displaySessionDate, formatTime } from '@/utils/format';

const EventSessionItem = ({
    session,
    eventData,
    updatingSessionId,
    onSessionChange,
    onSaveSession,
    onOpenCreateTicket,
    onEditTicket,
    onDeleteTicket,
    onDeleteSession,
    onCancelSession
}) => {
    const expiredEventSession = session.endTime < (new Date());
    const hasError = Object.keys(session.validationErrors || {}).length > 0;
    const isCancelled = session.status === EventSessionStatus.CANCELLED;
    const isEditable = !expiredEventSession && !isCancelled;
    return (
        <AccordionItem value={String(session.id)}
            className={cn(
                "border rounded-xl px-4 bg-card transition-all hover:shadow-sm data-[state=open]:border-blue-200",
                hasError && "border-red-500",
                isCancelled && "bg-slate-50 border-slate-200"
            )}>

            <AccordionTrigger className="hover:no-underline flex-1 py-2">
                <div className={cn("flex gap-3 text-left items-start transition-opacity", isCancelled && "opacity-70")}>
                    <div className={cn("mt-1 p-1.5 rounded-lg", isCancelled ? "bg-slate-200 text-slate-500" : "bg-blue-50 text-blue-600")}>
                        <CalendarClock className="size-4" />
                    </div>
                    <div>
                        <div className='flex gap-4'>
                            <h4 className={cn("font-bold text-base", hasError ? "text-red-500" : (isCancelled ? "text-slate-500" : "text-slate-800"))}>
                                {displaySessionDate({
                                    startDateTime: session.startTime,
                                    endDateTime: session.endTime
                                })}
                            </h4>
                            <EventSessionStatusBadge eventSession={session} />
                        </div>
                        <h4 className={cn("font-bold text-md", isCancelled ? "text-slate-500" : "text-slate-800")}>
                            {formatTime(session.startTime)} - {formatTime(session.endTime)}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {session.tickets.length} loại vé - ID: {session.id}
                        </p>
                    </div>
                </div>
            </AccordionTrigger>

            <AccordionContent className="pb-4 pt-2 space-y-6">
                <div className="space-y-4 border-b pb-6 border-dashed">
                    <div className="flex items-center justify-between">
                        <h5 className={cn("font-bold text-sm flex items-center gap-2", isCancelled ? "text-slate-500" : "text-slate-700")}>
                            <Clock className={cn("size-4", isCancelled ? "text-slate-400" : "text-blue-600")} />
                            Thiết lập thời gian
                        </h5>

                        {isEditable && (
                            <Button size="sm" onClick={() => onSaveSession(session)}
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
                                onChange={(val) => onSessionChange(session.id, 'checkinStartTime', val)}
                                error={session.validationErrors?.checkinStartTime}
                                disabled={!isEditable}
                            />
                            <p className="text-xs text-muted-foreground mt-1 ml-1">
                                Thời gian bắt đầu cho phép người tham gia vào cổng/phòng chờ.
                            </p>
                        </div>
                        <DateTimePicker
                            label="Bắt đầu sự kiện"
                            value={session.startTime}
                            onChange={(val) => onSessionChange(session.id, 'startTime', val)}
                            error={session.validationErrors?.startTime}
                            disabled={!isEditable}
                        />
                        <DateTimePicker
                            label="Kết thúc sự kiện"
                            value={session.endTime}
                            onChange={(val) => onSessionChange(session.id, 'endTime', val)}
                            error={session.validationErrors?.endTime}
                            disabled={!isEditable}
                        />
                    </div>

                    {eventData?.type === EventType.ONLINE.key && (
                        <div className={cn("p-4 rounded-xl border space-y-4 mt-4", isCancelled ? "bg-slate-50 border-slate-200" : "bg-blue-50/50 border-blue-100")}>
                            <div className="flex items-center justify-between">
                                <div className={cn("flex items-center gap-2 font-bold text-sm", isCancelled ? "text-slate-500" : "text-blue-700")}>
                                    <Video className="size-4" /> Thông tin phòng họp trực tuyến
                                </div>
                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" size="sm" onClick={() => window.open('https://meet.google.com/', '_blank')} disabled={!isEditable} className="h-7 text-xs bg-white text-slate-600 border-slate-200 hover:text-blue-600">
                                        Tạo Google Meet <ExternalLink className="size-3 ml-1 opacity-50" />
                                    </Button>
                                    <Button type="button" variant="outline" size="sm" onClick={() => window.open('https://zoom.us/meeting/schedule', '_blank')} disabled={!isEditable} className="h-7 text-xs bg-white text-slate-600 border-slate-200 hover:text-blue-600">
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
                                            disabled={!isEditable}
                                            onChange={(e) => onSessionChange(session.id, 'meetingUrl', e.target.value)}
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
                                            disabled={!isEditable}
                                            onChange={(e) => onSessionChange(session.id, 'meetingPassword', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- Q&A SECTION --- */}
                <div className="space-y-4 border-b pb-6 border-dashed">
                    <h5 className={cn("font-bold text-sm flex items-center gap-2", isCancelled ? "text-slate-500" : "text-slate-700")}>
                        <MessageSquareQuote className={cn("size-4", isCancelled ? "text-slate-400" : "text-blue-600")} />
                        Cài đặt Hỏi Đáp (Q&A)
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm">Trạng thái Q&A</Label>
                            <div className='ms-1'>
                                <Select
                                    value={session.qaStatus}
                                    onValueChange={(val) => onSessionChange(session.id, 'qaStatus', val)}
                                    disabled={!isEditable}
                                >
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={QAStatus.DISABLED}>Tắt Q&A</SelectItem>
                                        <SelectItem value={QAStatus.PRE_EVENT}>Nhận câu hỏi trước (Pre-event)</SelectItem>
                                        <SelectItem value={QAStatus.LIVE}>Trực tiếp (Live)</SelectItem>
                                        <SelectItem value="CLOSED">Đóng Q&A</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {(session.qaStatus === QAStatus.PRE_EVENT || session.qaStatus === QAStatus.LIVE) && (
                        <div className="flex flex-col sm:flex-row gap-6 mt-4 p-4 rounded-xl border bg-slate-50/50">
                            <div className="flex items-center space-x-3">
                                <Switch
                                    id={`anonymous-${session.id}`}
                                    checked={session.allowAnonymous}
                                    onCheckedChange={(val) => onSessionChange(session.id, 'allowAnonymous', val)}
                                    disabled={!isEditable}
                                />
                                <Label htmlFor={`anonymous-${session.id}`} className="text-sm font-normal cursor-pointer">
                                    Cho phép gửi ẩn danh
                                </Label>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Switch
                                    id={`moderation-${session.id}`}
                                    checked={session.requireModerationQuestion}
                                    onCheckedChange={(val) => onSessionChange(session.id, 'requireModerationQuestion', val)}
                                    disabled={!isEditable}
                                />
                                <Label htmlFor={`moderation-${session.id}`} className="text-sm font-normal cursor-pointer">
                                    Duyệt câu hỏi trước khi hiển thị
                                </Label>
                            </div>
                        </div>
                    )}
                </div>

                {/* Ticket Section */}
                <div className={cn("rounded-xl p-4 border space-y-3", isCancelled ? "bg-slate-100" : "bg-slate-50")}>
                    <div className="flex justify-between items-center">
                        <h5 className={cn("font-bold text-sm flex items-center gap-2", isCancelled ? "text-slate-500" : "text-slate-700")}>
                            <Ticket className={cn("size-4", isCancelled ? "text-slate-400" : "text-blue-600")} />
                            Danh sách Vé ({session.tickets.length})
                        </h5>

                        {isEditable && (
                            <Button variant="ghost" size="sm" onClick={() => onOpenCreateTicket(session, false)} className="text-blue-600 text-xs font-bold hover:bg-blue-50">
                                <PlusCircle className="size-3 mr-1" /> Thêm vé mới
                            </Button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        {session.tickets.map(t => (
                            <TicketEditItem
                                key={t.id}
                                ticket={t}
                                openEditTicketModal={() => onEditTicket(session, t)}
                                handleRemoveTicket={() => onDeleteTicket(session, t)}
                                expiredEventSession={!isEditable}
                            />
                        ))}
                    </div>
                </div>

                {/* Delete / cancel area*/}
                {isEditable && (
                    <div className="border-t border-red-100 pt-4 mt-6">
                        <div className="flex items-center justify-between p-4 bg-red-50/50 rounded-xl border border-red-100">
                            <div>
                                <h6 className="text-sm font-bold text-red-700 flex items-center gap-2">
                                    <AlertTriangle className="size-4" /> Quản lý rủi ro
                                </h6>
                                <p className="text-xs text-red-600/80 mt-1">
                                    Xóa (Hard delete) khi chưa có ai mua vé. Hủy (Cancel) khi sự kiện đã bán vé và cần dừng lại.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="bg-white border-red-200 text-red-600 hover:bg-red-50 transition-colors" onClick={() => onCancelSession(session)}>
                                    <Ban className="size-4 mr-2" /> Hủy Session
                                </Button>
                                <Button variant="destructive" size="sm" className="bg-red-600 text-white hover:bg-red-700 transition-colors" onClick={() => onDeleteSession(session)}>
                                    <Trash2 className="size-4 mr-2" /> Xóa hẳn
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </AccordionContent>
        </AccordionItem>
    );
};

export default EventSessionItem;