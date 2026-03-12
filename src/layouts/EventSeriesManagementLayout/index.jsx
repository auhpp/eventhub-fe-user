import { Toaster } from "@/components/ui/sonner";
import { EventSeriesProvider } from "@/context/EventSeriesContext";
import EventSeriesManagementSidebar from "../EventSeriesManagementSidebar";
import EventSeriesMangementHeader from "../EventSeriesManagementHeader";

const EventSeriesManagementLayout = ({ children }) => {
    return (
        <EventSeriesProvider>
            <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
                <EventSeriesManagementSidebar />
                {/*  Main Content Area */}
                <main className="flex-1 flex flex-col h-full overflow-hidden relative">

                    {/* Header (Fixed Top inside Main) */}
                    <EventSeriesMangementHeader />

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
        </EventSeriesProvider>
    );
};

export default EventSeriesManagementLayout;