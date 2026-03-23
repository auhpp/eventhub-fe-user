import AttendeeStatusBadge from "@/components/AttendeeStatusBadge";
import { AttendeeStatus } from "@/utils/constant";

const ResaleTicketCard = ({ attendee }) => {
    const { ticket, status } = attendee;

    const isSold = status === AttendeeStatus.RESOLD.key;

    return (
        <div className={`relative bg-white rounded-lg shadow-sm border flex flex-col transition-all 
            ${isSold ? 'border-green-200 opacity-90 bg-green-50/30' : 'border-slate-200 hover:shadow-md'}`}>

            {/* Top part*/}
            <div className="p-4 pb-2 rounded-t-2xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loại vé</span>
                    <AttendeeStatusBadge status={status} />
                </div>
                <div className="text-md font-bold text-slate-800 uppercase mb-3">
                    {ticket?.name || "Vé thường"}
                </div>
            </div>

            {/*  Dotted line for tearing tickets */}
            {/* <div className="relative flex items-center h-6 bg-transparent">
                <div className="absolute -left-3 w-6 h-6 border-r border-slate-300 rounded-full z-10 bg-gray-50"></div>
                <div className="w-full border-t-2 border-dashed border-slate-200 mx-4"></div>
                <div className="absolute -right-3 w-6 h-6 border-l border-slate-300 rounded-full z-10 bg-gray-50"></div>
            </div> */}

            {/* bottom part */}

        </div>
    );
};

export default ResaleTicketCard