import React, { useState, useEffect, useContext } from "react";
import { Loader2 } from "lucide-react";
import DefaultPagination from "@/components/DefaultPagination";
import { useSearchParams } from "react-router-dom";
import { HttpStatusCode } from "axios";
import TabsLayout from "@/components/TabsLayout";
import { AuthContext } from "@/context/AuthContex";
import ResaleTicketCard from "@/features/resale/ResaleCard";
import { filterResalePosts } from "@/services/resalePostService";
import { ResalePostStatus } from "@/utils/constant";

const ResaleTicketPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [resalePosts, setResalePosts] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useContext(AuthContext);

    const activeTab = searchParams.get("tab") || "SELLING";
    const currentPage = parseInt(searchParams.get("page") || "1");
    const pageSize = 5;

    const tabs = [
        { value: "SELLING", label: "Đang bán" },
        { value: "SOLD", label: "Đã bán" },
        { value: "CANCELLED", label: "Đã hủy" },
    ];

    // Fetch data 
    useEffect(() => {
        const fetchResalePosts = async () => {
            if (!user?.id) return;

            try {
                setIsLoading(true);


                let statusParams = [];
                if (activeTab === "SELLING") {
                    statusParams = [ResalePostStatus.PENDING, ResalePostStatus.APPROVED];
                } else if (activeTab === "SOLD") {
                    statusParams = [ResalePostStatus.SOLD];
                } else if (activeTab === "CANCELLED") {
                    statusParams = [ResalePostStatus.CANCELLED_BY_USER, ResalePostStatus.REJECTED,
                    ResalePostStatus.CANCELLED_BY_ADMIN
                    ];
                }

                const response = await filterResalePosts({
                    userId: user.id,
                    statuses: statusParams,
                    page: currentPage,
                    size: pageSize
                });

                if (response.code === HttpStatusCode.Ok) {
                    const resData = response.result;
                    setResalePosts(resData.data || []);
                    setTotalPages(resData.totalPage || 1);
                    setTotalElements(resData.totalElements || 0);
                }
            } catch (error) {
                console.log("Error fetching resale posts:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchResalePosts();
    }, [activeTab, currentPage, user]);

    const handleChangeTab = (tab) => {
        setSearchParams((prev) => {
            prev.set("tab", tab);
            prev.set("page", 1);
            return prev;
        });
    };

    return (
        <div className="w-full dark:bg-slate-950 font-sans rounded-md">
            {/* Header Page */}
            <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Vé bán lại
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Quản lý các bài đăng bán lại vé, theo dõi trạng thái và doanh thu.
                    </p>
                </div>
            </div>

            {/* Filters & List */}
            <TabsLayout
                activeTab={activeTab}
                setActiveTab={handleChangeTab}
                tabs={tabs}
                content={
                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="flex h-64 items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            </div>
                        ) : resalePosts.length > 0 ? (
                            resalePosts.map((post) => (
                                <ResaleTicketCard key={post.id} data={post} currentUser={user} />
                            ))
                        ) : (
                            <div className="text-center py-20 bg-slate-50 rounded-lg border border-dashed border-slate-200
                             flex flex-col items-center justify-center">
                                <p className="text-slate-500 mb-4">Không có bài đăng bán vé nào trong mục này.</p>
                            </div>
                        )}
                    </div>
                }
            />

            {/* Pagination */}
            {resalePosts.length > 0 && (
                <div className="mt-6">
                    <DefaultPagination
                        currentPage={currentPage}
                        setSearchParams={setSearchParams}
                        totalPages={totalPages}
                        totalElements={totalElements}
                        pageSize={pageSize}
                    />
                </div>
            )}
        </div>
    );
};

export default ResaleTicketPage;