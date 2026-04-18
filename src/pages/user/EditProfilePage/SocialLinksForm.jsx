import React, { useState, useEffect, useContext } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Facebook, Youtube, Twitter, Instagram, Save, Loader2 } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AuthContext } from "@/context/AuthContex";
import { createSocialLink, updateSocialLink } from "@/services/userService";

const socialSchema = z.object({
    FACEBOOK: z.string().url("Đường dẫn không hợp lệ").or(z.literal("")),
    YOUTUBE: z.string().url("Đường dẫn không hợp lệ").or(z.literal("")),
    TWITTER: z.string().url("Đường dẫn không hợp lệ").or(z.literal("")),
    INSTAGRAM: z.string().url("Đường dẫn không hợp lệ").or(z.literal("")),
});

const SOCIAL_NETWORKS = [
    { type: "FACEBOOK", label: "Facebook", icon: <Facebook className="w-5 h-5 text-blue-600" /> },
    { type: "YOUTUBE", label: "YouTube", icon: <Youtube className="w-5 h-5 text-red-600" /> },
    { type: "TWITTER", label: "Twitter / X", icon: <Twitter className="w-5 h-5 text-blue-400" /> },
    { type: "INSTAGRAM", label: "Instagram", icon: <Instagram className="w-5 h-5 text-pink-600" /> },
];

const SocialLinksForm = () => {
    const { user } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);

    const [existingLinkIds, setExistingLinkIds] = useState({});

    const form = useForm({
        resolver: zodResolver(socialSchema),
        defaultValues: {
            FACEBOOK: "",
            YOUTUBE: "",
            TWITTER: "",
            INSTAGRAM: "",
        },
    });

    useEffect(() => {
        if (user && user.socialLinks) {
            const currentLinks = {
                FACEBOOK: "",
                YOUTUBE: "",
                TWITTER: "",
                INSTAGRAM: "",
            };
            const currentIds = {};

            user.socialLinks.forEach(link => {
                if (currentLinks[link.type] !== undefined) {
                    currentLinks[link.type] = link.urlLink;
                    currentIds[link.type] = link.id; 
                }
            });

            form.reset(currentLinks);
            setExistingLinkIds(currentIds);
        }
    }, [user, form]);

    const onSubmit = async (values) => {
        setIsLoading(true);
        try {
            const createPayload = [];
            const updatePayload = [];

            Object.entries(values).forEach(([type, urlLink]) => {
                const trimmedUrl = (urlLink || "").trim();
                const id = existingLinkIds[type]; 

                if (id) {
                    updatePayload.push({ id, type, urlLink: trimmedUrl });
                } else {
                    if (trimmedUrl !== "") {
                        createPayload.push({ type, urlLink: trimmedUrl });
                    }
                }
            });

            if (createPayload.length === 0 && updatePayload.length === 0) {
                toast.warning("Không có thay đổi nào để lưu.");
                setIsLoading(false);
                return;
            }

            const apiCalls = [];
            if (createPayload.length > 0) {
                apiCalls.push(createSocialLink(createPayload));
            }
            if (updatePayload.length > 0) {
                apiCalls.push(updateSocialLink(updatePayload));
            }

            await Promise.all(apiCalls);

            toast.success("Cập nhật liên kết mạng xã hội thành công!");


        } catch (error) {
            console.error(error);
            toast.error("Cập nhật liên kết mạng xã hội thất bại.");
        } finally {
            setIsLoading(false);
        }
    };

    const primaryColorClass = "bg-brand hover:bg-[#0f4BC4]";

    return (
        <Card className="w-full shadow-md mt-6">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">Mạng xã hội</CardTitle>
                <CardDescription>
                    Thêm hoặc xóa các liên kết đến hồ sơ mạng xã hội của bạn.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {SOCIAL_NETWORKS.map((network) => (
                                <FormField
                                    key={network.type}
                                    control={form.control}
                                    name={network.type}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                {network.icon}
                                                {network.label}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={`https://${network.label.toLowerCase().replace(' / x', '')}.com/your-profile`}
                                                    {...field}
                                                    value={field.value || ""}
                                                    className="focus-visible:ring-brand"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ))}
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isLoading} className={`w-full md:w-auto px-8 ${primaryColorClass}`}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Lưu mạng xã hội
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

export default SocialLinksForm;