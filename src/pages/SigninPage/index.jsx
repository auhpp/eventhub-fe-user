import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import SigninForm from "@/features/auth/SigninForm";
import { Link } from "react-router-dom";
import { routes } from "@/config/routes";

const SigninPage = () => {
    return (
        <div className="w-full max-w-md">

            {/* Welcome Text */}
            <div className="text-center mb-10">
                <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-slate-900 dark:text-white">
                    Đăng nhập
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Đăng nhập để tiếp tục khám phá và quản lý các sự kiện.
                </p>
            </div>

            {/* Main Card */}
            <Card className="rounded-2xl border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                <CardContent className="p-8">
                    <SigninForm />
                </CardContent>
            </Card>

            {/* Footer Link */}
            <p className="mt-10 text-center text-sm text-slate-500 dark:text-slate-400">
                Bạn chưa có tài khoản?{" "}
                <Link
                    to={routes.signup}
                    className="font-bold text-brand hover:text-brand-dark transition-colors"
                >
                    Đăng ký ngay
                </Link>
            </p>
        </div>
    );
};

export default SigninPage;