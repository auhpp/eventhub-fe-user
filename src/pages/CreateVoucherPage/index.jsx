import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventContext } from '@/context/EventContext';
import { toast } from 'sonner';

import { Button } from "@/components/ui/button";
import { createCoupon } from '@/services/couponService';
import { HttpStatusCode } from 'axios';
import { DiscountType } from '@/utils/constant';
import ButtonBack from '@/components/ButtonBack';
import BasicInfoSection from '@/features/voucher/BasicInfoSection';
import VoucherSettingsSection from '@/features/voucher/VoucherSettingsSection';
import ScopeSection from '@/features/voucher/ScopeSection';
import { CheckCircle2, Loader2 } from 'lucide-react';

const CreateVoucherPage = () => {
    const { event } = useContext(EventContext);
    const navigate = useNavigate();

    // --- STATES ---
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        startDateTime: '',
        endDateTime: '',
        content: '',
        avatar: null,
        discountType: DiscountType.FIXED_AMOUNT,
        value: '',
        maxDiscountAmount: '',
        maximumBooking: '',
        minimumTicketInBooking: '',
        maximumTicketInBooking: '',
        hasPublic: true,
    });
    const [avatarPreview, setAvatarPreview] = useState(null);

    // Error State for Validate
    const [errors, setErrors] = useState({});

    // UI specific states
    const [isUnlimitedTicket, setIsUnlimitedTicket] = useState(false);
    const [maximumUsage, setMaximumUsage] = useState('');
    const [isAllSessions, setIsAllSessions] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Scopes 
    const [selectedSessionIds, setSelectedSessionIds] = useState([]);
    const [selectedTicketIds, setSelectedTicketIds] = useState([]);

    // --- VALIDATION LOGIC ---
    const validateForm = () => {
        const newErrors = {};
        const { name, code, startDateTime, endDateTime, value, maxDiscountAmount, maximumBooking,
            minimumTicketInBooking, maximumTicketInBooking, discountType } = formData;

        // 1. Validate name
        if (!name.trim()) newErrors.name = "Vui lòng nhập tên chương trình.";

        // 2. Validate Code
        if (!code.trim()) {
            newErrors.code = "Vui lòng nhập mã voucher.";
        } else if (code.length < 6 || code.length > 12) {
            newErrors.code = "Mã voucher phải từ 6 đến 12 ký tự.";
        } else if (!/^[A-Z0-9]+$/.test(code)) {
            newErrors.code = "Mã chỉ được chứa chữ cái in hoa (A-Z) và số (0-9).";
        }

        // 3. Validate Time
        if (!startDateTime) newErrors.startDateTime = "Vui lòng chọn thời gian bắt đầu.";
        if (!endDateTime) {
            newErrors.endDateTime = "Vui lòng chọn thời gian kết thúc.";
        } else if (startDateTime && new Date(endDateTime) <= new Date(startDateTime)) {
            newErrors.endDateTime = "Thời gian kết thúc phải sau thời gian bắt đầu.";
        }

        // 5. Validate value & maxDiscountAmount
        if (!value) {
            newErrors.value = "Vui lòng nhập mức giảm.";
        } else if (Number(value) <= 0) {
            newErrors.value = "Mức giảm phải lớn hơn 0.";
        } else if (discountType === DiscountType.PERCENTAGE && Number(value) > 100) {
            newErrors.value = "Mức giảm phần trăm không được vượt quá 100%.";
        }

        if (discountType === DiscountType.PERCENTAGE && maxDiscountAmount) {
            if (Number(maxDiscountAmount) <= 0) {
                newErrors.maxDiscountAmount = "Mức giảm tối đa phải lớn hơn 0.";
            }
        }

        // 6. Validate quantity(ticket, booking)
        if (!maximumBooking) {
            newErrors.maximumBooking = "Vui lòng nhập số lượng.";
        } else if (Number(maximumBooking) <= 0) newErrors.maximumBooking = "Phải lớn hơn 0.";

        if (!minimumTicketInBooking) {
            newErrors.minimumTicketInBooking = "Vui lòng nhập số lượng.";
        } else if (Number(minimumTicketInBooking) <= 0) newErrors.minimumTicketInBooking = "Phải lớn hơn 0.";

        if (!maximumTicketInBooking) {
            newErrors.maximumTicketInBooking = "Vui lòng nhập số lượng.";
        } else if (Number(maximumTicketInBooking) <= 0) {
            newErrors.maximumTicketInBooking = "Phải lớn hơn 0.";
        } else if (minimumTicketInBooking && Number(maximumTicketInBooking) < Number(minimumTicketInBooking)) {
            newErrors.maximumTicketInBooking = "Số vé tối đa không được nhỏ hơn số vé tối thiểu.";
        }

        if (!isUnlimitedTicket) {
            if (!maximumUsage) {
                newErrors.maximumUsage = "Vui lòng nhập tổng số lượt dùng.";
            } else if (Number(maximumUsage) <= 0) {
                newErrors.maximumUsage = "Tổng số lượt dùng phải lớn hơn 0.";
            }
        }

        // 7. Validate Scope 
        if (!isAllSessions && selectedTicketIds.length === 0) {
            newErrors.scope = "Vui lòng chọn ít nhất một loại vé để áp dụng.";
            toast.error(newErrors.scope);
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    useEffect(
        () => {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setAvatarPreview(event?.appUser?.avatar);
        }, [event]
    )

    // --- HANDLERS ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        const finalValue = name === 'code' ? value.toUpperCase() : value;

        setFormData(prev => ({ ...prev, [name]: finalValue }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };



    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.error("Vui lòng kiểm tra lại các trường thông tin không hợp lệ.");
            return;
        }
        setIsSubmitting(true);
        
        const requestData = new FormData();
        requestData.append('eventId', event.id);
        requestData.append('name', formData.name);
        requestData.append('code', formData.code);
        requestData.append('startDateTime', formData.startDateTime);
        requestData.append('endDateTime', formData.endDateTime);
        requestData.append('content', formData.content);
        if (formData.avatar) {
            requestData.append('avatar', formData.avatar);
        }
        requestData.append('discountType', formData.discountType);
        requestData.append('value', formData.value);

        if (formData.discountType === DiscountType.PERCENTAGE && formData.maxDiscountAmount) {
            requestData.append('maxDiscountAmount', formData.maxDiscountAmount);
        }

        requestData.append('maximumBooking', formData.maximumBooking);
        requestData.append('minimumTicketInBooking', formData.minimumTicketInBooking);
        requestData.append('maximumTicketInBooking', formData.maximumTicketInBooking);
        requestData.append('hasPublic', formData.hasPublic);

        if (!isUnlimitedTicket && maximumUsage) {
            requestData.append('maximumUsage', maximumUsage);
        }

        if (!isAllSessions) {
            selectedTicketIds.forEach(id => requestData.append('ticketIds', id));
        }

        try {
            const response = await createCoupon(requestData);
            if (response.code === HttpStatusCode.Ok || response.code === HttpStatusCode.Created) {
                toast.success("Tạo thành công");
                navigate(-1);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi tạo voucher");
        }
        finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w pb-20">
            {/* HEADER */}
            <div className="flex items-center gap-4 mb-6">
                <ButtonBack />
                <h1 className="text-2xl font-bold">Tạo voucher mới</h1>
            </div>

            <div className="space-y-6">
                {/* 1. Basic info */}
                <BasicInfoSection
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    setErrors={setErrors}
                    handleChange={handleChange}
                    avatarPreview={avatarPreview}
                    setAvatarPreview={setAvatarPreview}
                    isEditMode={false}
                    eventId={event?.id}
                />

                {/* 2. Code VOUCHER */}
                <VoucherSettingsSection
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors} setErrors={setErrors}
                    handleChange={handleChange}
                    isUnlimitedTicket={isUnlimitedTicket}
                    setIsUnlimitedTicket={setIsUnlimitedTicket}
                    maximumUsage={maximumUsage}
                    setMaximumUsage={setMaximumUsage}
                />

                {/* 3. Scopes */}
                <ScopeSection
                    event={event}
                    errors={errors}
                    setErrors={setErrors}
                    isAllSessions={isAllSessions}
                    setIsAllSessions={setIsAllSessions}
                    selectedSessionIds={selectedSessionIds}
                    setSelectedSessionIds={setSelectedSessionIds}
                    selectedTicketIds={selectedTicketIds}
                    setSelectedTicketIds={setSelectedTicketIds}
                />

                {/* SUBMIT */}
                <div className="flex justify-end gap-4 mt-8">
                    <Button variant="outline" onClick={() => navigate(-1)}>Hủy bỏ</Button>
                    <Button
                        onClick={handleSubmit}
                        className="bg-primary px-8"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                Tạo Voucher
                            </>
                        )}
                    </Button>
                </div>
            </div>

        </div>
    );
};

export default CreateVoucherPage;