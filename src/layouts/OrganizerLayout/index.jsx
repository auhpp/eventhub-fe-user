import { Toaster } from "@/components/ui/sonner";
import OrganizerHeader from "../OrganizerHeader";
import OrganizerSidebar from "../OrganizerSideBar";



const OrganizerLayout = ({ children }) => {
    return (
        <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
            <OrganizerSidebar />
            {/*  Main Content Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">

                {/* Header (Fixed Top inside Main) */}
                <OrganizerHeader />

                {/* Page Content (Scrollable) */}
                <div className="flex-1 overflow-y-auto bg-background/50 px-6 pt-4">
                    {children}
                </div>
                <Toaster position="top-center" richColors
                    toastOptions={{
                        classNames: {
                            error: "bg-red-100 text-white",

                        },
                    }}
                />
            </main>
        </div>
    );
};

export default OrganizerLayout;