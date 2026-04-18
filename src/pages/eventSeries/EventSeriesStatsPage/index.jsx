import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { getEventStats } from '@/services/statsService';
import RefreshButton from '@/components/RefreshButton';
import {
    DollarSign,
    Tag,
    Loader2
} from 'lucide-react';
import { AuthContext } from '@/context/AuthContex';
import { DashboardFilters } from '../../organizer/OrganizerStatsPage/DashboardFilters';
import { KpiCard } from '../../organizer/OrganizerStatsPage/KpiCard';
import OrganizerRevenueChart from '../../organizer/OrganizerStatsPage/OrganizerRevenueChart';
import OrganizerReviewWidget from '../../organizer/OrganizerStatsPage/OrganizerReviewWidget';
import OrganizerTopEventsTable from '../../organizer/OrganizerStatsPage/OrganizerTopEventsTable';
import { formatCurrency } from '@/utils/format';

export default function EventSeriesStatsPage() {
    const { user } = useContext(AuthContext);
    const organizerId = user?.id;
    const { eventSeriesId } = useParams();

    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        timeUnit: 'MONTH'
    });
    const [kpiData, setKpiData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [refresh, setRefresh] = useState(false);

    useEffect(() => {
        if (organizerId && eventSeriesId) {
            fetchKpiData();
        }
    }, [filters, refresh, organizerId, eventSeriesId]);

    const fetchKpiData = async () => {
        setLoading(true);
        try {
            const data = await getEventStats({ organizerId, eventSeriesId, ...filters });
            setKpiData(data.result);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu KPI Event Series:", error);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="p-2 pb-6 space-y-6">
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Thống kê Chuỗi Sự kiện (Event Series)</h1>
                    <p className="text-muted-foreground mt-2">
                        Tổng quan về doanh thu, hiệu suất bán vé cho chuỗi sự kiện này.
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
                        <h2 className="text-lg font-semibold mb-3">Tổng quan Doanh Thu</h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <KpiCard
                                title="Tổng Doanh Thu"
                                value={formatCurrency(kpiData.totalRevenue)}
                                icon={DollarSign}
                                iconColor="bg-green-100 text-green-600"
                            />
                            <KpiCard
                                title="Giảm giá"
                                value={formatCurrency(kpiData.discountAmount)}
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
                                value={formatCurrency(kpiData.totalRevenue - kpiData.discountAmount - kpiData.totalFee)}
                                icon={DollarSign}
                                iconColor="bg-green-100 text-green-600"
                            />
                        </div>
                    </div>

                    {/* Section 2 */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <OrganizerRevenueChart
                                refresh={refresh}
                                filters={filters}
                                organizerId={organizerId}
                                eventSeriesId={eventSeriesId}
                            />
                        </div>
                        <div className="lg:col-span-1">
                            <OrganizerReviewWidget
                                refresh={refresh}
                                filters={filters}
                                organizerId={organizerId}
                                eventSeriesId={eventSeriesId}
                            />
                        </div>
                    </div>

                    <div className="w-full">
                        <OrganizerTopEventsTable
                            refresh={refresh}
                            filters={filters}
                            organizerId={organizerId}
                            eventSeriesId={eventSeriesId}
                        />
                    </div>
                </div>
            ) : (
                <div className="text-center text-gray-500 py-10">Không có dữ liệu thống kê cho Series này</div>
            )}
        </div>
    );
}