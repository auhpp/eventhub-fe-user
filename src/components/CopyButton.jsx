import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Check, Copy } from "lucide-react";


const CopyButton = ({ text }) => {
    const [copied, setCopied] = useState(false);
    const onCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Đã sao chép mã vé!");
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <Button variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={onCopy}>
            {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} className="text-muted-foreground" />}
        </Button>
    )
}

export default CopyButton

