import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

const ButtonBack = () => {
    const navigate = useNavigate()
    return (
        <Button variant="outline" size="icon"
            onClick={() => navigate(-1)}
            className="h-9 w-9 shrink-0">
            <ArrowLeft size={16} />
        </Button>
    )
}

export default ButtonBack;