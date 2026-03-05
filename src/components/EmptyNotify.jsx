import { Filter } from "lucide-react"

const EmptyNotify = ({ title, subTitle }) => {
    return (
        <div className="text-center py-16 bg-muted/30 rounded-lg border border-dashed">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            {
                subTitle &&
                <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                    {subTitle}
                </p>
            }
        </div>
    )
}
export default EmptyNotify