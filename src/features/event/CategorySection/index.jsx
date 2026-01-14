import React from 'react';
import { Search, Filter, Music, Cpu, GraduationCap, Palette, Trophy, Utensils, Heart, Check, ChevronDown } from 'lucide-react';

const categories = [
    { id: 1, name: 'Âm nhạc', desc: 'Concert, Acoustic, EDM...', icon: Music, color: 'text-pink-600', bg: 'bg-pink-100', active: false },
    { id: 2, name: 'Công nghệ', desc: 'AI, Blockchain, Coding...', icon: Cpu, color: 'text-blue-600', bg: 'bg-blue-100', active: true },
    { id: 3, name: 'Hội thảo', desc: 'Kỹ năng mềm, phát triển...', icon: GraduationCap, color: 'text-orange-600', bg: 'bg-orange-100', active: false },
    { id: 4, name: 'Nghệ thuật', desc: 'Triển lãm, bảo tàng...', icon: Palette, color: 'text-purple-600', bg: 'bg-purple-100', active: false },
    { id: 5, name: 'Thể thao', desc: 'Bóng đá, chạy bộ...', icon: Trophy, color: 'text-green-600', bg: 'bg-green-100', active: false },
    { id: 6, name: 'Ẩm thực', desc: 'Lễ hội ẩm thực, workshop...', icon: Utensils, color: 'text-yellow-600', bg: 'bg-yellow-100', active: false },
];

const CategorySection = () => {
    return (
        <section className="mx-auto max-w-7xl px-4 pb-8 pt-6 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-card shadow-sm border p-6 sm:p-8">
                {/* Header Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Theo dõi Danh mục Sự kiện</h2>
                        <p className="mt-1 text-sm text-muted-foreground">Chọn chủ đề bạn yêu thích để nhận thông báo ngay.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative w-full sm:w-64">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <input type="text" className="block w-full rounded-lg border border-input bg-muted/50 py-2 pl-10 pr-4 text-sm focus:border-brand focus:ring-brand outline-none" placeholder="Tìm danh mục..." />
                        </div>
                        <button className="flex shrink-0 items-center justify-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-semibold hover:bg-accent transition-colors">
                            <Filter className="h-4 w-4" /> Lọc
                        </button>
                    </div>
                </div>

                {/* Grid Items */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {categories.map((cat) => (
                        <div
                            key={cat.id}
                            className={`group flex items-start gap-4 rounded-xl border p-4 transition-all hover:bg-background hover:shadow-md ${cat.active ? 'border-brand/20 bg-brand/5' : 'bg-muted/30 border-border'}`}
                        >
                            <div className={`flex size-12 shrink-0 items-center justify-center rounded-lg ${cat.bg} ${cat.color}`}>
                                <cat.icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold">{cat.name}</h3>
                                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{cat.desc}</p>
                            </div>
                            {cat.active ? (
                                <button className="flex shrink-0 items-center gap-1 rounded-full bg-brand px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-brand/90 transition-colors">
                                    <Check className="h-3 w-3" /> <span>Đã theo dõi</span>
                                </button>
                            ) : (
                                <button className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-pink-50 hover:text-pink-500 hover:border-pink-200 transition-colors">
                                    <Heart className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-center">
                    <button className="flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-dark transition-colors">
                        Xem tất cả danh mục <ChevronDown className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default CategorySection;