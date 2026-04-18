import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { getBookingById } from '@/services/bookingService';
import { getSystemConfigByKey } from '@/services/systemConfigurationService';
import ConfirmDialog from '@/components/ConfirmDialog';
import { createResalePost } from '@/services/resalePostService';

import Step1SelectTickets from './Step1SelectTickets';
import Step2ConfigurePrice from './Step2ConfigurePrice';
import ButtonBack from '@/components/ButtonBack';
import { toast } from 'sonner';
import { HttpStatusCode } from 'axios';
import { routes } from '@/config/routes';
import { formatCurrency } from '@/utils/format';
import { AttendeeStatus, AttendeeType, SourceType } from '@/utils/constant';

export default function CreateResaleTicketPage() {
    const { bookingId } = useParams();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [bookingData, setBookingData] = useState(null);
    const [configs, setConfigs] = useState({ minRate: 0, maxRate: 0, resaleCommissionRate: 0 });

    const [selectedAttendees, setSelectedAttendees] = useState([]);
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [pricePerTicket, setPricePerTicket] = useState('');
    const [noRetail, setNoRetail] = useState(true);
    const [confirmOpen, setConfirmOpen] = useState(false);

    useEffect(() => {
        if (!bookingId) {
            alert("Không tìm thấy mã đơn hàng!");
            navigate(-1);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                // get booking
                const booking = await getBookingById({ id: bookingId });
                setBookingData(booking.result);

                // get config
                const minRateRes = await getSystemConfigByKey({ key: 'MIN_RESALE_RATE' });
                const maxRateRes = await getSystemConfigByKey({ key: 'MAX_RESALE_RATE' });
                const resaleCommissionRate = await getSystemConfigByKey({ key: 'RESALE_COMMISSION_RATE' });
                setConfigs({
                    minRate: minRateRes.result?.value,
                    maxRate: maxRateRes.result?.value,
                    resaleCommissionRate: resaleCommissionRate.result?.value
                });
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu", error);
                alert("Không thể tải thông tin đơn hàng!");
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [bookingId, navigate]);

    const validAttendees = useMemo(() => {
        if (!bookingData?.attendees) return [];
        return bookingData.attendees.filter(a =>
            a.status === AttendeeStatus.VALID.key &&
            a.type !== AttendeeType.INVITE &&
            a.sourceType !== SourceType.GIFT &&
            a.sourceType !== SourceType.INVITATION
        );
    }, [bookingData]);

    const groupedAttendees = useMemo(() => {
        return validAttendees.reduce((groups, attendee) => {
            const tId = attendee.ticket.id;
            if (!groups[tId]) {
                groups[tId] = { ticket: attendee.ticket, attendees: [] };
            }
            groups[tId].attendees.push(attendee);
            return groups;
        }, {});
    }, [validAttendees]);

    const toggleAttendeeSelection = (attendee) => {
        const ticketId = attendee.ticket.id;
        const attId = attendee.id;

        setSelectedAttendees(prev => {
            const isSelected = prev.includes(attId);

            if (isSelected) {
                const newSelection = prev.filter(id => id !== attId);
                if (newSelection.length === 0) setSelectedTicketId(null);
                return newSelection;
            }

            if (prev.length > 0 && selectedTicketId !== ticketId) {
                alert("Bạn chỉ được chọn một loại vé trong một lần bán!");
                return prev;
            }

            setSelectedTicketId(ticketId);
            return [...prev, attId];
        });
    };

    const handleGoBack = () => {
        if (step === 2) {
            setStep(1);
        } else {
            navigate(-1);
        }
    };

    const selectedGroup = selectedTicketId ? groupedAttendees[selectedTicketId] : null;
    const ticketInfo = selectedGroup?.ticket;

    const originalPrice = ticketInfo?.price || 0;
    const minPrice = (originalPrice * configs.minRate / 100);
    const maxPrice = (originalPrice * configs.maxRate / 100);

    const inputPrice = Number(pricePerTicket) || 0;

    const serviceFee = inputPrice > 0 ? (inputPrice * configs.resaleCommissionRate / 100) : 0;

    const netPerTicket = inputPrice > 0 ? (inputPrice - serviceFee) : 0;
    const totalNet = netPerTicket * selectedAttendees.length;

    const handleSubmit = async () => {
        if (inputPrice < minPrice || inputPrice > maxPrice) {
            alert(`Giá vé phải nằm trong khoảng ${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`);
            setConfirmOpen(false);
            return;
        }

        try {
            setSubmitting(true);
            const response = await createResalePost({
                pricePerTicket: inputPrice,
                ticketId: selectedTicketId,
                hasRetail: !noRetail,
                attendeeIds: selectedAttendees
            });
            if (response.code == HttpStatusCode.Ok) {
                toast.success("Đăng bán vé thành công!");
                navigate(routes.myTicket, { replace: true });
            }
        } catch (error) {
            console.error("Lỗi tạo bài đăng", error);
            toast.error("Có lỗi xảy ra, vui lòng thử lại!");
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

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
            <div className="max-w-5xl mx-auto">
                {/* title */}
                <div className="flex items-center gap-4 mb-8">
                    <ButtonBack onClick={handleGoBack} />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Thiết lập bán lại vé</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            {step === 1 ? 'Chọn những vé bạn muốn bán lại từ đơn hàng' : 'Cấu hình giá và phương thức bán'}
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    {/* Render Step 1 */}
                    {step === 1 && (
                        <Step1SelectTickets
                            bookingData={bookingData}
                            groupedAttendees={groupedAttendees}
                            selectedTicketId={selectedTicketId}
                            selectedAttendees={selectedAttendees}
                            toggleAttendeeSelection={toggleAttendeeSelection}
                            onNextStep={() => setStep(2)}
                        />
                    )}

                    {/* Render Step 2 */}
                    {step === 2 && (
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
                    )}
                </div>

                {/* Dialog  */}
                <ConfirmDialog
                    open={confirmOpen}
                    onOpenChange={setConfirmOpen}
                    onConfirm={handleSubmit}
                    isLoading={submitting}
                    title="Xác nhận đăng bán vé"
                    description={
                        <div className="space-y-2 mt-2 text-slate-600">
                            <p>Bạn đang đăng bán <strong className="text-slate-900">{selectedAttendees.length} vé {ticketInfo?.name}</strong>.</p>
                            <p>Giá công khai: <strong className="text-slate-900">{formatCurrency(inputPrice)} / vé</strong>.</p>
                            <p className="text-sm mt-2 p-2 bg-amber-50 text-amber-800 rounded border border-amber-200">
                                Hành động này không thể hoàn tác. Vé sẽ chuyển sang trạng thái chờ có người mua. Bạn chắc chắn muốn tiếp tục?
                            </p>
                        </div>
                    }
                    confirmLabel="Đăng bán ngay"
                    cancelLabel="Kiểm tra lại"
                />
            </div>
        </div>
    );
}