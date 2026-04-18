import React, { useState, useEffect, useContext, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';
import { EventContext } from '@/context/EventContext';
import { getTickets } from '@/services/ticketService';
import SessionSelector from '@/components/SessionSelector';
import { useSearchParams } from 'react-router-dom';
import RevenueDetailsModal from './RevenueDetailsModal';
import { formatCurrency } from '@/utils/format';
import { getEventStats } from '@/services/statsService';
import { getEventChartStats } from '@/services/eventSessionService';


const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat('vi-VN').format(num);
};

const CircleProgress = ({ percentage }) => {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - ((percentage || 0) / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center w-24 h-24">
            <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200" />
                <circle
                    cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="text-amber-500 transition-all duration-1000 ease-in-out"
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute flex items-center justify-center text-lg font-bold text-gray-800">
                {percentage || 0}%
            </div>
        </div>
    );
};


export default function EventStatisticsPage() {
    const { event } = useContext(EventContext);
    const [searchParams, setSearchParams] = useSearchParams();

    const [timeFilter, setTimeFilter] = useState('LAST_30_DAYS');
    const [overviewData, setOverviewData] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [tickets, setTickets] = useState([]);

    const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const currentSessionId = useMemo(() => {
        const idFromUrl = searchParams.get("sessionId");
        if (idFromUrl) return Number(idFromUrl);
        if (event?.eventSessions?.length > 0) return event.eventSessions[0].id;
        return null;
    }, [searchParams, event]);

    // Fetch Overview & Tickets
    useEffect(() => {
        const fetchBaseData = async () => {
            setIsLoading(true);
            try {
                const [overviewRes, ticketsRes] = await Promise.all([
                    getEventStats({ eventSessionId: currentSessionId }),
                    getTickets({ eventSessionId: currentSessionId })
                ]);

                setOverviewData(overviewRes?.result || null);
                setTickets(Array.isArray(ticketsRes?.result) ? ticketsRes.result : []);

            } catch (error) {
                console.error("Failed to fetch event stats", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (currentSessionId) fetchBaseData();
    }, [currentSessionId]);

    // Fetch Chart Data
    useEffect(() => {
        const fetchChart = async () => {
            try {
                const chartRes = await getEventChartStats({ eventSessionId: currentSessionId, timeFilter });
                setChartData(Array.isArray(chartRes?.result.data) ? chartRes.result.data : []);
            } catch (error) {
                console.error("Failed to fetch chart stats", error);
                setChartData([]);
            }
        };

        if (currentSessionId) fetchChart();
    }, [currentSessionId, timeFilter]);

    const handleSessionChange = (id) => {
        setSearchParams(prev => {
            prev.set("sessionId", id);
            return prev;
        });
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-[60vh] w-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>

    }

    return (
        <div className="min-h-screen space-y-6 pb-4">

            {/* Header & Session Selector */}
            <h2 className="text-xl font-semibold text-gray-800 mt-1">Doanh thu</h2>
            <SessionSelector sessions={event?.eventSessions || []}
                selectedSessionId={currentSessionId} onSelect={handleSessionChange} />

            {/* OVERVIEW CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Card */}
                <div
                    onClick={() => setIsRevenueModalOpen(true)}
                    className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 flex justify-between items-center cursor-pointer hover:border-emerald-200 hover:shadow-md transition-all group"
                >
                    <div>
                        <p className="text-sm text-gray-500 font-medium mb-1 group-hover:text-emerald-600 transition-colors">Doanh thu</p>
                        <h3 className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(overviewData?.totalRevenue)}</h3>
                        <p className="text-xs text-gray-400">Tổng: {formatCurrency(overviewData?.maxPotentialRevenue)}</p>
                    </div>
                    <CircleProgress percentage={overviewData?.revenuePercentage} />
                </div>

                {/* Card */}
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">Số vé đã bán</p>
                        <h3 className="text-3xl font-bold text-gray-900 mb-2">{formatNumber(overviewData?.totalTicketsSold)} vé</h3>
                        <p className="text-xs text-gray-400">Tổng: {formatNumber(overviewData?.totalCapacity)} vé</p>
                    </div>
                    <CircleProgress percentage={overviewData?.ticketsSoldPercentage} />
                </div>
            </div>

            {/* CHART SECTION */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    {/* Legend */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                            <span className="text-sm font-semibold text-gray-700">Doanh thu</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                            <span className="text-sm font-semibold text-gray-700">Số vé bán</span>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setTimeFilter('LAST_24_HOURS')}
                            className={`px-4 py-1.5 text-sm rounded-md transition-all ${timeFilter === 'LAST_24_HOURS' ? 'bg-primary text-white font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            24 giờ
                        </button>
                        <button
                            onClick={() => setTimeFilter('LAST_30_DAYS')}
                            className={`px-4 py-1.5 text-sm rounded-md transition-all ${timeFilter === 'LAST_30_DAYS' ? 'bg-primary text-white font-medium shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            30 ngày
                        </button>
                    </div>
                </div>

                <div className="w-full outline-none focus:outline-none [&_.recharts-wrapper]:outline-none [&_.recharts-surface]:outline-none">
                    <ResponsiveContainer width="100%" height={350} minWidth={0}>
                        <LineChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                            {/* <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" /> */}
                            <CartesianGrid vertical={false} horizontal={true} stroke="#E5E7EB" />
                            <XAxis dataKey="timeLabel" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />

                            <YAxis
                                yAxisId="left"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                dx={-10}
                                allowDecimals={false}
                                tickFormatter={(val) => {
                                    if (val === 0) return '0';
                                    if (val >= 1000000) return `${val / 1000000}M`;
                                    if (val >= 1000) return `${val / 1000}K`;
                                    return val;
                                }}
                            />

                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                dx={10}
                                allowDecimals={false}
                                tickCount={5} 
                            />

                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value, name) => [name === 'revenue' ? formatCurrency(value) : value, name === 'revenue' ? 'Doanh thu' : 'Số vé bán']}
                                labelStyle={{ color: '#374151', fontWeight: 'bold', marginBottom: '4px' }}
                            />
                            <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            <Line yAxisId="right" type="monotone" dataKey="ticketsSold" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* TABLE detail ticket */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden mt-6 pb-6">
                <div className="p-5 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800">Chi tiết</h3>
                    <p className="text-sm text-gray-500 mt-1">Vé đã bán</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-medium">Loại vé</th>
                                <th className="px-6 py-4 font-medium text-right">Giá bán</th>
                                <th className="px-6 py-4 font-medium text-center">Đã bán</th>
                                <th className="px-6 py-4 font-medium w-1/4">Tỉ lệ bán</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map((ticket, index) => {
                                const sellRate = ticket.quantity > 0 ? (ticket.soldQuantity / ticket.quantity) * 100 : 0;
                                console.log(sellRate)
                                return (
                                    <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors" >
                                        <td className="px-6 py-4 font-medium text-gray-800">{ticket.name}</td>
                                        <td className="px-6 py-4 text-right text-gray-600">{formatCurrency(ticket.price)}</td>
                                        <td className="px-6 py-4 text-center font-medium text-gray-800">{ticket.soldQuantity} / {ticket.quantity}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-full bg-gray-100 rounded-full h-2">
                                                    <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${sellRate}%` }}></div>
                                                </div>
                                                <span className="text-xs font-semibold text-gray-600 min-w-[3ch]">{sellRate.toFixed(1)}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {tickets.length === 0 && (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-400">Chưa có dữ liệu vé</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Render Modal */}
            <RevenueDetailsModal
                isOpen={isRevenueModalOpen}
                onClose={() => setIsRevenueModalOpen(false)}
                data={overviewData}
                event={event}
            />
        </div >
    );
}