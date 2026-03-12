import DefaultPagination from '@/components/DefaultPagination';
import { routes } from '@/config/routes';
import EventCard from '@/features/event/EventCard';
import React from 'react';

const EventListSection = ({ events, currentPage, totalPages, totalElements, pageSize, setSearchParams, navigate }) => {

    if (!events || events.length === 0) {
        return (
            <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                Không tìm thấy sự kiện nào phù hợp.
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-4 mb-8">
                {events.map((event) => (
                    <EventCard
                        key={event.id}
                        event={event}
                        showActionManage={false}
                        userMode={true}
                        onClick={() => navigate(routes.eventDetail.replace(":id", event.id))}
                    />
                ))}
            </div>

            {totalPages >= 1 && (
                <DefaultPagination
                    currentPage={currentPage}
                    setSearchParams={setSearchParams}
                    totalPages={totalPages}
                    totalElements={totalElements}
                    pageSize={pageSize}
                />
            )}
        </>
    );
};

export default EventListSection;