import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"; 
import { formatCurrency } from "@/utils/format";
import { Info } from "lucide-react";

const RevenueDetailsModal = ({ isOpen, onClose, data, event }) => {
    const handleOpenChange = (open) => {
        if (!open) {
            onClose();
        }
    };

    const totalRevenue = data?.totalRevenue || 0;
    const discountAmount = data?.discountAmount || 0;
    const totalFee = data?.totalFee || 0;
    const netRevenue = totalRevenue - discountAmount;
    const finalIncome = netRevenue - totalFee;

    const commissionRate = event?.commissionRate || 0;
    const commissionFixed = event?.commissionFixedPerTicket || 0;

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="p-2 overflow-hidden max-w-lg gap-0 bg-white"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <DialogHeader className="p-4 border-b border-gray-100 bg-gray-50 m-0">
                    <DialogTitle className="font-semibold text-gray-800 text-left">
                        Chi tiết doanh thu
                    </DialogTitle>
                </DialogHeader>

                <div className="p-0">
                    <table className="w-full text-md text-left text-black-600">
                        <tbody>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <td className="p-4 pl-6 flex items-center gap-1">
                                    Doanh thu trước khuyến mãi 
                                </td>
                                <td className="p-4 text-right">{formatCurrency(totalRevenue)}</td>
                            </tr>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <td className="p-4 pl-6 flex items-center gap-1">
                                    Khuyến mãi 
                                </td>
                                <td className="p-4 text-right">{formatCurrency(discountAmount)}</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                                <td className="p-4 font-semibold text-gray-800">Tổng doanh thu</td>
                                <td className="p-4 text-right text-red-600 font-semibold text-lg">
                                    {formatCurrency(netRevenue)}
                                </td>
                            </tr>

                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <td className="p-4 pl-6 flex items-center gap-1">
                                    Phí dịch vụ
                                    <TooltipProvider delayDuration={100}>
                                        <Tooltip>
                                            <TooltipTrigger className="cursor-help flex items-center outline-none">
                                                <Info size={14} className="text-gray-400 hover:text-gray-600 transition-colors" />
                                            </TooltipTrigger>
                                            <TooltipContent
                                                side="right"
                                                className="bg-zinc-900 text-white border-none text-xs px-3 py-1.5"
                                            >
                                                Mức phí: {commissionRate}% + {commissionFixed} VND/vé
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </td>
                                <td className="p-4 text-right">{formatCurrency(totalFee)}</td>
                            </tr>
                            {/* ------------------------------------------ */}

                            <tr className="border-b border-gray-100">
                                <td className="p-4 font-semibold text-gray-800">Thực nhận</td>
                                <td className="p-4 text-right text-red-600 font-semibold text-lg">
                                    {formatCurrency(finalIncome)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default RevenueDetailsModal;