import React, { useState } from 'react';
import { createWithdrawalRequest } from '@/services/withdrawalRequestService';
import { formatCurrency } from '@/utils/format';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

const CreateWithdrawalModal = ({ isOpen, wallet, paymentMethods, onClose, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [selectedMethodId, setSelectedMethodId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [globalError, setGlobalError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const handleAmountChange = (e) => {
        setAmount(e.target.value);
        if (fieldErrors.amount) {
            setFieldErrors(prev => ({ ...prev, amount: '' }));
        }
    };

    const handleMethodChange = (value) => {
        setSelectedMethodId(value);
        if (fieldErrors.method) {
            setFieldErrors(prev => ({ ...prev, method: '' }));
        }
    };

    const validateForm = () => {
        const errors = {};
        const withdrawAmount = parseFloat(amount);

        if (!amount || amount.trim() === '') {
            errors.amount = 'Vui lòng nhập số tiền muốn rút.';
        } else if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
            errors.amount = 'Số tiền rút phải lớn hơn 0.';
        } else if (withdrawAmount > wallet.availableBalance) {
            errors.amount = 'Số dư khả dụng không đủ.';
        } else if (withdrawAmount < 50000) {
            errors.amount = 'Số tiền rút tối thiểu là 50.000 VNĐ.';
        }

        if (!selectedMethodId) {
            errors.method = 'Vui lòng chọn tài khoản nhận tiền.';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGlobalError('');

        if (!validateForm()) {
            return;
        }

        const bankDetails = paymentMethods.find(pm => pm.id.toString() === selectedMethodId);

        setIsSubmitting(true);
        try {
            await createWithdrawalRequest({
                amount: parseFloat(amount),
                bankCode: bankDetails.bankCode,
                bankAccountNo: bankDetails.bankAccountNo,
                bankAccountName: bankDetails.bankAccountName,
                walletId: wallet.id
            });
            toast.success("Tạo lệnh rút tiền thành công!");
            onSuccess();
        } catch (err) {
            setGlobalError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo lệnh. Vui lòng thử lại sau.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenChange = (open) => {
        if (!open && !isSubmitting) {
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-slate-800">
                        Tạo lệnh rút tiền
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 py-4">
                    {globalError && (
                        <div className="p-3 bg-red-50 text-red-600 border border-red-100 text-sm rounded-md">
                            {globalError}
                        </div>
                    )}

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center">
                        <label className="text-sm font-medium text-slate-600">Số dư khả dụng:</label>
                        <p className="text-lg font-bold text-blue-600">{formatCurrency(wallet.availableBalance)}</p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">
                            Số tiền muốn rút (VNĐ) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={handleAmountChange}
                            placeholder="VD: 500000"
                            className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${fieldErrors.amount
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-slate-300 focus:ring-blue-500'
                                }`}
                            max={wallet.availableBalance}
                        />
                        {fieldErrors.amount && (
                            <p className="text-xs text-red-500 font-medium mt-1">{fieldErrors.amount}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">
                            Tài khoản nhận tiền <span className="text-red-500">*</span>
                        </label>
                        {paymentMethods.length > 0 ? (
                            <>
                                <Select
                                    value={selectedMethodId}
                                    onValueChange={handleMethodChange}
                                >
                                    <SelectTrigger
                                        className={`w-full bg-white ${fieldErrors.method
                                            ? 'border-red-500 focus:ring-red-500 text-red-600'
                                            : 'border-slate-300'
                                            }`}
                                    >
                                        <SelectValue placeholder="-- Chọn ngân hàng --" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {paymentMethods.map(pm => (
                                            <SelectItem key={pm.id}
                                                value={pm.id.toString()}>
                                                {pm.bankCode} -
                                                *{pm.bankAccountNo.slice(-4)}
                                                ({pm.bankAccountName})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>


                                {fieldErrors.method && (
                                    <p className="text-xs text-red-500 
                                    font-medium mt-1">{fieldErrors.method}</p>
                                )}
                            </>
                        ) : (
                            <p className="text-sm text-red-500 font-medium">Bạn chưa thêm tài khoản ngân hàng nào. Vui lòng thêm ở trang quản lý.</p>
                        )}
                    </div>

                    <DialogFooter className="pt-4 border-t border-slate-100 sm:justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || paymentMethods.length === 0}
                            className="px-4 py-2 text-sm font-medium bg-blue-600
                            hover:bg-blue-700 text-white rounded-md disabled:opacity-50 transition-colors"
                        >
                            {isSubmitting ? 'Đang xử lý...' : 'Xác nhận rút tiền'}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateWithdrawalModal;