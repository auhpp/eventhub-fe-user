import React, { useEffect, useState } from 'react';
import {
    UploadCloud,
    Phone,
    Link as LinkIcon,
    CheckCircle2,
    Loader2,
    Save,
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
import { useNavigate, useParams } from 'react-router-dom';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, Form } from '@/components/ui/form';
import { createOrganizerRegistrationRequest, getOrganizerRegistrationById, updateOrganizerRegistrationRequest } from '@/services/organizerRegistrationService';
import { HttpStatusCode } from 'axios';
import { routes } from '@/config/routes';
import { toast } from 'sonner';
import ButtonBack from '@/components/ButtonBack';


const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const getSchema = (isEditMode) => {
    return z.object({
        businessName: z.string().min(1, { message: "Vui lòng nhập tên ban tổ chức" }),
        representativeFullName: z.string().min(1, { message: "Vui lòng nhập tên người đại diện" }),
        email: z.string().min(1, { message: "Vui lòng nhập email" }).email({ message: "Email không hợp lệ" }),
        phoneNumber: z.string().min(1, { message: "Vui lòng nhập số điện thoại" })
            .regex(/^(0)(3|5|7|8|9)[0-9]{8}$/, { message: "Số điện thoại không đúng định dạng (VN)" }),
        biography: z.string().min(1, { message: "Vui lòng nhập giới thiệu" }),
        contactAddress: z.string().min(1, { message: "Vui lòng nhập địa chỉ" }),
        businessAvatar: z.any()
            .refine((file) => {
                if (isEditMode && !file) return true; 
                return file instanceof File;
            }, { message: "Vui lòng chọn ảnh đại diện" })
            .refine((file) => {
                if (file instanceof File) return file.size <= MAX_FILE_SIZE;
                return true;
            }, { message: "Kích thước ảnh tối đa là 5MB" })
            .refine((file) => {
                if (file instanceof File) return ACCEPTED_IMAGE_TYPES.includes(file.type);
                return true;
            }, { message: "Chỉ hỗ trợ định dạng .jpg, .jpeg, .png và .webp" }),
    });
};

const CreateOrganizerRequestPage = () => {
    const navigate = useNavigate();
    const { id } = useParams(); 
    const isEditMode = !!id;
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(false);

    const form = useForm({
        resolver: zodResolver(getSchema(isEditMode)),
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
        if (file) {
            form.setValue("businessAvatar", file, { shouldValidate: true });
            setPreviewUrl(URL.createObjectURL(file));
        }
    };


    useEffect(() => {
        if (isEditMode) {
            const fetchData = async () => {
                setIsLoadingData(true);
                try {
                    const response = await getOrganizerRegistrationById({ id: id });
                    if (response.code === HttpStatusCode.Ok) {
                        const data = response.result;
                        // Fill data to form
                        form.reset({
                            businessName: data.businessName,
                            representativeFullName: data.representativeFullName,
                            email: data.email,
                            phoneNumber: data.phoneNumber,
                            biography: data.biography,
                            contactAddress: data.contactAddress,
                        });
                        // Set preview from URL server return
                        setPreviewUrl(data.businessAvatarUrl || data.businessAvatar);
                    }
                } catch (error) {
                    console.error("Failed to fetch data", error);
                    toast.error("Không thể tải thông tin yêu cầu.");
                    navigate(routes.organizerRegistration);
                } finally {
                    setIsLoadingData(false);
                }
            };
            fetchData();
        }
    }, [id, isEditMode, form, navigate]);

    const onSubmit = async (values) => {
        try {
            console.log(values)
            let response;
            if (!isEditMode) {
                response = await createOrganizerRegistrationRequest(values);
            }
            else {
                response = await updateOrganizerRegistrationRequest({ id: id, data: values });
            }
            if (response.code == HttpStatusCode.Ok) {
                toast.success(isEditMode ? "Cập nhật thành công!" : "Đăng ký thành công!");
                navigate(routes.organizerRegistration, { replace: true })
            }
        } catch (error) {
            console.log(error)
            toast.error("Có lỗi xảy ra, vui lòng thử lại.");
        }
    }
    if (isLoadingData) {
        return (
            <div className="flex justify-center items-center h-screen w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <ButtonBack />
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {isEditMode ? "Cập nhật hồ sơ Ban Tổ chức" : "Đăng ký Ban Tổ chức"}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {isEditMode
                            ? "Chỉnh sửa thông tin hồ sơ đối tác của bạn."
                            : "Hoàn tất hồ sơ để bắt đầu kiến tạo những sự kiện tuyệt vời trên nền tảng."}
                    </p>
                </div>
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
                                                <div className="relative group w-32 h-32
                                                 rounded-lg border-2 border-dashed border-muted-foreground/25
                                                 hover:border-primary/50 bg-muted/30 flex flex-col items-center 
                                                 justify-center cursor-pointer transition-colors overflow-hidden">
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
                                                        onChange={handleImageChange}
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
                                        {isEditMode ? <Save className="mr-2 h-4 w-4" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                        {isEditMode ? "Lưu thay đổi" : "Gửi yêu cầu đăng ký"}
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