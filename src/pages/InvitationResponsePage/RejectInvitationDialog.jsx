import React, { useState } from 'react';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";

const RejectInvitationDialog = ({ open, onOpenChange, onConfirm }) => {
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirm = async () => {
        setIsSubmitting(true);
        await onConfirm(message);
        setIsSubmitting(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-red-600 mb-2">
                        <AlertTriangle size={20} />
                        <DialogTitle>Từ chối tham gia</DialogTitle>
                    </div>
                    <DialogDescription>
                        Chúng tôi rất tiếc khi bạn không thể tham gia. Bạn có muốn để lại lời nhắn cho ban tổ chức không?
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="message">Lý do / Lời nhắn (Tùy chọn)</Label>
                        <Textarea
                            id="message"
                            placeholder="Ví dụ: Tôi bận công tác vào ngày này..."
                            className="min-h-[100px] resize-none"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Đang xử lý..." : "Xác nhận từ chối"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default RejectInvitationDialog;