import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { routes } from "@/config/routes";
import { sendOtpCreateUser, verifyAndCreateUser } from "@/services/authenticationService";
import { HttpStatusCode } from "axios";
import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp";

const otpSchema = z.object({
    otp: z
        .string()
        .min(6, "Vui lòng nhập đủ 6 chữ số")
        .max(6, "Mã OTP chỉ gồm 6 chữ số")
        .regex(/^\d+$/, "Mã OTP chỉ được chứa số"),
});

export default function OtpForm({ email, password, phoneNumber, fullName }) {
    const [timeLeft, setTimeLeft] = useState(60);
    const navigate = useNavigate();

    const {
        control,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(otpSchema),
        defaultValues: {
            otp: "",
        },
    });

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timerId = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timerId);
    }, [timeLeft]);

    const handleResendOtp = async () => {
        if (timeLeft > 0) return;

        try {
            await sendOtpCreateUser({ email: email, password: password });
            setTimeLeft(60);
        } catch (error) {
            console.error("Lỗi gửi lại OTP", error);
        }
    };

    const onSubmit = async (data) => {
        console.log("Submitting OTP:", data.otp);
        try {
            const result = await verifyAndCreateUser({
                email: email, password: password, otp: data.otp,
                phoneNumber, fullName
            });

            if (result.code === HttpStatusCode.Ok || result.status === 200) {
                navigate(routes.signin, { replace: true });
            }
        } catch (error) {
            console.log("Lỗi API verify otp:", error);
            setError("otp", {
                type: "manual",
                message: "Mã OTP không chính xác hoặc đã hết hạn."
            });
        }
    };

    const slotClassName = `w-10 h-12 sm:w-12 sm:h-14 text-xl font-bold ${errors.otp
        ? "border-red-500 text-red-500 animate-shake"
        : "border-gray-200 dark:border-gray-700 text-slate-900 dark:text-white"
        }`;

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col items-center w-full"
        >
            {/* Title & Description */}
            <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
                    Xác minh tài khoản
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-[90%] mx-auto">
                    Vui lòng nhập mã OTP gồm 6 chữ số đã được gửi tới email{" "}
                    <span className="font-bold text-slate-900 dark:text-white">
                        {email || "nguoidung@example.com"}
                    </span>{" "}
                    của bạn.
                </p>
            </div>

            {/* OTP Inputs  */}
            <div className="w-full px-4 mb-4 flex justify-center">
                <Controller
                    control={control}
                    name="otp"
                    render={({ field }) => (
                        <InputOTP maxLength={6} {...field}>
                            <InputOTPGroup>
                                <InputOTPSlot index={0} className={slotClassName} />
                                <InputOTPSlot index={1} className={slotClassName} />
                                <InputOTPSlot index={2} className={slotClassName} />
                            </InputOTPGroup>

                            <InputOTPSeparator />

                            <InputOTPGroup>
                                <InputOTPSlot index={3} className={slotClassName} />
                                <InputOTPSlot index={4} className={slotClassName} />
                                <InputOTPSlot index={5} className={slotClassName} />
                            </InputOTPGroup>
                        </InputOTP>
                    )}
                />
            </div>

            {/* ERROR MESSAGE SECTION */}
            <div className="h-6 mb-4 text-center min-h-[24px]">
                {errors.otp && (
                    <span className="text-red-500 text-sm font-medium animate-pulse block">
                        {errors.otp.message}
                    </span>
                )}
            </div>

            <div className="w-full px-8">
                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 text-md font-bold rounded-xl bg-brand 
                    hover:bg-brand-dark shadow-lg shadow-blue-500/20 disabled:opacity-70"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang xác thực...
                        </>
                    ) : (
                        "Xác nhận"
                    )}
                </Button>
            </div>

            {/* Footer Actions */}
            <div className="text-center space-y-4 mt-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Bạn không nhận được mã?{" "}
                    <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={timeLeft > 0}
                        className={`font-bold transition-colors ml-1 ${timeLeft > 0
                            ? "text-slate-400 cursor-not-allowed decoration-slice"
                            : "text-brand hover:underline cursor-pointer"
                            }`}
                    >
                        {timeLeft > 0 ? `Gửi lại sau ${timeLeft}s` : "Gửi lại mã"}
                    </button>
                </p>

                <Link
                    to={routes.signin}
                    className="inline-flex items-center gap-1 text-sm text-slate-400 
                    hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                    <ArrowLeft className="w-3 h-3" />
                    Quay lại đăng nhập
                </Link>
            </div>
        </form>
    );
}