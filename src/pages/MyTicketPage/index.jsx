import React, { useState, useEffect } from "react";
import { Loader2, CalendarDays, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import TicketCard from "@/features/tickets/TicketCard";
import DefaultPagination from "@/components/DefaultPagination";
import { useSearchParams } from "react-router-dom";
import { getAttendeeByCurrentUser } from "@/services/attendeeService";
import { HttpStatusCode } from "axios";
import TabsLayout from "@/components/TabsLayout";


const MyTicketPage = () => {
    const [activeTab, setActiveTab] = useState("COMING");
    const [isLoading, setIsLoading] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("page") || "1");
    const pageSize = 2;
    const tabs = [
        { value: "COMING", label: "Sắp diễn ra" },
        { value: "PAST", label: "Đã qua" },
        { value: "CANCELLED", label: "Đã hủy" },
    ]

    // Fetch data 
    useEffect(() => {
        const fetchTickets = async () => {
            try {
                setIsLoading(true)
                const response = await getAttendeeByCurrentUser({
                    attendeeStatus: activeTab,
                    page: currentPage, size: pageSize
                })
                if (response.code == HttpStatusCode.Ok) {
                    setTickets(response.result.data)
                    setTotalPages(response.result.totalPage);
                    setTotalElements(response.result.totalElements);
                }
            } catch (error) {
                console.log(error)
            }
            finally {
                setIsLoading(false)
            }
        }
        fetchTickets()
    }, [activeTab, currentPage]);

    return (
        <div className="w-full dark:bg-slate-950 font-sans rounded-md">
            {/* Header Page */}
            <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Vé điện tử của tôi
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Quản lý vé tham dự và mã QR check-in của bạn.
                    </p>
                </div>
                <Button variant="outline" className="hidden md:flex gap-2 rounded-xl bg-white shadow-sm">
                    <CalendarDays className="h-5 w-5" />
                    Xem lịch trình
                </Button>
            </div>

            {/* Filters */}
            <TabsLayout
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                tabs={tabs}
                content={
                    <div className="space-y-6">
                        {isLoading ? (
                            <div className="flex h-64 items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            </div>
                        ) : tickets.length > 0 ? (
                            tickets.map((ticket) => (
                                <TicketCard key={ticket.id} data={ticket} />
                            ))
                        ) : (
                            <div className="text-center py-20">
                                <p className="text-slate-500">Chưa có vé nào trong mục này.</p>
                            </div>
                        )}
                    </div>
                }
            />
            {/* Pagination */}
            <DefaultPagination
                currentPage={currentPage}
                setSearchParams={setSearchParams}
                totalPages={totalPages}
                totalElements={totalElements}
                pageSize={pageSize}
            />

        </div>
    );
};

export default MyTicketPage;