import DefaultHeader from "../DefaultHeader";
import ProfileSidebar from "../ProfileSidebar";

export default function ProfileLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <DefaultHeader />

            <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 md:p-8 gap-8">

                <ProfileSidebar />

                <main className="flex-1 min-w-0 flex flex-col gap-6">
                    {children}
                </main>

            </div>
        </div>
    );
}