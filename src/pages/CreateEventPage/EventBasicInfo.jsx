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
import { getAllEventSeries } from '@/services/eventSeriesService';

const EventBasicInfo = ({ form, isEditing = false }) => {
    const [categories, setCategories] = useState(null);
    const [eventSeries, setEventSeries] = useState(null);
    // Fetch categories
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoryRes, eventSeriesRes] = await Promise.all([
                    getCategoris(),
                    getAllEventSeries()
                ]);

                if (categoryRes.code === HttpStatusCode.Ok) {
                    setCategories(categoryRes.result);
                }

                setEventSeries(eventSeriesRes.result || []);

            } catch (error) {
                console.log(error);
                setEventSeries([]); 
            }
        }
        fetchData();
    }, []);

    if (!categories || eventSeries === null) {
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
                                <FormLabel className="flex items-center min-h-[28px]">
                                    Danh mục <span className="text-red-500 ml-1">*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
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
                                <FormLabel className="flex items-center gap-2 min-h-[28px]">
                                    <span>Loại sự kiện <span className="text-red-500">*</span></span>
                                    {isEditing && (
                                        <span className="text-xs text-muted-foreground flex items-center gap-1 
                                        bg-slate-100 px-2 py-0.5 rounded-full font-normal">
                                            <Lock className="size-3" /> Không thể thay đổi
                                        </span>
                                    )}
                                </FormLabel>
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
                <FormField
                    control={form.control}
                    name="eventSeriesId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Chuỗi sự kiện <span className="text-muted-foreground font-normal text-xs ml-1">(Tùy chọn)</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                <FormControl>
                                    <SelectTrigger className="h-11 rounded-xl">
                                        <SelectValue placeholder="Chọn chuỗi sự kiện" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="none">
                                        <span className="text-muted-foreground italic">Không thuộc chuỗi nào</span>
                                    </SelectItem>

                                    {eventSeries.map((item) => (
                                        <SelectItem key={item.id} value={String(item.id)}>
                                            <div className="flex items-center gap-2">
                                                {item.avatar ? (
                                                    <img
                                                        src={item.avatar}
                                                        alt={item.name}
                                                        className="size-6 rounded-full object-cover shadow-sm border"
                                                    />
                                                ) : (
                                                    <div className="size-6 rounded-full bg-slate-200 flex items-center
                                                     justify-center text-[10px] font-bold text-slate-500 border">
                                                        {item.name.charAt(0)}
                                                    </div>
                                                )}
                                                <span className="font-medium text-sm">{item.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
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