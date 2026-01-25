import React from 'react';
import DefaultHeader from '@/layouts/DefaultHeader';

const DefaultNoneFooterLayout = ({ children }) => {
    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background font-sans text-foreground">
            <DefaultHeader />

            <main className="flex-1">
                {children}
            </main>

        </div>
    );
};

export default DefaultNoneFooterLayout;