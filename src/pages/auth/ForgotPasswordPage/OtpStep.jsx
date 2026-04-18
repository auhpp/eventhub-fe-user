import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { sendEmailResetPassword } from "@/services/userService";
import { toast } from "sonner";
import { verifyOtp } from "@/services/otpService";
import { HttpStatusCode } from "axios";


const otpSchema = z.object({
    otp: z.string().length(6, "Vui lòng nhập đủ 6 chữ số").regex(/^\d+$/, "Chỉ chứa số"),
});

const OtpStep = ({ email, onSuccess, onBack }) => {
    const [timeLeft, setTimeLeft] = useState(60);

    const { control, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(otpSchema),
        defaultValues: { otp: "" },
    });

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        return () => clearInterval(timerId);
    }, [timeLeft]);

    const handleResendOtp = async () => {
        if (timeLeft > 0) return;
        try {
            await sendEmailResetPassword({ email });
            setTimeLeft(60);
            toast.success("Đã gửi lại mã OTP");
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            toast.error("Lỗi gửi lại OTP");
        }
    };

    const onSubmit = async (data) => {
        try {
            const res = await verifyOtp({ email, otpCode: data.otp });
            if (res.code === HttpStatusCode.Ok && res.result) {
                toast.success("Xác thực thành công!");
                onSuccess(data.otp);
            }
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            setError("otp", { type: "manual", message: "Mã OTP không chính xác hoặc đã hết hạn." });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center w-full border rounded-xl bg-white py-6">
            <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">Nhập mã OTP</h1>
                <p className="text-slate-500 text-sm max-w-[90%] mx-auto">
                    Vui lòng nhập mã OTP đã được gửi tới <span className="font-bold text-slate-900">{email}</span>
                </p>
            </div>

            <div className="w-full px-4 mb-2 flex flex-col items-center justify-center gap-2">
                <Controller
                    control={control}
                    name="otp"
                    render={({ field }) => (
                        <InputOTP maxLength={6} {...field}>
                            <InputOTPGroup className={errors.otp ? "border-red-500" : ""}>
                                <InputOTPSlot index={0} className="w-10 h-12 sm:w-12 sm:h-14 text-xl font-bold" />
                                <InputOTPSlot index={1} className="w-10 h-12 sm:w-12 sm:h-14 text-xl font-bold" />
                                <InputOTPSlot index={2} className="w-10 h-12 sm:w-12 sm:h-14 text-xl font-bold" />
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup className={errors.otp ? "border-red-500" : ""}>
                                <InputOTPSlot index={3} className="w-10 h-12 sm:w-12 sm:h-14 text-xl font-bold" />
                                <InputOTPSlot index={4} className="w-10 h-12 sm:w-12 sm:h-14 text-xl font-bold" />
                                <InputOTPSlot index={5} className="w-10 h-12 sm:w-12 sm:h-14 text-xl font-bold" />
                            </InputOTPGroup>
                        </InputOTP>
                    )}
                />
            </div>

            {/* display errors */}
            <div className="h-6 mb-4 text-center text-sm text-red-500">
                {errors.otp && errors.otp.message}
            </div>

            <div className="w-full px-8 space-y-4">
                <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl bg-brand hover:bg-brand-dark">
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Kiểm tra...</> : "Xác nhận OTP"}
                </Button>
                <div className="text-center space-y-3">
                    <p className="text-sm text-slate-500">
                        Chưa nhận được mã?{" "}
                        <button type="button" onClick={handleResendOtp} disabled={timeLeft > 0} className={timeLeft > 0 ? "text-slate-400" : "text-brand font-bold"}>
                            {timeLeft > 0 ? `Gửi lại sau ${timeLeft}s` : "Gửi lại ngay"}
                        </button>
                    </p>
                    <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand">
                        <ArrowLeft className="w-4 h-4" /> Đổi email khác
                    </button>
                </div>
            </div>
        </form>
    );
};

export default OtpStep;