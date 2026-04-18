import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { filterWallets } from '@/services/walletService';
import { getAllPaymentMethods } from '@/services/paymentMethodService';
import { filterWithdrawalRequests } from '@/services/withdrawalRequestService';
import WalletOverview from '../../features/revenue/WalletOverview';
import PaymentMethodList from '../../features/revenue/PaymentMethodList';
import WithdrawalHistory from '../../features/revenue/WithdrawalHistory';
import { AuthContext } from '@/context/AuthContex';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CreateWithdrawalModal from '@/features/revenue/CreateWithdrawalModal';
import WalletTransactionHistory from '@/features/revenue/WalletTransactionHistory';

const OrganizerRevenuePage = () => {
    const { user } = useContext(AuthContext);

    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("page") || "1");
    const statusFilter = searchParams.get("status") || 'ALL';
    const pageSize = 10;

    const [wallet, setWallet] = useState(null);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [withdrawals, setWithdrawals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    const fetchData = async () => {
        try {
            // 1. get Organizer wallet
            const walletRes = await filterWallets({
                data: { userEmail: user.email, type: 'ORGANIZER_WALLET' },
                page: 1, size: 1
            });
            setWallet(walletRes.result.data?.[0] || null);

            // 2. Lpayment methods
            const pmRes = await getAllPaymentMethods();
            setPaymentMethods(pmRes.result?.filter(pm => pm.status === 'ACTIVE') || []);

            // 3. withdrawal history 
            const filterData = { userEmail: user.email };
            if (statusFilter !== 'ALL') {
                filterData.status = statusFilter;
            }

            const historyRes = await filterWithdrawalRequests({
                data: filterData,
                page: currentPage,
                size: pageSize
            });

            setWithdrawals(historyRes.result?.data || []);
            setTotalPages(historyRes.result?.totalPage || 1);
            setTotalElements(historyRes.result?.totalElements || 0);

        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu tài chính:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user, currentPage, statusFilter]);

    const handleStatusChange = (value) => {
        setSearchParams(params => {
            params.set("status", value);
            params.set("page", "1");
            return params;
        });
    };

    if (isLoading && !wallet) return <div className="p-8 text-center text-slate-500">Đang tải dữ liệu ví...</div>;

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-6xl space-y-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Quản lý doanh thu</h1>
                    <p className="text-slate-500 text-sm mt-1">Quản lý tiền bán vé và yêu cầu quyết toán của ban tổ chức</p>
                </div>
                <button
                    onClick={() => setIsWithdrawModalOpen(true)}
                    disabled={!wallet || wallet.availableBalance <= 0 || wallet.status === 'LOCKED'}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-md font-medium disabled:opacity-50 transition-colors shadow-sm"
                >
                    Rút tiền ngay
                </button>
            </div>

            <WalletOverview wallet={wallet} />

            <div className="mt-8">
                <Tabs defaultValue="history" className="w-full">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <TabsList className="grid max-w-md grid-cols-3"> {/* Đổi max-w-xs thành max-w-md, grid-cols-2 thành 3 */}
                            <TabsTrigger value="history">Lịch sử rút tiền</TabsTrigger>
                            <TabsTrigger value="transactions">Biến động số dư</TabsTrigger> {/* Tab Mới */}
                            <TabsTrigger value="payment-methods">Thẻ ngân hàng</TabsTrigger>
                        </TabsList>

                        {/* filter  */}
                        <TabsContent value="history" className="m-0 focus-visible:outline-none">
                            <div className="flex items-center gap-2">
                                <Select value={statusFilter} onValueChange={handleStatusChange}>
                                    <SelectTrigger className="w-[180px] bg-white border-slate-200">
                                        <SelectValue placeholder="Trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                                        <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                                        <SelectItem value="PROCESSING">Đang xử lý</SelectItem>
                                        <SelectItem value="COMPLETED">Thành công</SelectItem>
                                        <SelectItem value="REJECTED">Bị từ chối</SelectItem>
                                        <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </TabsContent>
                    </div>

                    <TabsContent value="history" className="focus-visible:outline-none mt-0">
                        <WithdrawalHistory
                            withdrawals={withdrawals}
                            currentPage={currentPage}
                            pageSize={pageSize}
                            totalPages={totalPages}
                            totalElements={totalElements}
                            setSearchParams={setSearchParams}
                        />
                    </TabsContent>

                    {/* balance */}
                    <TabsContent value="transactions" className="focus-visible:outline-none mt-0">
                        {wallet ? (
                            <WalletTransactionHistory walletId={wallet.id} />
                        ) : (
                            <div className="text-center p-8 text-slate-500">Chưa tải được ví</div>
                        )}
                    </TabsContent>

                    {/* payment methods */}
                    <TabsContent value="payment-methods" className="focus-visible:outline-none mt-0">
                        <div className="max-w-3xl">
                            <PaymentMethodList
                                paymentMethods={paymentMethods}
                                refreshData={fetchData}
                            />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {isWithdrawModalOpen && (
                <CreateWithdrawalModal
                    wallet={wallet}
                    paymentMethods={paymentMethods}
                    isOpen={isWithdrawModalOpen}
                    onClose={() => setIsWithdrawModalOpen(false)}
                    onSuccess={() => {
                        setIsWithdrawModalOpen(false);
                        fetchData();
                    }}
                />
            )}
        </div>
    );
};

export default OrganizerRevenuePage;