import React, { useState, useEffect, useMemo } from 'react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { createEventInvitation } from '@/services/eventInvitationService';
import { addHours, format, isAfter } from "date-fns";
import { vi } from "date-fns/locale";
import { formatDateTime } from '@/utils/format';

const InviteGuestDialog = ({ isOpen, onClose, sessions, currentSessionId, onSuccess }) => {
    const [selectedTicketId, setSelectedTicketId] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [emails, setEmails] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const [expireDuration, setExpireDuration] = useState("48");
    const [customExpireDate, setCustomExpireDate] = useState("");

    const currentSession = sessions.find(s => s.id === currentSessionId);
    const availableTickets = currentSession?.tickets || [];
    const selectedTicket = availableTickets.find(t => String(t.id) === selectedTicketId);

    const remainingQuota = selectedTicket
        ? (selectedTicket.invitationQuota || 0) - (selectedTicket.invitedQuantity || 0)
        : 0;

    // Reset form
    useEffect(() => {
        if (isOpen) {
            setEmails("");
            setMessage("");
            setQuantity(1);
            setSelectedTicketId("");
            setExpireDuration("48");
            setCustomExpireDate("");
        }
    }, [isOpen, currentSessionId]);

    const calculatedExpiredAt = useMemo(() => {
        if (expireDuration === 'custom') {
            return customExpireDate ? new Date(customExpireDate) : null;
        }
        return addHours(new Date(), parseInt(expireDuration));
    }, [expireDuration, customExpireDate]);

    // --- HANDLERS ---
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            const extractedEmails = text.split(/[\n,;]+/).map(e => e.trim()).filter(e => e);
            setEmails(prev => (prev ? prev + "\n" : "") + extractedEmails.join("\n"));
            toast.success(`Đã nhập ${extractedEmails.length} email từ file.`);
        };
        reader.readAsText(file);
    };

    const handleSubmit = async () => {
        if (!selectedTicketId) return toast.error("Vui lòng chọn loại vé");
        if (!emails.trim()) return toast.error("Vui lòng nhập email khách mời");
        if (quantity > remainingQuota) return toast.error(`Số lượng mời vượt quá hạn ngạch (${remainingQuota})`);

        if (!calculatedExpiredAt) return toast.error("Vui lòng chọn thời hạn xác nhận hợp lệ");

        if (currentSession?.startDateTime) {
            const sessionStart = new Date(currentSession.startDateTime);
            if (isAfter(calculatedExpiredAt, sessionStart)) {
                return toast.error("Hạn chót xác nhận không được trễ hơn thời gian bắt đầu sự kiện!");
            }
        }

        if (isAfter(new Date(), calculatedExpiredAt)) {
            return toast.error("Hạn chót xác nhận phải ở tương lai!");
        }

        const emailList = emails.split(/[\n,;]+/).map(e => e.trim()).filter(e => e !== "");
        if (emailList.length === 0) return toast.error("Danh sách email không hợp lệ");

        setLoading(true);
        try {
            await createEventInvitation({
                emails: emailList,
                ticketId: Number(selectedTicketId),
                message: message,
                initialQuantity: Number(quantity),
                expiredAt: calculatedExpiredAt.toISOString(),
            });
            toast.success("Gửi lời mời thành công!");
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Gửi lời mời thất bại. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[650px]">
                <DialogHeader>
                    <DialogTitle>Gửi lời mời tham gia</DialogTitle>
                    <DialogDescription>
                        Bắt đầu lúc: {currentSession?.startDateTime &&
                            formatDateTime(currentSession.startDateTime)}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* type ticket */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Loại vé <span className="text-red-500">*</span></Label>
                        <div className="col-span-3">
                            <Select value={selectedTicketId} onValueChange={setSelectedTicketId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn loại vé mời" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableTickets.map(t => {
                                        const remain = (t.invitationQuota || 0) - (t.invitedQuantity || 0);
                                        return (
                                            <SelectItem key={t.id} value={String(t.id)} disabled={remain <= 0}>
                                                {t.name} (Quota còn: {remain})
                                            </SelectItem>
                                        )
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* quantity */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Số lượng/người</Label>
                        <div className="col-span-3 flex items-center gap-2">
                            <Input
                                type="number" min={1} max={remainingQuota}
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                className="w-24"
                            />
                            <span className="text-xs text-muted-foreground">vé</span>
                        </div>
                    </div>

                    {/* expired time */}
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">Hạn xác nhận</Label>
                        <div className="col-span-3 space-y-2">
                            <Select value={expireDuration} onValueChange={setExpireDuration}>
                                <SelectTrigger className="w-full">
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-muted-foreground" />
                                        <SelectValue placeholder="Chọn thời hạn" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="24">24 giờ tới</SelectItem>
                                    <SelectItem value="48">48 giờ tới (Mặc định)</SelectItem>
                                    <SelectItem value="72">3 ngày tới</SelectItem>
                                    <SelectItem value="168">1 tuần tới</SelectItem>
                                    <SelectItem value="custom">Tùy chọn ngày giờ...</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Input Custom Date */}
                            {expireDuration === 'custom' && (
                                <Input
                                    type="datetime-local"
                                    value={customExpireDate}
                                    onChange={(e) => setCustomExpireDate(e.target.value)}
                                    className="mt-2"
                                />
                            )}

                            {calculatedExpiredAt && (
                                <div className="text-xs text-muted-foreground flex items-center gap-1.5 bg-muted/50 p-2 rounded">
                                    <AlertCircle size={12} />
                                    Link sẽ hết hạn lúc: <span className="font-semibold text-foreground">{format(calculatedExpiredAt, "HH:mm dd/MM/yyyy", { locale: vi })}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Email */}
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">Email <span className="text-red-500">*</span></Label>
                        <div className="col-span-3 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Nhập mỗi email một dòng</span>
                                <div className="relative">
                                    <Input
                                        type="file" accept=".txt,.csv" className="hidden"
                                        id="file-upload" onChange={handleFileUpload}
                                    />
                                    <Label htmlFor="file-upload" className="cursor-pointer flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                        <Upload size={12} /> Import file
                                    </Label>
                                </div>
                            </div>
                            <Textarea
                                placeholder="example1@gmail.com&#10;example2@yahoo.com"
                                className="min-h-[100px]"
                                value={emails}
                                onChange={(e) => setEmails(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* message */}
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">Lời nhắn</Label>
                        <div className="col-span-3">
                            <Textarea
                                placeholder="Gửi lời nhắn riêng (Optional)..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>Hủy</Button>
                    <Button onClick={handleSubmit} disabled={loading || !selectedTicketId}>
                        {loading ? "Đang gửi..." : "Gửi lời mời"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default InviteGuestDialog;