import React from 'react';

import '../../assets/css/hero.css';
import CategorySection from '@/pages/HomePage/CategorySection';
import FeaturedEvents from '@/pages/HomePage/FeaturedEvents';
import UpcomingEvents from '@/features/event/UpcomingEvents';
import CTASection from '@/features/event/CTASection';
import bannerImage from '../../assets/images/banner.jpg';

const HomePage = () => {
    return (
        <>
            {/* Hero Section */}
            <div className="relative w-full bg-background">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="hero-background">
                        <img
                            src={bannerImage}
                            alt="Concert crowd"
                            className="hero-image"
                        />
                        <div className="hero-overlay"></div>
                        <div className="hero-content">
                            <h1 className="mb-4 max-w-3xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                                Khám phá sự kiện tuyệt vời <br className="hidden sm:block" /> đang diễn ra quanh bạn
                            </h1>
                            <p className="max-w-2xl text-lg text-gray-200">
                                Kết nối đam mê, trải nghiệm không giới hạn với hàng ngàn sự kiện âm nhạc, hội thảo, và nghệ thuật đang chờ đón.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <CategorySection />
            <FeaturedEvents />
            <UpcomingEvents />
            <CTASection />
        </>


    );
};

export default HomePage;