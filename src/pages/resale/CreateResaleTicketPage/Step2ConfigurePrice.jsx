import React from 'react';
import { Info } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

export default function Step2ConfigurePrice({
    ticketInfo,
    selectedAttendees,
    pricePerTicket,
    setPricePerTicket,
    noRetail,
    setNoRetail,
    configs,
    originalPrice,
    minPrice,
    maxPrice,
    inputPrice,
    serviceFee,
    netPerTicket,
    totalNet,
    onOpenConfirm,
    formatCurrency
}) {
    return (
        <div className="p-6 md:p-8 animate-in slide-in-from-right-8 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

                {/* left column: config price */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 flex justify-between items-center">
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Loại vé đang bán</p>
                            <p className="font-bold text-lg text-slate-900 uppercase">{ticketInfo?.name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-slate-500 mb-1">Số lượng</p>
                            <p className="font-bold text-lg text-blue-600">{selectedAttendees.length} vé</p>
                        </div>
                    </div>

                    {/* Input price */}
                    <div>
                        <label className="block font-bold text-slate-900 text-lg mb-4">
                            Giá bán mỗi vé <span className="text-red-500">*</span>
                        </label>
                        <div className="relative max-w-md">
                            <Input
                                type="number"
                                value={pricePerTicket}
                                onChange={(e) => setPricePerTicket(e.target.value)}
                                placeholder="VD: 2000000"
                                className="h-14 text-right pr-12 text-lg font-bold border-slate-300 
                                focus:border-blue-500 focus:ring-blue-500/20"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-md">VNĐ</span>
                        </div>

                        {/* Min/Max price */}
                        <div className="mt-4 flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-3 py-1.5 rounded-md">
                                Gốc: <span className="font-semibold text-slate-900">{formatCurrency(originalPrice)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-3 py-1.5 rounded-md">
                                Tối thiểu: <span className="font-semibold">{formatCurrency(minPrice)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-violet-600 bg-violet-50 px-3 py-1.5 rounded-md">
                                Tối đa: <span className="font-semibold">{formatCurrency(maxPrice)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Setting has retail */}
                    <div className="pt-6 border-t border-slate-100">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h4 className="font-bold text-slate-900 text-base mb-1">Không bán lẻ</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    Khi bật tính năng này, người mua sẽ phải mua toàn bộ <strong className="text-slate-700">{selectedAttendees.length} vé</strong> cùng lúc, không được mua lẻ tẻ.
                                </p>
                            </div>
                            <Switch
                                checked={noRetail}
                                onCheckedChange={setNoRetail}
                                className="data-[state=checked]:bg-blue-500 mt-1"
                            />
                        </div>
                    </div>
                </div>

                {/* right column: price info */}
                <div className="lg:col-span-2">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 sticky top-24">
                        <div className="flex items-center gap-2 mb-6 text-slate-800">
                            <h3 className="font-bold text-lg">Tóm tắt doanh thu</h3>
                        </div>

                        <div className="space-y-4 text-sm text-slate-600 border-b border-slate-200 pb-6 mb-6">
                            <div className="flex justify-between items-center">
                                <span>Giá vé thiết lập</span>
                                <span className="font-semibold text-slate-900">{formatCurrency(inputPrice)}</span>
                            </div>
                            <div className="flex justify-between items-center text-rose-500">
                                <span className="flex items-center gap-1">Phí dịch vụ ({configs.resaleCommissionRate}%) <Info className="w-3 h-3" /></span>
                                <span>-{formatCurrency(serviceFee)}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center font-medium">
                                <span className="text-slate-600">Thực nhận 1 vé</span>
                                <span className="text-slate-900">{formatCurrency(netPerTicket)}</span>
                            </div>
                            <div className="flex justify-between items-center font-medium">
                                <span className="text-slate-600">Số lượng bán</span>
                                <span className="text-slate-900">x {selectedAttendees.length}</span>
                            </div>
                            <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
                                <div>
                                    <span className="block text-slate-500 text-sm mb-1">Tổng tiền bạn nhận</span>
                                    <span className="text-xs text-blue-600 font-medium">Đã trừ mọi chi phí</span>
                                </div>
                                <span className="text-2xl font-bold text-red-600">{formatCurrency(totalNet)}</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-6">
                            <button
                                onClick={onOpenConfirm}
                                disabled={!pricePerTicket || inputPrice < minPrice || inputPrice > maxPrice}
                                className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-lg hover:bg-blue-700 
                                transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                Xác nhận đăng bán
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}