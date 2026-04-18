import { formatCurrency } from '@/utils/format';
import { Wallet, Clock, Lock } from 'lucide-react';

const WalletOverview = ({ wallet }) => {
    if (!wallet) return <div>Không tìm thấy ví</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Wallet size={24} /></div>
                <div>
                    <p className="text-sm font-medium text-slate-500">Số dư khả dụng</p>
                    <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(wallet.availableBalance)}</h3>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-amber-100 text-amber-600 rounded-lg"><Clock size={24} /></div>
                <div>
                    <p className="text-sm font-medium text-slate-500">Chờ đối soát (Từ sự kiện chưa kết thúc)</p>
                    <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(wallet.pendingBalance)}</h3>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-slate-100 text-slate-600 rounded-lg"><Lock size={24} /></div>
                <div>
                    <p className="text-sm font-medium text-slate-500">Tiền đang rút (Đóng băng)</p>
                    <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(wallet.lockedBalance)}</h3>
                </div>
            </div>
        </div>
    );
};

export default WalletOverview;