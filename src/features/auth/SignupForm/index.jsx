import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff, Loader2, User, Phone } from "lucide-react";
import { RequirementItem } from "@/components/RequirementItem";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { sendOtpCreateUser } from "@/services/authenticationService";
import { HttpStatusCode } from "axios";
import { useSearchParams } from "react-router-dom";

const formSchema = z
    .object({
        fullName: z
            .string()
            .min(1, { message: "Vui lòng nhập họ và tên" })
            .max(50, { message: "Họ tên không được vượt quá 50 ký tự" }),
        phoneNumber: z
            .string()
            .min(1, { message: "Vui lòng nhập số điện thoại" })
            .regex(/(0[3|5|7|8|9])+([0-9]{8})\b/, { message: "Số điện thoại không hợp lệ (VD: 0912345678)" }),
        email: z
            .string()
            .min(1, { message: "Vui lòng nhập email" })
            .email({ message: "Email không hợp lệ" }),
        password: z
            .string()
            .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" })
            .regex(/[A-Z]/, { message: "Phải có ít nhất 1 chữ in hoa" })
            .regex(/[0-9]/, { message: "Phải có ít nhất 1 số" })
            .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "Phải có ký tự đặc biệt" }),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Mật khẩu xác nhận không khớp",
        path: ["confirmPassword"],
    });

export default function SignupForm({ showOtpForm }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const togglePassword = () => setShowPassword(!showPassword);
    const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);
    const [searchParams] = useSearchParams();
    const urlEmail = searchParams.get("email");

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "", 
            phoneNumber: "", 
            email: urlEmail || "",
            password: "",
            confirmPassword: "",
        },
        mode: "onChange",
    });

    useEffect(() => {
        if (urlEmail) {
            form.setValue("email", urlEmail);
        }
    }, [urlEmail, form]);

    const passwordValue = form.watch("password") || "";

    const passwordCriteria = {
        length: passwordValue.length >= 8,
        uppercase: /[A-Z]/.test(passwordValue),
        number: /[0-9]/.test(passwordValue),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(passwordValue),
    };

    const onSubmit = async (values) => {
        console.log("Dữ liệu hợp lệ:", values);
        try {
            const result = await sendOtpCreateUser({
                email: values.email,
                password: values.password,
                fullName: values.fullName,
                phoneNumber: values.phoneNumber
            });
            console.log(result)

            if (result.code == HttpStatusCode.Ok) {
                showOtpForm(true, {
                    email: values.email,
                    password: values.password,
                    fullName: values.fullName,
                    phoneNumber: values.phoneNumber
                });
            }
        } catch (error) {
            console.log(error)
            form.setError("email", {
                type: "manual",
                message: "Email này đã tồn tại hoặc xảy ra lỗi hệ thống.",
            });
            form.setFocus("email");
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* Full Name Field */}
                <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <FormLabel className="font-semibold">Họ và tên</FormLabel>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    <User className="h-5 w-5" />
                                </div>
                                <FormControl>
                                    <Input
                                        id="fullName"
                                        placeholder="Nhập họ và tên của bạn"
                                        className="pl-10 h-12 rounded-xl bg-white dark:bg-slate-950 focus-visible:ring-brand"
                                        {...field}
                                    />
                                </FormControl>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Phone Number Field */}
                <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <FormLabel className="font-semibold">Số điện thoại</FormLabel>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    <Phone className="h-5 w-5" />
                                </div>
                                <FormControl>
                                    <Input
                                        id="phoneNumber"
                                        placeholder="Nhập số điện thoại"
                                        className="pl-10 h-12 rounded-xl bg-white dark:bg-slate-950 focus-visible:ring-brand"
                                        {...field}
                                    />
                                </FormControl>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Email Field */}
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <FormLabel className="font-semibold">Email</FormLabel>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <FormControl>
                                    <Input
                                        id="email"
                                        placeholder="nhapemail@example.com"
                                        className="pl-10 h-12 rounded-xl bg-white dark:bg-slate-950 focus-visible:ring-brand"
                                        {...field}
                                        disabled={!!urlEmail}
                                    />
                                </FormControl>
                            </div>
                            {urlEmail && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    * Bạn đang đăng ký tài khoản cho email được mời.
                                </p>
                            )}
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Password Field */}
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <div className="flex items-center justify-between">
                                <FormLabel className="font-semibold">Mật khẩu</FormLabel>
                            </div>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <FormControl>
                                    <Input
                                        id="password"
                                        placeholder="Nhập mật khẩu mới"
                                        type={showPassword ? "text" : "password"}
                                        className="pl-10 pr-10 h-12 rounded-xl bg-white dark:bg-slate-950 focus-visible:ring-brand"
                                        {...field}
                                        onChange={(e) => {
                                            field.onChange(e);
                                            if (form.getValues("confirmPassword")) {
                                                form.trigger("confirmPassword");
                                            }
                                        }}
                                    />
                                </FormControl>
                                <button
                                    type="button"
                                    onClick={togglePassword}
                                    className="absolute right-3 top-2.5 text-gray-500 hover:text-brand transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800 mt-3 space-y-3">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Yêu cầu độ mạnh mật khẩu:
                                </h4>
                                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                                    <RequirementItem
                                        met={passwordCriteria.length}
                                        text="Tối thiểu 8 ký tự"
                                    />
                                    <RequirementItem
                                        met={passwordCriteria.number}
                                        text="Ít nhất 1 số"
                                    />
                                    <RequirementItem
                                        met={passwordCriteria.uppercase}
                                        text="Ít nhất 1 chữ in hoa"
                                    />
                                    <RequirementItem
                                        met={passwordCriteria.special}
                                        text="Ký tự đặc biệt"
                                    />
                                </div>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Confirm Password Field */}
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <div className="flex items-center justify-between">
                                <FormLabel className="font-semibold">Xác nhận mật khẩu</FormLabel>
                            </div>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <FormControl>
                                    <Input
                                        id="confirmPassword"
                                        placeholder="Nhập lại mật khẩu"
                                        type={showConfirmPassword ? "text" : "password"}
                                        className="pl-10 pr-10 h-12 rounded-xl bg-white dark:bg-slate-950 focus-visible:ring-brand"
                                        {...field}
                                    />

                                </FormControl>
                                <button
                                    type="button"
                                    onClick={toggleConfirmPassword}
                                    className="absolute right-3 top-2.5 text-gray-500 hover:text-brand transition-colors"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Submit Button */}
                <div className="w-full">
                    <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                        className="w-full h-12 text-md font-bold
                         rounded-xl bg-brand hover:bg-brand-dark shadow-lg shadow-blue-500/20 disabled:opacity-70"
                    >
                        {form.formState.isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang xác thực...
                            </>
                        ) : (
                            "Đăng ký"
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}