import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWithdrawalRequestById, updateWithdrawalRequest } from '@/services/withdrawalRequestService';
import { formatDateTime, formatCurrency } from '@/utils/format';
import { ArrowLeft, AlertCircle, CheckCircle2, XCircle, Info, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmCancelModal } from '@/components/ConfirmCancelModal';
import { WithdrawalStatus } from '@/utils/constant';
import WithdrawalStatusBadge from '@/components/WithdrawalStatusBadge';

const COMMON_BANKS = [
    { code: 'VCB', name: 'Vietcombank' },
    { code: 'TCB', name: 'Techcombank' },
    { code: 'MB', name: 'MBBank' },
    { code: 'CTG', name: 'VietinBank' },
    { code: 'BIDV', name: 'BIDV' },
    { code: 'ACB', name: 'ACB' },
    { code: 'VPB', name: 'VPBank' },
    { code: 'TPB', name: 'TPBank' },
    { code: 'STB', name: 'Sacombank' },
    { code: 'VBA', name: 'Agribank' },
    { code: 'VIB', name: 'VIB' },
];

const WithdrawalRequestDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [requestData, setRequestData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Form States
    const [bankCode, setBankCode] = useState('');
    const [bankAccountNo, setBankAccountNo] = useState('');
    const [bankAccountName, setBankAccountName] = useState('');

    const [isUpdating, setIsUpdating] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [error, setError] = useState('');

    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    const fetchDetail = async () => {
        setIsLoading(true);
        try {
            const res = await getWithdrawalRequestById(id);
            const data = res.result || res;
            setRequestData(data);

            setBankCode(data.bankCode);
            setBankAccountNo(data.bankAccountNo);
            setBankAccountName(data.bankAccountName);
        } catch (err) {
            console.error(err);
            setError("Không thể tải dữ liệu. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleNameChange = (e) => {
        let value = e.target.value.toUpperCase();
        value = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        value = value.replace(/Đ/g, "D");
        setBankAccountName(value);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');

        if (!bankCode || !bankAccountNo || !bankAccountName) return setError('Vui lòng điền đủ thông tin ngân hàng.');

        setIsUpdating(true);
        try {
            await updateWithdrawalRequest({
                id,
                data: {
                    bankCode,
                    bankAccountNo,
                    bankAccountName
                }
            });
            alert("Cập nhật lệnh rút tiền thành công!");
            fetchDetail();
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi cập nhật dữ liệu.');
        } finally {
            setIsUpdating(false);
        }
    };

    const executeCancel = async () => {
        setIsCancelling(true);
        try {
            await updateWithdrawalRequest({
                id,
                data: {
                    status: WithdrawalStatus.CANCELLED,
                    amount: requestData.amount
                }
            });
            alert("Đã hủy lệnh rút tiền.");
            setIsCancelModalOpen(false);
            fetchDetail();
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi khi hủy lệnh.');
        } finally {
            setIsCancelling(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>;
    if (!requestData) return <div className="p-8 text-center text-red-500">Không tìm thấy yêu cầu rút tiền này.</div>;

    const isPending = requestData.status === 'PENDING';

    return (
        <div className="container space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="h-9 w-9">
                    <ArrowLeft size={18} />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        Chi tiết lệnh rút tiền #{requestData.id}
                        <WithdrawalStatusBadge status={requestData.status} />
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Tạo lúc: {formatDateTime(requestData.createdAt)}
                    </p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 border border-red-200">
                    <AlertCircle size={18} />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            {(requestData.adminNote || requestData.proofImageUrl) && (
                <Card className="bg-slate-50 border-slate-200 shadow-none">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2 text-slate-700">
                            <Info size={18} className="text-blue-500" /> Phản hồi từ quản trị viên
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {requestData.adminNote && (
                            <div>
                                <Label className="text-slate-500">Ghi chú:</Label>
                                <p className="text-sm font-medium mt-1">{requestData.adminNote}</p>
                            </div>
                        )}
                        {requestData.proofImageUrl && (
                            <div>
                                <Label className="text-slate-500 mb-2 block">Chứng từ chuyển khoản:</Label>
                                <a href={requestData.proofImageUrl} target="_blank" rel="noreferrer" className="inline-block relative group">
                                    <img
                                        src={requestData.proofImageUrl}
                                        alt="Proof"
                                        className="h-32 object-contain rounded-md border border-slate-200 shadow-sm transition-transform group-hover:scale-[1.02]"
                                    />
                                    <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center rounded-md transition-all">
                                        <ImageIcon className="text-white" size={24} />
                                    </div>
                                </a>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        Thông tin giao dịch
                    </CardTitle>
                    <CardDescription>
                        {isPending
                            ? "Bạn có thể thay đổi thông tin nhận tiền hoặc hủy lệnh khi đang ở trạng thái Chờ duyệt."
                            : "Thông tin lệnh rút tiền đã được khóa và không thể chỉnh sửa."}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form id="update-form" onSubmit={handleUpdate} className="space-y-5">

                        <div className="space-y-1.5">
                            <Label>Số tiền rút</Label>
                            <Input
                                value={formatCurrency(requestData.amount)}
                                disabled
                                className="bg-slate-50 font-bold text-slate-800"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <Label>Ngân hàng</Label>
                                {isPending ? (
                                    <Select value={bankCode} onValueChange={setBankCode}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn ngân hàng" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {COMMON_BANKS.map(bank => (
                                                <SelectItem key={bank.code} value={bank.code}>
                                                    {bank.code} - {bank.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Input value={requestData.bankCode} disabled className="bg-slate-50" />
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label>Số tài khoản</Label>
                                <Input
                                    value={isPending ? bankAccountNo : requestData.bankAccountNo}
                                    onChange={(e) => setBankAccountNo(e.target.value.replace(/\D/g, ''))}
                                    disabled={!isPending}
                                    className={!isPending ? "bg-slate-50 font-mono tracking-wider" : "font-mono tracking-wider"}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Tên chủ tài khoản</Label>
                            <Input
                                value={isPending ? bankAccountName : requestData.bankAccountName}
                                onChange={handleNameChange}
                                disabled={!isPending}
                                className={!isPending ? "bg-slate-50 uppercase font-medium" : "uppercase font-medium"}
                            />
                        </div>
                    </form>
                </CardContent>

                {isPending && (
                    <CardFooter className="flex flex-col sm:flex-row justify-end gap-3 border-t pt-6 bg-slate-50/50 rounded-b-xl">
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => setIsCancelModalOpen(true)}
                            disabled={isCancelling || isUpdating}
                            className="w-full sm:w-auto flex items-center gap-2"
                        >
                            <XCircle size={16} /> Hủy lệnh này
                        </Button>
                        <Button
                            type="submit"
                            form="update-form"
                            disabled={isUpdating || isCancelling}
                            className="w-full sm:w-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                        >
                            {isUpdating ? "Đang lưu..." : <><CheckCircle2 size={16} /> Cập nhật thông tin</>}
                        </Button>
                    </CardFooter>
                )}
            </Card>

            <ConfirmCancelModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={executeCancel}
                title="Xác nhận hủy lệnh rút tiền"
                description={`Bạn có chắc chắn muốn hủy lệnh rút tiền ${formatCurrency(requestData?.amount)} không?`}
                note="Tiền đang bị đóng băng sẽ lập tức được hoàn trả lại vào số dư khả dụng của bạn."
                confirmText="Hủy lệnh rút tiền"
                isLoading={isCancelling}
            />
        </div>
    );
};

export default WithdrawalRequestDetailPage;