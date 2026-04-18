import React from 'react';
import DefaultHeader from '@/layouts/DefaultHeader';
import { Toaster } from 'sonner';

const DefaultNoneFooterLayout = ({ children }) => {
    return (
        <div className="relative flex h-screen w-full flex-col bg-background font-sans text-foreground overflow-hidden">
            <DefaultHeader />

            <main className="flex-1 overflow-y-auto">
                {children}
            </main>

            <Toaster position="top-center" richColors
                toastOptions={{
                    classNames: {
                        error: "bg-red-100 text-white",
                    },
                }}
            />
        </div>
    );
};

export default DefaultNoneFooterLayout;