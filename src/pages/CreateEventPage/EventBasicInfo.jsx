import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Lock } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { getCategoris } from '@/services/categoryService';
import { HttpStatusCode } from 'axios';
import { EventType } from '@/utils/constant';

const EventBasicInfo = ({ form, isEditing = false }) => {
    const [categories, setCategories] = useState(null);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getCategoris();
                if (response.code === HttpStatusCode.Ok) {
                    setCategories(response.result);
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchCategories();
    }, []);

    if (!categories) {
        return (
            <div className="flex justify-center items-center h-40 w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <Card className="rounded-2xl shadow-sm border-slate-200">
            <CardHeader className="border-b bg-slate-50/50 rounded-t-2xl pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <span className="size-7 rounded-lg bg-blue-600 text-white flex
                     items-center justify-center text-sm font-bold shadow-sm">2</span>
                    Thông tin cơ bản
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
                {/* name*/}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel htmlFor="name">Tên sự kiện <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <Input {...field} id="name" placeholder="Tên sự kiện..." className="h-11 rounded-xl" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-5">
                    {/* category */}
                    <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Danh mục <span className="text-red-500">*</span></FormLabel>
                                <Select onValueChange={field.onChange}
                                    defaultValue={field.value} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="h-11 rounded-xl">
                                            <SelectValue placeholder="Chọn danh mục" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categories.map(item => (
                                            <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* type */}
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center gap-2">
                                    <FormLabel>Loại sự kiện <span className="text-red-500">*</span></FormLabel>
                                    {isEditing && (
                                        <span className="text-xs text-muted-foreground flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full">
                                            <Lock className="size-3" /> Không thể thay đổi
                                        </span>
                                    )}
                                </div>
                                <Select
                                    disabled={isEditing}
                                    onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="h-11 rounded-xl">
                                            <SelectValue placeholder="Chọn loại sự kiện" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value={EventType.OFFLINE.key}>{EventType.OFFLINE.name}</SelectItem>
                                        <SelectItem value={EventType.ONLINE.key}>{EventType.ONLINE.name}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* description */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mô tả sự kiện <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    placeholder="Giới thiệu chi tiết về sự kiện của bạn..."
                                    className="min-h-[140px] rounded-xl resize-none leading-relaxed"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card >
    );
};

export default EventBasicInfo;