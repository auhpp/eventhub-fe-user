import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { getCouponReportDetail } from '@/services/couponService';
import { formatCurrency } from '@/utils/format';
import { CardDescription } from '@/components/ui/card';

const VoucherStatisticsModal = ({ isOpen, onClose, voucher }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState();

    // State for Modal 2 

    useEffect(() => {
        if (isOpen && voucher) {
            fetchStatistics();
        }
    }, [isOpen, voucher]);

    const fetchStatistics = async () => {
        setIsLoading(true);
        try {
            const res = await getCouponReportDetail(voucher.id);
            const data = res.result;

            setData(data);
        } catch (error) {
            console.log(error)
            toast.error("Không thể tải dữ liệu thống kê.");
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <>
            {/* Modal 1 */}
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl bg-slate-50">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Thống kê voucher: {voucher?.code}</DialogTitle>
                        <CardDescription className="text-lg"> {voucher?.name}</CardDescription>

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
                                        {data?.totalQuantity || 'Không giới hạn'}
                                    </span>
                                </div>
                                <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-col justify-center">
                                    <span className="text-sm text-muted-foreground mb-1">Tổng số vé đã dùng</span>
                                    <span className="text-2xl font-semibold">{data?.usageQuantity}</span>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-col justify-center">
                                <span className="text-sm text-muted-foreground mb-1">Tổng số tiền đã dùng</span>
                                <span className="text-2xl text-red-600 font-semibold">{
                                    data?.totalUsageMoney && formatCurrency(data.totalUsageMoney)}</span>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>


        </>
    );
};

export default VoucherStatisticsModal;