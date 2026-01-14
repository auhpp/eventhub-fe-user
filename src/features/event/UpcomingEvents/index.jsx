import React from 'react';

const upcoming = [
    { id: 1, title: 'Giải chạy HCMC Marathon 2024', date: 'CHỦ NHẬT, 27 THÁNG 10 • 05:00', loc: 'Quận 7, TP. Hồ Chí Minh', participants: '1.2k', price: '350.000đ', img: 'https://images.unsplash.com/photo-1552674605-5d226a588736?auto=format&fit=crop&q=80&w=800' },
    { id: 2, title: 'Workshop: Kỹ năng đàm phán', date: 'THỨ HAI, 28 THÁNG 10 • 18:00', loc: 'Dreamplex, Hà Nội', participants: '45', price: '150.000đ', img: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800' },
];

const UpcomingEvents = () => {
    return (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Sắp diễn ra</h2>
                <p className="text-sm text-muted-foreground mt-1">Đừng bỏ lỡ các sự kiện trong 7 ngày tới</p>
            </div>

            <div className="space-y-4">
                {upcoming.map((item) => (
                    <div key={item.id} className="group flex flex-col gap-4 rounded-xl bg-card border p-3 shadow-sm transition-all hover:shadow-md sm:flex-row sm:items-center">
                        <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-lg sm:h-28 sm:w-48">
                            <img src={item.img} alt={item.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        </div>
                        <div className="flex flex-1 flex-col justify-between sm:flex-row sm:items-center">
                            <div className="flex flex-col gap-1 pr-4">
                                <div className="text-xs font-bold text-brand uppercase">{item.date}</div>
                                <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                                <div className="text-sm text-muted-foreground">{item.loc}</div>
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="flex -space-x-2">
                                        {/* Avatar placeholders */}
                                        {[1, 2, 3].map(i => <div key={i} className="h-6 w-6 rounded-full ring-2 ring-white bg-gray-300"></div>)}
                                    </div>
                                    <span className="text-xs font-medium text-muted-foreground">+{item.participants} người tham gia</span>
                                </div>
                            </div>
                            <div className="mt-4 flex shrink-0 items-center justify-between gap-4 sm:mt-0 sm:flex-col sm:items-end">
                                <span className="text-lg font-bold text-brand">{item.price}</span>
                                <button className="rounded-lg bg-secondary px-4 py-2 text-sm font-bold hover:bg-secondary/80 transition-colors">
                                    Đặt vé ngay
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 flex justify-center">
                <button className="flex items-center gap-2 rounded-lg border bg-transparent px-6 py-2.5 text-sm font-bold hover:bg-accent transition-colors">
                    Xem thêm sự kiện
                </button>
            </div>
        </section>
    );
};

export default UpcomingEvents;