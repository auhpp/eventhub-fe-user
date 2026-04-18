import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Lock, X } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { getCategoris } from '@/services/categoryService';
import { HttpStatusCode } from 'axios';
import { EventType } from '@/utils/constant';
import { getAllEventSeries } from '@/services/eventSeriesService';
import { getAllTags } from '@/services/tagService';
import { Switch } from "@/components/ui/switch";
import 'react-quill-new/dist/quill.snow.css';
import RichTextEditor from './RichTextEditor';

const EventBasicInfo = ({ form, isEditing = false }) => {
    const [categories, setCategories] = useState(null);
    const [eventSeries, setEventSeries] = useState(null);
    const [availableTags, setAvailableTags] = useState([]);
    const [tagInputValue, setTagInputValue] = useState("");
    const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
    const wrapperRef = useRef(null);

    // Fetch categories
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoryRes, eventSeriesRes, tagRes] = await Promise.all([
                    getCategoris(),
                    getAllEventSeries(),
                    getAllTags()
                ]);

                if (categoryRes.code === HttpStatusCode.Ok) {
                    setCategories(categoryRes.result);
                }
                if (tagRes) setAvailableTags(tagRes.result || []);
                setEventSeries(eventSeriesRes.result || []);

            } catch (error) {
                console.log(error);
                setEventSeries([]);
            }
        }
        fetchData();
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsTagDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    if (!categories || eventSeries === null) {
        return (
            <div className="flex justify-center items-center h-40 w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const handleAddTag = (tagObj) => {
        const currentTags = form.getValues("tags") || [];
        if (!currentTags.find(t => t.name.toLowerCase() === tagObj.name.toLowerCase())) {
            form.setValue("tags", [...currentTags, tagObj], { shouldValidate: true });
        }
        setTagInputValue("");
        setIsTagDropdownOpen(false);
    };

    const handleRemoveTag = (tagNameToRemove) => {
        const currentTags = form.getValues("tags") || [];
        form.setValue("tags", currentTags.filter(t => t.name !== tagNameToRemove), { shouldValidate: true });
    };

    const handleTagInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = tagInputValue.trim();
            if (val) {
                const existingTag = availableTags.find(t => t.name.toLowerCase() === val.toLowerCase());
                if (existingTag) {
                    handleAddTag({ id: existingTag.id, name: existingTag.name });
                } else {
                    handleAddTag({ id: null, name: val });
                }
            }
        }
    };

    const filteredSuggestions = availableTags.filter(
        tag => tag.name.toLowerCase().includes(tagInputValue.toLowerCase()) &&
            !(form.getValues("tags") || []).some(t => t.name.toLowerCase() === tag.name.toLowerCase())
    );

    return (
        <Card className="rounded-2xl shadow-sm border-slate-200">
            <CardHeader className="border-b bg-slate-50/50 rounded-t-2xl pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <span className="size-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">2</span>
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
                                        <span className="text-xs text-muted-foreground flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full font-normal">
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
                                                    <img src={item.avatar} alt={item.name} className="size-6 rounded-full object-cover shadow-sm border" />
                                                ) : (
                                                    <div className="size-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 border">
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
                <FormField
                    control={form.control}
                    name="hasResalable"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-200 p-4 shadow-sm bg-white">
                            <div className="space-y-1">
                                <FormLabel className="text-base">
                                    Cho phép bán lại vé 
                                </FormLabel>
                                <div className="text-[13px] text-muted-foreground">
                                    Bật tùy chọn này nếu bạn cho phép người tham gia có thể bán lại vé của họ.
                                </div>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                {/* tags */}
                <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Thẻ sự kiện (Tags) <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <div className="space-y-3" ref={wrapperRef}>
                                    {field.value?.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {field.value.map((tag, index) => (
                                                <div key={index} className="flex items-center gap-1 bg-brand/10 text-brand px-3 py-1 rounded-full text-sm font-medium border border-brand/20">
                                                    <span>{tag.name}</span>
                                                    <button type="button" onClick={() => handleRemoveTag(tag.name)} className="hover:bg-brand/20 p-0.5 rounded-full transition-colors">
                                                        <X className="size-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="relative">
                                        <Input
                                            value={tagInputValue}
                                            onChange={(e) => {
                                                setTagInputValue(e.target.value);
                                                setIsTagDropdownOpen(true);
                                            }}
                                            onKeyDown={handleTagInputKeyDown}
                                            onFocus={() => setIsTagDropdownOpen(true)}
                                            placeholder="Nhập tên thẻ và ấn Enter..."
                                            className="h-11 rounded-xl"
                                        />
                                        {isTagDropdownOpen && tagInputValue && (
                                            <div className="absolute top-full left-0 w-full mt-1 bg-white border rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                                                {filteredSuggestions.length > 0 ? (
                                                    filteredSuggestions.map((tag) => (
                                                        <div key={tag.id} onClick={() => handleAddTag({ id: tag.id, name: tag.name })} className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm flex items-center justify-between">
                                                            <span>{tag.name}</span>
                                                            <span className="text-xs text-muted-foreground">{tag.type === 'TOPIC' ? 'Chủ đề' : 'Tùy chỉnh'}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div onClick={() => handleAddTag({ id: null, name: tagInputValue.trim() })} className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm text-brand flex items-center gap-2">
                                                        <span className="font-semibold text-muted-foreground">Tạo thẻ mới:</span> "{tagInputValue}"
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </FormControl>
                            <p className="text-[13px] text-muted-foreground">Nhập từ khóa và ấn Enter để tạo thẻ mới nếu không có trong gợi ý.</p>
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
                                <RichTextEditor
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Giới thiệu chi tiết về sự kiện của bạn..."
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    );
};

export default EventBasicInfo;