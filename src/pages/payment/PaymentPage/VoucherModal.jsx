import React, { useState, useEffect } from 'react';
import { Ticket, X, CheckCircle2, Circle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from "@/components/ui/input";
import { Avatar } from '@/components/ui/avatar';
import DefaultAvatar from '@/components/DefaultAvatar';

const VoucherModal = ({
    isOpen,
    onClose,
    coupons,
    totalTicketsQuantity,
    selectedTickets,
    couponUsages,
    onApply,
    currentSelectedCoupon,
    totalAmount,
    organizer
}) => {
    const [tempSelectedCoupon, setTempSelectedCoupon] = useState(null);
    const [localCode, setLocalCode] = useState('');
    const [localError, setLocalError] = useState('');

    useEffect(() => {
        if (isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTempSelectedCoupon(currentSelectedCoupon);
            setLocalCode('');
            setLocalError('');
        }
    }, [isOpen, currentSelectedCoupon]);

    // Check conditions
    const checkEligibility = (coupon) => {
        // 1. check maximumUsage
        if (coupon.maximumUsage && (coupon.quantityUsage || 0) >= coupon.maximumUsage) {
            return { isEligible: false, reason: "Voucher đã hết lượt sử dụng" };
        }

        // 2. check maximumBooking
        const userUsage = couponUsages?.[coupon.id] || 0;
        if (coupon.maximumBooking && userUsage >= coupon.maximumBooking) {
            return { isEligible: false, reason: `Bạn đã dùng tối đa ${coupon.maximumBooking} lần` };
        }

        // 3. Check minimumTicketInBooking
        if (coupon.minimumTicketInBooking && totalTicketsQuantity < coupon.minimumTicketInBooking) {
            return { isEligible: false, reason: `Yêu cầu đơn tối thiểu ${coupon.minimumTicketInBooking} vé` };
        }

        // 4. check maximumTicketInBooking
        if (coupon.maximumTicketInBooking && totalTicketsQuantity > coupon.maximumTicketInBooking) {
            return { isEligible: false, reason: `Đơn tối đa chỉ được ${coupon.maximumTicketInBooking} vé` };
        }

        // 5. check scopes
        if (coupon.tickets && coupon.tickets.length > 0) {
            const hasApplicableTicket = selectedTickets?.some(cartTicket =>
                coupon.tickets.some(couponTicket => couponTicket.id === cartTicket.id)
            );

            if (!hasApplicableTicket) {
                return { isEligible: false, reason: "Không áp dụng cho loại vé đang chọn" };
            }
        }

        return { isEligible: true, reason: "" };
    };

    const handleSelectCoupon = (coupon) => {
        const { isEligible } = checkEligibility(coupon);
        if (!isEligible) return;

        if (tempSelectedCoupon?.id === coupon.id) {
            setTempSelectedCoupon(null);
        } else {
            setTempSelectedCoupon(coupon);
            setLocalError('');
        }
    };

    const handleApplyLocalCode = () => {
        if (!localCode.trim()) return;

        const matchedCoupon = coupons.find(c => c.code.toUpperCase() === localCode.trim().toUpperCase());

        if (matchedCoupon) {
            const { isEligible } = checkEligibility(matchedCoupon);
            if (isEligible) {
                setTempSelectedCoupon(matchedCoupon);
                setLocalError('');
            } else {
                setLocalError('Mã voucher không đủ điều kiện áp dụng cho đơn này.');
            }
        } else {
            setLocalError('Rất tiếc! Không thể tìm thấy mã voucher này. Bạn vui lòng kiểm tra lại mã đang nhập hoặc có thể mã đã hết hạn sử dụng.');
        }
    };

    const handleConfirm = () => {
        if (tempSelectedCoupon) {
            onApply(tempSelectedCoupon);
        } else {
            onApply(null);
            onClose();
        }
    };

    const calculateDiscountAmount = (coupon) => {
        if (!coupon || !totalAmount) return 0;
        let discount = 0;
        if (coupon.discountType === 'PERCENTAGE') {
            discount = totalAmount * (coupon.value / 100);
            if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
                discount = coupon.maxDiscountAmount;
            }
        } else {
            discount = coupon.value;
        }
        return discount > totalAmount ? totalAmount : discount;
    };

    const discountAmount = calculateDiscountAmount(tempSelectedCoupon);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[550px] bg-gray-50 max-h-[90vh] flex flex-col overflow-hidden p-0 gap-0">
                <DialogHeader className="p-4 bg-white border-b">
                    <DialogTitle className="text-xl font-medium text-gray-800">{organizer.fullName} Voucher</DialogTitle>
                </DialogHeader>

                {/* Form enter code */}
                <div className="p-4 bg-gray-50 flex items-start gap-3 border-b">
                    <span className="whitespace-nowrap mt-2 text-gray-700 font-medium">Mã Voucher</span>
                    <div className="flex-1 relative">
                        <div className="flex gap-2 relative">
                            <Input
                                placeholder="Nhập mã voucher"
                                className={`uppercase bg-white ${localError ?
                                    'border-red-500 text-red-600 focus-visible:ring-red-500' : ''}`}
                                value={localCode}
                                onChange={(e) => {
                                    setLocalCode(e.target.value.toUpperCase());
                                    setLocalError('');
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && handleApplyLocalCode()}
                            />
                            {localCode && (
                                <button
                                    onClick={() => setLocalCode('')}
                                    className="absolute right-24 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                            <Button
                                variant={localCode ? "default" : "secondary"}
                                className={`whitespace-nowrap ${localCode ? 'bg-red-500 hover:bg-red-600 text-white' :
                                    'bg-gray-100 text-gray-400'}`}
                                onClick={handleApplyLocalCode}
                                disabled={!localCode.trim()}
                            >
                                ÁP DỤNG
                            </Button>
                        </div>
                        {localError && (
                            <div className="absolute top-full mt-2 w-full bg-red-50 text-red-500 border 
                            border-red-200 text-sm p-3 rounded shadow-sm z-10">
                                {localError}
                            </div>
                        )}
                    </div>
                </div>

                {/* Voucher list */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {coupons.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Ticket className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p>Chưa có mã giảm giá nào cho sự kiện này.</p>
                        </div>
                    ) : (
                        coupons.map((coupon) => {
                            const { isEligible, reason } = checkEligibility(coupon);
                            const isSelected = tempSelectedCoupon?.id === coupon.id;

                            // const usedPercentage = coupon.maximumUsage ? Math.floor(((coupon.maximumUsage - (coupon.quantityUsage || 0)) / coupon.maximumUsage) * 100) : 0;

                            return (
                                <div
                                    key={coupon.id}
                                    className={`relative flex bg-white rounded-md shadow-sm
                                         border transition-all cursor-pointer ${!isEligible ?
                                            'opacity-60 grayscale-[30%] bg-gray-50' : 'hover:shadow-md'
                                        } `}
                                    onClick={() => handleSelectCoupon(coupon)}
                                >
                                    {/* Left section: Logo */}
                                    <div className={`w-28 flex flex-col justify-center 
                                    items-center p-3 border-r border-dashed border-gray-300 relative
                                        ${coupon.isBestChoice ? 'bg-green-50' : 'bg-blue-50'}
                                    `}>
                                        {/* Half circles for the ticket effect */}
                                        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-gray-50 
                                        rounded-full border-b border-l border-gray-200"></div>
                                        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-gray-50
                                         rounded-full border-t border-l border-gray-200"></div>

                                        {coupon.isBestChoice && (
                                            <div className="absolute top-0 left-0 bg-green-500 text-white 
                                            text-[10px] px-1 py-0.5 rounded-br-md">
                                                Lựa chọn tốt nhất
                                            </div>
                                        )}
                                        <Avatar>
                                            <DefaultAvatar user={organizer} />
                                        </Avatar>
                                    </div>

                                    {/* Right section: Details */}
                                    <div className="flex-1 p-3 flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-800 text-base">
                                                Giảm {coupon.discountType === 'PERCENTAGE' ? `${coupon.value}%`
                                                    : `${(coupon.value / 1000)}kđ`}
                                            </div>
                                            <div className="text-sm text-gray-600 mb-1">
                                                {reason || `Đơn Tối Thiểu ${(coupon.minimumTicketInBooking || 1)} vé`}
                                            </div>

                                            <div className="inline-block border border-red-500 text-red-500
                                             text-[10px] px-1 mb-2">
                                                Voucher sự kiện
                                            </div>

                                            {/* Progress bar */}
                                            {/* <div className="flex flex-col gap-1 w-full max-w-[200px]">
                                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                    <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${usedPercentage}%` }}></div>
                                                </div>
                                                <div className="flex justify-between items-center text-xs text-gray-500">
                                                    <span>Đã dùng {usedPercentage}%</span>
                                                    <span className="text-blue-500 hover:underline">Điều Kiện</span>
                                                </div>
                                                <span className="text-[10px] text-gray-400 mt-0.5">Tổng số lượt sử dụng voucher: 
                                                    {coupon.usageLimit || 'Không giới hạn'}</span>
                                            </div> */}
                                        </div>

                                        {/* Radio Check */}
                                        <div className="ml-4">
                                            {isSelected ? (
                                                <CheckCircle2 className="w-6 h-6 text-red-500 fill-red-500/20" />
                                            ) : (
                                                <Circle className="w-6 h-6 text-gray-300" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                {/* Footer bar */}
                <div className="bg-white border-t p-4 flex justify-between items-center">
                    <div className="text-gray-700">
                        {tempSelectedCoupon ? (
                            <>1 Voucher đã được chọn <span className="text-red-500 font-medium">
                                Tiết kiệm {(discountAmount / 1000)}kđ</span></>
                        ) : (
                            <span className="text-gray-400">Chưa chọn Voucher nào</span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose} className="px-6 rounded-sm bg-white 
                        text-gray-700 hover:bg-gray-50 uppercase">
                            Trở Lại
                        </Button>
                        <Button onClick={handleConfirm} className="px-6 rounded-sm bg-primary text-white uppercase">
                            Đồng Ý
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default VoucherModal;