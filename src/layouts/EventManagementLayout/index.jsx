import { Toaster } from "@/components/ui/sonner";
import EventManagementSidebar from "../EventManagementSidebar";
import EventMangementHeader from "../EventManagementHeader";
import { EventProvider } from "@/context/EventContext";

const EventManagementLayout = ({ children }) => {
    return (
        <EventProvider>
            <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
                <EventManagementSidebar />
                {/*  Main Content Area */}
                <main className="flex-1 flex flex-col h-full overflow-hidden relative">

                    {/* Header (Fixed Top inside Main) */}
                    <EventMangementHeader />

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
        </EventProvider>
    );
};

export default EventManagementLayout;