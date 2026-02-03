import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/format";
import { Edit2, Ticket, Trash2 } from "lucide-react";

const TicketEditItem = ({ ticket, openEditTicketModal, handleRemoveTicket, expiredEventSession }) => {
    return (
        <div key={ticket.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border bg-white shadow-sm hover:border-blue-300 transition-colors group">
            <div className="flex items-center gap-3 mb-2 sm:mb-0">
                <div className="size-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <Ticket className="size-5" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{ticket.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground font-medium mt-0.5">{
                        formatCurrency(ticket.price)}</div>
                </div>
            </div>
            <div className="flex gap-1">
                <div className="flex gap-1">
                    <Button
                        variant="ghost" size="icon" type="button"
                        className="h-8 w-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-50"
                        onClick={openEditTicketModal}
                    >
                        <Edit2 className="size-4" />
                    </Button>
                    {
                        !expiredEventSession &&
                        <Button
                            variant="ghost" size="icon" type="button"
                            className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                            onClick={handleRemoveTicket}                                                    >
                            <Trash2 className="size-4" />
                        </Button>
                    }
                </div>
            </div>
        </div>
    )
}

export default TicketEditItem;