import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Video, Link as LinkIcon, Loader2, Navigation } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { getAddresses } from '@/services/mapService';
import { HttpStatusCode } from 'axios';
import Map from '@/components/Map';
import { MeetingPlatform } from '@/utils/constant';

const EventLocation = ({ form, onLocationSelect, onLocationChange }) => {
    const eventType = form.watch("type");
    const coordinates = form.watch("coordinates");

    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const currentPlatform = form.watch("meetingPlatform");
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

    // Debounce search
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

    const handleCreateGoogleMeet = () => {
        window.open('https://meet.google.com/new', '_blank');
    };

    const handleCreateZoom = () => {
        window.open('https://zoom.us/meeting/schedule', '_blank');
    };

    const detectPlatform = (url) => {
        if (!url) return null;
        const lowerUrl = url.toLowerCase();

        if (lowerUrl.includes('meet.google.com')) return MeetingPlatform.GOOGLE_MEET;
        if (lowerUrl.includes('zoom.us')) return MeetingPlatform.ZOOM;

        return null;
    };

    const handleMeetingUrlChange = (e, field) => {
        const value = e.target.value;
        field.onChange(value);

        const platform = detectPlatform(value);
        form.setValue('meetingPlatform', platform);
    };

    // Helper render badge platform
    const getPlatformBadge = () => {
        switch (currentPlatform) {
            case 'GOOGLE_MEET':
                return <span className="absolute right-3 top-3 text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1"><Video className="size-3" /> Google Meet</span>;
            case 'ZOOM':
                return <span className="absolute right-3 top-3 text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1"><Video className="size-3" /> Zoom</span>;
            default:
                return null;
        }
    };

    return (
        <Card className="rounded-2xl shadow-sm border-slate-200 h-fit transition-all duration-300 overflow-visible relative z-10">
            <CardHeader className="border-b bg-slate-50/50 rounded-t-2xl pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <span className="size-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">2</span>
                    {eventType === 'online' ? 'Thông tin phòng họp' : 'Địa điểm tổ chức'}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">

                {/* ------------------- OFFLINE ------------------- */}
                {eventType === 'OFFLINE' && (
                    <>
                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem ref={wrapperRef} className="relative z-50">
                                    <FormLabel>Địa chỉ chi tiết <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 text-muted-foreground size-5" />
                                            <Input
                                                {...field}
                                                onChange={handleLocationInputChange}
                                                className="pl-10 h-11 rounded-xl"
                                                placeholder="Nhập địa chỉ hoặc tên địa điểm..."
                                                autoComplete="off"
                                                onFocus={() => {
                                                    if (field.value && field.value.length > 1) setShowSuggestions(true);
                                                }}
                                                onBlur={(e) => {
                                                    field.onBlur(e);
                                                    // Delay little to click item before hidden
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

                                    {/* List Suggestion */}
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

                        {/* Map Placeholder  */}
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
                    </>
                )}

                {/* ------------------- ONLINE ------------------- */}
                {eventType === 'ONLINE' && (
                    <>
                        <div className="p-4 bg-blue-50 text-blue-700 rounded-xl text-sm mb-2 border border-blue-100">
                            Sự kiện Online sẽ được tổ chức qua các nền tảng trực tuyến (Zoom, Google Meet, Teams...).
                        </div>

                        <FormField
                            control={form.control}
                            name="meetingUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Đường dẫn cuộc họp (Meeting Link) <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <LinkIcon className="absolute left-3 top-3 text-muted-foreground size-5" />
                                            <Input
                                                {...field}
                                                className="pl-10 h-11 rounded-xl font-mono text-sm pr-32"
                                                placeholder="https://meet.google.com/..."
                                                onChange={(e) => handleMeetingUrlChange(e, field)}
                                            />
                                            {getPlatformBadge()}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="meetingPlatform"
                            render={({ field }) => (
                                <input type="hidden" {...field} />
                            )}
                        />

                        <div className="space-y-2 pt-2">
                            <Label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Tạo nhanh cuộc họp</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCreateGoogleMeet}
                                    className="h-10 border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                                >
                                    <Video className="size-4 mr-2" /> Google Meet
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCreateZoom}
                                    className="h-10 border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                                >
                                    <Video className="size-4 mr-2" /> Zoom Meeting
                                </Button>
                            </div>
                        </div>
                    </>
                )}

            </CardContent>
        </Card>
    );
};

export default EventLocation;