import DefaultPagination from "@/components/DefaultPagination";
import { AuthContext } from "@/context/AuthContex";
import EventSeriesCard from "@/features/eventSeries/EventSeriesCard";
import { getAllEventSeries, getEventSeries } from "@/services/eventSeriesService";
import { RoleName } from "@/utils/constant";
import { HttpStatusCode } from "axios";
import { Loader2 } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const EventSeriesPage = () => {
    const { user } = useContext(AuthContext);
    const isOrganizer = user.role.name == RoleName.ORGANIZER.key

    const [eventSeries, setEventSeries] = useState(null)
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("page") || "1");
    const pageSize = 4;
    const [myEventSeries, setMyEventSeries] = useState(null)

    useEffect(
        () => {
            const fetchEvents = async () => {
                try {
                    if (user) {
                        const response = await getEventSeries({
                            searchData: {
                                userFollowerId: user.id,
                            }, page: currentPage, size: pageSize
                        })
                        if (response.code == HttpStatusCode.Ok) {
                            setEventSeries(response.result.data)
                            setTotalPages(response.result.totalPage);
                            setTotalElements(response.result.totalElements);
                        }
                    }
                } catch (error) {
                    console.log(error)
                }
            }
            fetchEvents()
        }, [currentPage, user]
    )

    useEffect(
        () => {
            const fetchMyEventSeries = async () => {
                try {
                    const response = await getAllEventSeries()
                    if (response.code == HttpStatusCode.Ok) {
                        setMyEventSeries(response.result)
                    }

                } catch (error) {
                    console.log(error)
                }
            }
            fetchMyEventSeries()
        }, []
    )
    if (!eventSeries || isOrganizer && !myEventSeries) {
        return (
            <div className="flex justify-center items-center h-screen w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 pb-8 pt-6 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Chuỗi Sự kiện</h2>
                </div>
            </div>
            {
                isOrganizer &&
                <section className="">
                    {/* Header Section */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                            <h3 className="text-xl font-bold tracking-tight">Chuỗi sự kiện của tôi</h3>
                        </div>
                    </div>

                    {/* Grid Items */}
                    {
                        myEventSeries.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {
                                        myEventSeries.map((event) => (
                                            <EventSeriesCard
                                                key={event.id}
                                                series={event}
                                                showActionManage={true}
                                            />
                                        ))
                                    }
                                </div>
                            </>
                        ) : (
                            <EmptyNotify title={"Không tìm thấy sự kiện"} />
                        )
                    }
                </section>
            }
            <section className={`mt-5 ${isOrganizer ? "border-t" : ""}`}>
                {/* Header Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4 mt-5">
                    <div>
                        <h3 className="text-xl font-bold tracking-tight">Chuỗi sự kiện đang theo dõi</h3>
                    </div>
                </div>

                {/* Grid Items */}
                {
                    eventSeries.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2  gap-4">
                                {
                                    eventSeries.map((event) => (
                                        <>
                                            <EventSeriesCard
                                                key={event.id}
                                                series={event}
                                                showActionManage={false}
                                                showUpcomingEvents={true}
                                            />
                                        </>
                                    ))
                                }
                            </div>
                        </>
                    ) : (
                        <EmptyNotify title={"Không tìm thấy sự kiện"} />
                    )
                }
                {
                    eventSeries.length > 0 &&
                    <div className="mt-4">
                        <DefaultPagination
                            currentPage={currentPage}
                            setSearchParams={setSearchParams}
                            totalPages={totalPages}
                            totalElements={totalElements}
                            pageSize={pageSize}
                        />
                    </div>
                }
            </section>
        </div>
    )
}

export default EventSeriesPage;