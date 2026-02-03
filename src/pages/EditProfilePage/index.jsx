import React, { useState, useEffect, useContext } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Camera, Loader2, Save, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AuthContext } from "@/context/AuthContex";
import { updateInfoUser } from "@/services/userService";
import { HttpStatusCode } from "axios";
import { toast } from "sonner";
import BoringAvatar from "boring-avatars";


const profileSchema = z.object({
    fullName: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
    phoneNumber: z.string().regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, "Số điện thoại không hợp lệ").optional().or(z.literal("")),
    biography: z.string().max(500, "Tiểu sử không quá 500 ký tự").optional(),
    avatar: z.any().optional(),
});

const EditProfilePage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [previewAvatar, setPreviewAvatar] = useState(null);
    const { user } = useContext(AuthContext)

    const form = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            fullName: "",
            phoneNumber: "",
            biography: "",
            password: "",
            avatar: null,
        },
    });

    useEffect(() => {
        const fetchUserData = async () => {
            form.reset({
                fullName: user?.fullName ?? '',
                phoneNumber: user?.phoneNumber ?? '',
                biography: user?.biography ?? '',
                email: user?.email
            });
            setPreviewAvatar(user.avatar);
        };

        fetchUserData();
    }, [form, user]);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewAvatar(url);
            form.setValue("avatar", file);
        }
    };

    const onSubmit = async (values) => {
        setIsLoading(true);
        try {
            const formData = new FormData();

            formData.append("fullName", values.fullName);

            if (values.phoneNumber) {
                formData.append("phoneNumber", values.phoneNumber);
            }

            if (values.biography) {
                formData.append("biography", values.biography);
            }

            if (values.avatar instanceof File) {
                formData.append("avatar", values.avatar);
            }

            const response = await updateInfoUser({ id: user.id, formData: formData })

            if (response.code == HttpStatusCode.Ok) {
                toast.success("Cập nhật tài khoản thành công");
            }

        } catch (error) {
            console.error(error);
            toast.error("Cập nhật tài khoản thất bại");
        } finally {
            setIsLoading(false);
        }
    };

    const primaryColorClass = "bg-brand hover:bg-[#0f4BC4]";
    const primaryRingClass = "focus-visible:ring-brand";

    return (
        <Card className="w-full shadow-md ">
            <CardHeader>
                <CardTitle className=" text-2xl font-bold text-gray-900 ">Chỉnh sửa hồ sơ</CardTitle>
                <CardDescription>
                    Cập nhật thông tin cá nhân và ảnh đại diện của bạn.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* --- Avatar --- */}
                        <div className="flex flex-col items-center justify-center gap-4 mb-6">
                            <div className="relative group">
                                <Avatar className="w-32 h-32 border-4 border-white shadow-md cursor-pointer">
                                    <AvatarImage src={previewAvatar} alt={user.fullName} />
                                    <AvatarFallback className="bg-transparent p-0 overflow-hidden">
                                        <BoringAvatar
                                            size="100%"
                                            name={user.email}
                                            variant="marble"
                                        />
                                    </AvatarFallback>
                                </Avatar>
                                {/* Upload button */}
                                <label
                                    htmlFor="avatar-upload"
                                    className="absolute bottom-0 right-0
                                     bg-slate-900 text-white p-2 rounded-full
                                      cursor-pointer shadow-lg hover:bg-[#0f4BC4] transition-all duration-200"
                                >
                                    <Camera size={18} />
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarChange}
                                    />
                                </label>
                            </div>
                        </div>
                        {/* full name */}
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Họ và tên</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nhập họ tên của bạn" {...field} className={primaryRingClass} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Email*/}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                readOnly={true}
                                                value={field.email}
                                                {...field}
                                                className={primaryRingClass} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Phone number */}
                            <FormField
                                control={form.control}
                                name="phoneNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Số điện thoại</FormLabel>
                                        <FormControl>
                                            <Input placeholder="0912..." {...field} className={primaryRingClass} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* biography */}
                            <FormField
                                control={form.control}
                                name="biography"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Tiểu sử</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Giới thiệu đôi chút về bản thân..."
                                                className={`resize-none min-h-[100px] ${primaryRingClass}`}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* --- Button Submit --- */}
                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full md:w-auto px-8 ${primaryColorClass}`}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Lưu thay đổi
                                    </>
                                )}
                            </Button>
                        </div>

                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default EditProfilePage;