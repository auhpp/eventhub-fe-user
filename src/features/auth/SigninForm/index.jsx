import React, { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HttpStatusCode } from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { routes } from "@/config/routes";
import { authenticate, getCurrentUserInfo } from "@/services/authenticationService";
import { AuthContext } from "@/context/AuthContex";

const signinFormSchema = z
    .object({
        email: z
            .string()
            .min(1, { message: "Vui lòng nhập email" })
            .email({ message: "Email không hợp lệ" }),
        password: z
            .string()
            .min(1, { message: "Vui lòng nhập mật khẩu" })
    })

export default function SigninForm() {
    const [searchParams] = useSearchParams();
    const [showPassword, setShowPassword] = useState(false);
    const togglePassword = () => setShowPassword(!showPassword);
    const navigate = useNavigate()
    const { setUser } = useContext(AuthContext)
    const urlEmail = searchParams.get("email");

    const form = useForm({
        resolver: zodResolver(signinFormSchema),
        defaultValues: {
            email: urlEmail || "",
            password: "",
        },
        mode: "onChange",
    })
    useEffect(() => {
        if (urlEmail) {
            form.setValue("email", urlEmail);
        }
    }, [urlEmail, form]);
    const onSubmit = async (values) => {
        console.log("Dữ liệu hợp lệ:", values);
        try {
            const data = await authenticate({ email: values.email, password: values.password })
            console.log("login response", data)
            if (data.code == HttpStatusCode.Ok) {

                const redirectUrl = searchParams.get("redirect");
                if (redirectUrl) {
                    navigate(redirectUrl, { replace: true });
                } else {
                    navigate(routes.home, { replace: true });
                }
                
                localStorage.setItem('access_token', data.result.accessToken);
                const userInfoResponse = await getCurrentUserInfo();
                if (userInfoResponse.code == HttpStatusCode.Ok) {
                    setUser(userInfoResponse.result)
                }

            }
        } catch (error) {
            console.log(error)
            if (!urlEmail) {
                form.setError("email", {
                    type: "manual",
                    message: "Email hoặc mật khẩu không chính xác",
                });
                form.setFocus("email");
                form.setValue("email", "");
            }
            form.setError("password", {
                type: "manual",
                message: "Email hoặc mật khẩu không chính xác",
            });

            form.setValue("password", "");
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                    * Email này được cố định theo lời mời.
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
                                <Link
                                    to={""}
                                    className="text-xs font-bold text-brand hover:text-brand-dark transition-colors"
                                >
                                    Quên mật khẩu?
                                </Link>
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
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Submit Button */}
                <Button
                    disabled={form.formState.isSubmitting}
                    className="w-full h-12 text-md font-bold rounded-xl bg-brand hover:bg-brand-dark shadow-lg shadow-brand/20"
                >
                    {form.formState.isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang xác thực...
                        </>
                    ) : (
                        "Đăng nhập"
                    )}
                </Button>

                {/* Divider */}
                <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase font-bold tracking-wider">
                        <span className="bg-white dark:bg-slate-900 px-4 text-gray-500">
                            Hoặc tiếp tục với
                        </span>
                    </div>
                </div>

                {/* Social Buttons */}
                <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-12 rounded-xl gap-2 font-semibold hover:bg-gray-50">
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path d="M24 12.2727C24 5.48864 18.6273 0 12 0 5.37273 0 0 5.48864 0 12.2727c0 5.925 4.19318 10.8886 9.73636 11.9659V15.75H7.15227v-3.4773h2.58409v-2.3113c0-3.3205 1.54773-4.8818 4.71818-4.8818 1.05682 0 2.23636.0955 2.50227.1296v2.85h-1.4659c-1.28864 0-1.74545.8386-1.74545 1.7454v2.4682h3.51136l-.55909 3.4773h-2.95227v8.4886C19.8068 23.1614 24 18.1977 24 12.2727Z" fill="#1877F2" />
                        </svg>
                        Facebook
                    </Button>
                    <Button variant="outline" className="h-12 rounded-xl gap-2 font-semibold hover:bg-gray-50">
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path d="M23.766 12.2764c0-.8829-.0782-1.7331-.2232-2.5609H12v4.8379h6.6052c-.2851 1.5404-1.1502 2.8453-2.4535 3.7179v3.0898h3.9733c2.3251-2.1387 3.665-5.2861 3.665-8.9189z" fill="#4285F4" />
                            <path d="M12 24.0008c3.3103 0 6.0886-1.096 8.1171-2.9695l-3.9733-3.0898c-1.0977.7346-2.5034 1.1689-4.1438 1.1689-3.1939 0-5.8993-2.1578-6.8643-5.0594H1.1436v3.1788C3.1794 21.237 7.2965 24.0008 12 24.0008z" fill="#34A853" />
                            <path d="M5.1357 14.051c-.2444-.7336-.3846-1.5222-.3846-2.3335 0-.8113.1402-1.5999.3846-2.3335V6.2052H1.1436C.4149 7.653 0 9.2773 0 10.984c0 1.7067.4149 3.331 1.1436 4.7788l3.9921-3.1788z" fill="#FBBC05" />
                            <path d="M12 4.7828c1.8003 0 3.4182.6186 4.6888 1.8335l3.516-3.516C17.9659.9838 15.188 0 12 0 7.2965 0 3.1794 2.7638 1.1436 6.8052l3.9921 3.1788c.965-2.9016 3.6704-5.0594 6.8643-5.0594z" fill="#EA4335" />
                        </svg>
                        Google
                    </Button>
                </div>
            </form>
        </Form>
    );
}