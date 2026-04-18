import React, { useState, useEffect } from 'react';
import { createPaymentMethod, updatePaymentMethod } from '@/services/paymentMethodService';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }
    from "@/components/ui/select";

const COMMON_BANKS = [
    { code: 'VCB', name: 'Vietcombank (Ngân hàng Ngoại thương)' },
    { code: 'TCB', name: 'Techcombank (Ngân hàng Kỹ Thương)' },
    { code: 'MB', name: 'MBBank (Ngân hàng Quân Đội)' },
    { code: 'CTG', name: 'VietinBank (Ngân hàng Công Thương)' },
    { code: 'BIDV', name: 'BIDV (Ngân hàng Đầu tư và Phát triển)' },
    { code: 'ACB', name: 'ACB (Ngân hàng Á Châu)' },
    { code: 'VPB', name: 'VPBank (Ngân hàng Việt Nam Thịnh Vượng)' },
    { code: 'TPB', name: 'TPBank (Ngân hàng Tiên Phong)' },
    { code: 'STB', name: 'Sacombank (Ngân hàng Sài Gòn Thương Tín)' },
    { code: 'VBA', name: 'Agribank (Ngân hàng Nông nghiệp)' },
    { code: 'VIB', name: 'VIB (Ngân hàng Quốc Tế)' },
];

const CreatePaymentMethodModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
    const [bankCode, setBankCode] = useState('');
    const [bankAccountNo, setBankAccountNo] = useState('');
    const [bankAccountName, setBankAccountName] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const isEditMode = !!initialData;

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setBankCode(initialData.bankCode || '');
                setBankAccountNo(initialData.bankAccountNo || '');
                setBankAccountName(initialData.bankAccountName || '');
            } else {
                setBankCode('');
                setBankAccountNo('');
                setBankAccountName('');
            }
            setError('');
        }
    }, [isOpen, initialData]);

    const handleNameChange = (e) => {
        let value = e.target.value;
        value = value.toUpperCase();
        value = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        value = value.replace(/Đ/g, "D");
        setBankAccountName(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!bankCode || !bankAccountNo || !bankAccountName) {
            return setError('Vui lòng điền đầy đủ thông tin.');
        }

        setIsSubmitting(true);
        try {
            const payload = {
                bankCode,
                bankAccountNo,
                bankAccountName
            };

            if (isEditMode) {
                await updatePaymentMethod({ id: initialData.id, data: payload });
            } else {
                await createPaymentMethod(payload);
            }

            onSuccess();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || `Có lỗi xảy ra khi ${isEditMode ? 'cập nhật' : 'thêm'} tài khoản ngân hàng.`);
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
                        {isEditMode ? 'Cập nhật tài khoản ngân hàng' :
                            'Thêm tài khoản ngân hàng'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 py-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 border
                         border-red-100 text-sm rounded-md">
                            {error}
                        </div>
                    )}

                    {/* Ngân hàng */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">
                            Ngân hàng</label>
                        <Select value={bankCode} onValueChange={setBankCode}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="-- Chọn ngân hàng --" />
                            </SelectTrigger>
                            <SelectContent>
                                {COMMON_BANKS.map(bank => (
                                    <SelectItem key={bank.code} value={bank.code}>
                                        {bank.code} - {bank.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Số tài khoản */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">
                            Số tài khoản
                        </label>
                        <input
                            type="text"
                            value={bankAccountNo}
                            onChange={(e) =>
                                setBankAccountNo(e.target.value.replace(/\D/g, ''))}
                            placeholder="Nhập số tài khoản hợp lệ"
                            className="w-full border border-slate-300 rounded-md px-3 
                            py-2 text-sm focus:outline-none focus:ring-2 
                            focus:ring-blue-500"
                        />
                    </div>

                    {/* name */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">
                            Tên chủ tài khoản</label>
                        <input
                            type="text"
                            value={bankAccountName}
                            onChange={handleNameChange}
                            placeholder="VD: NGUYEN VAN A"
                            className="w-full border border-slate-300 rounded-md 
                            px-3 py-2 text-sm focus:outline-none focus:ring-2
                             focus:ring-blue-500 font-medium"
                        />
                        <p className="text-[11px] text-slate-500">
                            Tên không dấu, viết hoa (Trùng với tên in trên thẻ)</p>
                    </div>

                    <DialogFooter className="pt-4 border-t border-slate-100 
                    sm:justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600
                             hover:bg-slate-100 rounded-md transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !bankCode ||
                                !bankAccountNo || !bankAccountName}
                            className="px-4 py-2 text-sm font-medium bg-blue-600
                             hover:bg-blue-700 text-white rounded-md disabled:opacity-50 
                             transition-colors"
                        >
                            {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Cập nhật'
                                : 'Thêm tài khoản')}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreatePaymentMethodModal;