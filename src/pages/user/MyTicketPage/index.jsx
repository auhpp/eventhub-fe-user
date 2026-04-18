import React, { useState, useEffect, useContext } from "react";
import { Loader2 } from "lucide-react";
import DefaultPagination from "@/components/DefaultPagination";
import { useSearchParams } from "react-router-dom";
import { getBookings } from "@/services/bookingService";
import { HttpStatusCode } from "axios";
import TabsLayout from "@/components/TabsLayout";
import { AuthContext } from "@/context/AuthContex";
import TicketBookingCard from "@/features/tickets/TicketBookingCard";

const MyTicketPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useContext(AuthContext)
    const activeTab = searchParams.get("tab") || "COMING";
    const currentPage = parseInt(searchParams.get("page") || "1");
    const pageSize = 5;

    const tabs = [
        { value: "COMING", label: "Sắp diễn ra" },
        { value: "PAST", label: "Đã qua" },
        { value: "CANCELLED", label: "Đã hủy" },
    ];

    // Fetch data 
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setIsLoading(true);

                let upcomingParam = null;
                let statusParam = null;

                if (activeTab === "COMING") upcomingParam = true;
                if (activeTab === "PAST") upcomingParam = false;
                if (activeTab === "CANCELLED") {
                    upcomingParam = null;
                    statusParam = "CANCELLED";
                }

                const response = await getBookings({
                    userId: user.id,
                    status: statusParam,
                    upcoming: upcomingParam,
                    page: currentPage,
                    size: pageSize
                });

                if (response.code === HttpStatusCode.Ok) {
                    const resData = response.result;
                    setBookings(resData.data);
                    setTotalPages(resData.totalPage);
                    setTotalElements(resData.totalElements);
                }
            } catch (error) {
                console.log("Error fetching bookings:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBookings();
    }, [activeTab, currentPage, user]);

    const handleChangeTab = (tab) => {
        setSearchParams((prev) => {
            prev.set("tab", tab);
            prev.set("page", 1); 
            return prev;
        });
    };

    return (
        <div className="w-full dark:bg-slate-950 font-sans rounded-md">
            {/* Header Page */}
            <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Vé của tôi
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Quản lý và theo dõi các giao dịch mua vé của bạn.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <TabsLayout
                activeTab={activeTab}
                setActiveTab={handleChangeTab}
                tabs={tabs}
                content={
                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="flex h-64 items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            </div>
                        ) : bookings.length > 0 ? (
                            bookings.map((booking) => (
                                <TicketBookingCard key={booking.id} data={booking} currentUser={user} />
                            ))
                        ) : (
                            <div className="text-center py-20 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                <p className="text-slate-500">Chưa có đơn hàng nào trong mục này.</p>
                            </div>
                        )}
                    </div>
                }
            />

            {/* Pagination */}
            {bookings.length > 0 && (
                <div className="mt-6">
                    <DefaultPagination
                        currentPage={currentPage}
                        setSearchParams={setSearchParams}
                        totalPages={totalPages}
                        totalElements={totalElements}
                        pageSize={pageSize}
                    />
                </div>
            )}
        </div>
    );
};

export default MyTicketPage;