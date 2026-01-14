import React, { useState } from 'react';
import {
    UploadCloud,
    Phone,
    Link as LinkIcon,
    CheckCircle2,
    Loader2
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardFooter
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, Form } from '@/components/ui/form';
import { createOrganizerRegistrationRequest } from '@/services/organizerRegistrationService';
import { HttpStatusCode } from 'axios';
import { routes } from '@/config/routes';


const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const createOrganizerRequestFormSchema = z
    .object({
        businessName: z
            .string()
            .min(1, { message: "Vui lòng nhập tên ban tổ chức" }),
        representativeFullName: z
            .string()
            .min(1, { message: "Vui lòng nhập tên người đại diện" }),
        email: z
            .string()
            .min(1, { message: "Vui lòng nhập email" })
            .email({ message: "Email không hợp lệ" }),
        phoneNumber: z
            .string()
            .min(1, { message: "Vui lòng nhập số điện thoại" })
            .regex(/^(0)(3|5|7|8|9)[0-9]{8}$/, { message: "Số điện thoại không đúng định dạng (VN)" }),
        biography: z
            .string()
            .min(1, { message: "Vui lòng nhập giới thiệu" }),
        contactAddress: z
            .string()
            .min(1, { message: "Vui lòng nhập địa chỉ" }),

        businessAvatar: z
            .instanceof(File, { message: "Vui lòng chọn ảnh đại diện" })
            .refine((file) => file.size <= MAX_FILE_SIZE, {
                message: "Kích thước ảnh tối đa là 5MB",
            })
            .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
                message: "Chỉ hỗ trợ định dạng .jpg, .jpeg, .png và .webp",
            }),
    });


const CreateOrganizerRequestPage = () => {
    const navigate = useNavigate();
    const [previewUrl, setPreviewUrl] = useState(null);
    const form = useForm({
        resolver: zodResolver(createOrganizerRequestFormSchema),
        defaultValues: {
            businessName: "",
            representativeFullName: "",
            email: "",
            phoneNumber: "",
            biography: "",
            contactAddress: "",
            businessAvatar: undefined,
        },
        mode: "onChange",
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        console.log(file)
        if (file) {
            form.setValue("businessAvatar", file)
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (values) => {
        try {
            console.log(values)
            const reponse = await createOrganizerRegistrationRequest(values);
            if (reponse.code == HttpStatusCode.Ok) {
                navigate(routes.organizerRegistration, { replace: true })
            }
        } catch (error) {
            console.log(error)
        }
    }
    return (
        <div className=" space-y-6">

            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Đăng ký Ban Tổ chức</h1>
                <p className="text-muted-foreground text-sm">
                    Hoàn tất hồ sơ để bắt đầu kiến tạo những sự kiện tuyệt vời trên nền tảng.
                </p>
            </div>

            <Card className="border-border shadow-sm">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="space-y-8 mt-5">
                            {/* === SECTION 1: PUBLIC INFO === */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                {/* Avatar Upload */}
                                <div className="md:col-span-3 flex flex-col items-center gap-3">
                                    <FormField
                                        control={form.control}
                                        name="businessAvatar"
                                        // eslint-disable-next-line no-unused-vars
                                        render={({ field: { value, onChange, ...fieldProps } }) => (
                                            <FormItem>
                                                <div className="relative group w-32 h-32 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 bg-muted/30 flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden">
                                                    {previewUrl ? (
                                                        <>
                                                            <img
                                                                src={previewUrl}
                                                                alt="Avatar Preview"
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <UploadCloud className="w-8 h-8 text-white" />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UploadCloud className="w-8 h-8 text-muted-foreground mb-2" />
                                                            <span className="text-xs text-muted-foreground font-medium text-center px-2">
                                                                Tải logo lên
                                                            </span>
                                                        </>
                                                    )}
                                                    <Input
                                                        {...fieldProps}
                                                        type="file"
                                                        accept="image/*"
                                                        className="absolute inset-0 opacity-0 cursor-pointer h-full w-full z-10"
                                                        onChange={(e) => handleImageChange(e, onChange)}
                                                    />
                                                </div>
                                                <FormMessage className="text-xs text-center" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Info Fields */}
                                <div className="md:col-span-9 space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="businessName"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2 col-span-2 md:col-span-2">
                                                    <FormLabel>Tên Ban Tổ chức <span className="text-destructive">*</span></FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Ví dụ: Công ty Giải trí ABC" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* === SECTION 2: VERIFICATION === */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-primary" />
                                    <h3 className="text-sm font-semibold">Thông tin liên hệ</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="representativeFullName"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2 space-y-2">
                                                <FormLabel>Tên người đại diện <span className="text-destructive">*</span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Nguyễn Văn A" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="phoneNumber"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel>Số điện thoại liên hệ <span className="text-destructive">*</span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder="09xxxxxxxx" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel>Email liên hệ <span className="text-destructive">*</span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder="example@gmail.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <Separator />

                            {/* === SECTION 3: CONTACT === */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <LinkIcon className="w-4 h-4 text-primary" />
                                    <h3 className="text-sm font-semibold">Thông tin bổ sung</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="biography"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2 space-y-2">
                                                <FormLabel>Giới thiệu ngắn gọn <span className="text-destructive">*</span></FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Mô tả về tầm nhìn, sứ mệnh hoặc các sự kiện bạn thường tổ chức..."
                                                        className="min-h-[120px] resize-none"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="contactAddress"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2 space-y-2">
                                                <FormLabel>Địa chỉ liên hệ <span className="text-destructive">*</span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Số 123, Đường ABC, TP.HCM" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="flex justify-end gap-3 bg-muted/20 border-t p-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate(-1)} 
                            >
                                Hủy bỏ
                            </Button>
                            <Button
                                type="submit"
                                className="rounded bg-brand hover:bg-brand-dark"
                                disabled={form.formState.isSubmitting}
                            >
                                {form.formState.isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Gửi yêu cầu đăng ký
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>


    );
};


export default CreateOrganizerRequestPage;