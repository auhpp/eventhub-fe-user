import { Badge } from "@/components/ui/badge";
import { QuestionStatus } from "@/utils/constant";

const QuestionStatusBadge = ({ status }) => {
    switch (status) {
        case QuestionStatus.PENDING:
            return (
                <Badge className="bg-amber-100 text-amber-700 border-none hover:bg-amber-100 text-xs">
                    Đang chờ duyệt
                </Badge>
            );
        case QuestionStatus.REJECTED:
            return (
                <Badge variant="destructive" className="text-xs">
                    Bị từ chối
                </Badge>
            );
        case QuestionStatus.REPLYING:
            return (
                <Badge className="bg-blue-600 text-white border-none hover:bg-blue-700 text-[10px] uppercase font-bold animate-pulse">
                    Đang trả lời
                </Badge>
            );
        case QuestionStatus.PINNED:
            return (
                <Badge className="bg-indigo-500 text-white border-none hover:bg-indigo-600 text-[10px] uppercase font-bold">
                    Được ghim
                </Badge>
            );
        case QuestionStatus.RESOLVED:
            return (
                <Badge variant="secondary" className="uppercase text-[10px]">
                    Đã trả lời xong
                </Badge>
            );
        default:
            return null;
    }
};

export default QuestionStatusBadge;
