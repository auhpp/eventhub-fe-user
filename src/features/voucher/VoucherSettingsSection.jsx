import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DiscountType } from '@/utils/constant';

const VoucherSettingsSection = ({ formData, setFormData, errors, setErrors, handleChange, isUnlimitedTicket,
    setIsUnlimitedTicket, maximumUsage, setMaximumUsage }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-6">Thiết lập mã voucher</h2>
            <div className="grid grid-cols-[200px_1fr] gap-6 items-start">

                <Label className="text-right mt-3">Loại khuyến mãi : <span className="text-red-500">*</span></Label>
                <div>
                    <div className="flex gap-4">
                        <Select value={formData.discountType} onValueChange={(val) => {
                            setFormData(prev => ({ ...prev, discountType: val, maxDiscountAmount: '' }));
                            setErrors(prev => ({ ...prev, value: undefined, maxDiscountAmount: undefined }));
                        }}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Chọn loại" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={DiscountType.FIXED_AMOUNT}>Theo số tiền</SelectItem>
                                <SelectItem value={DiscountType.PERCENTAGE}>Theo %</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex flex-col gap-2 max-w-[400px] flex-1">
                            <div className="relative">
                                <Input
                                    type="number"
                                    name="value"
                                    placeholder="Nhập mức giảm"
                                    value={formData.value} onChange={handleChange}
                                    className={errors.value ? "border-red-500" : ""}
                                />
                                <span className="absolute right-3 top-2 text-muted-foreground">
                                    {formData.discountType === DiscountType.FIXED_AMOUNT ? 'đ' : '%'}
                                </span>
                            </div>

                            {formData.discountType === DiscountType.PERCENTAGE && (
                                <div className="relative">
                                    <Input
                                        type="number"
                                        name="maxDiscountAmount"
                                        placeholder="Mức giảm tối đa (Tùy chọn)"
                                        value={formData.maxDiscountAmount} onChange={handleChange}
                                        className={errors.maxDiscountAmount ? "border-red-500" : ""}
                                    />
                                    <span className="absolute right-3 top-2 text-muted-foreground">đ</span>
                                </div>
                            )}
                        </div>
                    </div>
                    {errors.value && <p className="text-red-500 text-xs mt-1">{errors.value}</p>}
                    {errors.maxDiscountAmount && <p className="text-red-500 text-xs mt-1">{errors.maxDiscountAmount}</p>}
                </div>

                <Label className="text-right mt-3">Tổng lượt sử dụng : <span className="text-red-500">*</span></Label>
                <div>
                    <RadioGroup
                        className="flex gap-6 mb-3"
                        value={isUnlimitedTicket ? "unlimited" : "limited"}
                        onValueChange={(val) => {
                            setIsUnlimitedTicket(val === 'unlimited'); setErrors(prev =>
                                ({ ...prev, maximumUsage: undefined }));
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="limited" id="limited" />
                            <Label htmlFor="limited" className="cursor-pointer">Giới hạn</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="unlimited" id="unlimited" />
                            <Label htmlFor="unlimited" className="cursor-pointer">Không giới hạn</Label>
                        </div>
                    </RadioGroup>
                    {!isUnlimitedTicket && (
                        <>
                            <Input
                                type="number"
                                placeholder="Nhập tổng lượt dùng"
                                value={maximumUsage} onChange={(e) => {
                                    setMaximumUsage(e.target.value); setErrors(prev =>
                                        ({ ...prev, maximumUsage: undefined }));
                                }}
                                className={`max-w-[600px] ${errors.maximumUsage ? "border-red-500" : ""}`}
                            />
                            {errors.maximumUsage && <p className="text-red-500 text-xs mt-1">{errors.maximumUsage}</p>}
                            <p className="text-xs text-muted-foreground mt-1">Tổng số đơn hàng trên toàn hệ thống có thể
                                áp dụng mã này</p>
                        </>
                    )}
                </div>

                <Label className="text-right mt-3">Số lượt/Người mua : <span className="text-red-500">*</span></Label>
                <div>
                    <Input type="number" name="maximumBooking" placeholder="Nhập số lượt tối đa"
                        value={formData.maximumBooking} onChange={handleChange} className={`max-w-[600px] 
                    ${errors.maximumBooking ? "border-red-500" : ""}`} />
                    {errors.maximumBooking && <p className="text-red-500 text-xs mt-1">{errors.maximumBooking}</p>}
                    <p className="text-xs text-muted-foreground mt-1">Số lần tối đa một tài khoản có thể sử dụng voucher này</p>
                </div>

                <Label className="text-right mt-3">Số lượng vé tối thiểu : <span className="text-red-500">*</span></Label>
                <div>
                    <Input type="number" name="minimumTicketInBooking" placeholder="Nhập số lượng vé tối thiểu"
                        value={formData.minimumTicketInBooking} onChange={handleChange} className={`max-w-[600px] 
                     ${errors.minimumTicketInBooking ? "border-red-500" : ""}`} />
                    {errors.minimumTicketInBooking && <p className="text-red-500 text-xs mt-1">
                        {errors.minimumTicketInBooking}</p>}
                    <p className="text-xs text-muted-foreground mt-1">Số lượng vé tối thiểu trong
                        đơn hàng để có thể áp dụng mã</p>
                </div>

                <Label className="text-right mt-3">Số vé giảm giá tối đa : <span className="text-red-500">*</span></Label>
                <div>
                    <Input type="number" name="maximumTicketInBooking" placeholder="Nhập số lượng vé tối đa"
                        value={formData.maximumTicketInBooking} onChange={handleChange} className={`max-w-[600px]
                      ${errors.maximumTicketInBooking ? "border-red-500" : ""}`} />
                    {errors.maximumTicketInBooking && <p className="text-red-500 text-xs mt-1">
                        {errors.maximumTicketInBooking}</p>}
                    <p className="text-xs text-muted-foreground mt-1">Số lượng vé tối đa trong đơn được hưởng mức ưu đãi</p>
                </div>

            </div>
        </div>
    );
};

export default VoucherSettingsSection;