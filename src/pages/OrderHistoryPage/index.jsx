import React, { useEffect, useState } from 'react';
import { Search, Filter, ShoppingBag, Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import OrderCard from '@/features/order/OrderCard';
import { getBookingsByCurrentUser } from '@/services/bookingService';
import { useSearchParams } from 'react-router-dom';
import DefaultPagination from '@/components/DefaultPagination';
import { HttpStatusCode } from 'axios';
import TabsLayout from '@/components/TabsLayout';


const OrderHistoryPage = () => {
    const [activeTab, setActiveTab] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const [bookings, setBookings] = useState([])
    const [isLoading, setIsLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("page") || "1");
    const pageSize = 2;
    const tabs = [
        { value: "ALL", label: "Tất cả" },
        { value: "PAID", label: "Hoàn thành" },
        { value: "CANCELLED", label: "Đã hủy" },
    ]
    useEffect(() => {
        const fetchTickets = async () => {
            try {
                setIsLoading(true)
                const response = await getBookingsByCurrentUser({
                    status: activeTab,
                    page: currentPage, size: pageSize
                })
                if (response.code == HttpStatusCode.Ok) {
                    setBookings(response.result.data)
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
        <div className="w-full">
            {/* title */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    Lịch sử Đơn hàng
                </h1>
                <p className="text-muted-foreground mt-1">
                    Quản lý và theo dõi các giao dịch mua vé của bạn.
                </p>
            </div>

            {/*  Search & Filter */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm theo tên sự kiện hoặc mã đơn..."
                        className="pl-9 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabs */}
            <TabsLayout
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                tabs={tabs}
                content={
                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="flex h-64 items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            </div>
                        ) :

                            bookings.length > 0 ? (
                                bookings.map((booking) => (
                                    <OrderCard key={booking.id} booking={booking} />
                                ))
                            ) : (
                                // Empty State
                                <div className="text-center py-16 bg-muted/30 rounded-lg border border-dashed">
                                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Filter className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">Không tìm thấy đơn hàng</h3>
                                    <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                                        Bạn chưa có đơn hàng nào trong mục này hoặc không tìm thấy kết quả phù hợp.
                                    </p>
                                </div>
                            )
                        }

                    </div>
                } />
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

export default OrderHistoryPage;