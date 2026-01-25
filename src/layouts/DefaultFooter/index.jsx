import React from 'react';
import { Calendar } from 'lucide-react';

const DefaultFooter = () => {
    return (
        <footer className="border-t bg-card py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">EventHub</span>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">
                        © 2024 EventHub. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-sm font-medium text-muted-foreground hover:text-brand transition-colors">Điều khoản</a>
                        <a href="#" className="text-sm font-medium text-muted-foreground hover:text-brand transition-colors">Bảo mật</a>
                        <a href="#" className="text-sm font-medium text-muted-foreground hover:text-brand transition-colors">Hỗ trợ</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default DefaultFooter;