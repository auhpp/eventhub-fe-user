import React from 'react';
import { MapPin, ArrowRight } from 'lucide-react';

const events = [
    { id: 1, title: 'Vietnam Tech Summit 2024', type: 'Hội thảo', date: '24 OCT', price: '500.000đ', loc: 'Hà Nội', img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800' },
    { id: 2, title: 'Music Festival Hanoi', type: 'Âm nhạc', date: '02 NOV', price: '1.200.000đ', loc: 'Hà Nội', img: 'https://images.unsplash.com/photo-1459749411177-0473ef71607b?auto=format&fit=crop&q=80&w=800' },
    { id: 3, title: 'Triển lãm: Sắc màu', type: 'Nghệ thuật', date: '15 NOV', price: 'Miễn phí', loc: 'TP. HCM', img: 'https://images.unsplash.com/photo-1518998053901-5348d3969161?auto=format&fit=crop&q=80&w=800', isFree: true },
    { id: 4, title: 'Startup Weekend 2024', type: 'Khởi nghiệp', date: '20 NOV', price: '250.000đ', loc: 'Đà Nẵng', img: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800' },
];

const FeaturedEvents = () => {
    return (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Sự kiện nổi bật</h2>
                <a href="#" className="flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-dark">
                    Xem tất cả <ArrowRight className="h-4 w-4" />
                </a>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {events.map((evt) => (
                    <div key={evt.id} className="group relative flex flex-col overflow-hidden rounded-xl bg-card border shadow-sm transition-all hover:shadow-md">
                        <div className="aspect-[3/2] w-full overflow-hidden bg-muted">
                            <img src={evt.img} alt={evt.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                            <div className="absolute right-3 top-3 rounded-md bg-white/90 px-2 py-1 text-xs font-bold text-foreground backdrop-blur-sm shadow-sm">
                                {evt.date}
                            </div>
                        </div>
                        <div className="flex flex-1 flex-col p-4">
                            <div className="mb-2 text-xs font-medium text-brand">{evt.type}</div>
                            <h3 className="mb-2 text-lg font-bold leading-tight group-hover:text-brand transition-colors">{evt.title}</h3>
                            <div className="mt-auto flex items-center justify-between">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3" /> {evt.loc}
                                </div>
                                <span className={`font-bold ${evt.isFree ? 'text-green-600' : 'text-brand'}`}>{evt.price}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FeaturedEvents;