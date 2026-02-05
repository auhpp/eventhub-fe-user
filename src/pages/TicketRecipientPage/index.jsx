import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search, ChevronLeft, Ticket, X, ChevronDown, ChevronUp, User, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { getUserByEmail } from '@/services/userService';
import { routes } from '@/config/routes';
import { HttpStatusCode } from 'axios';
import DefaultAvatar from '@/components/DefaultAvatar';

const TicketRecipientPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // --- STATE ---
    const [selectedTickets, setSelectedTickets] = useState([]);
    const [emailInput, setEmailInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [recipient, setRecipient] = useState(null);
    const [isTicketsExpanded, setIsTicketsExpanded] = useState(false);

    // --- EFFECT ---
    useEffect(() => {
        const storedTickets = localStorage.getItem('gift_session_tickets');
        if (storedTickets) {
            setSelectedTickets(JSON.parse(storedTickets));
        } else {
            toast.error("Vui lòng chọn vé trước");
            navigate(-1);
        }
    }, [navigate]);

    // --- HELPER: Group tickets by type  ---
    const groupedTickets = useMemo(() => {
        const groups = {};
        selectedTickets.forEach(t => {
            const name = t.ticket?.name;
            if (!groups[name]) groups[name] = 0;
            groups[name]++;
        });
        return Object.entries(groups).map(([name, count]) => ({ name, count }));
    }, [selectedTickets]);

    // --- HANDLER ---
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!emailInput.trim()) return;

        setLoading(true);
        setRecipient(null);

        try {
            const data = await getUserByEmail({ email: emailInput });
            if (data.code == HttpStatusCode.Ok && data?.result) {
                setRecipient(data.result);
                toast.success("Đã tìm thấy người dùng!");
            } else {
                toast.error("Không tìm thấy người dùng với email này");
            }
        } catch (error) {
            console.error("Search error", error);
            toast.error("Lỗi kết nối");
        } finally {
            setLoading(false);
        }
    };

    const handleClearSearch = () => {
        setEmailInput('');
        setRecipient(null);
    };

    const handleContinue = () => {
        if (!recipient) return;
        const giftSession = { recipient, tickets: selectedTickets };
        localStorage.setItem('gift_session_final', JSON.stringify(giftSession));
        navigate(routes.ticketGiftConfirm.replace(":id", id));
    };

    // --- RENDER ---
    return (
        <div className="flex flex-col min-h-screen relative bg-gray-50/50">

            {/* HEADER */}
            <div className="bg-white border-b border-gray-100 py-3 sticky top-0 z-10">
                <div className=" mx-auto px-4 flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-8 w-8 -ml-2 text-gray-500">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-lg font-semibold text-gray-900">Người nhận vé</h1>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1  mx-auto w-full px-4 py-6 space-y-6">

                {/* COMPACT TICKET SUMMARY  */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => setIsTicketsExpanded(!isTicketsExpanded)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-brand flex items-center
                             justify-center shrink-0">
                                <Ticket className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    Đang tặng <span className="text-brand font-bold">{selectedTickets.length}</span> vé
                                </p>
                                <p className="text-xs text-gray-500">
                                    {isTicketsExpanded ? "Thu gọn danh sách" : "Xem chi tiết vé"}
                                </p>
                            </div>
                        </div>
                        {isTicketsExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> :
                            <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>

                    {/* Expandable List */}
                    {isTicketsExpanded && (
                        <div className="px-4 pb-4 bg-gray-50/50 border-t border-gray-100 
                        animate-in slide-in-from-top-2 duration-200">
                            <div className="mt-3 space-y-2">
                                {groupedTickets.map((group, idx) => (
                                    <div key={idx} className="flex justify-between items-center 
                                    text-sm bg-white p-2.5 rounded-lg border border-gray-200">
                                        <span className="text-gray-700 font-medium">{group.name}</span>
                                        <span className="bg-gray-100 text-gray-600 text-xs px-2
                                         py-1 rounded font-semibold">x{group.count}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 text-xs text-center text-gray-400">
                                Vé sẽ được chuyển miễn phí ngay lập tức
                            </div>
                        </div>
                    )}
                </div>

                {/* SEARCH AREA */}
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider ml-1">Tìm người nhận</h2>

                    {/* Input Form */}
                    <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand transition-all">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    type="email"
                                    placeholder="Nhập email người nhận (VD: user@example.com)"
                                    className="pl-9 border-none shadow-none focus-visible:ring-0 bg-transparent h-10"
                                    value={emailInput}
                                    onChange={(e) => setEmailInput(e.target.value)}
                                    disabled={!!recipient}
                                />
                                {recipient && (
                                    <button
                                        type="button"
                                        onClick={handleClearSearch}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            {!recipient && (
                                <Button
                                    type="submit"
                                    disabled={loading || !emailInput}
                                    className="bg-brand hover:bg-brand/90 text-white px-6 rounded-lg h-10"
                                >
                                    {loading ? <span className="animate-spin">...</span> : "Tìm"}
                                </Button>
                            )}
                        </form>
                    </div>

                    {/* Result Card */}
                    {recipient && (
                        <div className="bg-white rounded-xl border
                         border-green-200 p-4 shadow-[0_4px_20px_rgba(0,255,100,0.05)] 
                         animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden">

                            <div className="flex items-start gap-4 relative z-10">
                                <Avatar className="w-14 h-14 border-2 border-white shadow-sm ring-2 ring-green-100">
                                    <DefaultAvatar user={recipient} />
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col">
                                        <h3 className="text-lg font-bold text-gray-900 truncate">
                                            {recipient.fullName || "Người dùng"}
                                        </h3>
                                        <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5 truncate">
                                            <User className="w-3.5 h-3.5" />
                                            <span>{recipient.email}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {!recipient && !loading && (
                        <div className="text-xs text-gray-400 text-center px-4">
                            Lưu ý: Người nhận phải có tài khoản trên hệ thống để nhận vé.
                        </div>
                    )}
                </div>
            </div>

            {/* STICKY FOOTER */}
            <div className="sticky bottom-0 z-20 bg-white border-t border-gray-200 py-3 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="mx-auto flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wide">Gửi tới</span>
                        <div className="text-sm font-semibold text-gray-900 max-w-[500px] truncate">
                            {recipient ? recipient.fullName : "---"}
                        </div>
                    </div>

                    <Button
                        onClick={handleContinue}
                        disabled={!recipient}
                        size="sm"
                        className="h-10 px-8 rounded-lg font-medium bg-brand hover:bg-brand/90 text-white min-w-[140px] shadow-lg shadow-blue-500/20 disabled:shadow-none transition-all"
                    >
                        Tiếp tục <ArrowRight className="ml-1.5 w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TicketRecipientPage;