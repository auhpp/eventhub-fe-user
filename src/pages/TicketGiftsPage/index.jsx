import React, { useState, useEffect, useContext } from "react";
import { Loader2, Gift, Send, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import DefaultPagination from "@/components/DefaultPagination";
import { useSearchParams } from "react-router-dom";
import TabsLayout from "@/components/TabsLayout";
import { getTicketGifts } from "@/services/ticketGiftService";
import TicketGiftItem from "./TicketGiftItem";
import { TicketGiftStatus } from "@/utils/constant";
import { AuthContext } from "@/context/AuthContex";
import { HttpStatusCode } from "axios";

const TicketGiftsPage = () => {
    const { user } = useContext(AuthContext);

    const [searchParams, setSearchParams] = useSearchParams();

    const activeTab = searchParams.get("tab") || "RECEIVED";

    // Pagination State
    const currentPage = parseInt(searchParams.get("page") || "1");
    const pageSize = 5;

    const [isLoading, setIsLoading] = useState(false);
    const [gifts, setGifts] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    // Filter State
    const [searchKeyword, setSearchKeyword] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const tabs = [
        { value: "RECEIVED", label: "Quà được tặng", icon: Gift },
        { value: "SENT", label: "Quà đã gửi", icon: Send },
    ];

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchGifts = async () => {
            if (!user?.email) return;

            try {
                setIsLoading(true);

                const isReceivedTab = activeTab === "RECEIVED";

                const params = {
                    page: currentPage,
                    size: pageSize,
                    status: statusFilter === "ALL" ? null : statusFilter,
                    receiverEmail: isReceivedTab ? user.email : (searchKeyword || null),
                    senderEmail: isReceivedTab ? (searchKeyword || null) : user.email,
                };

                const response = await getTicketGifts(params);

                if (response.code == HttpStatusCode.Ok) {
                    setGifts(response.result.data);
                    setTotalPages(response.result.totalPage);
                    setTotalElements(response.result.totalElements);
                } else {
                    setGifts([]);
                }
            } catch (error) {
                console.error("Failed to fetch gifts:", error);
                setGifts([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGifts();
    }, [activeTab, currentPage, user?.email, searchKeyword, statusFilter]);

    // --- HANDLERS ---

    const handleTabChange = (val) => {
        // Clear search input local state
        setSearchKeyword("");
        setStatusFilter("ALL");

        // set new tab and reset to page 1
        setSearchParams({ tab: val, page: "1" });
    };

    const handleFilterChange = (key, value) => {
        if (key === "search") setSearchKeyword(value);
        if (key === "status") setStatusFilter(value);

        setSearchParams({ tab: activeTab, page: "1" });
    };

    // --- RENDER CONTENT HELPER ---
    const renderContent = () => (
        <div className="space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-card p-4 rounded-lg border shadow-sm">

                <div className="flex flex-1 items-center gap-2 w-full sm:w-auto">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={activeTab === "RECEIVED" ? "Tìm theo email người gửi..." : "Tìm theo email người nhận..."}
                            className="pl-9 bg-white"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onBlur={(e) => handleFilterChange("search", e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleFilterChange("search", e.currentTarget.value)}
                        />
                    </div>

                    {/* Status Select */}
                    <Select value={statusFilter} onValueChange={(val) => handleFilterChange("status", val)}>
                        <SelectTrigger className="w-[180px]">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                <SelectValue placeholder="Trạng thái" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                            <SelectItem value={TicketGiftStatus.PENDING}>Chờ nhận</SelectItem>
                            <SelectItem value={TicketGiftStatus.ACCEPTED}>Đã nhận</SelectItem>
                            <SelectItem value={TicketGiftStatus.REJECTED}>Đã từ chối</SelectItem>
                            <SelectItem value={TicketGiftStatus.REVOKED}>Đã thu hồi</SelectItem>
                            <SelectItem value={TicketGiftStatus.EXPIRED}>Hết hạn</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* List Data */}
            {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-brand" />
                </div>
            ) : gifts.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {gifts.map((gift) => (
                        <TicketGiftItem
                            key={gift.id || gift.createdAt}
                            data={gift}
                            isSentType={activeTab === "SENT"}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                    <div className="bg-gray-50 p-4 rounded-full mb-3">
                        <Gift className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">Không tìm thấy quà tặng nào.</p>
                    <p className="text-sm text-gray-400 mt-1">
                        Thử thay đổi bộ lọc hoặc tìm kiếm từ khóa khác.
                    </p>
                </div>
            )}
        </div>
    );

    return (
        <div className="dark:bg-slate-950 font-sans rounded-md">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    Quà tặng vé
                </h1>
                <p className="text-muted-foreground mt-1">
                    Quản lý vé bạn đã gửi tặng hoặc nhận được từ bạn bè.
                </p>
            </div>

            {/* Tabs & Content */}
            <TabsLayout
                activeTab={activeTab}
                setActiveTab={handleTabChange}
                tabs={tabs}
                className="mb-6"
                content={renderContent()}
            />

            {/* Pagination */}
            {gifts.length > 0 && (
                <div className="mt-6">
                    <DefaultPagination
                        currentPage={currentPage}
                        setSearchParams={(newParams) => {
                            setSearchParams((prev) => {
                                const nextParams = typeof newParams === 'function' ? newParams(prev) : newParams;
                                return {
                                    ...Object.fromEntries(prev),
                                    ...nextParams,
                                    tab: activeTab
                                };
                            })
                        }}
                        totalPages={totalPages}
                        totalElements={totalElements}
                        pageSize={pageSize}
                    />
                </div>
            )}
        </div>
    );
};

export default TicketGiftsPage;