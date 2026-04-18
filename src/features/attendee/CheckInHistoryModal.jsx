import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { formatDateTime } from "@/utils/format";
import { getCheckInLogs } from "@/services/attendeeService";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DateTimePicker from "@/components/DateTimePicker";
import DefaultPagination from "@/components/DefaultPagination";
import { ActionType } from "@/utils/constant";

const CheckInHistoryModal = ({ isOpen, onClose, attendee }) => {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // States cho Filter & Pagination
    const [page, setPage] = useState(1);
    const [actionType, setActionType] = useState("all"); // "all" | "IN" | "OUT"
    const [fromTime, setFromTime] = useState("");
    const [toTime, setToTime] = useState("");

    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        const fetchLogs = async () => {
            if (!isOpen || !attendee?.id) return;

            try {
                const formattedFrom = fromTime ? `${fromTime}:00` : undefined;
                const formattedTo = toTime ? `${toTime}:00` : undefined;

                const res = await getCheckInLogs({
                    attendeeId: attendee.id,
                    actionType: actionType === "all" ? undefined : actionType,
                    fromTime: formattedFrom,
                    toTime: formattedTo,
                    page: page,
                    size: pageSize
                });

                const data = res?.result?.data || [];
                setLogs(data);

                setTotalElements(res?.result?.totalElements);
                setTotalPages(res?.result?.totalPage || 1);

            } catch (error) {
                console.error("Lỗi khi tải lịch sử:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLogs();
    }, [isOpen, attendee?.id, page, actionType, fromTime, toTime]);

    // Reset filter when close modal
    useEffect(() => {
        if (!isOpen) {
            setPage(1);
            setActionType("all");
            setFromTime("");
            setToTime("");
            setLogs([]);
            setTotalElements(0);
            setTotalPages(1);
        }
    }, [isOpen]);

    const mockSetSearchParams = (updater) => {
        const prevParams = new URLSearchParams();
        prevParams.set("page", page.toString());

        const updatedParams = updater(prevParams);

        const newPage = parseInt(updatedParams.get("page"), 10);
        if (!isNaN(newPage)) {
            setPage(newPage);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl bg-white">
                <DialogHeader>
                    <DialogTitle>Lịch sử điểm danh vé {attendee?.ticket?.name}</DialogTitle>
                </DialogHeader>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
                    {/* Select ActionType */}
                    <div className="flex flex-col space-y-2 mt-2">
                        <label className="text-xs uppercase font-bold text-muted-foreground">
                            Loại hành động
                        </label>
                        <Select
                            value={actionType}
                            onValueChange={(val) => { setActionType(val); setPage(1); }}
                        >
                            <SelectTrigger className="h-10 rounded-lg">
                                <SelectValue placeholder="Tất cả" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value={ActionType.IN}>Check-IN (Vào)</SelectItem>
                                <SelectItem value={ActionType.OUT}>Check-OUT (Ra)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* from date  */}
                    <div className="flex flex-col justify-end">
                        <DateTimePicker
                            label="Từ thời gian"
                            value={fromTime}
                            onChange={(val) => { setFromTime(val); setPage(1); }}
                        />
                    </div>

                    {/* to date */}
                    <div className="flex flex-col justify-end">
                        <DateTimePicker
                            label="Đến thời gian"
                            value={toTime}
                            onChange={(val) => { setToTime(val); setPage(1); }}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="border rounded-md overflow-hidden min-h-[300px] relative">
                    {isLoading && (
                        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        </div>
                    )}
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead className="w-16 text-center">ID</TableHead>
                                <TableHead>Hành động</TableHead>
                                <TableHead>Thời gian</TableHead>
                                <TableHead>Nhân viên soát vé</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.length === 0 && !isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-slate-500">
                                        Không có dữ liệu
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log, index) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="text-center">{(page - 1) * pageSize + index + 1}</TableCell>
                                        <TableCell>
                                            <span className=
                                                {`px-2 py-1 rounded text-xs font-bold ${log.actionType === ActionType.IN ?
                                                    'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                                    }`}>
                                                {log.actionType}
                                            </span>
                                        </TableCell>
                                        <TableCell>{formatDateTime(log.createdAt)}</TableCell>
                                        <TableCell><p className="font-medium">{log.eventStaffFullName}</p>
                                            <p>{log.eventStaffEmail}</p>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {totalElements > 0 && (
                    <DefaultPagination
                        totalPages={totalPages}
                        currentPage={page}
                        pageSize={pageSize}
                        totalElements={totalElements}
                        setSearchParams={mockSetSearchParams}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};

export default CheckInHistoryModal;