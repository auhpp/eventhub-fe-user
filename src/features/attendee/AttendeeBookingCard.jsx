import React, { useState } from "react";
import AttendeeStatusBadge from "@/components/AttendeeStatusBadge";
import AttendeeTypeBadges from "@/components/AttendeeTypeBadges";
import BookingStatusBadge from "@/components/BookingStatusBadge";
import SourceTypeBadge from "@/components/SourceTypeBadge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ActionType, AttendeeStatus, SourceType } from "@/utils/constant";
import { formatDateTime } from "@/utils/format";
import { CalendarCheck, CheckCircle, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import CheckInHistoryModal from "./CheckInHistoryModal";
import { isToTimeCheckIn } from "@/utils/eventUtils";

const AttendeeBookingCard = ({ booking, onCheckInClick, isSessionEnded, eventSession }) => {
    const attendees = booking.attendees || [];
    const [selectedAttendeeForHistory, setSelectedAttendeeForHistory] = useState(null);

    return (
        <>
            <Card className="overflow-hidden border shadow-sm">
                <CardHeader className="p-4 bg-white border-b flex flex-row items-center justify-between">
                    {
                        booking.sourceType == SourceType.PURCHASE ? (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-sm bg-muted px-2 py-0.5 rounded">
                                        #{booking.transactionId?.substring(0, 8) || booking.id}
                                    </span>
                                    <BookingStatusBadge status={booking.status} />
                                    <AttendeeTypeBadges bookings={[booking]} />
                                </div>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <CalendarCheck size={14} /> <span>
                                        {formatDateTime(booking.createdAt)}
                                    </span>
                                </p>
                            </div>
                        ) : (
                            <>
                                <SourceTypeBadge sourceType={booking.sourceType} />
                                {
                                    booking.sourceType == SourceType.GIFT && (
                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                            <span>Người tặng:</span> {booking.giver.email}
                                        </p>
                                    )
                                }
                            </>
                        )
                    }
                </CardHeader>

                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableHead className="h-9 text-xs w-[35%]">Loại vé</TableHead>
                                <TableHead className="h-9 text-xs text-center">Trạng thái</TableHead>
                                <TableHead className="h-9 text-xs text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {attendees.map((attendee) => {
                                const hasPermission = (attendee.owner && booking.appUser && booking.appUser.id == attendee.owner.id) || booking.sourceType == SourceType.INVITATION;


                                const canCheckIn = hasPermission && !isSessionEnded
                                    && (attendee.status === AttendeeStatus.VALID.key ||
                                        attendee.status === AttendeeStatus.OUTSIDE.key)
                                    && eventSession && isToTimeCheckIn({ checkinStartTime: eventSession.checkinStartTime });

                                const canCheckOut = hasPermission && !isSessionEnded &&
                                    attendee.status === AttendeeStatus.CHECKED_IN.key
                                    && eventSession && isToTimeCheckIn({ checkinStartTime: eventSession.checkinStartTime });


                                return (
                                    <TableRow key={attendee.id}>
                                        <TableCell className="py-3">
                                            <div className="font-medium text-sm flex items-center gap-2">
                                                {attendee.ticket?.name}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3 text-center">
                                            {
                                                attendee.sourceType == SourceType.GIFT &&
                                                    booking.sourceType == SourceType.PURCHASE ? (
                                                    <div className="flex flex-col items-center">
                                                        <SourceTypeBadge sourceType={SourceType.GIFT} isSender={true} />
                                                        {
                                                            booking.sourceType == SourceType.PURCHASE && (
                                                                <p className="text-[11px] text-gray-500 mt-1 text-center">
                                                                    <span>Đã tặng:</span> {attendee.owner?.email || "Khách"}
                                                                </p>
                                                            )
                                                        }
                                                    </div>
                                                ) : (
                                                    <AttendeeStatusBadge status={attendee.status} />
                                                )
                                            }
                                            {
                                                attendee.status === AttendeeStatus.CHECKED_IN.key && attendee.checkInAt && (
                                                    <div className="text-[10px] text-green-600 mt-1 font-medium">
                                                        Lần vào cuối: {formatDateTime(attendee.checkInAt).split(' ')[1]}
                                                    </div>
                                                )
                                            }
                                        </TableCell>

                                        <TableCell className="py-3 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">

                                                    {canCheckIn &&
                                                        attendee.status !== AttendeeStatus.CANCELLED_BY_EVENT.key && (
                                                            <DropdownMenuItem
                                                                className="cursor-pointer text-green-600 focus:text-green-700"
                                                                onClick={() => onCheckInClick &&
                                                                    onCheckInClick(attendee, ActionType.IN)}
                                                            >
                                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                                Check-in (Vào)
                                                            </DropdownMenuItem>
                                                        )}

                                                    {canCheckOut &&
                                                        attendee.status !== AttendeeStatus.CANCELLED_BY_EVENT.key && (
                                                            <DropdownMenuItem
                                                                className="cursor-pointer text-orange-600 focus:text-orange-700"
                                                                onClick={() => onCheckInClick &&
                                                                    onCheckInClick(attendee, ActionType.OUT)}
                                                            >
                                                                Check-out (Ra)
                                                            </DropdownMenuItem>
                                                        )}

                                                    <DropdownMenuItem
                                                        className="cursor-pointer"
                                                        onClick={() => setSelectedAttendeeForHistory(attendee)}
                                                    >
                                                        Lịch sử điểm danh
                                                    </DropdownMenuItem>

                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <CheckInHistoryModal
                isOpen={!!selectedAttendeeForHistory}
                onClose={() => setSelectedAttendeeForHistory(null)}
                attendee={selectedAttendeeForHistory}
            />
        </>
    );
};

export default AttendeeBookingCard;