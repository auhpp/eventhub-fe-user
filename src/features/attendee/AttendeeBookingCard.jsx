import AttendeeStatusBadge from "@/components/AttendeeStatusBadge";
import AttendeeTypeBadges from "@/components/AttendeeTypeBadges";
import CopyButton from "@/components/CopyButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { CalendarCheck, QrCode } from "lucide-react";

const AttendeeBookingCard = ({ booking }) => {
    const attendees = booking.attendees || [];

    return (
        <Card className="overflow-hidden border shadow-sm">
            <CardHeader className="p-4 bg-white border-b flex flex-row items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm bg-muted px-2 py-0.5 rounded">
                            #{booking.transactionId?.substring(0, 8) || booking.id}
                        </span>
                        <Badge variant="outline">{booking.status}</Badge>
                        <AttendeeTypeBadges bookings={[booking]} />

                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <CalendarCheck size={12} /> {formatDateTime(booking.createdAt)}
                    </p>
                </div>
                <div className="text-right">
                    <div className="font-bold text-primary">{formatCurrency(booking.finalAmount)}</div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableHead className="h-9 text-xs w-[40%]">Loại vé</TableHead>
                            <TableHead className="h-9 text-xs">Mã vé (Check-in)</TableHead>
                            <TableHead className="h-9 text-xs text-right">Trạng thái</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {attendees.map((attendee) => (
                            <TableRow key={attendee.id}>
                                <TableCell className="py-3">
                                    <div className="flex flex-col gap-1">
                                        <div className="font-medium text-sm flex items-center gap-2">
                                            {attendee.ticket?.name}
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {formatCurrency(attendee.ticket?.price)}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-3">
                                    <div className="flex items-center gap-1 font-mono text-sm bg-muted/50 pl-2 pr-1 py-1 rounded w-fit border">
                                        <QrCode size={14} className="text-muted-foreground" />
                                        {attendee.ticketCode}
                                        <CopyButton text={attendee.ticketCode} />
                                    </div>
                                    {attendee.checkInAt && (
                                        <div className="text-[10px] text-green-600 mt-1 font-medium">
                                            Check-in: {formatDateTime(attendee.checkInAt).split(' ')[1]}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="py-3 text-right">
                                    <AttendeeStatusBadge status={attendee.status} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default AttendeeBookingCard;