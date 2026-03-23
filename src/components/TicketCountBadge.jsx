import { Ticket } from "lucide-react";

const TicketCountBadge = ({ ticketCount }) => {
    return (
        <div className={`flex items-center gap-1.5 font-medium px-2.5 py-1 rounded-md
                                 shrink-0 text-slate-700 bg-slate-100`}>
            <Ticket className="w-4 h-4" />
            {ticketCount} vé
        </div>
    )
}

export default TicketCountBadge;