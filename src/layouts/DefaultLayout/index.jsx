import React from 'react';
import DefaultHeader from '@/layouts/DefaultHeader';
import DefaultFooter from '@/layouts/DefaultFooter';

const DefaultLayout = ({ children }) => {
    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background font-sans text-foreground">
            <DefaultHeader />

            <main className="flex-1">
                {children}
            </main>

            <DefaultFooter />
        </div>
    );
};

export default DefaultLayout;