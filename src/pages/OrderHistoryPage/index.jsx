import React, { useContext, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import OrderCard from '@/features/order/OrderCard';
import { useSearchParams } from 'react-router-dom';
import DefaultPagination from '@/components/DefaultPagination';
import { HttpStatusCode } from 'axios';
import TabsLayout from '@/components/TabsLayout';
import { getBookings } from '@/services/bookingService';
import { AuthContext } from '@/context/AuthContex';
import EmptyNotify from '@/components/EmptyNotify';


const OrderHistoryPage = () => {
    const [activeTab, setActiveTab] = useState("ALL");
    const [bookings, setBookings] = useState([])
    const { user } = useContext(AuthContext)
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
                const response = await getBookings({
                    userId: user.id,
                    eventSessionId: null,
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
                    Đơn hàng
                </h1>
                <p className="text-muted-foreground mt-1">
                    Quản lý và theo dõi các giao dịch mua vé của bạn.
                </p>
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
                                <EmptyNotify title={"Không tìm thấy đơn hàng"}
                                    subTitle={"  Bạn chưa có đơn hàng nào trong mục này hoặc không tìm thấy kết quả phù hợp."} />

                            )
                        }

                    </div>
                } />
            {/* Pagination */}
            {
                bookings.length > 0 &&
                <DefaultPagination
                    currentPage={currentPage}
                    setSearchParams={setSearchParams}
                    totalPages={totalPages}
                    totalElements={totalElements}
                    pageSize={pageSize}
                />
            }

        </div>
    );
};

export default OrderHistoryPage;