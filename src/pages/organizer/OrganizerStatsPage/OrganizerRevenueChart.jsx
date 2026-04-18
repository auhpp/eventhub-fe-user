import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getVoucherRevenueWithTimeLabel } from '@/services/statsService';

export default function OrganizerRevenueChart({ filters, refresh, organizerId, eventSeriesId }) {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                if (!organizerId && !eventSeriesId) return;
                const data = await getVoucherRevenueWithTimeLabel({ eventSeriesId, organizerId, ...filters });
                setChartData(data.result || data || []);
            } catch (error) {
                console.error("Lỗi khi tải biểu đồ doanh thu:", error);
            }
        };
        fetchChartData();
    }, [filters, refresh, organizerId, eventSeriesId]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { notation: "compact", compactDisplay: "short" }).format(value) + ' ₫';
    };

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Biểu Đồ Doanh Thu</CardTitle>
                <CardDescription>Biến động tổng doanh thu</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full mt-2 [&_.recharts-wrapper]:outline-none [&_.recharts-surface]:outline-none [&_*:focus]:outline-none">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                            data={chartData}
                            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                            style={{ outline: 'none' }}

                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#9ca3af" opacity={0.5} />
                            <XAxis dataKey="timeLabel" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />

                            <YAxis yAxisId="left" tickFormatter={formatCurrency}
                                axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />

                            <Tooltip
                                formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
                                contentStyle={{
                                    borderRadius: '8px', border: 'none',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />

                            <Bar yAxisId="left" dataKey="gmv" name="Tổng Giao Dịch" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}