import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import DateTimePicker from "@/components/DateTimePicker";
import { format } from "date-fns/format";
import { isExpiredEventSession } from "@/utils/eventUtils";

// Schema Validation
const getTicketSchema = (eventStart, eventEnd) => {
    return z.object({
        name: z.string().min(1, { message: "Vui lòng nhập tên hạng vé" }),
        price: z.coerce.number().min(0, { message: "Giá vé không được âm" }),
        quantity: z.coerce.number().min(1, { message: "Số lượng vé phải ít nhất là 1" }),
        maximumPerPurchase: z.coerce.number().min(1, { message: "Tối thiểu 1 vé/đơn" }),
        invitationQuota: z.coerce.number().min(0, { message: "Số lượng không hợp lệ" }),
        openAt: z.coerce.date({ required_error: "Vui lòng chọn ngày bắt đầu" }),
        endAt: z.coerce.date({ required_error: "Vui lòng chọn ngày kết thúc" }),
        description: z.string().max(500, { message: "Mô tả quá dài (tối đa 500 ký tự)" }).optional(),
    })
        .refine((data) => {
            if (!eventEnd) return true;
            return data.endAt <= eventEnd;
        }, {
            message: "Ngày kết thúc bán phải trước khi sự kiện kết thúc",
            path: ["endAt"],
        })
        .refine((data) => data.endAt > data.openAt, {
            message: "Ngày kết thúc phải sau ngày bắt đầu",
            path: ["endAt"],
        });
};

export default function TicketModal({ isOpen, onClose, ticketToEdit, session, onSubmit }) {
    const isEditing = !!ticketToEdit;
    const isExpired = isExpiredEventSession({ eventSession: session })

    const ticketSchema = useMemo(() =>
        getTicketSchema(
            session?.startTime ? new Date(session.startTime) : null,
            session?.endTime ? new Date(session.endTime) : null
        ),
        [session]);

    const ticketForm = useForm({
        resolver: zodResolver(ticketSchema),
        defaultValues: {
            name: '',
            price: 0,
            quantity: 100,
            maximumPerPurchase: 5,
            invitationQuota: 0,
            openAt: new Date(),
            endAt: session?.startTime ? new Date(session.startTime) :
                new Date(new Date().setHours(new Date().getHours() + 2)),
            description: ''
        },
        mode: "onChange"
    });

    // Reset form when close/open or change session
    useEffect(() => {
        if (isOpen) {
            if (ticketToEdit) {
                // Map fields from BE (openAt) to Form (openAt)
                ticketForm.reset({
                    id: ticketToEdit.id,
                    name: ticketToEdit.name,
                    price: ticketToEdit.price,
                    quantity: ticketToEdit.quantity,
                    maximumPerPurchase: ticketToEdit.maximumPerPurchase || ticketToEdit.maximumPerPurchase || 5,
                    invitationQuota: ticketToEdit.invitationQuota || 0,
                    openAt: ticketToEdit.openAt ? new Date(ticketToEdit.openAt) : new Date(),
                    endAt: ticketToEdit.endAt ? new Date(ticketToEdit.endAt) : new Date(),
                    description: ticketToEdit.description || ''
                });
            } else {
                ticketForm.reset({
                    name: '', price: 0, quantity: 100, maximumPerPurchase: 5, invitationQuota: 0,
                    openAt: new Date(),
                    endAt: session?.endTime ? new Date(session.endTime) : new Date(),
                    description: ''
                });
            }
        }
    }, [isOpen, ticketToEdit, session, ticketForm]);

    const handleFormSubmit = (values) => {

        // FORMAT String before send
        // Backend LocalDateTime need format: "yyyy-MM-dd'T'HH:mm:ss"
        const payload = {
            ...values,
            id: ticketToEdit?.id,
            openAt: format(values.openAt, "yyyy-MM-dd'T'HH:mm:ss"),
            endAt: format(values.endAt, "yyyy-MM-dd'T'HH:mm:ss")
        };

        console.log("Dữ liệu gửi đi:", payload);
        // result: "2026-01-30T10:50:00"

        onSubmit(payload, session);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden gap-0 bg-white rounded-xl">
                <Form {...ticketForm}>
                    <form onSubmit={(e) => {
                        e.stopPropagation(); // Prevent foamy event
                        return ticketForm.handleSubmit(handleFormSubmit)(e);
                    }}>
                        {/* Header */}
                        <DialogHeader className="p-4 border-b bg-gray-50/50">
                            <div className="flex flex-col gap-1 text-left">
                                <DialogTitle>{isEditing ? "Cập nhật hạng vé" : "Tạo hạng vé mới"}</DialogTitle>
                                <DialogDescription className="text-gray-500 text-sm">
                                    T{isEditing ? "Chỉnh sửa thông tin, giá và số lượng vé." : "Thiết lập vé cho phiên này."}
                                </DialogDescription>
                            </div>
                        </DialogHeader>

                        {/* Body Form */}
                        <div className="p-6 space-y-6">
                            {/* name */}
                            <FormField
                                name="name"
                                control={ticketForm.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-gray-700">
                                            Tên hạng vé <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="VD: Vé VIP, Vé Early Bird"
                                                className="h-11"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                {/* Price */}
                                <FormField
                                    name="price"
                                    control={ticketForm.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold text-gray-700">
                                                Giá vé (VNĐ) <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <div className="relative">
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        placeholder="0"
                                                        className="h-11"
                                                        min={0}
                                                    />
                                                </FormControl>
                                            </div>
                                            <p className="text-[11px] text-gray-500 mt-1">Nhập 0 = Miễn phí</p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Quantity */}
                                <FormField
                                    name="quantity"
                                    control={ticketForm.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold text-gray-700">
                                                Tổng số lượng <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input {...field} type="number" className="h-11" min={1} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Max per order */}
                                <FormField
                                    name="maximumPerPurchase"
                                    control={ticketForm.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold text-gray-700">
                                                Max/Đơn <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input {...field} type="number" className="h-11" min={1} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Invitation Quota */}
                                <FormField
                                    name="invitationQuota"
                                    control={ticketForm.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold text-gray-700">
                                                Vé mời
                                            </FormLabel>
                                            <FormControl>
                                                <Input {...field} type="number" className="h-11" min={0} />
                                            </FormControl>
                                            <p className="text-[11px] text-gray-500 mt-1">Giữ chỗ (không bán)</p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Time */}
                            <div className="space-y-2">
                                <Label className="font-bold text-gray-700 text-sm uppercase tracking-wide">Thời gian mở bán</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4
                                 bg-slate-50 rounded-xl border border-slate-100">

                                    <FormField
                                        control={ticketForm.control}
                                        name="openAt"
                                        render={({ field, fieldState }) => (
                                            <DateTimePicker
                                                label="Bắt đầu mở bán"
                                                require={true}
                                                value={field.value}
                                                onChange={field.onChange}
                                                error={fieldState.error?.message}
                                            />
                                        )}
                                    />

                                    <FormField
                                        control={ticketForm.control}
                                        name="endAt"
                                        render={({ field, fieldState }) => (
                                            <DateTimePicker
                                                label="Kết thúc mở bán"
                                                require={true}
                                                value={field.value}
                                                onChange={field.onChange}
                                                error={fieldState.error?.message}
                                            />
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <FormField
                                name="description"
                                control={ticketForm.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-gray-700">
                                            Mô tả chi tiết
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder="VD: Bao gồm nước uống, chỗ ngồi VIP..."
                                                className="min-h-[100px] rounded-xl resize-none"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Footer Actions */}
                        <DialogFooter className="p-4 border-t bg-gray-50 flex flex-row justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                type="button"
                                className="h-10 px-6"
                            >
                                Hủy bỏ
                            </Button>
                            {
                                !isExpired &&
                                <Button
                                    type="submit"
                                    className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" /> Lưu thông tin
                                </Button>
                            }
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}