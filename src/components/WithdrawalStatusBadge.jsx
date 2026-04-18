import { Badge } from "@/components/ui/badge";
import { WithdrawalStatus } from "@/utils/constant";

const WithdrawalStatusBadge = ({ status }) => {
    switch (status) {
        case WithdrawalStatus.PENDING:
            return (
                <Badge className="border-transparent bg-yellow-50 text-yellow-700 hover:bg-yellow-100 ring-1 ring-yellow-600/20 shadow-none">
                    Chờ duyệt
                </Badge>
            );
        case WithdrawalStatus.PROCESSING:
            return (
                <Badge className="border-transparent bg-blue-50 text-blue-700 hover:bg-blue-100 ring-1 ring-blue-600/20 shadow-none">
                    Đang xử lý
                </Badge>
            );
        case WithdrawalStatus.COMPLETED:
            return (
                <Badge className="border-transparent bg-emerald-50 text-emerald-700 hover:bg-emerald-100 ring-1 ring-emerald-600/20 shadow-none">
                    Thành công
                </Badge>
            );
        case WithdrawalStatus.REJECTED:
            return (
                <Badge className="border-transparent bg-red-50 text-red-700 hover:bg-red-100 ring-1 ring-red-600/20 shadow-none">
                    Bị từ chối
                </Badge>
            );
        case WithdrawalStatus.CANCELLED:
            return (
                <Badge className="border-transparent bg-slate-100 text-slate-700 hover:bg-slate-200 ring-1 ring-slate-500/10 shadow-none">
                    Đã hủy
                </Badge>
            );
        default:
            return (
                <Badge className="border-transparent bg-slate-100 text-slate-600 ring-1 ring-slate-500/10 shadow-none">
                    {status || 'Không rõ'}
                </Badge>
            );
    }
};

export default WithdrawalStatusBadge;
