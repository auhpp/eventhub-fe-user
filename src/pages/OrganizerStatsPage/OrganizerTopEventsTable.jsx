import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star } from 'lucide-react';
import { getTopEventRevenue } from '@/services/statsService';

export default function OrganizerTopEventsTable({ filters, refresh, organizerId, eventSeriesId }) {
    const [events, setEvents] = useState([]);
    const [limit, setLimit] = useState("5");

    useEffect(() => {
        const fetchTopEvents = async () => {
            try {
                if (!organizerId && !eventSeriesId) return;
                const data = await getTopEventRevenue({
                    eventSeriesId,
                    organizerId,
                    ...filters,
                    limit: parseInt(limit, 10)
                });
                setEvents(data.result || data || []);
            } catch (error) {
                console.error("Lỗi tải Top Sự kiện:", error);
            }
        };
        fetchTopEvents();
    }, [filters, refresh, organizerId, limit, eventSeriesId]); 

    const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="space-y-1">
                    <CardTitle className="text-base">Top Sự Kiện Thành Công Nhất</CardTitle>
                    <CardDescription>Sắp xếp theo tổng doanh thu mang lại</CardDescription>
                </div>

                <Select value={limit} onValueChange={setLimit}>
                    <SelectTrigger className="w-[120px] bg-card h-9 text-sm">
                        <SelectValue placeholder="Số lượng" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="5">Top 5</SelectItem>
                        <SelectItem value="10">Top 10</SelectItem>
                        <SelectItem value="20">Top 20</SelectItem>
                        <SelectItem value="50">Top 50</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="px-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-y">
                            <tr>
                                <th className="px-4 py-3">Sự Kiện</th>
                                <th className="px-4 py-3 text-right">Doanh thu</th>
                                <th className="px-4 py-3 text-right">Vé Bán / Lấp đầy</th>
                                <th className="px-4 py-3 text-right">Thực tế Check-in</th>
                                <th className="px-4 py-3 text-right">Đánh giá</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {events.map((evt) => (
                                <tr key={evt.eventId} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-gray-900 truncate max-w-[250px]">{evt.eventName}</p>
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold text-green-600">
                                        {formatCurrency(evt.totalRevenue)}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <p className="font-medium text-gray-900">{evt.totalTicketsSold} / {evt.totalTickets}</p>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {evt.totalCheckIn}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <span className="font-medium">{evt.averageRating?.toFixed(1)}</span>
                                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                        </div>
                                        <p className="text-xs text-gray-500">({evt.reviewCount} lượt)</p>
                                    </td>
                                </tr>
                            ))}
                            {events.length === 0 && (
                                <tr><td colSpan="5" className="text-center py-6 text-gray-500">Không có dữ liệu</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}