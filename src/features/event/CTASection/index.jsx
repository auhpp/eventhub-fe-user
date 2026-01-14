import React from 'react';

const CTASection = () => {
    return (
        <section className="relative mx-auto my-8 max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl bg-brand px-6 py-12 text-center shadow-lg sm:px-12 lg:px-16">
                <div className="relative z-10 flex flex-col items-center gap-6">
                    <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Bạn muốn tổ chức sự kiện?</h2>
                    <p className="max-w-xl text-lg text-blue-100">EventHub cung cấp đầy đủ công cụ để bạn quản lý, bán vé và quảng bá sự kiện đến hàng triệu người.</p>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <button className="rounded-lg bg-white px-8 py-3 text-sm font-bold text-brand shadow-sm hover:bg-gray-50 transition-colors">
                            Trở thành ban tổ chức
                        </button>
                        <button className="rounded-lg border border-white/30 bg-brand/20 px-8 py-3 text-sm font-bold text-white backdrop-blur-sm hover:bg-brand/30 transition-colors">
                            Tìm hiểu thêm
                        </button>
                    </div>
                </div>
                {/* Background decorative blobs */}
                <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
                <div className="absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
            </div>
        </section>
    );
};

export default CTASection;