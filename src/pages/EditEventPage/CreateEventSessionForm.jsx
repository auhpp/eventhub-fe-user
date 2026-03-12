import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, X, Video, ExternalLink, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import DateTimePicker from '@/components/DateTimePicker';
import TicketEditItem from '@/features/tickets/TicketEditItem';
import { EventType } from '@/utils/constant';

const CreateEventSessionForm = ({
    eventData,
    newSessionData,
    isSubmittingNew,
    onCancel,
    onChange,
    onSubmit,
    onOpenCreateTicket,
    onEditTicket,
    onRemoveTempTicket
}) => {
    return (
        <div className="border-2 border-blue-100 bg-blue-50/30 rounded-xl p-4 space-y-5 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center border-b border-blue-100 pb-3">
                <h4 className="font-bold text-blue-700 flex items-center gap-2">
                    <PlusCircle className="size-5" /> Tạo Khung Giờ Mới
                </h4>
                <Button variant="ghost" size="sm" onClick={onCancel} className="text-slate-400 hover:text-red-500">
                    <X className="size-4" /> Hủy
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DateTimePicker
                    label="Bắt đầu Check-in"
                    value={newSessionData.checkinStartTime}
                    onChange={(val) => onChange('checkinStartTime', val)}
                    error={newSessionData.validationErrors?.checkinStartTime}
                />
                <DateTimePicker
                    label="Bắt đầu sự kiện"
                    value={newSessionData.startTime}
                    onChange={(val) => onChange('startTime', val)}
                    error={newSessionData.validationErrors?.startTime}
                />
                <DateTimePicker
                    label="Kết thúc sự kiện"
                    value={newSessionData.endTime}
                    onChange={(val) => onChange('endTime', val)}
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
                            <Button type="button" variant="outline" size="sm"
                             onClick={() => window.open('https://meet.google.com/', '_blank')} className="h-7 text-xs">
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
                                onChange={(e) => onChange('meetingUrl', e.target.value)}
                                className={cn(newSessionData.validationErrors?.meetingUrl && 
                                    "border-red-500 focus-visible:ring-red-500")}
                            />
                            {newSessionData.validationErrors?.meetingUrl && <p 
                            className="text-xs text-red-500">{newSessionData.validationErrors.meetingUrl}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Mật khẩu (Optional)</Label>
                            <Input placeholder="123456" value={newSessionData.meetingPassword} 
                            onChange={(e) => onChange('meetingPassword', e.target.value)} />
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white p-4 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center mb-3">
                    <Label className="text-slate-700 font-bold">Vé bán trong khung giờ này 
                        <span className="text-red-500">*</span></Label>
                    <Button size="sm" variant="outline"
                        onClick={() => onOpenCreateTicket(newSessionData, true)} className="text-xs h-8">
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
                                openEditTicketModal={() => onEditTicket({ ...newSessionData, isNewSession: true }, t)}
                                handleRemoveTicket={() => onRemoveTempTicket(t.id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={onSubmit} disabled={isSubmittingNew}>
                {isSubmittingNew && <Loader2 className="animate-spin size-4 mr-2" />}
                Lưu Khung Giờ & Vé
            </Button>
        </div>
    );
};

export default CreateEventSessionForm;