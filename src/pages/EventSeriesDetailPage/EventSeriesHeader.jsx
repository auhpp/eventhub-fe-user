import React from 'react';
import { Button } from '@/components/ui/button'; 
import { Loader2 } from 'lucide-react';

const EventSeriesHeader = ({ series, isFollowing, onToggleFollow, isLoadingFollow }) => {
    return (
        <div className="w-full bg-white border-b mt-6">
            {/* Cover Image */}
            <div className="w-full h-[250px] md:h-[320px] bg-slate-100 relative">
                <img
                    src={series.coverImage || '/placeholder-cover.jpg'}
                    alt="Cover"
                    className="w-full h-full object-cover rounded-xl"
                />
            </div>

            {/* Info Section */}
            <div className="px-4 md:px-8 relative max-w-7xl mx-auto pb-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-16 md:-mt-20">

                    {/* Avatar & Title */}
                    <div className="flex flex-col items-start z-10">
                        <div className="p-1.5 bg-white rounded-2xl shadow-sm">
                            <img
                                src={series.avatar || '/placeholder-avatar.png'}
                                alt={series.name}
                                className="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover bg-blue-500"
                            />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 mt-4">
                            {series.name}
                        </h1>
                    </div>

                    {/* Follow Button */}
                    <div className="z-10 pb-2">
                        <Button
                            variant={isFollowing ? "outline" : "default"}
                            onClick={onToggleFollow}
                            className={isFollowing ? "text-blue-600 border-blue-600" : "bg-blue-600 text-white"}
                            disabled={isLoadingFollow}
                        >
                            {isLoadingFollow ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (isFollowing ? 'Đã theo dõi' : 'Theo dõi')}
                        </Button>
                    </div>
                </div>

                {/* Description & Socials */}
                <div className="mt-4 text-slate-600">

                    <p className="mb-4">{series.description}</p>


                </div>
            </div>
        </div>
    );
};

export default EventSeriesHeader;