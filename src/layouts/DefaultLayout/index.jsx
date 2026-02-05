import React from 'react';
import DefaultHeader from '@/layouts/DefaultHeader';
import DefaultFooter from '@/layouts/DefaultFooter';
import { Toaster } from 'sonner';

const DefaultLayout = ({ children }) => {
    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background font-sans text-foreground">
            <DefaultHeader />

            <main className="flex-1">
                {children}
            </main>
            <Toaster position="top-center" richColors
                toastOptions={{
                    classNames: {
                        error: "bg-red-100 text-white",

                    },
                }}
            />
            <DefaultFooter />
        </div>
    );
};

export default DefaultLayout;