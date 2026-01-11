import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Timer, ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { routes } from "@/config/routes";
import { sendOtpCreateUser, verifyAndCreateUser } from "@/services/authenticationService";
import { HttpStatusCode } from "axios";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const otpSchema = z.object({
    otp: z
        .string()
        .min(6, "Vui lòng nhập đủ 6 chữ số")
        .max(6, "Mã OTP chỉ gồm 6 chữ số")
        .regex(/^\d+$/, "Mã OTP chỉ được chứa số"),
});

export default function OtpForm({ email, password }) {
    const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
    const [timeLeft, setTimeLeft] = useState(60);
    const navigate = useNavigate();
    const inputRefs = useRef([]);

    const {
        register,
        setValue,
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
        register("otp");
    }, [register]);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timerId = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timerId);
    }, [timeLeft]);

    const handleChange = (index, value) => {
        if (isNaN(value)) return;

        const newOtpValues = [...otpValues];
        newOtpValues[index] = value;
        setOtpValues(newOtpValues);

        const otpString = newOtpValues.join("");
        setValue("otp", otpString, { shouldValidate: true });

        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otpValues[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleResendOtp = async () => {
        if (timeLeft > 0) return;

        try {
            await sendOtpCreateUser({ email: email, password: password })
            setTimeLeft(60);
        } catch (error) {
            console.error("Lỗi gửi lại OTP", error);
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData("text");
        const pasteDigits = pasteData.replace(/\D/g, "").split("").slice(0, 6);
        if (pasteDigits.length === 0) return;
        const newOtpValues = [...otpValues];

        pasteDigits.forEach((digit, i) => {
            newOtpValues[i] = digit;
        });

        setOtpValues(newOtpValues);

        const otpString = newOtpValues.join("");
        setValue("otp", otpString, { shouldValidate: true });

        const nextIndex = Math.min(pasteDigits.length, 5);
        inputRefs.current[nextIndex]?.focus();

        if (pasteDigits.length === 6) {
            inputRefs.current[5].blur();
        }
    };

    const onSubmit = async (data) => {
        console.log("Submitting OTP:", data.otp);
        try {
            const result = await verifyAndCreateUser({ email: email, password: password, otp: data.otp });

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

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col items-center w-full"
        >
            {/* Icon */}
            <div className="mb-6 flex justify-center">
                <div className="h-16 w-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-brand">
                    <Mail className="h-8 w-8" />
                </div>
            </div>

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

            {/* OTP Inputs */}
            <div className="w-full px-4 mb-4">
                <div className="flex justify-center gap-2 sm:gap-3">
                    {otpValues.map((digit, index) => (
                        <React.Fragment key={index}>
                            <input
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                maxLength={1}
                                value={digit}
                                autoComplete="off"
                                onPaste={handlePaste}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className={`w-10 h-12 sm:w-12 sm:h-14 text-center bg-transparent 
                                border-b-2 outline-none text-xl font-bold transition-all placeholder-transparent
                                ${errors.otp
                                        ? "border-red-500 text-red-500 animate-shake"
                                        : "border-gray-200 dark:border-gray-700 focus:border-brand text-slate-900 dark:text-white"
                                    }`}
                            />
                            {index === 2 && (
                                <div className="flex items-center justify-center w-2 text-gray-300 dark:text-gray-600">
                                    -
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
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
            <div className="text-center space-y-4 mt-2">
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
                    className="inline-flex items-center gap-1 text-xs text-slate-400 
                    hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                    <ArrowLeft className="w-3 h-3" />
                    Quay lại đăng nhập
                </Link>
            </div>
        </form>
    );
};