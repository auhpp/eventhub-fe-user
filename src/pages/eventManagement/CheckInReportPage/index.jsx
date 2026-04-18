import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom'; 
import { RefreshCw, Users, UserMinus } from 'lucide-react';
import { EventContext } from '@/context/EventContext';
import SessionSelector from '@/components/SessionSelector';
import { reportCheckin } from '@/services/eventSessionService';
import { HttpStatusCode } from 'axios';
import CircleProgress from './CircularProgress';
import { routes } from '@/config/routes';

const CheckInReportPage = () => {
    const { event } = useContext(EventContext);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate(); 
    const [reportData, setReportData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // 1. Logic handle Session ID from URL params 
    const currentSessionId = useMemo(() => {
        const idFromUrl = searchParams.get("sessionId");
        if (idFromUrl) return Number(idFromUrl);
        if (event?.eventSessions?.length > 0) return event.eventSessions[0].id;
        return null;
    }, [searchParams, event]);

    useEffect(() => {
        if (event?.eventSessions?.length > 0 && !searchParams.get("sessionId")) {
            setSearchParams(prev => {
                prev.set("sessionId", event.eventSessions[0].id);
                return prev;
            }, { replace: true });
        }
    }, [event, searchParams, setSearchParams]);

    const handleSessionChange = (id) => {
        setSearchParams(prev => {
            prev.set("sessionId", id);
            prev.set("page", "1"); // Reset page 
            return prev;
        });
    };

    // 2. call api fetch data
    const fetchReportData = useCallback(async () => {
        if (!currentSessionId) return;

        try {
            const response = await reportCheckin({ eventSessionId: currentSessionId });
            if (response.code == HttpStatusCode.Ok) {
                setReportData(response.result);
            }
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu báo cáo:", error);
        }
        finally {
            setIsLoading(false)
        }
    }, [currentSessionId]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchReportData();
    }, [fetchReportData]);

    // 3. calculate total
    const totalCheckInPercent = useMemo(() => {
        if (!reportData || reportData.soldQuantity === 0) return 0;
        return Math.round((reportData.checkedInQuantity / reportData.soldQuantity) * 100);
    }, [reportData]);

    const handleTicketClick = (ticketId, ticketName) => {
        navigate(
            routes.attendeeCheckInList.replace(":id", event.id).replace(":ticketId", ticketId),
            {
                state: {
                    eventSessionId: currentSessionId,
                    ticketName: ticketName
                }
            }

        );
    };

    return (
        <div className="w-full space-y-6">
            {/* Header & Session Selector */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Check-in</h1>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchReportData}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Làm mới
                    </button>
                </div>
            </div>

            {/* component SessionSelector */}
            <SessionSelector
                sessions={event?.eventSessions || []}
                selectedSessionId={currentSessionId}
                onSelect={handleSessionChange}
            />

            {/* Overview Section */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-800">Tổng quan</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Card process Check-in */}
                    <div className="md:col-span-1 bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500">Đã check-in</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {reportData?.checkedInQuantity || 0} vé
                            </p>
                            <p className="text-sm text-gray-500">
                                Đã bán {reportData?.soldQuantity || 0} vé
                            </p>
                        </div>
                        <CircleProgress percentage={totalCheckInPercent} />
                    </div>

                    {/* small Cards  */}
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Trong sự kiện</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {reportData?.checkedInQuantity || 0}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
                            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                                <UserMinus className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Đã ra ngoài</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {reportData?.outsideQuantity || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Section */}
            <div className="space-y-3 pt-4">
                <h2 className="text-lg font-semibold text-gray-800">Chi tiết</h2>
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">Loại vé</th>
                                    <th className="px-6 py-4 text-center">Khách mua</th>
                                    <th className="px-6 py-4 text-center">Khách mời</th>
                                    <th className="px-6 py-4 w-2/5">Tỉ lệ check-in</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {reportData?.ticketCheckIns?.map((ticket, index) => {
                                    const ticketPercent = ticket.soldQuantity > 0
                                        ? Math.round((ticket.checkInQuantity / ticket.soldQuantity) * 100)
                                        : 0;
                                    const ticketPercentGuest = ticket.guestInvitedQuantity > 0
                                        ? Math.round((ticket.guestCheckedInQuantity / ticket.guestInvitedQuantity) * 100)
                                        : 0;
                                    return (
                                        <tr
                                            key={index}
                                            className="hover:bg-gray-100 transition-colors cursor-pointer" 
                                            onClick={() => handleTicketClick(ticket.id, ticket.name)} 
                                        >
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {ticket.name}
                                            </td>
                                            <td className="px-6 py-4 text-center text-gray-600">
                                                <span className="font-semibold text-gray-900">{ticket.checkInQuantity}</span> / {ticket.soldQuantity}
                                            </td>
                                            <td className="px-6 py-4 text-center text-gray-600">
                                                <span className="font-semibold text-gray-900">{ticket.guestCheckedInQuantity}</span> / {ticket.guestInvitedQuantity}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <span className='text-xs w-[90px]'>Khách mua</span>
                                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                        <div
                                                            className="bg-amber-500 h-2.5 rounded-full transition-all duration-500"
                                                            style={{ width: `${ticketPercent}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs font-semibold text-gray-600 min-w-[2rem]">
                                                        {ticketPercent}%
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className='text-xs  w-[90px]'>Khách mời</span>

                                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                        <div
                                                            className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                                                            style={{ width: `${ticketPercentGuest}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs font-semibold text-gray-600 min-w-[2rem]">
                                                        {ticketPercentGuest}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {(!reportData?.ticketCheckIns || reportData.ticketCheckIns.length === 0) && (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                                            Không có dữ liệu
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckInReportPage;