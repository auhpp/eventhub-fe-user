import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Save } from 'lucide-react';
import EventBasicInfo from './EventBasicInfo';
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import EventLocation from './EventLocation';
import EventSessions from './EventSessions';
import { EventType } from '@/utils/constant';
import { createEventApi } from '@/services/eventService';
import { HttpStatusCode } from 'axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/config/routes';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const createEventSchema = z.object({
    name: z.string().min(1, { message: "Vui lòng nhập tên sự kiện" }),
    categoryId: z.string().min(1, { message: "Vui lòng chọn danh mục" }),
    type: z.string().min(1, { message: "Vui lòng chọn loại sự kiện" }),
    description: z.string().min(10, { message: "Mô tả cần ít nhất 10 ký tự" }),
    thumbnail: z
        .instanceof(File, { message: "Vui lòng chọn ảnh bìa sự kiện" })
        .refine((file) => file.size <= MAX_FILE_SIZE, {
            message: "Kích thước ảnh tối đa là 5MB",
        })
        .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
            message: "Chỉ hỗ trợ định dạng .jpg, .jpeg, .png và .webp",
        }),
    location: z.string(),
    meetingUrl: z.string(),
    meetingPlatform: z.string().optional(),
    coordinates: z.object({
        lat: z.number(),
        lng: z.number()
    }).nullable().optional(),
})
    .superRefine((data, ctx) => {
        if (data.type === EventType.OFFLINE.key) {
            if (!data.location || data.location.length < 5) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Vui lòng nhập địa chỉ tổ chức (tối thiểu 5 ký tự)",
                    path: ["location"],
                });
            }

            if (data.location && data.location.length >= 5 && !data.coordinates) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Vui lòng chọn địa điểm từ danh sách gợi ý để lấy vị trí chính xác",
                    path: ["location"],
                });
            }
        }

        if (data.type === EventType.ONLINE.key) {
            // eslint-disable-next-line no-useless-escape
            const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
            if (!data.meetingUrl || !urlRegex.test(data.meetingUrl)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Vui lòng nhập đường dẫn cuộc họp hợp lệ (Zoom, Google Meet...)",
                    path: ["meetingUrl"],
                });
            }
        }
    });

const CreateEventPage = () => {
    const navigate = useNavigate()
    const [sessions, setSessions] = useState([
        {
            id: `session-1`,
            startTime: '',
            endTime: '',
            tickets: []
        }
    ]);

    const form = useForm({
        resolver: zodResolver(createEventSchema),
        defaultValues: {
            name: "",
            categoryId: "",
            type: EventType.OFFLINE.key,
            description: "",
            thumbnail: undefined,
            location: "",
            meetingUrl: "",
            meetingPlatform: "",
            coordinates: null,
        },
        mode: "onChange",
    });
    const handleLocationSelect = (locationName, locationCoordinates) => {
        form.setValue("coordinates", locationCoordinates, { shouldValidate: false });
        form.setValue("location", locationName, { shouldValidate: true });
    };

    const createEvent = async (data) => {

        console.log("Form Data Submitted:", data);
        console.log("sessions:", sessions);

        try {
            const response = await createEventApi({ eventData: data, sessions: sessions })
            if (response.code == HttpStatusCode.Ok) {
                toast.info("Tạo sự kiện thành công")
                navigate(routes.eventManagement)

            }
        } catch (error) {
            console.log(error)
        }
    }
    const handleLocationChange = (text) => {
        form.setValue("location", text);
        form.setValue("coordinates", null);
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black leading-tight">Tạo sự kiện</h1>
                    <p className="text-muted-foreground mt-1">Thêm thông tin chi tiết, quản lý địa điểm và các suất diễn.</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(createEvent)}>
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-4">
                        <div className="space-y-6 col-span-2">
                            <EventBasicInfo form={form} />
                        </div>

                        <div className="space-y-6 col-span-1">
                            <EventLocation
                                form={form}
                                onLocationSelect={handleLocationSelect}
                                onLocationChange={handleLocationChange}
                            />
                        </div>
                    </div>

                    <EventSessions sessions={sessions} setSessions={setSessions} />

                    <div className="flex gap-4 pt-6 pb-2 mt-4">
                        <Button
                            type="submit"
                            className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 transition-all ml-auto"
                            disabled={form.formState.isSubmitting}
                        >
                            {form.formState.isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <Save className="size-5 mr-2" />
                                    Tạo sự kiện
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
            <div className="h-12"></div>
        </div>
    );
};

export default CreateEventPage;