import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { HttpStatusCode } from 'axios';

import { getResalePostById, updateResalePost } from '@/services/resalePostService';
import { getSystemConfigByKey } from '@/services/systemConfigurationService';
import ButtonBack from '@/components/ButtonBack';
import Step2ConfigurePrice from '../CreateResaleTicketPage/Step2ConfigurePrice';
import ConfirmDialog from '@/components/ConfirmDialog';
import { formatCurrency } from '@/utils/format';
import { ResalePostStatus } from '@/utils/constant';


export default function EditResaleTicketPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    // States loading & configs
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [postData, setPostData] = useState(null);
    const [configs, setConfigs] = useState({ minRate: 0, maxRate: 0, resaleCommissionRate: 0 });

    // States form edit
    const [pricePerTicket, setPricePerTicket] = useState('');
    const [noRetail, setNoRetail] = useState(true);
    const [confirmOpen, setConfirmOpen] = useState(false);

    // Fetch resale post and configs
    useEffect(() => {
        if (!id) {
            toast.error("Không tìm thấy mã bài đăng!");
            navigate(-1);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                // 1. get resale post
                const postResponse = await getResalePostById({ id });
                const post = postResponse.result;

                if (post.status !== ResalePostStatus.PENDING && post.status !== ResalePostStatus.APPROVED) {
                    toast.error("Không thể chỉnh sửa bài đăng ở trạng thái này!");
                    navigate(-1);
                    return;
                }

                setPostData(post);
                setPricePerTicket(post.pricePerTicket.toString());
                setNoRetail(!post.hasRetail);

                // 2. get system config
                const [minRateRes, maxRateRes, commissionRes] = await Promise.all([
                    getSystemConfigByKey({ key: 'MIN_RESALE_RATE' }),
                    getSystemConfigByKey({ key: 'MAX_RESALE_RATE' }),
                    getSystemConfigByKey({ key: 'RESALE_COMMISSION_RATE' })
                ]);

                setConfigs({
                    minRate: minRateRes.result?.value || 0,
                    maxRate: maxRateRes.result?.value || 0,
                    resaleCommissionRate: commissionRes.result?.value || 0
                });

            } catch (error) {
                console.error("Lỗi khi tải dữ liệu bài đăng", error);
                toast.error("Không thể tải thông tin bài đăng!");
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    const ticketInfo = postData?.attendees?.[0]?.ticket;
    const selectedAttendees = postData?.attendees || [];

    const originalPrice = ticketInfo?.price || 0;
    const minPrice = (originalPrice * configs.minRate / 100);
    const maxPrice = (originalPrice * configs.maxRate / 100);
    const inputPrice = Number(pricePerTicket) || 0;

    const serviceFee = inputPrice > 0 ? (inputPrice * configs.resaleCommissionRate / 100) : 0;
    const netPerTicket = inputPrice > 0 ? (inputPrice - serviceFee) : 0;
    const totalNet = netPerTicket * selectedAttendees.length;

    const handleSubmitUpdate = async () => {
        if (inputPrice < minPrice || inputPrice > maxPrice) {
            toast.error(`Giá vé phải nằm trong khoảng ${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`);
            setConfirmOpen(false);
            return;
        }

        try {
            setSubmitting(true);
            const response = await updateResalePost({
                id: id,
                ticketId: ticketInfo.id,
                pricePerTicket: inputPrice,
                hasRetail: !noRetail
            });

            if (response.code === HttpStatusCode.Ok) {
                toast.success("Cập nhật bài đăng bán vé thành công!");
                navigate(-1);
            }
        } catch (error) {
            console.error("Lỗi cập nhật bài đăng", error);
            toast.error(error?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!");
        } finally {
            setSubmitting(false);
            setConfirmOpen(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 text-slate-500">
                <Loader2 className="animate-spin w-10 h-10 text-blue-600 mb-4" />
            </div>
        );
    }

    if (!postData) return null;

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <ButtonBack onClick={() => navigate(-1)} />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Chỉnh sửa tin bán lại</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Thay đổi cấu hình giá và phương thức bán cho bài đăng của bạn
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <Step2ConfigurePrice
                        ticketInfo={ticketInfo}
                        selectedAttendees={selectedAttendees}
                        pricePerTicket={pricePerTicket}
                        setPricePerTicket={setPricePerTicket}
                        noRetail={noRetail}
                        setNoRetail={setNoRetail}
                        configs={configs}
                        originalPrice={originalPrice}
                        minPrice={minPrice}
                        maxPrice={maxPrice}
                        inputPrice={inputPrice}
                        serviceFee={serviceFee}
                        netPerTicket={netPerTicket}
                        totalNet={totalNet}
                        onOpenConfirm={() => setConfirmOpen(true)}
                        formatCurrency={formatCurrency}
                    />
                </div>

                {/* Dialog */}
                <ConfirmDialog
                    open={confirmOpen}
                    onOpenChange={setConfirmOpen}
                    onConfirm={handleSubmitUpdate}
                    isLoading={submitting}
                    title="Xác nhận lưu thay đổi"
                    description={
                        <div className="space-y-2 mt-2 text-slate-600">
                            <p>Bạn đang thay đổi cấu hình bán cho <strong
                                className="text-slate-900">{selectedAttendees.length} vé {ticketInfo?.name}</strong>.</p>
                            <p>Giá mới công khai: <strong
                                className="text-slate-900">{formatCurrency(inputPrice)} / vé</strong>.</p>
                            <p className="text-sm mt-2 p-2 bg-blue-50 text-blue-800 rounded border border-blue-200">
                                Nếu bài đăng đang được chờ duyệt hoặc đang hiển thị, thay đổi này sẽ áp dụng ngay lập tức.
                            </p>
                        </div>
                    }
                    confirmLabel="Lưu thay đổi"
                    cancelLabel="Hủy bỏ"
                />
            </div>
        </div>
    );
}