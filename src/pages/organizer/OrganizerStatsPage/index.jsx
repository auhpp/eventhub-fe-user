import React, { useState, useEffect, useContext } from 'react';
import { getOrganizerKpiReport } from '@/services/organizerStatsService'; // Sửa đường dẫn theo project của bạn
import { KpiCard } from './KpiCard';
import { DashboardFilters } from './DashboardFilters';
import OrganizerRevenueChart from './OrganizerRevenueChart';
import OrganizerTopEventsTable from './OrganizerTopEventsTable';
import OrganizerReviewWidget from './OrganizerReviewWidget';
import RefreshButton from '@/components/RefreshButton';
import {
    DollarSign,
    CalendarCheck,
    Clock,
    CheckCircle,
    Star,
    Loader2,
    Tag
} from 'lucide-react';
import { AuthContext } from '@/context/AuthContex';

export default function OrganizerStatsPage() {
    const { user } = useContext(AuthContext);
    const organizerId = user.id
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        timeUnit: 'MONTH'
    });
    const [kpiData, setKpiData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [refresh, setRefresh] = useState(false);

    useEffect(() => {
        fetchKpiData();
    }, [filters, refresh, organizerId]);

    const fetchKpiData = async () => {
        setLoading(true);
        try {
            const data = await getOrganizerKpiReport({ organizerId, ...filters });
            setKpiData(data.result);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu KPI Organizer:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
    const formatNumber = (value) => value?.toLocaleString('vi-VN') || '0';

    return (
        <div className="p-2 pb-6 space-y-6">
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Thống kê Sự kiện</h1>
                    <p className="text-muted-foreground mt-2">
                        Tổng quan về doanh thu, hiệu suất bán vé và đánh giá từ khách hàng của bạn.
                    </p>
                </div>
                <RefreshButton isLoading={loading} onClick={() => setRefresh(!refresh)} />
            </div>

            <DashboardFilters filters={filters} onFilterChange={setFilters} />

            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : kpiData ? (
                <div className="space-y-6">
                    {/* Section 1 */}
                    <div>
                        <h2 className="text-lg font-semibold mb-3">Hiệu suất kinh doanh</h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <KpiCard
                                title="Tổng Doanh Thu"
                                value={formatCurrency(kpiData.totalRevenue)}
                                icon={DollarSign}
                                iconColor="bg-green-100 text-green-600"
                            />
                            <KpiCard
                                title="Giảm giá"
                                value={formatCurrency(kpiData.totalRevenue - kpiData.totalRevenueAfterVoucher)}
                                icon={Tag}
                                iconColor="bg-blue-100 text-blue-600"
                            />
                            <KpiCard
                                title="Tổng phí dịch vụ"
                                value={formatCurrency(kpiData.totalFee)}
                                icon={DollarSign}
                                iconColor="bg-red-100 text-red-600"
                            />
                            <KpiCard
                                title="Doanh thu thực nhận"
                                value={formatCurrency(kpiData.totalRevenueAfterVoucher - kpiData.totalFee)}
                                icon={DollarSign}
                                iconColor="bg-green-100 text-green-600"
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2 lg:grid-cols-2">
                            <KpiCard
                                title="Điểm Đánh Giá TB"
                                value={`${(kpiData.totalRating || 0).toFixed(1)} / 5.0`}
                                icon={Star}
                                iconColor="bg-yellow-100 text-yellow-500"
                            />
                            <KpiCard
                                title="Tổng Lượt Đánh Giá"
                                value={formatNumber(kpiData.totalReviews)}
                                icon={Star}
                                iconColor="bg-orange-100 text-orange-600"
                            />
                        </div>
                    </div>

                    {/* Section 2 */}
                    <div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <KpiCard
                                title="Đang mở bán"
                                value={formatNumber(kpiData.activeEvents)}
                                icon={CheckCircle}
                                iconColor="bg-green-100 text-green-600"
                            />
                            <KpiCard
                                title="Sắp diễn ra"
                                value={formatNumber(kpiData.upcomingEvents)}
                                icon={Clock}
                                iconColor="bg-blue-100 text-blue-600"
                            />
                            <KpiCard
                                title="Đã kết thúc"
                                value={formatNumber(kpiData.pastEvents)}
                                icon={CalendarCheck}
                                iconColor="bg-gray-100 text-gray-600"
                            />
                        </div>
                    </div>

                    {/* Section 3 */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <OrganizerRevenueChart refresh={refresh} filters={filters} organizerId={organizerId} />
                        </div>
                        <div className="lg:col-span-1">
                            <OrganizerReviewWidget refresh={refresh} filters={filters} organizerId={organizerId} />
                        </div>
                    </div>

                    {/* Section 4 */}
                    <div className="w-full">
                        <OrganizerTopEventsTable refresh={refresh} filters={filters} organizerId={organizerId} />
                    </div>

                </div>
            ) : (
                <div className="text-center text-gray-500 py-10">Không có dữ liệu thống kê</div>
            )}
        </div>
    );
}