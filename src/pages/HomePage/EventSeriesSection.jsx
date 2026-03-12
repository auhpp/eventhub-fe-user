import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { HttpStatusCode } from 'axios';
import { getEventSeries } from '@/services/eventSeriesService';
import EventSeriesCard from '@/features/eventSeries/EventSeriesCard';

const EventSeriesSection = () => {
    const [eventSeries, setEventSeries] = useState(null)
    useEffect(
        () => {
            const fetchCategory = async () => {
                try {
                    const response = await getEventSeries({ page: 1, size: 3 })
                    if (response.code == HttpStatusCode.Ok) {
                        setEventSeries(response.result.data)
                    }
                } catch (error) {
                    console.log(error)
                }
            }
            fetchCategory()
        }, []
    )
    if (!eventSeries) {
        return (
            <div className="flex justify-center items-center h-screen w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }
    return (
        <section className="mx-auto max-w-7xl px-4 pb-8 pt-6 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Theo dõi Chuỗi Sự kiện</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Chọn chuỗi sự kiện bạn yêu thích để nhận thông báo ngay.</p>
                </div>
            </div>

            {/* Grid Items */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-4">
                {eventSeries.map((es) => (
                    <EventSeriesCard series={es} showActionManage={false} />
                ))}
            </div>
        </section>
    );
};

export default EventSeriesSection;