import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Trash2 } from 'lucide-react';
import AddSessionModal from './AddSessionModal';

const ScopeSection = ({ event, errors, setErrors, isAllSessions, setIsAllSessions,
    selectedSessionIds, setSelectedSessionIds, selectedTicketIds, setSelectedTicketIds }) => {

    const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false);
    const [sessionToSelect, setSessionToSelect] = useState("");

    const handleSelectSession = () => {
        if (sessionToSelect && !selectedSessionIds.includes(Number(sessionToSelect))) {
            setSelectedSessionIds(prev => [...prev, Number(sessionToSelect)]);
        }
        setIsAddSessionModalOpen(false);
        setSessionToSelect("");
    };

    const handleRemoveSession = (sessionId) => {
        setSelectedSessionIds(prev => prev.filter(id => id !== sessionId));
        const session = event?.eventSessions.find(s => s.id === sessionId);
        if (session) {
            const sessionTicketIds = session.tickets.map(t => t.id);
            setSelectedTicketIds(prev => prev.filter(id => !sessionTicketIds.includes(id)));
        }
    };

    const handleToggleTicket = (ticketId, checked) => {
        if (checked) setSelectedTicketIds(prev => [...prev, ticketId]);
        else setSelectedTicketIds(prev => prev.filter(id => id !== ticketId));
        if (errors.scope) setErrors(prev => ({ ...prev, scope: undefined }));
    };

    const handleToggleAllTicketsInSession = (sessionId, checked) => {
        const session = event?.eventSessions.find(s => s.id === sessionId);
        if (!session) return;
        const sessionTicketIds = session.tickets.map(t => t.id);

        if (checked) {
            setSelectedTicketIds(prev => [...new Set([...prev, ...sessionTicketIds])]);
        } else {
            setSelectedTicketIds(prev => prev.filter(id => !sessionTicketIds.includes(id)));
        }
        if (errors.scope) setErrors(prev => ({ ...prev, scope: undefined }));
    };

    return (
        <div className={`bg-white p-6 rounded-lg shadow-sm border ${errors.scope ? "border-red-500" : ""}`}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Phạm vi áp dụng <span className="text-red-500">*</span></h2>
            </div>

            <RadioGroup
                className="flex gap-6 mb-6"
                value={isAllSessions ? "all" : "specific"}
                onValueChange={(val) => { setIsAllSessions(val === 'all'); setErrors(prev => ({ ...prev, scope: undefined })); }}
            >
                <div className="flex items-center gap-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all" className="cursor-pointer">Toàn bộ suất diễn</Label>
                </div>
                <div className="flex items-center gap-2">
                    <RadioGroupItem value="specific" id="specific" />
                    <Label htmlFor="specific" className="cursor-pointer">Giới hạn suất diễn</Label>
                </div>
            </RadioGroup>

            {!isAllSessions && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <span className="font-semibold text-sm">Các suất diễn áp dụng</span>
                        <Button size="sm" className="bg-[#10b981] hover:bg-[#059669]" onClick={() => 
                            setIsAddSessionModalOpen(true)}>
                            Thêm suất diễn
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {event?.eventSessions?.filter(s => selectedSessionIds.includes(s.id)).map((session, index) => {
                            const sessionTicketIds = session.tickets.map(t => t.id);
                            const isAllTicketsSelected = sessionTicketIds.length > 0 && sessionTicketIds.every(id => 
                                selectedTicketIds.includes(id));
                            const isSomeTicketsSelected = sessionTicketIds.some(id => selectedTicketIds.includes(id));

                            return (
                                <div key={session.id} className="border rounded-md overflow-hidden">
                                    <div className="bg-slate-50 p-3 flex justify-between items-center border-b">
                                        <span className="font-semibold text-sm">
                                            {index + 1} | Suất diễn: {new Date(session.startDateTime).toLocaleString('vi-VN')}
                                        </span>
                                        <Button variant="ghost" size="icon" className="text-red-500 h-8 w-8 hover:bg-red-50" 
                                        onClick={() => handleRemoveSession(session.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="p-0">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-white border-b">
                                                <tr>
                                                    <th className="px-4 py-3 w-[50px]">
                                                        <Checkbox
                                                            checked={isAllTicketsSelected ? true : isSomeTicketsSelected ?
                                                                 "indeterminate" : false}
                                                            onCheckedChange={(checked) => 
                                                                handleToggleAllTicketsInSession(session.id, checked)}
                                                        />
                                                    </th>
                                                    <th className="px-4 py-3 font-medium">Loại vé</th>
                                                    <th className="px-4 py-3 font-medium w-[150px]">Giá</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {session.tickets.map(ticket => (
                                                    <tr key={ticket.id} className="border-b last:border-0 bg-[#f0fdf4]/30">
                                                        <td className="px-4 py-3">
                                                            <Checkbox
                                                                checked={selectedTicketIds.includes(ticket.id)}
                                                                onCheckedChange={(checked) =>
                                                                     handleToggleTicket(ticket.id, checked)}
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">{ticket.name}</td>
                                                        <td className="px-4 py-3">{ticket.price.toLocaleString('vi-VN')} đ</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            <AddSessionModal
                onCancel={() => setIsAddSessionModalOpen(false)}
                onOpenChange={setIsAddSessionModalOpen}
                onSubmit={handleSelectSession}
                onValueChange={setSessionToSelect}
                open={isAddSessionModalOpen}
                selectedSessionIds={selectedSessionIds}
                value={sessionToSelect}
                event={event}
            />
        </div>
    );
};

export default ScopeSection;