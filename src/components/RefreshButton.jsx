import { RefreshCw } from "lucide-react"
import { Button } from "./ui/button"

const RefreshButton = ({ onClick, isLoading }) => {
    return (
        <Button
            onClick={onClick}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 
            text-sm font-medium text-gray-700 bg-white border
             border-gray-300 rounded-md hover:bg-gray-50 
              disabled:opacity-50"
        >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
    )
}

export default RefreshButton