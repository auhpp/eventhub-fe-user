import React, { useRef, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ImagePlus, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import DateTimePicker from '@/components/DateTimePicker';
import { checkCodeExists } from '@/services/couponService';

const BasicInfoSection = ({ formData, setFormData, errors, setErrors, handleChange, avatarPreview,
    setAvatarPreview, isEditMode, eventId }) => {
    const fileInputRef = useRef(null);
    const [isGeneratingCode, setIsGeneratingCode] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, avatar: file }));
            setAvatarPreview(URL.createObjectURL(file));
            if (errors.avatar) setErrors(prev => ({ ...prev, avatar: undefined }));
        }
    };

    const generateRandomString = (length = 8) => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    const handleAutoGenerateCode = async () => {
        setIsGeneratingCode(true);
        let newCode = '';
        let isExist = true;
        let attempts = 0;
        const MAX_ATTEMPTS = 5;

        try {
            while (isExist && attempts < MAX_ATTEMPTS) {
                newCode = generateRandomString(8);
                const res = await checkCodeExists(eventId, newCode);
                isExist = res.result;
                attempts++;
            }

            if (!isExist) {
                setFormData(prev => ({ ...prev, code: newCode }));
                if (errors.code) setErrors(prev => ({ ...prev, code: undefined }));
            } else {
                toast.error("Hệ thống đang bận, vui lòng thử lại sau.");
            }
        } catch (error) {
            console.log(error);
            toast.error("Có lỗi xảy ra khi kiểm tra mã ngẫu nhiên.");
        } finally {
            setIsGeneratingCode(false);
        }
    };

    const handleCheckCodeExists = async () => {
        const code = formData.code.trim();
        if (!code || code.length < 6 || code.length > 12 || !/^[A-Z0-9]+$/.test(code)) return;

        try {
            const isExist = await checkCodeExists(eventId, code);
            if (isExist.result != null) {
                setErrors(prev => ({ ...prev, code: "Mã này đã tồn tại trong sự kiện, vui lòng nhập mã khác." }));
            }
        } catch (error) {
            console.log(error);
            toast.error("Không thể kiểm tra mã vào lúc này.");
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-6">Thông tin cơ bản</h2>
            <div className="grid grid-cols-[200px_1fr] gap-6 items-start">

                <Label className="text-right mt-3">Tên chương trình khuyến mãi : <span className="text-red-500">*</span></Label>
                <div>
                    <Input
                        name="name"
                        placeholder="Nhập tên chương trình khuyến mãi"
                        maxLength={80}
                        value={formData.name} onChange={handleChange}
                        className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    <p className="text-xs text-muted-foreground mt-1">Tên chương trình sẽ không hiển thị cho người mua</p>
                </div>

                <Label className="text-right mt-3">Mã voucher : <span className="text-red-500">*</span></Label>
                <div>
                    <div className="flex gap-3 items-center">
                        <Input
                            name="code"
                            placeholder="Nhập mã voucher"
                            maxLength={12}
                            value={formData.code}
                            onChange={handleChange}
                            onBlur={!isEditMode ? handleCheckCodeExists : undefined}
                            disabled={isEditMode}
                            className={errors.code ? "uppercase border-red-500 w-[200px]" : "uppercase w-[200px]"}
                        />
                        {!isEditMode && (
                            <Button type="button" variant="outline" onClick={handleAutoGenerateCode} disabled={isGeneratingCode}>
                                {isGeneratingCode ? "Đang tạo..." : "Tự động tạo"}
                            </Button>
                        )}
                    </div>
                    {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                    <p className="text-xs text-muted-foreground mt-1">Chỉ cho phép những giá trị sau
                         (A-Z and 0-9), tối thiểu 6 và tối đa 12 ký tự</p>
                </div>

                <Label className="text-right mt-3">Thời gian sử dụng mã : <span className="text-red-500">*</span></Label>
                <div>
                    <div className="flex items-start gap-4">
                        <div className="w-[240px]">
                            <DateTimePicker
                                label="Thời gian bắt đầu"
                                require={false}
                                value={formData.startDateTime}
                                onChange={(isoString) => {
                                    setFormData(prev => ({ ...prev, startDateTime: isoString }));
                                    if (errors.startDateTime) setErrors(prev => ({ ...prev, startDateTime: undefined }));
                                }}
                                error={errors.startDateTime}
                            />
                        </div>
                        <div className="mt-8 text-muted-foreground">
                            <ArrowRight className="w-5 h-5 mt-2" strokeWidth={2} />
                        </div>
                        <div className="w-[240px]">
                            <DateTimePicker
                                label="Thời gian kết thúc"
                                require={false}
                                value={formData.endDateTime}
                                onChange={(isoString) => {
                                    setFormData(prev => ({ ...prev, endDateTime: isoString }));
                                    if (errors.endDateTime) setErrors(prev => ({ ...prev, endDateTime: undefined }));
                                }}
                                error={errors.endDateTime}
                            />
                        </div>
                    </div>
                </div>

                <Label className="text-right mt-3">Nội dung :</Label>
                <Textarea
                    name="content"
                    placeholder="Điều khoản và quy định của chương trình khuyến mại này"
                    value={formData.content} onChange={handleChange}
                    rows={4}
                />

                <Label className="text-right mt-3">Ảnh chương trình :</Label>
                <div className="flex gap-8">
                    <div>
                        <div
                            className={`w-32 h-32 border-2 border-dashed rounded-lg flex items-center 
                                justify-center cursor-pointer bg-slate-50 relative overflow-hidden group 
                                ${errors.avatar ? "border-red-500" : ""}`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <ImagePlus className="w-8 h-8 text-slate-400 group-hover:text-primary transition-colors" />
                            )}
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*"
                             onChange={handleImageChange} />
                        </div>
                        {errors.avatar && <p className="text-red-500 text-xs mt-1 w-32 text-center">{errors.avatar}</p>}
                    </div>

                    <div className="flex flex-col gap-4">
                        <Label className="text-base font-semibold">Thiết lập hiển thị</Label>
                        <RadioGroup
                            value={formData.hasPublic ? "public" : "private"}
                            onValueChange={(val) => setFormData(prev => ({ ...prev, hasPublic: val === 'public' }))}
                        >
                            <div className="flex items-start gap-2">
                                <RadioGroupItem value="public" id="public" className="mt-1" />
                                <div>
                                    <Label htmlFor="public" className="font-bold cursor-pointer">Công khai</Label>
                                    <p className="text-sm text-muted-foreground">Mã voucher sẽ được hiển 
                                        thị tự động trên trang thanh toán, giúp khách hàng dễ dàng nhận biết.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2 mt-2">
                                <RadioGroupItem value="private" id="private" className="mt-1" />
                                <div>
                                    <Label htmlFor="private" className="font-bold cursor-pointer">Riêng tư</Label>
                                    <p className="text-sm text-muted-foreground">Mã voucher sẽ không được công khai, 
                                        bạn cần chủ động chia sẻ mã với khách hàng.</p>
                                </div>
                            </div>
                        </RadioGroup>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BasicInfoSection;