import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2, Navigation, MapPinned, Info } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { getAddresses } from '@/services/mapService';
import { HttpStatusCode } from 'axios';
import Map from '@/components/Map';

const EventLocation = ({ form, onLocationSelect, onLocationChange }) => {
    const eventType = form.watch("type");
    const coordinates = form.watch("coordinates");

    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const wrapperRef = useRef(null);


    const handleLocationInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        onLocationChange(value);

        if (value.length <= 1) {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const selectAddress = (item) => {
        let coords = null;
        if (item.point) {
            coords = {
                lat: item.point.latitude,
                lng: item.point.longitude
            };
        }
        onLocationSelect(item.name, coords);
        setShowSuggestions(false);
    };

    // Debounce search logic
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        if (searchTerm.length <= 1) return;
        const delayDebounceFn = setTimeout(async () => {
            setIsLoadingAddress(true);
            try {
                const response = await getAddresses({ query: searchTerm });
                if (response.code === HttpStatusCode.Ok) {
                    setSuggestions(response.result);
                    setShowSuggestions(true);
                }
            } catch (error) {
                console.error("Lỗi tìm kiếm địa chỉ:", error);
            } finally {
                setIsLoadingAddress(false);
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);
    if (eventType === 'ONLINE') {
        return (
            <Card className="rounded-2xl shadow-sm border-slate-200 bg-blue-50/50 border-blue-100">
                <CardContent className="pt-6 pb-6 flex items-center gap-4 text-blue-700">
                    <div className="p-2 bg-blue-100 rounded-full">
                        <Info className="size-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-base">Sự kiện Online</h3>
                        <p className="text-sm text-blue-600/80">
                            Vui lòng nhập đường dẫn cuộc họp (Meeting URL) chi tiết trong phần <b> Quản lý Khung giờ</b> bên dưới.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="rounded-2xl shadow-sm border-slate-200 h-fit transition-all duration-300 overflow-visible relative z-10">
            <CardHeader className="border-b bg-slate-50/50 rounded-t-2xl pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <span className="size-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">3</span>
                    Địa điểm tổ chức
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
                {/* address */}
                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel htmlFor="address">Tên địa điểm <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 text-muted-foreground size-5" />
                                    <Input {...field} id="address"
                                        placeholder="VD: Trung tâm hội nghị Quốc gia..." className="pl-10 h-11 rounded-xl" />
                                </div>
                            </FormControl>
                            <FormMessage className="text-red-500 text-sm mt-1" />
                        </FormItem>
                    )}
                />
                {/* Location */}
                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem ref={wrapperRef} className="relative z-50">
                            <FormLabel>Địa chỉ chi tiết <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <MapPinned className="absolute left-3 top-3 text-muted-foreground size-5" />
                                    <Input
                                        {...field}
                                        onChange={handleLocationInputChange}
                                        className="pl-10 h-11 rounded-xl"
                                        placeholder="Nhập địa chỉ để tìm kiếm..."
                                        autoComplete="off"
                                        onFocus={() => {
                                            if (field.value && field.value.length > 1) setShowSuggestions(true);
                                        }}
                                        onBlur={(e) => {
                                            field.onBlur(e);
                                            setTimeout(() => setShowSuggestions(false), 200);
                                        }}
                                    />
                                    {isLoadingAddress && (
                                        <div className="absolute right-3 top-3">
                                            <Loader2 className="size-5 animate-spin text-blue-500" />
                                        </div>
                                    )}
                                </div>
                            </FormControl>

                            {/* List Suggestion Logic*/}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                    <ul className="py-1">
                                        {suggestions.map((item) => (
                                            <li
                                                key={item.id}
                                                className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-start gap-3 transition-colors border-b border-slate-50 last:border-0"
                                                onClick={() => selectAddress(item)}
                                            >
                                                <div className="mt-1 bg-slate-100 p-1.5 rounded-full">
                                                    <Navigation className="size-3.5 text-slate-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">{item.name}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <FormMessage className="text-red-500 text-sm mt-1" />
                        </FormItem>
                    )}
                />

                {/* Map Placeholder */}
                <div className="h-60 xl:h-72 rounded-xl bg-slate-100 relative overflow-hidden group border shadow-inner">
                    {coordinates ? (
                        <Map
                            lat={coordinates.lat}
                            lng={coordinates.lng}
                            address={form.getValues("location")}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                            <MapPin className="size-10 opacity-20" />
                            <span className="text-sm font-medium">Bản đồ sẽ hiển thị sau khi chọn địa chỉ từ gợi ý</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default EventLocation;