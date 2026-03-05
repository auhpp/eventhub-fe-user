import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatDateTime } from '@/utils/format';
import { toast } from 'sonner';
import { getCouponReportDetail } from '@/services/couponService';

const VoucherStatisticsModal = ({ isOpen, onClose, voucher }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [groupedData, setGroupedData] = useState([]);
    const [totalUsed, setTotalUsed] = useState(0);

    // State for Modal 2 
    const [selectedSession, setSelectedSession] = useState(null);

    useEffect(() => {
        if (isOpen && voucher) {
            fetchStatistics();
        } else {
            // Reset state modal
            setGroupedData([]);
            setTotalUsed(0);
            setSelectedSession(null);
        }
    }, [isOpen, voucher]);

    const fetchStatistics = async () => {
        setIsLoading(true);
        try {
            const res = await getCouponReportDetail(voucher.id);
            const data = res.result;

            processData(data);
        } catch (error) {
            console.log(error)
            toast.error("Không thể tải dữ liệu thống kê.");
        } finally {
            setIsLoading(false);
        }
    };

    // data by Session
    const processData = (rawData) => {
        const groups = {};
        let total = 0;

        rawData.forEach(item => {
            const session = item.ticket.eventSession;
            total += item.usageQuantity;

            if (!groups[session.id]) {
                groups[session.id] = {
                    sessionInfo: session,
                    totalUsageInSession: 0,
                    tickets: []
                };
            }

            groups[session.id].totalUsageInSession += item.usageQuantity;

            groups[session.id].tickets.push(item);
        });

        setGroupedData(Object.values(groups));
        setTotalUsed(total);
    };

    return (
        <>
            {/* Modal 1 */}
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl bg-slate-50">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Thống kê voucher: {voucher?.code}</DialogTitle>
                    </DialogHeader>

                    {isLoading ? (
                        <div className="p-8 text-center text-muted-foreground">Đang tải dữ liệu...</div>
                    ) : (
                        <div className="space-y-6">
                            {/* headline */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-col justify-center">
                                    <span className="text-sm text-muted-foreground mb-1">Tổng số vé được áp dụng</span>
                                    <span className="text-2xl font-semibold">
                                        {voucher?.maximumTicket || 'Không giới hạn'}
                                    </span>
                                </div>
                                <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-col justify-center">
                                    <span className="text-sm text-muted-foreground mb-1">Tổng số vé đã dùng</span>
                                    <span className="text-2xl font-semibold">{totalUsed}</span>
                                </div>
                            </div>

                            {/* Session table */}
                            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/50">
                                            <TableHead className="text-center">Suất diễn</TableHead>
                                            <TableHead className="text-center">Số vé đã dùng</TableHead>
                                            <TableHead className="text-center">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {groupedData.length > 0 ? (
                                            groupedData.map((group) => (
                                                <TableRow key={group.sessionInfo.id}>
                                                    <TableCell className="text-center">
                                                        {formatDateTime(group.sessionInfo.startDateTime)}
                                                    </TableCell>
                                                    <TableCell className="text-center">{group.totalUsageInSession}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Button
                                                            className="bg-[#10b981] hover:bg-[#059669] rounded-md h-8"
                                                            onClick={() => setSelectedSession(group)}
                                                        >
                                                            Xem chi tiết
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                                    Không có dữ liệu
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Modal 2 */}
            <Dialog open={!!selectedSession} onOpenChange={(open) => !open && setSelectedSession(null)}>
                <DialogContent className="max-w-2xl bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-lg">
                            Suất diễn {selectedSession && formatDateTime(selectedSession.sessionInfo.startDateTime)}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="border rounded-lg overflow-hidden mt-4">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50">
                                    <TableHead className="text-center">Loại vé</TableHead>
                                    <TableHead className="text-center">Giá</TableHead>
                                    <TableHead className="text-center">Số vé đã dùng</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedSession?.tickets.map((item, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell className="text-center font-medium">{item.ticket.name}</TableCell>
                                        <TableCell className="text-center">{item.ticket.price.toLocaleString('vi-VN')} 
                                            đ</TableCell>
                                        <TableCell className="text-center">{item.usageQuantity}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default VoucherStatisticsModal;