import React, { useState, useRef, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const EventSeriesForm = ({
    initialData = null,
    onSubmit,
    isLoading = false,
    isUpdate = false
}) => {
    const coverInputRef = useRef(null);
    const avatarInputRef = useRef(null);

    // Form States
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('ACTIVE');
    const [hasPublic, setHasPublic] = useState('true');

    // States for File and Preview
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setName(initialData.name || '');
            setDescription(initialData.description || '');
            setStatus(initialData.status || 'ACTIVE');
            setHasPublic(initialData.hasPublic?.toString() || 'true');
            setAvatarPreview(initialData.avatar || null);
            setCoverPreview(initialData.coverImage || null);
        }
    }, [initialData]);

    const handleImageChange = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        const previewUrl = URL.createObjectURL(file);
        if (type === 'cover') {
            setCoverFile(file);
            setCoverPreview(previewUrl);
        } else {
            setAvatarFile(file);
            setAvatarPreview(previewUrl);
            if (errors.avatar) setErrors(prev => ({ ...prev, avatar: null }));
        }
    };

    // Validate Form
    const validateForm = () => {
        const newErrors = {};

        if (!isUpdate && !avatarFile) {
            newErrors.avatar = 'Vui lòng chọn ảnh đại diện cho sự kiện.';
        }

        if (!name.trim()) {
            newErrors.name = 'Tên chuỗi sự kiện không được để trống.';
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const formData = new FormData();
        formData.append('name', name);
        if (description) formData.append('description', description);

        if (avatarFile) formData.append('avatar', avatarFile);
        if (coverFile) formData.append('coverImage', coverFile);

        if (isUpdate) {
            formData.append('status', status);
            formData.append('hasPublic', hasPublic);
        }

        onSubmit(formData);
    };

    return (
        <div className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <form onSubmit={handleSubmit}>
                {/* 1.COVER IMAGE */}
                <div className="relative h-48 bg-gray-100 flex items-center justify-center group">
                    {coverPreview && (
                        <img
                            src={coverPreview}
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                    )}

                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => coverInputRef.current?.click()}
                        className="absolute top-4 right-4 bg-gray-200/80 hover:bg-gray-300 text-gray-700 
                        font-medium transition-colors"
                    >
                        Thay đổi ảnh bìa
                    </Button>
                    <input
                        type="file"
                        accept="image/*"
                        ref={coverInputRef}
                        onChange={(e) => handleImageChange(e, 'cover')}
                        className="hidden"
                    />
                </div>

                {/* 2. Basic info */}
                <div className="relative px-6 pt-14 pb-6">
                    {/* Avatar*/}
                    <div className="absolute -top-10 left-6 flex flex-col items-start">
                        <div
                            className={`relative w-20 h-20 bg-gradient-to-br from-indigo-100 to-green-100 
                                rounded-lg border-4 shadow-md flex items-center justify-center cursor-pointer
                                 overflow-hidden group transition-all
                                ${errors.avatar ? 'border-red-500' : 'border-white'}`}
                            onClick={() => avatarInputRef.current?.click()}
                        >
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="grid grid-cols-3 gap-1 p-2 opacity-50">
                                    {[...Array(8)].map((_, i) => (
                                        <div key={i} className="w-1.5 h-1.5 bg-gray-800 rounded-full"></div>
                                    ))}
                                </div>
                            )}

                            <div className="absolute -bottom-0 -right-0 bg-gray-900 text-white p-1.5 rounded-tl-lg
                             shadow border border-white">
                                <Upload size={12} />
                            </div>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            ref={avatarInputRef}
                            onChange={(e) => handleImageChange(e, 'avatar')}
                            className="hidden"
                        />
                    </div>

                    {errors.avatar && (
                        <p className="text-red-500 text-sm mt-12 mb-2 font-medium">{errors.avatar}</p>
                    )}

                    {/* Inputs */}
                    <div className={`space-y-4 ${!errors.avatar && 'mt-2'}`}>
                        <div>
                            <Input
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                                }}
                                placeholder="Tên lịch"
                                className={`w-full !text-3xl !h-auto font-semibold text-gray-800 
                                    border-0 border-b rounded-none focus-visible:ring-0 
                                    px-0 pb-2 pt-2 placeholder:text-gray-400 bg-transparent caret-gray-800 shadow-none
                                    ${errors.name ? 'border-red-500 focus-visible:border-red-500' :
                                        'border-gray-200 focus-visible:border-gray-500'}`}
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1 font-medium">{errors.name}</p>}
                        </div>

                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Thêm mô tả ngắn."
                            className="w-full text-base text-gray-600 border-0 focus-visible:ring-0 px-0 resize-none
                             placeholder:text-gray-400 bg-transparent caret-gray-800 shadow-none"
                            rows={4}
                        />
                    </div>

                    {/* fields for update */}
                    {isUpdate && (
                        <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-gray-500">Trạng thái</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                                        <SelectItem value="UPCOMING">Upcoming</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-gray-500">Quyền riêng tư</Label>
                                <Select value={hasPublic} onValueChange={setHasPublic}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Chọn quyền riêng tư" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Công khai (Public)</SelectItem>
                                        <SelectItem value="false">Riêng tư (Private)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {/* Submit Action */}
                    <div className="mt-6 flex justify-end gap-3">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-primary hover:bg-primary/90 text-white px-6 font-medium"
                        >
                            {isLoading ? 'Đang xử lý...' : (isUpdate ? 'Cập nhật lịch' : 'Tạo lịch mới')}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EventSeriesForm;