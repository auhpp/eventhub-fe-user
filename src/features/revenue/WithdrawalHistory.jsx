import React from 'react';
import { formatCurrency, formatDateTime } from '@/utils/format';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { MoreVertical } from 'lucide-react';
import DefaultPagination from '@/components/DefaultPagination';
import WithdrawalStatusBadge from '@/components/WithdrawalStatusBadge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/config/routes';

const WithdrawalHistory = ({
    withdrawals,
    currentPage,
    pageSize,
    totalPages,
    totalElements,
    setSearchParams
}) => {
    const navigate = useNavigate()
    return (
        <div className="space-y-4">
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[15%]">Mã GD</TableHead>
                            <TableHead className="w-[20%]">Thời gian</TableHead>
                            <TableHead className="w-[25%]">Ngân hàng</TableHead>
                            <TableHead className="w-[20%]">Số tiền</TableHead>
                            <TableHead className="w-[20%]">Trạng thái</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {withdrawals.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    Chưa có giao dịch rút tiền nào.
                                </TableCell>
                            </TableRow>
                        ) : (
                            withdrawals.map((item, index) => (
                                <TableRow key={item.id || index} className="hover:bg-muted/50">

                                    <TableCell className="font-medium text-slate-600">
                                        <div className="ms-1">
                                            {item.id}
                                        </div>
                                    </TableCell>

                                    <TableCell className=" text-sm">
                                        <div className="flex items-center gap-2">
                                            {formatDateTime(item.createdAt)}
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm">{item.bankCode}</span>
                                                <span className="text-sm text-muted-foreground">
                                                    {item.bankAccountNo}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <span className="font-bold text-slate-800">
                                            {formatCurrency(item.amount)}
                                        </span>
                                    </TableCell>

                                    <TableCell>
                                        <WithdrawalStatusBadge status={item.status} />
                                    </TableCell>

                                    {/* Action */}
                                    <TableCell className="text-right pr-4">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="icon" variant="ghost" className="h-8 w-8">
                                                    <MoreVertical size={18} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => navigate(routes.withdrawalRequestDetail.replace(
                                                        ":id", item.id))}>
                                                    Xem chi tiết
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {withdrawals.length > 0 && (
                <div className="mt-4 flex justify-end">
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

export default WithdrawalHistory;