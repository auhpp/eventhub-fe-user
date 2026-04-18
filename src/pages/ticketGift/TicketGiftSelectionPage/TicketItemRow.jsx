import React, { useContext } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { User, CheckCircle2, Gift } from "lucide-react";
import { AttendeeStatus, SourceType } from '@/utils/constant';
import { isAttendeeUnusable } from '@/utils/attendeeUtils';
import { AuthContext } from '@/context/AuthContex';
import { isExpiredEventSession } from '@/utils/eventUtils';

const TicketItemRow = ({ attendee, isSelected, onToggle }) => {
    const isGifted = attendee.sourceType === SourceType.GIFT;
    const isUnusable = isAttendeeUnusable({ attendee: attendee })
    const isTransferable = attendee.sourceType === SourceType.PURCHASE && !isGifted && !isUnusable;
    const { user } = useContext(AuthContext)

    const isEventExpired = isExpiredEventSession({ eventSession: attendee.eventSession });
    const isCheckedIn = attendee.status === AttendeeStatus.CHECKED_IN.key;
    const isCancelled = attendee.status === AttendeeStatus.CANCELLED_BY_EVENT.key ||
        attendee.status === AttendeeStatus.CANCELLED_BY_USER.key;

    let overlayText = "";
    if (isGifted) overlayText = "Đã tặng";
    else if (isCancelled) overlayText = "Đã hủy";
    else if (isCheckedIn) overlayText = "Đã check-in";
    else if (isEventExpired) overlayText = "Đã kết thúc";

    const handleRowClick = () => {
        if (isTransferable) {
            onToggle(attendee.id);
        }
    };

    return (
        <div
            onClick={handleRowClick}
            className={`
                group relative flex items-center justify-between 
                p-3 rounded-lg border transition-all duration-200 select-none
                ${isSelected
                    ? 'border-brand bg-brand/5 ring-1 ring-brand/20'
                    : 'border-gray-200 bg-white hover:border-brand/40 hover:shadow-sm'
                }
                ${!isTransferable && !isGifted && 'opacity-60 bg-gray-50 cursor-not-allowed border-gray-100'}
                ${isGifted && 'opacity-75 bg-gray-50/80 border-dashed border-gray-300 cursor-default'}
            `}
        >
            <div className="flex items-center gap-3 overflow-hidden">
                {/* Checkbox Area */}
                <div className="flex items-center justify-center w-5 h-5 shrink-0">
                    {!isGifted && (
                        <Checkbox
                            checked={isSelected}
                            disabled={!isTransferable}
                            className={`
                                w-4 h-4 rounded-sm border-gray-300
                                data-[state=checked]:bg-brand data-[state=checked]:border-brand
                                ${!isTransferable && 'data-[state=unchecked]:bg-gray-100'}
                            `}
                        />
                    )}
                    {isGifted && <Gift className="w-4 h-4 text-gray-400" />}
                </div>

                {/* Info Area */}
                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        {isGifted &&
                            <>
                                <span className="text-sm font-semibold
                                 text-gray-500 italic flex items-center gap-1.5">
                                    Vé {overlayText.toLowerCase()}
                                </span>
                            </>
                        }
                    </div>

                    <div className="flex items-center gap-1.5 text-sm text-gray-500 truncate">
                        <User className="w-3 h-3" />
                        <span className="truncate max-w-[150px] sm:max-w-[300px]">
                            {isGifted && (attendee.owner.email != user.email) ? attendee.owner.email : "Chưa định danh"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Status Badge / Check Indicator */}
            <div className="pl-2 shrink-0">
                {isGifted ? (
                    <Badge variant="outline" className="text-xs h-5 px-2 
                    bg-gray-100 text-gray-700 border-gray-200 font-normal">
                        {overlayText}
                    </Badge>
                ) : (
                    isTransferable ? (
                        isSelected ? (
                            <CheckCircle2 className="w-5 h-5 text-brand" />
                        ) : (
                            <div className="w-5 h-5 rounded-full border border-gray-200 group-hover:border-brand/30"></div>
                        )
                    ) : (
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-gray-100 text-gray-400 font-normal">
                            {attendee.status}
                        </Badge>
                    )
                )}
            </div>

        </div>
    );
};

export default TicketItemRow;