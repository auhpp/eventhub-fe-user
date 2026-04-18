import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { filterWalletTransactions } from '@/services/walletTransactionService';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowDownRight, ArrowUpRight, Loader2 } from "lucide-react";
import { formatCurrency, formatDateTime } from '@/utils/format';
import DefaultPagination from '@/components/DefaultPagination';


const WalletTransactionHistory = ({ walletId }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const currentPage = parseInt(searchParams.get('page') || '1');
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [transactionType, setTransactionType] = useState('ALL');
    const pageSize = 10;

    const fetchTransactions = async () => {
        if (!walletId) return;

        try {
            const requestData = { walletId };
            if (transactionType !== 'ALL') {
                requestData.transactionType = transactionType;
            }

            const response = await filterWalletTransactions({
                data: requestData,
                page: currentPage,
                size: pageSize
            });

            const responseData = response.result;

            setTransactions(responseData?.data || []);
            setTotalPages(responseData?.totalPage || 1);
            setTotalElements(responseData?.totalElements || 0);
        } catch (error) {
            console.error("Lỗi khi tải lịch sử giao dịch:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [walletId, currentPage, transactionType]);

    const handleTypeChange = (value) => {
        setTransactionType(value);
        setSearchParams((prev) => {
            prev.set('page', '1');
            return prev;
        });
    };

    if (!walletId) {
        return <div className="text-center p-4 text-slate-500">Chưa có thông tin ví để xem giao dịch.</div>;
    }

    return (
        <div className="space-y-4">
            {/* filters */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Biến động số dư</h3>
                <Select value={transactionType} onValueChange={handleTypeChange}>
                    <SelectTrigger className="w-[200px] bg-white border-slate-200">
                        <SelectValue placeholder="Loại giao dịch" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Tất cả giao dịch</SelectItem>
                        <SelectItem value="DEPOSIT">Tiền vào (Deposit)</SelectItem>
                        <SelectItem value="WITHDRAWAL">Tiền ra (Withdrawal)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* table */}
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead>Mã GD</TableHead>
                            <TableHead>Thời gian</TableHead>
                            <TableHead>Loại GD</TableHead>
                            <TableHead>Nội dung</TableHead>
                            <TableHead className="text-right">Số tiền</TableHead>
                            <TableHead className="text-right">Số dư trước GD</TableHead>
                            <TableHead className="text-right">Số dư sau GD</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400" />
                                </TableCell>
                            </TableRow>
                        ) : transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                    Không có giao dịch nào.
                                </TableCell>
                            </TableRow>
                        ) : (
                            transactions.map((tx) => {
                                const isDeposit = tx.transactionType === 'DEPOSIT';
                                return (
                                    <TableRow key={tx.id}>
                                        <TableCell className="font-medium text-slate-700">#{tx.id}</TableCell>
                                        <TableCell className="text-slate-600">{formatDateTime(tx.createdAt)}</TableCell>
                                        <TableCell>
                                            {isDeposit ? (
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
                                                    <ArrowUpRight className="h-3 w-3" /> Nạp tiền
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1">
                                                    <ArrowDownRight className="h-3 w-3" /> Rút tiền
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate text-slate-600" title={tx.description}>
                                            {tx.description || tx.referenceType}
                                            {tx.referenceId && ` (#${tx.referenceId})`}
                                        </TableCell>
                                        <TableCell className={`text-right font-semibold ${isDeposit ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(tx.amount)}
                                        </TableCell>
                                        <TableCell
                                            className="text-right font-medium text-slate-800">
                                            {formatCurrency(tx.balanceBefore)}
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-slate-800">
                                            {formatCurrency(tx.balanceAfter)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* pagination  */}
            {totalPages > 1 && (
                <DefaultPagination
                    currentPage={currentPage}
                    setSearchParams={setSearchParams}
                    totalPages={totalPages}
                    totalElements={totalElements}
                    pageSize={pageSize}
                />
            )}
        </div>
    );
};

export default WalletTransactionHistory;