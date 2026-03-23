import { Badge } from "./ui/badge"

const ResalePostHasRetailBadge = ({ hasRetail }) => {
    return (
        <Badge variant="outline" className={`text-xs ${hasRetail ? 'bg-blue-50 text-blue-700 border-blue-200' :
            'bg-orange-50 text-orange-700 border-orange-200'}`}>
            {hasRetail ? "Bán lẻ" : "Không bán lẻ"}
        </Badge>
    )
}

export default ResalePostHasRetailBadge;