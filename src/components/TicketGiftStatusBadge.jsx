import { TicketGiftStatus } from "@/utils/constant";

const TicketGiftStatusBadge = ({ status, isExpired }) => {
    const getStatusInfo = () => {
        if (isExpired) {
            return {
                label: 'Đã hết hạn',
                className: 'text-gray-500 bg-gray-100 border-gray-200',
            };
        }

        switch (status) {
            case TicketGiftStatus.PENDING:
                return {
                    label: 'Đang chờ nhận',
                    className: 'text-orange-600 bg-orange-50 border-orange-100',
                };
            case TicketGiftStatus.EXPIRED:
                return {
                    label: 'Đã hết hạn',
                    className: 'text-gray-500 bg-gray-100 border-gray-200',
                };
            case TicketGiftStatus.ACCEPTED:
                return {
                    label: 'Đã nhận vé',
                    className: 'text-green-600 bg-green-50 border-green-100',
                };
            case TicketGiftStatus.REJECTED:
                return {
                    label: 'Đã từ chối',
                    className: 'text-red-600 bg-red-50 border-red-100',
                };
            case TicketGiftStatus.REVOKED:
                return {
                    label: 'Đã thu hồi',
                    className: 'text-gray-600 bg-gray-100 border-gray-200',
                };
            default:
                return {
                    label: status,
                    className: 'bg-gray-100 text-gray-600',
                };
        }
    };
    const statusInfo = getStatusInfo();
    return (
        <>
            <div className={`ml-auto px-3 py-1.5 rounded-md text-xs font-medium border flex items-center gap-1.5 
                ${statusInfo.className}`}>
                {statusInfo.label}
            </div>
        </>
    )
}

export default TicketGiftStatusBadge