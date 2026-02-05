import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, X, Mail, AlertTriangle } from "lucide-react";

const FailedEmailsDialog = ({ open, onOpenChange, failedEmails = [] }) => {

    const handleClose = () => {
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-white border-none shadow-2xl rounded-2xl">

                {/* Header Section */}
                <div className="flex flex-col items-center justify-center pt-8 pb-4 bg-red-50/50">
                    <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4 ring-8 ring-red-50 animate-in zoom-in-50 duration-300">
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>

                    <DialogHeader className="text-center px-6">
                        <DialogTitle className="text-2xl font-bold text-gray-900 text-center">
                            Gửi lời mời thất bại
                        </DialogTitle>
                        <p className="text-center text-muted-foreground mt-2 text-sm">
                            Đã có lỗi xảy ra với <span className="font-bold text-red-600">{failedEmails.length}</span> địa chỉ email.
                            Vui lòng kiểm tra lại danh sách bên dưới.
                        </p>
                    </DialogHeader>
                </div>

                {/* Body Section */}
                <div className="px-6 py-4">
                    <div className="bg-gray-50 border border-gray-100 rounded-xl overflow-hidden">
                        {/* small header */}
                        <div className="px-4 py-2 bg-gray-100/50 border-b border-gray-200 flex justify-between items-center">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Danh sách chi tiết</span>
                        </div>

                        {/* List items */}
                        <div className="max-h-[240px] overflow-y-auto custom-scrollbar p-2 space-y-2">
                            {failedEmails.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:border-red-200 transition-colors group"
                                >
                                    <div className="mt-1 shrink-0 w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                                        <Mail size={14} className="text-red-500" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                            {item.email}
                                        </p>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <AlertCircle size={12} className="text-red-500" />
                                            <p className="text-xs text-red-600 font-medium">
                                                {item.message || "Đã là thành viên của sự kiện"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="p-6 pt-2 bg-white">
                    <Button
                        onClick={handleClose}
                        className="w-full h-12 text-base font-semibold bg-gray-900 hover:bg-gray-800 text-white rounded-xl shadow-lg shadow-gray-200 transition-all active:scale-[0.98]"
                    >
                        Đã hiểu, tôi sẽ kiểm tra lại
                    </Button>
                </div>

            </DialogContent>
        </Dialog>
    );
};

export default FailedEmailsDialog;