import { CheckCircle2 } from "lucide-react";

export const RequirementItem = ({ met, text }) => (
    <div className="flex items-center gap-2">
        <CheckCircle2
            className={`h-4 w-4 transition-colors duration-200 ${met ? "text-green-500 fill-green-500 text-white" : "text-slate-300"
                }`}
        />
        <span className={`text-xs transition-colors duration-200 ${met ? "text-slate-700 font-medium" : "text-slate-500"
            }`}>
            {text}
        </span>
    </div>
);