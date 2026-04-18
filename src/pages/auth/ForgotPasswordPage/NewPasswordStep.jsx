import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { HttpStatusCode } from "axios";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { routes } from "@/config/routes";

import { resetPassword } from "@/services/userService";
import { RequirementItem } from "@/components/RequirementItem";


const passwordSchema = z.object({
    password: z.string().min(8, "Tối thiểu 8 ký tự").regex(/[A-Z]/, "Cần 1 chữ in hoa").regex(/[0-9]/, "Cần 1 số").regex(/[!@#$%^&*(),.?":{}|<>]/, "Cần 1 ký tự đặc biệt"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, { message: "Mật khẩu không khớp", path: ["confirmPassword"] });

const NewPasswordStep = ({ email, otpCode }) => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const form = useForm({
        resolver: zodResolver(passwordSchema),
        defaultValues: { password: "", confirmPassword: "" },
        mode: "onChange"
    });

    const passwordValue = form.watch("password") || "";
    const criteria = {
        length: passwordValue.length >= 8,
        uppercase: /[A-Z]/.test(passwordValue),
        number: /[0-9]/.test(passwordValue),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(passwordValue),
    };

    const onSubmit = async (values) => {
        try {
            const result = await resetPassword({ email, otpCode, newPassword: values.password });
            if (result.code === HttpStatusCode.Ok || result.status === 200) {
                toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
                navigate(routes.signin, { replace: true });
            }
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            toast.error("Đã xảy ra lỗi, vui lòng thử lại!");
        }
    };

    return (
        <div className="w-full">
            <div className="text-center mb-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Tạo mật khẩu mới</h1>
                <p className="text-slate-500 text-sm">Mật khẩu của bạn nên mạnh và dễ nhớ đối với bạn.</p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex flex-col items-center w-full
            border rounded-xl bg-white py-6
            ">
                    <div className="w-full px-4 sm:px-8 space-y-4">
                        <FormField
                            control={form.control} name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mật khẩu mới</FormLabel>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><Lock className="h-5 w-5" /></div>
                                        <FormControl>
                                            <Input type={showPassword ? "text" : "password"} className="pl-10 pr-10 h-12 rounded-xl" placeholder="Nhập mật khẩu mới" {...field} />
                                        </FormControl>
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-500">
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-900/50 space-y-2">
                            <h4 className="text-xs font-bold text-slate-500 uppercase">Yêu cầu bảo mật:</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <RequirementItem met={criteria.length} text="Tối thiểu 8 ký tự" />
                                <RequirementItem met={criteria.number} text="Ít nhất 1 số" />
                                <RequirementItem met={criteria.uppercase} text="Ít nhất 1 chữ in hoa" />
                                <RequirementItem met={criteria.special} text="Ký tự đặc biệt" />
                            </div>
                        </div>

                        <FormField
                            control={form.control} name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Xác nhận mật khẩu</FormLabel>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><Lock className="h-5 w-5" /></div>
                                        <FormControl>
                                            <Input type={showConfirm ? "text" : "password"} className="pl-10 pr-10 h-12 rounded-xl" placeholder="Nhập lại mật khẩu" {...field} />
                                        </FormControl>
                                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-2.5 text-gray-500">
                                            {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={form.formState.isSubmitting} className="w-full h-12 rounded-xl bg-brand mt-4">
                            {form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang cập nhật...</> : "Cập nhật mật khẩu"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default NewPasswordStep