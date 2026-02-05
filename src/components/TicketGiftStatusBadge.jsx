import { TicketGiftStatus } from "@/utils/constant";
import { AlertCircle, Ban, CheckCircle2, Clock, XCircle } from "lucide-react";

const TicketGiftStatusBadge = ({ status, isExpired }) => {
    const getStatusInfo = () => {
        if (isExpired) {
            return {
                label: 'Đã hết hạn',
                className: 'text-gray-500 bg-gray-100 border-gray-200',
                icon: AlertCircle
            };
        }

        switch (status) {
            case TicketGiftStatus.PENDING:
                return {
                    label: 'Đang chờ nhận',
                    className: 'text-orange-600 bg-orange-50 border-orange-100',
                    icon: Clock
                };
            case TicketGiftStatus.EXPIRED:
                return {
                    label: 'Đã hết hạn',
                    className: 'text-gray-500 bg-gray-100 border-gray-200',
                    icon: AlertCircle
                };
            case TicketGiftStatus.ACCEPTED:
                return {
                    label: 'Đã nhận vé',
                    className: 'text-green-600 bg-green-50 border-green-100',
                    icon: CheckCircle2
                };
            case TicketGiftStatus.REJECTED:
                return {
                    label: 'Đã từ chối',
                    className: 'text-red-600 bg-red-50 border-red-100',
                    icon: XCircle
                };
            case TicketGiftStatus.REVOKED:
                return {
                    label: 'Đã thu hồi',
                    className: 'text-gray-600 bg-gray-100 border-gray-200',
                    icon: Ban
                };
            default:
                return {
                    label: status,
                    className: 'bg-gray-100 text-gray-600',
                    icon: Clock
                };
        }
    };
    const statusInfo = getStatusInfo();
    const StatusIcon = statusInfo.icon;
    return (
        <>
            <div className={`ml-auto px-3 py-1.5 rounded-md text-xs font-medium border flex items-center gap-1.5 
                ${statusInfo.className}`}>
                {StatusIcon && <StatusIcon className="w-3.5 h-3.5" />}
                {statusInfo.label}
            </div>
        </>
    )
}

export default TicketGiftStatusBadge