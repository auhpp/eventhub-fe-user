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
import { useMemo } from "react";
import { Textarea } from "./ui/textarea";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";

const getTicketSchema = (eventStart, eventEnd) => {
    return z.object({
        name: z.string().min(1, { message: "Vui lòng nhập tên hạng vé" }),
        price: z.coerce.number().min(0, { message: "Vui lòng nhập giá vé hợp lệ" }),
        quantity: z.coerce.number().min(1, { message: "Tổng số lượng vé phải ít nhất là 1" }),
        maxPerOrder: z.coerce.number().min(1, { message: "Số vé tối đa/đơn phải ít nhất là 1" }),
        startDate: z.coerce.date({ required_error: "Vui lòng chọn ngày bắt đầu" }),
        endDate: z.coerce.date({ required_error: "Vui lòng chọn ngày kết thúc" }),
        description: z.string().max(100, { message: "Chỉ giới hạn 100 từ" }).optional(),
    })
        .refine((data) => {
            if (!eventStart) return true;
            return data.startDate >= new Date();
        }, {
            message: "Ngày mở bán không được sớm hơn ngày hiện tại",
            path: ["startDate"],
        })
        .refine((data) => {
            if (!eventEnd) return true;
            return data.endDate <= eventEnd;
        }, {
            message: "Ngày kết thúc bán không được muộn hơn ngày kết thúc sự kiện",
            path: ["endDate"],
        })
        .refine((data) => data.endDate > data.startDate, {
            message: "Ngày kết thúc phải diễn ra sau ngày bắt đầu",
            path: ["endDate"],
        })

};


export default function CreateTicketModal({ isOpen, onClose, session, onSubmit, }) {

    const ticketSchema = useMemo(() =>
        getTicketSchema(new Date(session.startTime), new Date(session.endTime)),
        [session]);

    const formatDateForInput = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const offset = d.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(d - offset)).toISOString().slice(0, 16);
        return localISOTime;
    };


    const ticketForm = useForm({
        resolver: zodResolver(ticketSchema),
        defaultValues: {
            name: '',
            price: 0,
            quantity: 10,
            maxPerOrder: 10,
            startDate: new Date(),
            endDate: new Date(new Date().setHours(new Date().getHours() + 2)),
            description: ''
        },
        mode: "onChange"
    })


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden gap-0 bg-white rounded-xl">
                <Form {...ticketForm}>
                    <form onSubmit={(e) => {
                        e.stopPropagation();
                        return ticketForm.handleSubmit(values => onSubmit(values, session))(e);
                    }}>
                        {/* Header */}
                        <DialogHeader className="p-3 pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <DialogTitle className="text-xl font-bold text-gray-900">
                                        Tạo hạng vé mới
                                    </DialogTitle>
                                    <DialogDescription className="text-gray-500 mt-1">
                                        Thiết lập giá và số lượng cho loại vé này.
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        {/* Body Form */}
                        <div className="p-6 space-y-6">
                            {/* name */}
                            <div className="grid grid-cols-2 gap-6">
                                <FormField className="space-y-1"
                                    name="name"
                                    control={ticketForm.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel htmlFor="ticketName" className="font-bold text-gray-700">
                                                Tên hạng vé <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    id="ticketName"
                                                    placeholder="VD: Vé VIP, Vé Sớm"
                                                    className="h-11 rounded-lg border-gray-300 focus:ring-blue-500"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>

                                    )}
                                />
                                {/* price */}
                                <FormField className="space-y-1"
                                    name="price"
                                    control={ticketForm.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel htmlFor="ticketName" className="font-bold text-gray-700">
                                                Giá vé <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₫</span>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        id="price"
                                                        type="number"
                                                        placeholder="0"
                                                        className="pl-8 h-11 rounded-lg border-gray-300 focus:ring-blue-500"
                                                    />
                                                </FormControl>
                                            </div>
                                            <p className="text-xs text-gray-500">Nhập 0 nếu là vé miễn phí.</p>
                                            <FormMessage />

                                        </FormItem>

                                    )}
                                />

                            </div>

                            {/* quantity */}
                            <div className="grid grid-cols-2 gap-6">
                                <FormField className="space-y-1"
                                    name="quantity"
                                    control={ticketForm.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel htmlFor="ticketName" className="font-bold text-gray-700">
                                                Số lượng vé có sẵn  <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    id="quantity"
                                                    type="number"
                                                    placeholder="VD: 100"
                                                    className="h-11 rounded-lg border-gray-300 focus:ring-blue-500"
                                                />
                                            </FormControl>
                                            <FormMessage />

                                        </FormItem>

                                    )}
                                />
                                {/* max per order */}
                                <FormField className="space-y-1"
                                    name="maxPerOrder"
                                    control={ticketForm.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel htmlFor="ticketName" className="font-bold text-gray-700">
                                                Số lượng tối đa mỗi đơn <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    id="maxPerOrder"
                                                    type="number"
                                                    defaultValue={10}
                                                    className="h-11 rounded-lg border-gray-300 focus:ring-blue-500"
                                                />
                                            </FormControl>
                                            <FormMessage />

                                        </FormItem>

                                    )}
                                />


                            </div>

                            {/* time */}
                            <div className="space-y-1">
                                <Label className="font-bold text-gray-700 text-base">Thời gian mở bán</Label>
                                <div className="grid grid-cols-2 gap-6">
                                    {/* Start date */}
                                    <FormField className="space-y-1"
                                        name="startDate"
                                        control={ticketForm.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel htmlFor="ticketName" className="text-xs font-bold text-gray-500 uppercase">
                                                    Bắt đầu <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        value={formatDateForInput(field.value)}
                                                        onChange={(e) => {
                                                            field.onChange(e.target.value ? new Date(e.target.value) : undefined);
                                                        }}
                                                        type="datetime-local"
                                                        className="h-11 rounded-lg border-gray-300 text-gray-600
                                             focus:ring-blue-500 cursor-pointer block"
                                                    />
                                                </FormControl>
                                                <FormMessage />

                                            </FormItem>

                                        )}
                                    />
                                    {/* end date */}
                                    <FormField className="space-y-1"
                                        name="endDate"
                                        control={ticketForm.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel htmlFor="ticketName" className="text-xs font-bold text-gray-500 uppercase">
                                                    Kết thúc <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        value={formatDateForInput(field.value)}
                                                        onChange={(e) => {
                                                            field.onChange(e.target.value ? new Date(e.target.value) : undefined);
                                                        }}
                                                        type="datetime-local"
                                                        className="h-11 rounded-lg border-gray-300 text-gray-600 focus:ring-blue-500 cursor-pointer block"
                                                    />
                                                </FormControl>
                                                <FormMessage />

                                            </FormItem>

                                        )}
                                    />

                                </div>
                            </div>
                            {/* Description */}
                            <FormField className="space-y-1"
                                name="desription"
                                control={ticketForm.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="ticketName" className="text-xs font-bold text-gray-500 uppercase">
                                            Thông tin vé
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder="Mô tả..."
                                                className="min-h-[100px] rounded-xl resize-none leading-relaxed"
                                            />
                                        </FormControl>
                                        <FormMessage />

                                    </FormItem>

                                )}
                            />
                        </div>

                        {/* Footer Actions */}
                        <DialogFooter className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                type="button"
                                className="h-11 px-6 rounded-lg border-gray-300 text-gray-700 font-semibold hover:bg-gray-100"
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                className="h-11 px-6 rounded-lg
                                 bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" /> Lưu vé
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>

            </DialogContent>
        </Dialog>
    );
}