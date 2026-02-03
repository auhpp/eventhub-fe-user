import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { HttpStatusCode } from 'axios';
import { EventType } from '@/utils/constant';
import { getEventById, updateEvent } from '@/services/eventService';
import { routes } from '@/config/routes';
import ImageUploadSession from '../CreateEventPage/ImageUploadSession';
import EventBasicInfo from '../CreateEventPage/EventBasicInfo';
import EventLocation from '../CreateEventPage/EventLocation';
import EditEventSessions from './EditEventSessions';
import { isExpiredEvent } from '@/utils/eventUtils';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const updateEventSchema = z.object({
    name: z.string().min(1, { message: "Vui lòng nhập tên sự kiện" }),
    categoryId: z.string().min(1, { message: "Vui lòng chọn danh mục" }),
    type: z.string().min(1, { message: "Vui lòng chọn loại sự kiện" }),
    description: z.string().min(10, { message: "Mô tả cần ít nhất 10 ký tự" }),
    poster: z.union([
        z.instanceof(File).refine((file) => file.size <= MAX_FILE_SIZE, "Kích thước tối đa 5MB")
            .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), "Định dạng không hỗ trợ"),
        z.string(),
        z.null(),
        z.undefined()
    ]).optional(),
    thumbnail: z.union([
        z.instanceof(File).refine((file) => file.size <= MAX_FILE_SIZE, "Kích thước tối đa 5MB")
            .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), "Định dạng không hỗ trợ"),
        z.string(),
        z.null(),
        z.undefined()
    ]).optional(),
    location: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
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
            if (!data.address || data.address.length < 5) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Vui lòng nhập tên địa điểm (tối thiểu 5 ký tự)",
                    path: ["address"],
                });
            }
            if (data.location && data.location.length >= 5 && !data.coordinates) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Vui lòng chọn địa chỉ từ danh sách gợi ý để ghim vị trí bản đồ",
                    path: ["location"],
                });
            }
        }
    });

const EditEventPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("info");
    const [eventData, setEventData] = useState(null);
    const form = useForm({
        resolver: zodResolver(updateEventSchema),
        defaultValues: {
            name: "",
            categoryId: "",
            type: EventType.OFFLINE.key,
            description: '',
            address: "",
            location: "",
            thumbnail: undefined,
            poster: undefined,
            coordinates: null,
        },
        mode: "onChange",
    });

    const fetchEventData = async () => {
        if (!id) return;
        try {
            const response = await getEventById({ id });
            if (response) {
                const eventDataRes = response.result;
                setEventData(eventDataRes)
                // Reset form with old value
                form.reset({
                    id: eventDataRes.id,
                    name: eventDataRes.name || "",
                    categoryId: String(eventDataRes.category.id || ""),
                    type: eventDataRes.type || EventType.OFFLINE.key,
                    description: eventDataRes.description || "",
                    address: eventDataRes.address || "",
                    location: eventDataRes.location || "",
                    poster: eventDataRes.posterUrl || eventDataRes.poster || null,
                    thumbnail: eventDataRes.thumbnailUrl || eventDataRes.thumbnail || null,
                    coordinates: (eventDataRes?.locationCoordinates?.latitude
                        && eventDataRes?.locationCoordinates?.longitude) ? {
                        lat: eventDataRes.locationCoordinates.latitude,
                        lng: eventDataRes.locationCoordinates.longitude
                    } : null
                });
            }
        } catch (error) {
            console.error("Failed to fetch event:", error);
            toast.error("Không thể tải thông tin sự kiện");
            navigate(routes.eventManagement);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEventData();
    }, [id, form, navigate]);

    const handleLocationSelect = (locationName, locationCoordinates) => {
        form.setValue("coordinates", locationCoordinates, { shouldValidate: false });
        form.setValue("location", locationName, { shouldValidate: true });
    };

    const handleLocationChange = (text) => {
        form.setValue("location", text);
        form.setValue("coordinates", null);
    };

    // Submit Handler
    const onUpdateEvent = async (data) => {
        try {
            const payload = {
                ...data,
                thumbnail: data.thumbnail instanceof File ? data.thumbnail : null,
                poster: data.poster instanceof File ? data.poster : null,
            };

            const response = await updateEvent({ id, eventData: payload });

            if (response && (response.code === HttpStatusCode.Ok || response.id)) {
                toast.success("Cập nhật sự kiện thành công");
            } else {
                toast.warning("Cập nhật thành công nhưng có cảnh báo từ hệ thống");
            }
        } catch (error) {
            console.error(error);
            toast.error("Có lỗi xảy ra khi cập nhật sự kiện");
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[80vh] w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    const isExpired = isExpiredEvent({ event: eventData })

    return (
        <div className="max-w">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                        <ArrowLeft className="size-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black leading-tight">Chỉnh sửa sự kiện</h1>
                        <p className="text-muted-foreground mt-1">Cập nhật thông tin, hình ảnh và thời gian tổ chức.</p>
                    </div>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-2">
                <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                    <TabsTrigger value="info">Thông tin chung</TabsTrigger>
                    <TabsTrigger value="sessions">Quản lý khung giờ</TabsTrigger>
                </TabsList>

                {/* --- TAB 1: event info --- */}
                <TabsContent value="info" className="space-y-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onUpdateEvent)}>
                            <div className="mb-6">
                                <ImageUploadSession form={form}
                                    isEditing={true}

                                />
                            </div>

                            <div className="mb-6">
                                <EventBasicInfo form={form}
                                    isEditing={true}
                                />
                            </div>

                            {
                                eventData.type == EventType.OFFLINE.key &&
                                <div className='mb-6'>
                                    <EventLocation
                                        form={form}
                                        onLocationSelect={handleLocationSelect}
                                        onLocationChange={handleLocationChange}
                                    />
                                </div>
                            }

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-4 border-t sticky bottom-0 bg-background/95 backdrop-blur py-4 z-20">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-11 px-8 rounded-xl"
                                    onClick={() => navigate(routes.eventManagement)}
                                >
                                    Hủy bỏ
                                </Button>
                                {
                                    !isExpired &&
                                    <Button
                                        type="submit"
                                        className="h-11 px-8 rounded-xl
                                     bg-blue-600 hover:bg-blue-700 text-white font-bold ml-auto"
                                        disabled={form.formState.isSubmitting}
                                    >
                                        {form.formState.isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Đang lưu...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="size-5 mr-2" />
                                                Lưu thay đổi
                                            </>
                                        )}
                                    </Button>
                                }
                            </div>
                        </form>
                    </Form>
                </TabsContent>

                {/* --- TAB 2: sessions --- */}
                <TabsContent value="sessions">
                    <TabsContent value="sessions">
                        {eventData ? (
                            <EditEventSessions
                                eventData={eventData}
                                onRefresh={fetchEventData} 
                            />
                        ) : (
                            <Loader2 className="animate-spin mx-auto mt-10" />
                        )}
                    </TabsContent>
                </TabsContent>
            </Tabs>

            <div className="h-12"></div>
        </div>
    );
};

export default EditEventPage;