import React from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Loader2, ArrowLeft, KeyRound } from "lucide-react";
import { HttpStatusCode } from "axios";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { routes } from "@/config/routes";

import { sendEmailResetPassword } from "@/services/userService";


const emailSchema = z.object({
    email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
});

const EmailStep = ({ onSuccess }) => {
    const form = useForm({
        resolver: zodResolver(emailSchema),
        defaultValues: { email: "" },
    });

    const onSubmit = async (values) => {
        try {
            const result = await sendEmailResetPassword({ email: values.email });
            if (result.code === HttpStatusCode.Ok || result.status === 200) {
                toast.success("Mã OTP đã được gửi đến email của bạn!");
                onSuccess(values.email);
            }
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            form.setError("email", { type: "manual", message: "Email không tồn tại trong hệ thống." });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex flex-col items-center w-full">
                <div className="text-center mb-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">Quên mật khẩu?</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Vui lòng nhập email bạn đã đăng ký để nhận mã khôi phục.</p>
                </div>

                <div className="w-full px-4 sm:px-8 space-y-6 border rounded-xl bg-white py-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-semibold">Email</FormLabel>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <FormControl>
                                        <Input placeholder="nhapemail@example.com" className="pl-10 h-12 rounded-xl" {...field} />
                                    </FormControl>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" disabled={form.formState.isSubmitting} className="w-full h-12 rounded-xl bg-brand hover:bg-brand-dark">
                        {form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang gửi...</> : "Gửi mã xác nhận"}
                    </Button>

                    <div className="text-center mt-4">
                        <Link to={routes.signin} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
                        </Link>
                    </div>
                </div>
            </form>
        </Form>
    );
};

export default EmailStep