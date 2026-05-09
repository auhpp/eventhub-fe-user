import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileSpreadsheet, Loader2, AlertCircle } from "lucide-react";
import Papa from 'papaparse';
import { toast } from "sonner";

const ImportCheckInDialog = ({ open, onOpenChange, onConfirm, isImporting }) => {
    const [parsedEmails, setParsedEmails] = useState([]);
    const [fileName, setFileName] = useState("");

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFileName(file.name);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                const emailList = results.data
                    .map(row => row['Email'] || row['User Email'] || row['email'] || Object.values(row)[0])
                    .filter(email => email && typeof email === 'string' && email.trim() !== "");

                const uniqueEmails = [...new Set(emailList)];
                setParsedEmails(uniqueEmails);
            },
            error: function (error) {
                toast.error("Lỗi đọc file: " + error.message);
            }
        });
    };

    const handleResetAndClose = (openState) => {
        if (!openState) {
            setParsedEmails([]);
            setFileName("");
        }
        onOpenChange(openState);
    };

    return (
        <Dialog open={open} onOpenChange={handleResetAndClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Import điểm danh bằng file CSV</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <Input type="file" accept=".csv" onChange={handleFileChange} />

                    {/* display parsed emails */}
                    {parsedEmails.length > 0 && (
                        <div className="space-y-2 animate-in fade-in duration-300">
                            <div className="text-sm font-medium text-green-600 flex items-center gap-2">
                                <FileSpreadsheet size={16} />
                                Tìm thấy {parsedEmails.length} email hợp lệ để điểm danh
                            </div>
                            <div className="bg-muted p-2 rounded-md">
                                <ScrollArea className="h-[200px] w-full rounded-md border bg-background p-4 shadow-inner">
                                    {parsedEmails.map((email, idx) => (
                                        <div key={idx} className="text-sm py-2 border-b last:border-0 border-gray-100 flex items-center gap-2 text-gray-700">
                                            <span className="text-xs text-muted-foreground w-4">{idx + 1}.</span> {email}
                                        </div>
                                    ))}
                                </ScrollArea>
                            </div>
                        </div>
                    )}
                    {fileName && parsedEmails.length === 0 && (
                        <div className="text-sm text-red-500 flex items-center gap-2 p-3 bg-red-50 rounded-md">
                            <AlertCircle size={16} /> Không tìm thấy cột chứa Email hợp lệ trong file. Vui lòng xem lại file mẫu.
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => handleResetAndClose(false)} disabled={isImporting}>
                        Hủy
                    </Button>
                    <Button
                        onClick={() => onConfirm(parsedEmails)}
                        disabled={parsedEmails.length === 0 || isImporting}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Xác nhận điểm danh
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ImportCheckInDialog;