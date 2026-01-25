import React, { useEffect, useState } from 'react';
import {
    ArrowLeft,
    Calendar,
    CreditCard,
    Download,
    Mail,
    Phone,
    QrCode,
    Ticket,
    User,
    Wallet,
    CheckCircle2,
    Clock,
    XCircle,
    Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getBookingById } from '@/services/bookingService';
import { useNavigate, useParams } from 'react-router-dom';
import { HttpStatusCode } from 'axios';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/format';


const StatusBadge = ({ status }) => {
    const styles = {
        PAID: "bg-green-100 text-green-700 border-green-200 hover:bg-green-100",
        PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
        CANCELLED: "bg-red-100 text-red-700 border-red-200 hover:bg-red-100",
    };

    const labels = {
        PAID: "Thành công",
        PENDING: "Chờ thanh toán",
        CANCELLED: "Đã hủy",
    };

    return (
        <Badge className={`${styles[status] || styles.PENDING} border px-3 py-1`}>
            {status === 'SUCCESS' && <CheckCircle2 className="w-3 h-3 mr-1" />}
            {status === 'PENDING' && <Clock className="w-3 h-3 mr-1" />}
            {status === 'CANCELLED' && <XCircle className="w-3 h-3 mr-1" />}
            {labels[status] || status}
        </Badge>
    );
};

const WalletInfo = ({ type }) => {
    if (type === 'MOMO') return <div className="flex items-center gap-2 font-medium text-pink-600"><Wallet className="w-4 h-4" /> Ví MoMo</div>;
    if (type === 'VNPay') return <div className="flex items-center gap-2 font-medium text-blue-600"><QrCode className="w-4 h-4" /> VNPAY QR</div>;
    return <div className="flex items-center gap-2 font-medium text-gray-700"><CreditCard className="w-4 h-4" /> Thẻ tín dụng/ATM</div>;
};

const OrderDetailPage = () => {
    const [booking, setBooking] = useState(null);
    const { id } = useParams();
    const [selectedTickets, setSelectedTickets] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchBookingById = async () => {
            try {
                const response = await getBookingById({ id: id })
                if (response.code === HttpStatusCode.Ok) {
                    setBooking(response.result)
                    var mapTicket = {};
                    response.result.attendees.forEach(attendee => {
                        var oldQuantity = mapTicket[attendee.ticket.id]?.quantity ? mapTicket[attendee.ticket.id].quantity : 0
                        mapTicket[attendee.ticket.id] = {
                            ...attendee.ticket,
                            quantity: oldQuantity + 1
                        }
                        mapTicket[attendee.ticket.id].ticketCode = attendee.ticketCode
                    });
                    setSelectedTickets(
                        Object.keys(mapTicket).map(
                            (key) => mapTicket[key]
                        ))
                }
            } catch (error) {
                console.log(error)
            }
        }
        fetchBookingById()
    }, [id])

    if (!booking || !selectedTickets) {
        return (
            <div className="flex justify-center items-center h-screen w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }
    return (
        <div className="min-h-screen bg-gray-50/50 font-sans text-slate-900">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* --- PAGE HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <Button variant="ghost" className="pl-0 text-slate-500 hover:text-primary mb-2" onClick={() => navigate(-1)}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
                        </Button>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-900">
                                Đơn hàng #{booking.id}
                            </h1>
                            <StatusBadge status={booking.status} />
                        </div>
                        <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Ngày đặt: {formatDateTime(booking.createdAt)}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" className="gap-2">
                            <Download className="w-4 h-4" /> Xuất hóa đơn
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                            <Mail className="w-4 h-4" /> Gửi lại vé
                        </Button>
                    </div>
                </div>

                {/* --- CUSTOMER INFO CARD --- */}
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="pb-2 border-b border-slate-100">
                        <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <User className="w-4 h-4" /> Thông tin người mua
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <p className="text-xs text-slate-500 mb-1 font-medium">Họ và tên</p>
                                <p className="text-base font-semibold text-slate-900">{booking.customerName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1 font-medium">Số điện thoại</p>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                                    <p className="text-base font-semibold text-slate-900">{booking.customerPhone}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1 font-medium">Email</p>
                                <div className="flex items-center gap-2">
                                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                                    <p className="text-base font-semibold text-slate-900">{booking.customerEmail}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* --- TICKET LIST --- */}
                <Card className="shadow-sm border-slate-200 overflow-hidden">
                    <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
                        <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <Ticket className="w-4 h-4" /> Danh sách vé ({booking.attendees?.length || 0})
                        </CardTitle>
                    </CardHeader>
                    <div className="overflow-x-auto px-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[300px]">Loại vé / Sự kiện</TableHead>
                                    {/* <TableHead>Mã vé (Check-in)</TableHead> */}
                                    <TableHead className="text-right">Đơn giá</TableHead>
                                    <TableHead className="text-center">SL</TableHead>
                                    <TableHead className="text-right">Thành tiền</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedTickets.map((ticket) => (
                                    <TableRow key={ticket.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-900">{ticket?.name}</span>
                                                {/* <span className="text-xs text-slate-500 mt-0.5">{booking.event?.name}</span> */}
                                            </div>
                                        </TableCell>
                                        {/* <TableCell>
                                            <Badge variant="outline" className="font-mono text-slate-600 bg-slate-50">
                                                {ticket.ticketCode}
                                            </Badge>
                                        </TableCell> */}
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(ticket?.price)}
                                        </TableCell>
                                        <TableCell className="text-center">                                            {ticket.quantity}
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-slate-900">
                                            {formatCurrency(ticket?.price * ticket.quantity)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Card>

                {/* --- BOTTOM SECTION: PAYMENT INFO & SUMMARY --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Left: Payment Method & History */}
                    <Card className="shadow-sm border-slate-200 flex flex-col h-full">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <CreditCard className="w-4 h-4" /> Thông tin thanh toán
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-4 flex-1">
                            <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-200">
                                <span className="text-sm text-slate-500">Phương thức</span>
                                <WalletInfo type={booking.walletType} />
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-200">
                                <span className="text-sm text-slate-500">Mã giao dịch</span>
                                <span className="text-sm font-mono font-medium text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                                    {booking.transactionId}
                                </span>
                            </div>

                            {/* Timeline đơn giản */}
                            <div className="bg-slate-50 p-4 rounded-lg mt-4 border border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-3">Lịch sử giao dịch</p>
                                <div className="relative pl-4 border-l-2 border-green-200">
                                    <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white shadow-sm"></div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">Thanh toán thành công</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{formatDate(booking.createdAt)}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right: Payment Details (Summary) */}
                    <Card className="shadow-sm border-slate-200 bg-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <Wallet className="w-4 h-4" /> Chi tiết thanh toán
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Tạm tính ({booking.attendees?.length} vé)</span>
                                <span className="font-medium text-slate-900">{formatCurrency(booking.totalAmount)}</span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Phí dịch vụ</span>
                                <span className="font-medium text-slate-900">0 ₫</span>
                            </div>

                            {booking.discountAmount > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span className="flex items-center gap-1">
                                        <Ticket className="w-3 h-3" /> Voucher / Giảm giá
                                    </span>
                                    <span className="font-medium">-{formatCurrency(booking.discountAmount)}</span>
                                </div>
                            )}

                            <Separator className="my-2" />

                            <div className="flex justify-between items-center">
                                <span className="text-base font-bold text-slate-900">Tổng tiền</span>
                                <span className="text-xl font-bold text-blue-600">
                                    {formatCurrency(booking.finalAmount)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
};

export default OrderDetailPage;