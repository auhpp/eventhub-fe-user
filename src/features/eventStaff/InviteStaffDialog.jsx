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
import { createEventStaff } from '@/services/eventStaffService';
import { addHours, format, isAfter } from "date-fns";
import { vi } from "date-fns/locale";
import { RoleName } from '@/utils/constant';
import FailedEmailsDialog from './FailedEmailsDialog';
import { isValidEmail } from '@/utils/validates';

const InviteStaffDialog = ({ isOpen, onClose, eventId, onSuccess }) => {
    // --- STATE ---
    const [selectedRole, setSelectedRole] = useState("EVENT_STAFF");
    const [emails, setEmails] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [failedEmails, setFailedEmails] = useState([]);
    const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);

    // Expire logic
    const [expireDuration, setExpireDuration] = useState("48");
    const [customExpireDate, setCustomExpireDate] = useState("");

    // Reset form when open modal
    useEffect(() => {
        if (isOpen) {
            setEmails("");
            setMessage("");
            setSelectedRole("EVENT_STAFF");
            setExpireDuration("48");
            setCustomExpireDate("");
        }
    }, [isOpen]);

    // call expirate time
    const calculatedExpiredAt = useMemo(() => {
        if (expireDuration === 'custom') {
            return customExpireDate ? new Date(customExpireDate) : null;
        }
        return addHours(new Date(), parseInt(expireDuration));
    }, [expireDuration, customExpireDate]);

    // --- HANDLERS ---
    const handleBlur = () => {
        if (!emails) return;

        const rawList = emails.split(/[\n,;]+/).map(e => e.trim()).filter(e => e !== "");

        const uniqueList = [...new Set(rawList)];

        // update UI
        if (rawList.length !== uniqueList.length || rawList.join("\n") !== emails.trim()) {
            setEmails(uniqueList.join("\n"));
            if (rawList.length > uniqueList.length) {
                toast.info(`Đã tự động gộp ${rawList.length - uniqueList.length} email trùng lặp.`);
            }
        }
    };

    // handle upload file txt/csv
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            const extractedEmails = text.split(/[\n,;]+/).map(e => e.trim()).filter(e => e);

            // --- VALIDATE ---
            const validFormatEmails = extractedEmails.filter(e => isValidEmail(e));
            const invalidFormatCount = extractedEmails.length - validFormatEmails.length;

            // get current list
            const currentEmails = emails.split(/[\n,;]+/).map(e => e.trim()).filter(e => e);

            const mergedUnique = [...new Set([...currentEmails, ...validFormatEmails])];

            setEmails(mergedUnique.join("\n"));
            toast.success(`Đã cập nhật danh sách (Thêm ${validFormatEmails.length - invalidFormatCount} email hợp lệ).`);

            e.target.value = null;
        };
        reader.readAsText(file);
    };

    const handleSubmit = async () => {
        // Validation 
        if (!eventId) return toast.error("Không tìm thấy thông tin sự kiện.");
        if (!selectedRole) return toast.error("Vui lòng chọn vai trò cho nhân viên.");
        if (!emails.trim()) return toast.error("Vui lòng nhập email nhân viên.");

        // Validate Time
        if (!calculatedExpiredAt) return toast.error("Vui lòng chọn thời hạn xác nhận hợp lệ");
        if (isAfter(new Date(), calculatedExpiredAt)) {
            return toast.error("Hạn chót xác nhận phải ở tương lai!");
        }

        // --- Hadle list EMAIL ---
        const rawEmailList = emails.split(/[\n,;]+/).map(e => e.trim()).filter(e => e !== "");
        const uniqueEmailList = [...new Set(rawEmailList)];

        // --- VALIDATE FORMAT EMAIL ---
        const invalidEmails = uniqueEmailList.filter(email => !isValidEmail(email));

        if (invalidEmails.length > 0) {
            const displayInvalid = invalidEmails.slice(0, 3).join(", ");
            const remaining = invalidEmails.length - 3;

            toast.error(
                `Có ${invalidEmails.length} email không đúng định dạng: ${displayInvalid}${remaining > 0
                    ? ` và ${remaining} email khác` : ''}. Vui lòng kiểm tra lại.`
            );
            return;
        }

        if (uniqueEmailList.length === 0) return toast.error("Danh sách email không hợp lệ");

        setLoading(true);
        try {
            const response = await createEventStaff({
                emails: uniqueEmailList,
                eventId: eventId,
                message: message,
                roleName: selectedRole,
                expiredAt: calculatedExpiredAt.toISOString(),
            });

            // handle response
            const successCount = response.result.filter(r => r.sendSuccess).length;
            const failCount = response.result.length - successCount;

            if (successCount > 0) {
                toast.success(`Đã gửi lời mời thành công cho ${successCount} người.`);
                onSuccess();
                onClose();
            }
            if (failCount > 0) {
                setFailedEmails(response.result.filter(r => !r.sendSuccess));
                setIsErrorDialogOpen(true);
            }

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Gửi lời mời thất bại. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const availableRoles = [
        RoleName.EVENT_ADMIN,
        RoleName.EVENT_MANAGER,
        RoleName.EVENT_STAFF
    ];

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Mời nhân sự tham gia</DialogTitle>
                        <DialogDescription>
                            Gửi email mời tham gia Ban tổ chức sự kiện.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-5 py-4">
                        {/* Role Selection */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right flex items-center justify-end gap-2">
                                Vai trò <span className="text-red-500">*</span>
                            </Label>
                            <div className="col-span-3">
                                <Select value={selectedRole} onValueChange={setSelectedRole}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn vai trò" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableRoles.map((role) => (
                                            <SelectItem key={role.key} value={role.key} >
                                                <div className="flex flex-col text-left">
                                                    <span className="font-medium">{role.label}</span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {role.key === 'EVENT_ADMIN' ? "Quyền quản trị cao nhất" :
                                                            role.key === 'EVENT_MANAGER' ? "Quản lý sự kiện" : "Nhân viên hỗ trợ (Check-in)"}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Email Input */}
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label className="text-right pt-2">Email <span className="text-red-500">*</span></Label>
                            <div className="col-span-3 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-muted-foreground">Mỗi email một dòng</span>
                                    <div className="relative">
                                        <Input
                                            type="file" accept=".txt,.csv" className="hidden"
                                            id="staff-file-upload" onChange={handleFileUpload}
                                        />
                                        <Label htmlFor="staff-file-upload" className="cursor-pointer flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                            <Upload size={12} /> Import file
                                        </Label>
                                    </div>
                                </div>
                                <Textarea
                                    placeholder="staff1@example.com&#10;manager@example.com"
                                    className="min-h-[100px] font-mono text-sm"
                                    value={emails}
                                    onChange={(e) => setEmails(e.target.value)}
                                    onBlur={handleBlur}
                                />
                                {emails && (
                                    <p className="text-[10px] text-muted-foreground text-right">
                                        Dự kiến gửi: {new Set(emails.split(/[\n,;]+/).map(e => e.trim()).filter(e => e)).size} người
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Expired Time */}
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
                                        Link mời sẽ hết hạn lúc: <span className="font-semibold text-foreground">{format(calculatedExpiredAt, "HH:mm dd/MM/yyyy", { locale: vi })}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Message */}
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label className="text-right pt-2">Lời nhắn</Label>
                            <div className="col-span-3">
                                <Textarea
                                    placeholder="Gửi lời nhắn riêng cho nhân viên..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={onClose} disabled={loading}>Hủy</Button>
                        <Button onClick={handleSubmit} disabled={loading || !selectedRole}>
                            {loading ? "Đang gửi..." : "Gửi lời mời"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <FailedEmailsDialog
                open={isErrorDialogOpen}
                onOpenChange={setIsErrorDialogOpen}
                failedEmails={failedEmails}
            />
        </>
    );
};

export default InviteStaffDialog;