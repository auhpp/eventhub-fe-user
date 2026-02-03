import React, { useState, useEffect, useRef } from 'react';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Image as ImageIcon, UploadCloud, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ImageUploadField = ({
    form,
    name,
    label,
    ratio = 16 / 9,
    recommendSize,
    minWidth = 0,   
    minHeight = 0,
    acceptTypes = "image/jpeg,image/jpg,image/png,image/webp",
    isShowCloseButton = true
}) => {
    const [previewUrl, setPreviewUrl] = useState("");
    const fileInputRef = useRef(null);

    const fileValue = form.watch(name);

    useEffect(() => {
        if (fileValue instanceof File) {
            const url = URL.createObjectURL(fileValue);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else if (typeof fileValue === 'string') {
            setPreviewUrl(fileValue);
        } else {
            setPreviewUrl("");
        }
    }, [fileValue]);

    const validateImageDimensions = (file) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const isValid = img.width == minWidth && img.height == minHeight;
                URL.revokeObjectURL(img.src);
                resolve({ isValid, width: img.width, height: img.height });
            };
            img.onerror = () => {
                resolve({ isValid: false, width: 0, height: 0 });
            };
        });
    };

    const handleFileChange = async (e, onChange) => {
        const file = e.target.files[0];

        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Dung lượng ảnh không được vượt quá 5MB");
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }

            if (minWidth > 0 || minHeight > 0) {
                const { isValid, width, height } = await validateImageDimensions(file);

                if (!isValid) {
                    toast.error(`Kích thước ảnh không hợp lệ!`, {
                        description: `Ảnh của bạn: ${width}x${height}px. Yêu cầu: ${minWidth}x${minHeight}px.`
                    });

                    if (fileInputRef.current) fileInputRef.current.value = "";
                    return;
                }
            }

            onChange(file);
        }
    };

    const handleRemove = (e, onChange) => {
        e.preventDefault();
        e.stopPropagation();
        onChange(undefined);
        setPreviewUrl("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <FormField
            control={form.control}
            name={name}
            // eslint-disable-next-line no-unused-vars
            render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem className="w-full">
                    <div className="flex justify-between items-center mb-2">
                        {label && <span className="font-semibold text-sm">{label}
                            <span className="text-red-500"> *</span></span>}
                    </div>

                    <FormControl>
                        <div className="group relative w-full cursor-pointer"
                            onClick={() => !previewUrl && fileInputRef.current?.click()}>
                            <AspectRatio ratio={ratio} className=" bg-gray-100
                             rounded-md overflow-hidden border border-dashed border-gray-500 
                             flex flex-col items-center justify-center text-center hover:border-brand transition-colors">
                                {previewUrl ? (
                                    <>
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0
                                          opacity-0 group-hover:opacity-100 transition-opacity
                                           flex items-center justify-center gap-2">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    fileInputRef.current?.click();
                                                }}
                                            >
                                                <UploadCloud className="size-4 mr-1" /> Thay đổi
                                            </Button>
                                            {
                                                isShowCloseButton &&
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={(e) => handleRemove(e, onChange)}
                                                >
                                                    <X className="size-4" />
                                                </Button>
                                            }
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-3 p-4">
                                        <div className="p-3 rounded-full border-2 text-brand border-brand">
                                            <ImageIcon className="w-8 h-8" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-medium text-sm sm:text-base">
                                                {label || "Thêm ảnh"}
                                            </p>
                                            {recommendSize && (
                                                <p className="text-xs text-slate-700 font-mono">
                                                    ({recommendSize})
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </AspectRatio>

                            <input
                                {...fieldProps}
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept={acceptTypes}
                                onChange={(event) => handleFileChange(event, onChange)}
                            />
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};

export default ImageUploadField;