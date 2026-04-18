import React from 'react';
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

const Forbidden403 = () => {
    const handleGoBack = () => {
        window.history.back();
    };

    const handleGoHome = () => {
        window.location.href = '/';
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-4 text-center">
            <div className="bg-destructive/10 p-6 rounded-full mb-8">
                <ShieldAlert className="w-20 h-20 text-destructive" />
            </div>

            <h1 className="text-8xl font-extrabold tracking-tight lg:text-9xl mb-4">
                403
            </h1>

            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Truy cập bị từ chối
            </h2>

            <p className="text-muted-foreground max-w-md text-lg mb-8">
                Xin lỗi, bạn không có quyền để xem trang này. Vui lòng kiểm tra lại tài khoản hoặc
                liên hệ với quản trị viên hệ thống nếu bạn nghĩ đây là một sự nhầm lẫn.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button
                    variant="outline"
                    size="lg"
                    onClick={handleGoBack}
                    className="flex items-center gap-2 w-full sm:w-auto"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại trang trước
                </Button>
                <Button
                    size="lg"
                    onClick={handleGoHome}
                    className="flex items-center gap-2 w-full sm:w-auto"
                >
                    <Home className="w-4 h-4" />
                    Về trang chủ
                </Button>
            </div>
        </div>
    );
};

export default Forbidden403;