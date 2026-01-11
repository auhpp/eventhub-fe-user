import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { routes } from "@/config/routes";
import SignupForm from "@/features/auth/SignupForm";
import OtpForm from "@/features/auth/OtpForm";

const SignupPage = () => {
    const [showOtpForm, setShowOtpForm] = useState(false)
    const [registerRequest, setRegisterRequest] = useState(false)

    const handleShowOtpForm = (data, registerRequestParam) => {
        setShowOtpForm(data)
        setRegisterRequest(registerRequestParam)
    }
    return (
        <div className="w-full max-w-md">

            {/* Welcome Text */}
            <div className="text-center mb-10">
                <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-slate-900 dark:text-white">
                    Đăng ký
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Tạo tài khoản để tham gia và quản lý sự kiện dễ dàng.
                </p>
            </div>

            {/* Main Card */}
            <Card className="rounded-2xl border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                <CardContent className="p-8">
                    {
                        showOtpForm ?
                            <OtpForm email={registerRequest.email} password={registerRequest.password} />
                            : <SignupForm showOtpForm={handleShowOtpForm} />
                    }
                </CardContent>
            </Card>

            {/* Footer Link */}
            <p className="mt-10 text-center text-sm text-slate-500 dark:text-slate-400">
                Bạn đã có tài khoản?{" "}
                <Link
                    to={routes.signin}
                    className="font-bold text-brand hover:text-brand-dark transition-colors"
                >
                    Đăng nhập
                </Link>
            </p>
        </div>
    );
};

export default SignupPage;