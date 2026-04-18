import React, { useState } from 'react';
import { CreditCard, Plus, Trash2, Edit2, Loader2 } from 'lucide-react'; 
import { deletePaymentMethod } from '@/services/paymentMethodService';
import CreatePaymentMethodModal from './CreatePaymentMethodModal';

const PaymentMethodList = ({ paymentMethods, refreshData }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [editingMethod, setEditingMethod] = useState(null); 

    const handleDelete = async (id) => {
        const isConfirm = window.confirm("Bạn có chắc chắn muốn xóa tài khoản ngân hàng này không?");
        if (!isConfirm) return;

        setDeletingId(id);
        try {
            await deletePaymentMethod(id);
            refreshData();
        } catch (error) {
            console.error("Lỗi khi xóa tài khoản:", error);
            alert("Không thể xóa tài khoản lúc này. Vui lòng thử lại sau.");
        } finally {
            setDeletingId(null);
        }
    };

    const handleAddNew = () => {
        setEditingMethod(null); 
        setIsModalOpen(true);
    };

    const handleEdit = (method) => {
        setEditingMethod(method); 
        setIsModalOpen(true);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
                <h3 className="text-lg font-semibold text-slate-800">Tài khoản ngân hàng</h3>
                <button
                    className="p-1.5 hover:bg-blue-100 bg-blue-50 rounded-md text-blue-600 transition-colors flex 
                    items-center gap-1 text-sm font-medium px-3"
                    onClick={handleAddNew} 
                >
                    <Plus size={16} />
                    Thêm thẻ
                </button>
            </div>

            <div className="p-5 space-y-4">
                {paymentMethods.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 
                        text-slate-400">
                            <CreditCard size={24} />
                        </div>
                        <p className="text-sm text-slate-500 font-medium">Chưa có tài khoản nào được lưu.</p>
                        <p className="text-xs text-slate-400 mt-1">Thêm tài khoản để thực hiện rút tiền.</p>
                    </div>
                ) : (
                    paymentMethods.map(pm => (
                        <div key={pm.id} className="p-4 border border-slate-200 rounded-lg relative overflow-hidden group 
                        hover:border-blue-400 hover:shadow-sm transition-all bg-white">

                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 p-2.5 rounded-lg border border-blue-200">
                                        <CreditCard size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">{pm.bankCode}</h4>
                                    </div>
                                </div>

                                {/* action buttons */}
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleEdit(pm)}
                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                        title="Sửa tài khoản"
                                    >
                                        <Edit2 size={18} />
                                    </button>

                                    <button
                                        onClick={() => handleDelete(pm.id)}
                                        disabled={deletingId === pm.id}
                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md 
                                        transition-colors disabled:opacity-50"
                                        title="Xóa tài khoản"
                                    >
                                        {deletingId === pm.id ? (
                                            <Loader2 size={18} className="animate-spin text-red-500" />
                                        ) : (
                                            <Trash2 size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-md border border-slate-100">
                                <p className="font-mono text-sm tracking-widest text-slate-700 font-semibold">
                                    {pm.bankAccountNo}
                                </p>
                                <p className="text-xs font-bold text-slate-500 mt-1">
                                    {pm.bankAccountName}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isModalOpen && (
                <CreatePaymentMethodModal
                    isOpen={isModalOpen}
                    initialData={editingMethod} 
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        refreshData();
                    }}
                />
            )}
        </div>
    );
};

export default PaymentMethodList;