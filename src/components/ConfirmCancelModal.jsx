import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react"; 

export function ConfirmCancelModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Xác nhận hủy", 
    description, 
    itemLabel, 
    note, 
    confirmText = "Xác nhận hủy",
    cancelText = "Quay lại",
    isLoading = false, 
}) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden rounded-2xl border-none shadow-2xl">
                <div className="p-6 bg-white dark:bg-slate-900">
                    <DialogHeader className="flex-row items-center gap-4 mb-4 space-y-0">
                        <div className="flex items-center justify-center w-12 h-12 flex-shrink-0 rounded-full bg-red-50 dark:bg-red-900/30">
                            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>

                        <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                            {title}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <DialogDescription className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                            {description ? (
                                description
                            ) : (
                                <>
                                    Bạn có chắc chắn muốn hủy bỏ{" "}
                                    {itemLabel && (
                                        <span className="font-bold text-gray-900 dark:text-white">
                                            "{itemLabel}"
                                        </span>
                                    )}{" "}
                                    không? Hành động này không thể hoàn tác.
                                </>
                            )}
                        </DialogDescription>

                        {/* Note Box */}
                        <div className="p-4 rounded-xl bg-red-50/50 border border-red-100 dark:bg-red-900/10 dark:border-red-800/50">
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                <span className="font-bold text-red-600 dark:text-red-400">
                                    Lưu ý:{" "}
                                </span>
                                {note ||
                                    "Dữ liệu sau khi hủy có thể sẽ bị xóa vĩnh viễn hoặc chuyển vào thùng rác tùy theo chính sách hệ thống."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer  */}
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100 dark:bg-gray-800/50 dark:border-gray-700">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="border-gray-300 text-gray-700 font-bold hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-500/20"
                    >
                        {isLoading ? "Đang xử lý..." : confirmText}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}