import React from 'react';
import TicketItemRow from './TicketItemRow';
import { Ticket } from "lucide-react";

const TicketGroup = ({ groupData, selectedIds, onToggleItem }) => {
    const { ticketInfo, items } = groupData;

    return (
        <div className="mb-6">
            {/* Header */}
            <div className="flex items-end justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-brand">
                        <Ticket className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800 text-sm md:text-base leading-tight">
                            {ticketInfo.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(ticketInfo.price)}
                        </p>
                    </div>
                </div>
                <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    SL: {items.length}
                </span>
            </div>

            {/* Grid ticket */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
                {items.map((attendee) => (
                    <TicketItemRow
                        key={attendee.id}
                        attendee={attendee}
                        isSelected={selectedIds.includes(attendee.id)}
                        onToggle={onToggleItem}
                    />
                ))}
            </div>
        </div>
    );
};

export default TicketGroup;