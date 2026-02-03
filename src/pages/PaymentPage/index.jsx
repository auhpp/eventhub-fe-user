import React, { useState, useEffect, useContext } from 'react';
import { ArrowLeft, Clock, User, Mail, Phone, Tag, ShieldCheck, CheckCircle2, QrCode, Loader2, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import OrderSummary from '@/features/event/BookingSummary';
import { deleteBookingById, getBookingById } from '@/services/bookingService';
import { HttpStatusCode } from 'axios';
import { getEventSessionById } from '@/services/eventSessionService';
import { getEventById } from '@/services/eventService';
import { createSearchParams, useNavigate, useParams } from 'react-router-dom';
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { routes } from '@/config/routes';
import { AuthContext } from '@/context/AuthContex';
import { createPaymentUrl } from '@/services/paymentService';
import { WalletType } from '@/utils/constant';
import logoVnpay from "@/assets/images/vnpay_logo.png";

const PaymentPage = () => {
    const [timeLeft, setTimeLeft] = useState(0);
    const [useProfile, setUseProfile] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState(WalletType.VNPay);
    const [booking, setBooking] = useState(null);
    const { eventId, eventSessionId, bookingId } = useParams();
    const [event, setEvent] = useState(null);
    const [eventSession, setEventSession] = useState(null);
    const [selectedTickets, setSelectedTickets] = useState(null)
    const [showExitDialog, setShowExitDialog] = useState(false);
    const { user } = useContext(AuthContext)
    const navigate = useNavigate()
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchBookingById = async () => {
            try {
                const response = await getBookingById({ id: bookingId })
                if (response.code === HttpStatusCode.Ok) {
                    const expiredTime = new Date(response.result.expiredAt).getTime();
                    const currentTime = new Date().getTime();

                    const secondsRemaining = Math.floor((expiredTime - currentTime) / 1000);

                    setTimeLeft(secondsRemaining > 0 ? secondsRemaining : 0);
                    setBooking(response.result)
                    var mapTicket = {};
                    response.result.attendees.forEach(attendee => {
                        var oldQuantity = mapTicket[attendee.ticket.id]?.quantity ? mapTicket[attendee.ticket.id].quantity : 0
                        mapTicket[attendee.ticket.id] = { ...attendee.ticket, quantity: oldQuantity + 1 }
                    });
                    setSelectedTickets(
                        Object.keys(mapTicket).map(
                            (key) => mapTicket[key]
                        ))
                }
            } catch (error) {
                alert("Thời gian giữ vé đã hết. Vui lòng chọn lại vé!");
                const redirectUrl = routes.selectTicket
                    .replace(":eventId", eventId)
                    .replace(":eventSessionId", eventSessionId);

                navigate(redirectUrl, { replace: true });
                console.log(error)
            }
        }
        fetchBookingById()
    }, [bookingId, eventId, eventSessionId, navigate])

    useEffect(() => {
        const fetchEventById = async () => {
            try {
                const response = await getEventById({ id: eventId })
                if (response.code === HttpStatusCode.Ok) {
                    setEvent(response.result)
                }
            } catch (error) {
                console.log(error)
            }
        }
        fetchEventById()
    }, [eventId])


    useEffect(() => {
        const fetchEventSessionById = async () => {
            try {
                const response = await getEventSessionById({ id: eventSessionId })
                if (response.code === HttpStatusCode.Ok) {
                    setEventSession(response.result)
                }
            } catch (error) {
                console.log(error)
            }
        }
        fetchEventSessionById()
    }, [eventSessionId])


    // Form State
    const [formData, setFormData] = useState({
        fullname: user?.fullname || "",
        email: user.email,
        phone: user?.phoneNumber || "",
        note: ""
    });

    const validateForm = () => {
        let newErrors = {};
        let isValid = true;

        if (!formData.fullname.trim()) {
            newErrors.fullname = "Vui lòng nhập họ và tên";
            isValid = false;
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "Vui lòng nhập số điện thoại";
            isValid = false;
        } else if (!/(84|0[3|5|7|8|9])+([0-9]{8})\b/.test(formData.phone)) {
            newErrors.phone = "Số điện thoại không hợp lệ";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    useEffect(() => {
        if (!booking || !event || !eventSession) return;

        if (timeLeft <= 0) {
            alert("Thời gian giữ vé đã hết. Vui lòng chọn lại vé!");

            const redirectUrl = routes.selectTicket
                .replace(":eventId", event.id)
                .replace(":eventSessionId", eventSession.id);

            navigate(redirectUrl, { replace: true });
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(timerId);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft, booking, event, eventSession, navigate]);

    const formatTimeLeft = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    useEffect(() => {
        if (useProfile) {
            setFormData({
                fullname: user?.fullname || "",
                email: user.email,
                phone: user?.phoneNumber || ""
            });
            setErrors({});
        } else {
            setFormData(prev => ({
                ...prev,
                fullname: "",
                phone: ""
            }));
            setErrors({});
        }
    }, [useProfile, user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleBackClick = () => {
        setShowExitDialog(true);
    };

    const handleConfirmCancel = async () => {
        try {
            const response = await deleteBookingById({ id: bookingId });
            if (response.code == HttpStatusCode.Ok) {
                setShowExitDialog(false);
                const redirectUrl = routes.selectTicket
                    .replace(":eventId", event.id)
                    .replace(":eventSessionId", eventSession.id);

                navigate(redirectUrl, { replace: true });
            }
        } catch (error) {
            console.error("Lỗi khi hủy đơn", error);
        }
    };

    if (!event || !eventSession || !booking) {
        return (
            <div className="flex justify-center items-center h-screen w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }
    const totalAmount = selectedTickets.reduce((acc, item) => acc + (item.price * item.quantity), 0);


    const onSubmitPayment = async () => {
        if (!validateForm()) {
            return;
        }
        try {
            const bookingPaymentRequest = {
                customerName: formData.fullname,
                customerPhone: formData.phone,
                note: formData.note,
                walletType: paymentMethod
            }
            const response = await createPaymentUrl({ bookingId: bookingId, bookingPaymentRequest: bookingPaymentRequest })
            if (response.code == HttpStatusCode.Ok) {
                if (response.result != null && response.result != "") {
                    window.location.href = response.result
                }
                else {
                    navigate({
                        pathname: routes.paymentCallback,
                        search: createSearchParams({
                            bookingId: bookingId
                        }).toString(),
                    }, { replace: true });
                }
            }
        } catch (error) {
            console.log(error)
        }
    }


    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pb-12">
            <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
                <AlertDialogContent className="sm:max-w-[425px] rounded-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-center text-xl font-bold text-gray-900 pb-2">
                            Hủy đơn hàng?
                        </AlertDialogTitle>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-3">
                            <p className="font-medium text-center">Bạn có chắc chắn muốn tiếp tục?</p>
                            <ul className="list-disc pl-5 space-y-1 text-gray-500">
                                <li>Bạn sẽ mất vị trí mình đã lựa chọn.</li>
                                <li>Đơn hàng đang trong quá trình thanh toán hoặc đã thanh toán thành công cũng có thể bị huỷ.</li>
                            </ul>
                        </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-row gap-3 justify-center sm:justify-center mt-4 w-full">
                        <Button
                            variant="outline"
                            className="flex-1 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 font-semibold"
                            onClick={handleConfirmCancel}
                        >
                            Hủy đơn
                        </Button>

                        <Button
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold"
                            onClick={() => setShowExitDialog(false)}
                        >
                            Ở lại
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {/* --- Header Section --- */}
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex flex-col gap-1">
                        <button
                            onClick={handleBackClick}
                            className="flex items-center gap-2 text-primary font-medium text-sm hover:underline w-fit">
                            <ArrowLeft className="w-4 h-4" /> Quay lại chọn vé
                        </button>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">Thanh toán</h1>
                    </div>

                    {/* Countdown Badge */}
                    <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full border border-green-100 dark:border-green-800">
                        <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-bold text-green-700 dark:text-green-400">
                            Thời gian giữ vé: {formatTimeLeft(timeLeft)}
                        </span>
                    </div>
                </div>
            </div>

            {/* --- Main Content --- */}
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* LEFT COLUMN: Forms */}
                    <div className="flex-1 flex flex-col gap-6">

                        {/* 1. Ticket Review Section (Simplified) */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 opacity-80 hover:opacity-100 transition-all shadow-sm">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white shrink-0">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Danh sách vé</h2>
                                    <span className="hidden sm:block text-gray-300">|</span>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 hidden sm:block">
                                        {selectedTickets.length} x Vé đang chọn
                                    </p>
                                </div>
                                <Button
                                    onClick={handleBackClick}

                                    variant="link" className="text-primary font-bold">Thay đổi</Button>
                            </div>
                        </div>

                        {/* 2. User Information Form */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm relative overflow-hidden">
                            {/* Decorative Left Border */}
                            <div className="absolute left-0 top-6 bottom-6 w-1 bg-primary rounded-r-full"></div>


                            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 pl-2">
                                {
                                    totalAmount != 0 && (
                                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm shadow-md shadow-blue-500/30">1</span>
                                    )
                                }
                                Thông tin người mua
                            </h2>

                            <div className="flex flex-col gap-6 pl-2">
                                {/* Auto-fill Checkbox */}
                                <div className="rounded-lg border border-blue-100 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-900/10 p-4 flex items-start gap-3">
                                    <Checkbox
                                        id="use_profile"
                                        checked={useProfile}
                                        onCheckedChange={setUseProfile}
                                        className="mt-1"
                                    />
                                    <div className="text-sm">
                                        <label htmlFor="use_profile" className="font-bold text-gray-900 dark:text-white cursor-pointer select-none">
                                            Sử dụng thông tin từ tài khoản đã đăng nhập
                                        </label>
                                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                                            Thông tin sẽ được tự động điền vào các trường bên dưới.
                                        </p>
                                    </div>
                                </div>

                                {/* Inputs */}
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullname">Họ và tên <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <Input
                                                id="fullname"
                                                name="fullname"
                                                value={formData.fullname}
                                                onChange={handleInputChange}
                                                className={`pl-10 ${errors.fullname ? "border-red-500 focus-visible:ring-red-500" : ""}`} placeholder="Nhập họ tên đầy đủ"
                                            />
                                        </div>
                                        {errors.fullname && <p className="text-red-500 text-sm mt-1 animate-in slide-in-from-top-1">{errors.fullname}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email nhận vé <span className="text-red-500">*</span></Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                    <Mail className="w-5 h-5" />
                                                </div>
                                                <Input
                                                    readOnly
                                                    id="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className="pl-10"
                                                    type="email"
                                                    placeholder="name@example.com"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Số điện thoại <span className="text-red-500">*</span></Label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                    <Phone className="w-5 h-5" />
                                                </div>
                                                <Input
                                                    id="phone"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className={`pl-10 ${errors.phone ? "border-red-500 focus-visible:ring-red-500" : ""}`} placeholder="Nhập số điện thoại"
                                                />
                                            </div>
                                            {errors.phone && <p className="text-red-500 text-sm mt-1 animate-in slide-in-from-top-1">{errors.phone}</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="note">Ghi chú (Tùy chọn)</Label>
                                        <div className="relative">
                                            <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none text-gray-400">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <textarea
                                                id="note"
                                                name="note"
                                                value={formData.note}
                                                onChange={handleInputChange}
                                                rows={3}
                                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10 resize-none"
                                                placeholder="Nhập ghi chú thêm cho ban tổ chức..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Payment Method Section */}
                        {
                            totalAmount != 0 && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm relative overflow-hidden">
                                    {/* Decorative Left Border */}
                                    <div className="absolute left-0 top-6 bottom-6 w-1 bg-primary rounded-r-full"></div>

                                    <h2 className="text-xl font-bold mb-6 flex items-center gap-3 pl-2">
                                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm shadow-md shadow-blue-500/30">2</span>
                                        Phương thức thanh toán
                                    </h2>

                                    <div className="flex flex-col gap-6 pl-2">
                                        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="gap-4">
                                            {/* Option VNPAY */}
                                            <div className={`relative rounded-xl
                                         border-2 p-4 cursor-pointer transition-all ${paymentMethod === WalletType.VNPay
                                                    ? 'border-primary bg-blue-50/50 dark:bg-blue-900/10' :
                                                    'border-gray-200 hover:border-blue-200'}`}>
                                                <RadioGroupItem value={WalletType.VNPay}
                                                    id="vnpay" className="absolute right-4 top-4" />
                                                <Label htmlFor="vnpay" className="cursor-pointer flex items-start gap-4">
                                                    {/*  VNPAY Icon */}
                                                    <div className="h-20 w-20 rounded border border-gray-100 bg-white
                                             flex items-center justify-center shrink-0 overflow-hidden">
                                                        <img src={logoVnpay} alt="" />
                                                    </div>
                                                    
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-bold text-gray-900 dark:text-white
                                                     text-base">Ví VNPAY</span>
                                                            {paymentMethod === WalletType.VNPay && (
                                                                <span className="bg-primary text-white text-[10px] 
                                                        font-bold px-2 py-0.5 rounded-full">ĐANG CHỌN</span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                                                            Quét mã QR để thanh toán an toàn, nhanh chóng.
                                                        </p>

                                                        {paymentMethod === WalletType.VNPay && (
                                                            <div className="mt-3 pt-3 border-t border-dashed border-gray-200 dark:border-gray-700 flex gap-2 text-sm text-gray-600 dark:text-gray-300 animate-in fade-in slide-in-from-top-2">
                                                                <QrCode className="w-5 h-5 text-primary shrink-0" />
                                                                <p>Hệ thống sẽ chuyển hướng bạn đến cổng thanh toán VNPAY.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </Label>
                                            </div>


                                        </RadioGroup>

                                        {/* Divider */}
                                        <div className="h-px bg-gray-100 dark:bg-gray-700"></div>

                                        {/* Voucher Input */}
                                        <div className="space-y-2">
                                            <Label htmlFor="voucher" className="flex items-center gap-2"><Tag className="w-4 h-4" /> Mã giảm giá</Label>
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <Input id="voucher" placeholder="Nhập mã voucher (nếu có)" />
                                                </div>
                                                <Button variant="secondary" className="whitespace-nowrap">Áp dụng</Button>
                                            </div>
                                        </div>

                                        {/* Terms */}
                                        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg p-4 flex gap-3">
                                            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                                            <p className="text-sm text-blue-800 dark:text-blue-400 leading-snug">
                                                Bằng cách chọn Hoàn tất thanh toán, bạn đồng ý với <a href="#" className="underline font-semibold hover:text-blue-600">Điều khoản sử dụng</a> và Chính sách của chúng tôi.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        }

                    </div>

                    {/* RIGHT COLUMN: Order Summary */}
                    <div className="w-full lg:w-[380px] shrink-0">
                        <div className="sticky top-24">
                            {/* Reusing your OrderSummary Component */}
                            <OrderSummary
                                event={event}
                                selectedTickets={selectedTickets}
                                totalAmount={totalAmount}
                                eventSession={eventSession}
                                messageButton={"Thanh toán"}
                                onSubmit={onSubmitPayment}
                            />

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PaymentPage;