import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getCategoris } from '@/services/categoryService';
import { HttpStatusCode } from 'axios';
import { Avatar, AvatarImage } from '@/components/ui/avatar';

const CategorySection = () => {
    const [categories, setCategories] = useState(null)
    useEffect(
        () => {
            const fetchCategory = async () => {
                try {
                    const response = await getCategoris()
                    if (response.code == HttpStatusCode.Ok) {
                        setCategories(response.result)
                    }
                } catch (error) {
                    console.log(error)
                }
            }
            fetchCategory()
        }, []
    )
    if (!categories) {
        return (
            <div className="flex justify-center items-center h-screen w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }
    return (
        <section className="mx-auto max-w-7xl px-4 pb-8 pt-6 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-card shadow-sm border p-6 sm:p-8">
                {/* Header Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Theo dõi Danh mục Sự kiện</h2>
                        <p className="mt-1 text-sm text-muted-foreground">Chọn chủ đề bạn yêu thích để nhận thông báo ngay.</p>
                    </div>
                </div>

                {/* Grid Items */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {categories.map((cat) => (
                        <div
                            key={cat.id}
                            className={`group flex items-start gap-4 rounded-xl border p-4 
                                transition-all hover:bg-background hover:shadow-md cursor-pointer`}
                        >
                            <div className={`flex size-16 shrink-0 items-center justify-center rounded-lg`}>
                                <Avatar className="rounded-lg size-full">
                                    <AvatarImage
                                        src={cat.avatarUrl}
                                        alt={cat.name}
                                        className="object-cover" 
                                    />
                                </Avatar>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold">{cat.name}</h3>
                                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{cat.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategorySection;