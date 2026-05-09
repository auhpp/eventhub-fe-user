import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Lock, Eye, EyeOff, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { changePassword } from "@/services/userService";
import { HttpStatusCode } from "axios";
import { AuthContext } from "@/context/AuthContex";

const changePasswordSchema = z
    .object({
        oldPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
        newPassword: z
            .string()
            .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" })
            .regex(/[A-Z]/, { message: "Phải có ít nhất 1 chữ in hoa" })
            .regex(/[0-9]/, { message: "Phải có ít nhất 1 số" })
            .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "Phải có ký tự đặc biệt" }),
        confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Mật khẩu xác nhận không khớp",
        path: ["confirmPassword"],
    });

const ChangePasswordPage = () => {
    const [isLoading, setIsLoading] = useState(false);

    // State to toggle hidden/display password
    const [showOldPass, setShowOldPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    const { user } = useContext(AuthContext);
    const currentUserId = user?.id;

    const form = useForm({
        resolver: zodResolver(changePasswordSchema),
        mode: "onChange",
        defaultValues: {
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const newPasswordValue = form.watch("newPassword");
    useEffect(() => {
        const confirmValue = form.getValues("confirmPassword");
        if (confirmValue) {
            form.trigger("confirmPassword");
        }
    }, [newPasswordValue, form.trigger]);

    const onSubmit = async (values) => {
        setIsLoading(true);
        try {
            const response = await changePassword({
                id: currentUserId,
                oldPassword: values.oldPassword,
                newPassword: values.newPassword,
            });

            if (response.code === HttpStatusCode.Ok) {
                toast.success("Đổi mật khẩu thành công!", {
                    description: "Mật khẩu của bạn đã được cập nhật.",
                });
                form.reset();
            }
        } catch (error) {
            console.error(error);
            const errorData = error.response?.data;
            const errorCode = errorData?.code;

            if (errorCode === 1027) {
                form.setError("oldPassword", {
                    type: "manual",
                    message: "Mật khẩu hiện tại không chính xác",
                });

                form.setFocus("oldPassword");
                form.setValue("oldPassword", "")
            } else {
                const errorMessage = errorData?.message || "Đổi mật khẩu thất bại. Vui lòng thử lại.";
                toast.error("Lỗi", {
                    description: errorMessage,
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const primaryRingClass = "focus-visible:ring-brand";

    return (
        <Card className="w-full shadow-sm">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    Đổi mật khẩu
                </CardTitle>
                <CardDescription>
                    Để bảo mật tài khoản, vui lòng sử dụng mật khẩu mạnh (chữ hoa, số, ký tự đặc biệt).
                </CardDescription>
            </CardHeader>

            <CardContent className='flex justify-center' >
                <Form {...form} >
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-lg w-full"
                    >
                        {/* old password */}
                        <FormField
                            control={form.control}
                            name="oldPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mật khẩu hiện tại</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                            <Input
                                                type={showOldPass ? "text" : "password"}
                                                placeholder="Nhập mật khẩu cũ"
                                                className={`pl-9 pr-10 ${primaryRingClass}`}
                                                {...field}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowOldPass(!showOldPass)}
                                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                            >
                                                {showOldPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* new password */}
                        <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mật khẩu mới</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                            <Input
                                                type={showNewPass ? "text" : "password"}
                                                placeholder="Nhập mật khẩu mới"
                                                className={`pl-9 pr-10 ${primaryRingClass}`}
                                                {...field}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPass(!showNewPass)}
                                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                            >
                                                {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* confirm password */}
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                            <Input
                                                type={showConfirmPass ? "text" : "password"}
                                                placeholder="Nhập lại mật khẩu mới"
                                                className={`pl-9 pr-10 ${primaryRingClass}`}
                                                {...field}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPass(!showConfirmPass)}
                                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                            >
                                                {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Submit Button */}
                        <div className="flex justify-end pt-2">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="bg-brand hover:bg-[#0f4bc4] min-w-[140px]"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    "Đổi mật khẩu"
                                )}
                            </Button>
                        </div>

                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default ChangePasswordPage;