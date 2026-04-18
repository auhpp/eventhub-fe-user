import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus } from "lucide-react";
import { toast } from "sonner";
import { HttpStatusCode } from 'axios';

import DefaultPagination from '@/components/DefaultPagination';
import { deleteCoupon, getCoupons, disableCoupon } from '@/services/couponService';
import VoucherTable from './VoucherTable';
import { routes } from '@/config/routes';
import { ConfirmCancelModal } from '@/components/ConfirmCancelModal';
import VoucherStatisticsModal from './VoucherStatisticsModal';
import { CouponStatus } from '@/utils/constant';

const VoucherManagementPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { id } = useParams()
    const [dataList, setDataList] = useState([]);
    const [loading, setLoading] = useState(false);

    // Pagination & Filter
    const currentPage = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("size") || "10");
    const statusFilter = searchParams.get("status") || "ALL";
    const keyword = searchParams.get("search") || "";

    // Pagination Result
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    // State for delete
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [voucherToDelete, setVoucherToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // State for disable
    const [isDisableDialogOpen, setIsDisableDialogOpen] = useState(false);
    const [voucherToDisable, setVoucherToDisable] = useState(null);
    const [isDisabling, setIsDisabling] = useState(false);

    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [voucherForStats, setVoucherForStats] = useState(null);

    // Fetch Data
    useEffect(() => {
        fetchData();
    }, [currentPage, pageSize, statusFilter, keyword]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const statusReq = statusFilter == "ALL" ? null : statusFilter
            const res = await getCoupons({
                status: statusReq,
                keyword: keyword == "" ? null : keyword,
                eventId: id,
                page: currentPage,
                size: pageSize,
            });

            if (res.code === HttpStatusCode.Ok) {
                const resultData = res.result?.data || [];
                setDataList(resultData);
                setTotalPages(res.result?.totalPage || 1);
                setTotalElements(res.result?.totalElements || 0);
            }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi tải danh sách voucher.");
            setDataList([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setSearchParams(prev => {
            if (value === "ALL" && key === "status") prev.delete(key);
            else if (!value) prev.delete(key);
            else prev.set(key, value);
            prev.set("page", "1");
            return prev;
        });
    };

    const handleEdit = (voucher) => {
        navigate(routes.editVoucher.replace(":id", id).replace(":voucherId", voucher.id));
    };

    const handleDeleteClick = (voucher) => {
        setVoucherToDelete(voucher);
        setIsDeleteDialogOpen(true);
    };

    const handleDisableClick = (voucher) => {
        setVoucherToDisable(voucher);
        setIsDisableDialogOpen(true);
    };

    const executeDelete = async () => {
        if (!voucherToDelete) return;

        setIsDeleting(true);
        try {
            await deleteCoupon(voucherToDelete.id);
            toast.success("Xóa voucher thành công!");
            fetchData();
        } catch (error) {
            console.error(error);
            const errorMessage = error?.response?.data?.message;
            if (error?.response?.data?.code === 'RESOURCE_CAN_NOT_DELETE') {
                toast.error("Không thể xóa: Voucher này đã có khách hàng sử dụng.");
            } else {
                toast.error(errorMessage || "Có lỗi xảy ra khi xóa voucher.");
            }
        } finally {
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
            setVoucherToDelete(null);
        }
    };

    const executeDisable = async () => {
        if (!voucherToDisable) return;

        setIsDisabling(true);
        try {
            const res = await disableCoupon({ id: voucherToDisable.id });
            if (res && res.code === HttpStatusCode.Ok) {
                toast.success("Vô hiệu hóa voucher thành công!");
                fetchData();
            }
        } catch (error) {
            console.error("Lỗi vô hiệu hóa voucher:", error);
            const errorMessage = error?.response?.data?.message;
            toast.error(errorMessage || "Có lỗi xảy ra khi vô hiệu hóa voucher.");
        } finally {
            setIsDisabling(false);
            setIsDisableDialogOpen(false);
            setVoucherToDisable(null);
        }
    };

    const handleViewStatsClick = (voucher) => {
        setVoucherForStats(voucher);
        setIsStatsModalOpen(true);
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header Area */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight">Quản lý Voucher</h1>
                <p className="text-muted-foreground">Tạo và quản lý các mã giảm giá cho sự kiện của bạn.</p>
            </div>

            {/* Toolbar Area */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-card p-4 
            rounded-lg border shadow-sm">
                <div className="flex flex-1 items-center gap-2 w-full sm:w-auto">
                    {/* Search */}
                    <div className="relative w-full sm:w-[300px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm theo tên/mã voucher..."
                            className="pl-9"
                            defaultValue={keyword}
                            onKeyDown={(e) => e.key === 'Enter' && handleFilterChange("search", e.currentTarget.value)}
                        />
                    </div>

                    {/* Status Filter */}
                    <Select value={statusFilter} onValueChange={(val) => handleFilterChange("status", val)}>
                        <SelectTrigger className="w-[180px]">
                            <div className="flex items-center gap-2">
                                <SelectValue placeholder="Trạng thái" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Tất cả thời gian</SelectItem>
                            <SelectItem value="COMING">Sắp diễn ra</SelectItem>
                            <SelectItem value="ONGOING">Đang diễn ra</SelectItem>
                            <SelectItem value="PAST">Đã kết thúc</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Button className="gap-2 bg-primary" onClick={() => navigate(routes.createVoucher.replace(":id", id))}>
                        <Plus size={16} /> Tạo voucher mới
                    </Button>
                </div>
            </div>

            {/* Table Content */}
            <VoucherTable
                data={dataList}
                isLoading={loading}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onDisable={handleDisableClick}
                onViewStats={handleViewStatsClick}
            />

            {/* Pagination */}
            {dataList.length > 0 && (
                <div className="mt-4">
                    <DefaultPagination
                        currentPage={currentPage}
                        setSearchParams={setSearchParams}
                        totalPages={totalPages}
                        totalElements={totalElements}
                        pageSize={pageSize}
                    />
                </div>
            )}

            {/* Modal delete */}
            <ConfirmCancelModal
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={executeDelete}
                title="Xác nhận xóa Voucher"
                itemLabel={voucherToDelete ? `Mã ${voucherToDelete.code}` : ""}
                note="Hệ thống chỉ cho phép xóa voucher chưa có bất kỳ giao dịch nào sử dụng. Dữ liệu sau khi xóa sẽ không thể khôi phục."
                confirmText="Xóa voucher"
                cancelText="Hủy bỏ"
                isLoading={isDeleting}
            />

            {/* Modal d */}
            <ConfirmCancelModal
                isOpen={isDisableDialogOpen}
                onClose={() => setIsDisableDialogOpen(false)}
                onConfirm={executeDisable}
                title={voucherToDisable?.status == CouponStatus.ACTIVE ?
                    "Xác nhận vô hiệu hóa Voucher" : "Xác nhận bật hoạt động Voucher"}
                itemLabel={voucherToDisable ? `Mã ${voucherToDisable.code}` : ""}
                note={voucherToDisable?.status == CouponStatus.ACTIVE ?
                    "Voucher sau khi vô hiệu hóa sẽ không thể tiếp tục sử dụng. Bạn có chắc chắn muốn thực hiện?" :
                    "Người dùng sẽ có thể dùng voucher sau khi bật hoạt động. Bạn có chắc chắn muốn thực hiện?"
                }
                description={<p>
                    Bạn có chắn chắn muốn bật hoạt động cho voucher
                    <span className="font-bold ms-1 me-1 text-gray-900 dark:text-white">
                        Mã {voucherToDisable?.code}
                    </span>
                    này không?
                </p>
                }
                confirmText="Xác nhận"
                cancelText="Hủy bỏ"
                isLoading={isDisabling}

            />

            <VoucherStatisticsModal
                isOpen={isStatsModalOpen}
                onClose={() => setIsStatsModalOpen(false)}
                voucher={voucherForStats}
            />
        </div>
    );
};

export default VoucherManagementPage;