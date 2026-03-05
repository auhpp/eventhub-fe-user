import { Badge } from "@/components/ui/badge";
import { SourceType } from "@/utils/constant";

const SourceTypeBadge = ({ sourceType, isSender = false }) => {

    switch (sourceType) {
        case SourceType.GIFT:
            return <Badge className="bg-green-50 text-green-700
             hover:bg-green-100 ring-1 ring-green-600/20 shadow-none">
                {isSender ? 'Đã tặng' : 'Được tặng'}
            </Badge>;
        case SourceType.INVITATION:
            return <Badge className="bg-yellow-50 text-yellow-800 hover:bg-yellow-100 ring-1 
            ring-yellow-600/20 shadow-none">Được mời</Badge>;
        default:
            return null;
    }
};

export default SourceTypeBadge;