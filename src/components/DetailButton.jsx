import { ArrowRight } from "lucide-react"
import { Button } from "./ui/button"

const DetailButton = ({ onClick }) => {
    return (
        <>
            <Button
                variant="default"
                size="sm"
                className="gap-2 font-medium bg-slate-900 hover:bg-slate-800 text-white 
                                shadow-sm flex-1 sm:flex-none"
                onClick={onClick}
            >
                Chi tiết <ArrowRight className="w-4 h-4" />
            </Button>
        </>
    )
}

export default DetailButton