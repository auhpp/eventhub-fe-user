import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Loader2, UploadCloud } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { getCategoris } from '@/services/categoryService';
import { HttpStatusCode } from 'axios';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { EventType } from '@/utils/constant';

const EventBasicInfo = ({ form }) => {
    const [categories, setCategories] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const fileInputRef = useRef(null);

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

    const handleFileChange = (e, fieldChange) => {
        const file = e.target.files[0];
        if (file) {
            fieldChange(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

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
                    <span className="size-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">1</span>
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
                                <Select onValueChange={field.onChange} defaultValue={field.value}
                                    value={field.value}
                                >
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
                                <FormLabel>Loại sự kiện <span className="text-red-500">*</span></FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                {/* thumbnail */}
                <FormField
                    control={form.control}
                    name="thumbnail"
                    // eslint-disable-next-line no-unused-vars
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                        <FormItem>
                            <FormLabel>Ảnh bìa <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <div className="">
                                    <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg">
                                        <div className="relative h-full w-full rounded-xl overflow-hidden group border bg-slate-100">
                                            {previewUrl && (
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
                                            )}

                                            <div className="absolute inset-0 bg-black/40
                                         opacity-0 group-hover:opacity-100 transition-all 
                                         flex items-center justify-center backdrop-blur-[2px]">
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    className="gap-2 font-bold shadow-lg"
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    <ImageIcon className="size-4" /> Tải ảnh lên
                                                </Button>
                                            </div>
                                        </div>
                                    </AspectRatio>

                                    <Input
                                        {...fieldProps}
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        onChange={(event) => handleFileChange(event, onChange)}
                                    />
                                </div>
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