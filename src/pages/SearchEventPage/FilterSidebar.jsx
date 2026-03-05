import React, { useState, useEffect } from 'react';
import { Filter, Loader2, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { getCategoris } from '@/services/categoryService';
import { HttpStatusCode } from 'axios';
import DatePicker from '@/components/DatePicker';

const FilterSidebar = ({ searchParams, setSearchParams }) => {
    const [localFilters, setLocalFilters] = useState({
        categoryId: [],
        time: '',
        type: '',
        priceFrom: '',
        priceTo: '',
        fromDate: '',
        toDate: ''
    });
    const [categories, setCategories] = useState(null);

    const [showAllCategories, setShowAllCategories] = useState(false);
    const VISIBLE_CATEGORIES_LIMIT = 5;

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const response = await getCategoris()
                if (response.code === HttpStatusCode.Ok) {
                    setCategories(response.result)
                }
            } catch (error) {
                console.log(error)
            }
        }
        fetchCategory()
    }, [])

    useEffect(() => {
        const urlCategoryIds = searchParams.get("categoryId");

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocalFilters({
            categoryId: urlCategoryIds ? urlCategoryIds.split(',') : [],
            time: searchParams.get("time") || '',
            type: searchParams.get("type") || '',
            priceFrom: searchParams.get("priceFrom") || '',
            priceTo: searchParams.get("priceTo") || '',
            fromDate: searchParams.get("fromDate") || '',
            toDate: searchParams.get("toDate") || ''
        });
    }, [searchParams]);

    const handleApplyFilter = (e) => {
        e.preventDefault();
        const currentName = searchParams.get("name");
        const newParams = { page: "1" };
        if (currentName) newParams.name = currentName;

        Object.keys(localFilters).forEach(key => {
            if (key === 'categoryId') {
                if (localFilters.categoryId.length > 0) {
                    newParams.categoryId = localFilters.categoryId.join(',');
                }
            } else if (localFilters[key]) {
                newParams[key] = localFilters[key];
            }
        });

        setSearchParams(newParams);
    };

    const handleClearFilter = () => {
        const currentName = searchParams.get("name");
        setSearchParams(currentName ? { name: currentName } : {});
        setLocalFilters({
            categoryId: [],
            time: '',
            type: '',
            priceFrom: '',
            priceTo: '',
            fromDate: '',
            toDate: ''
        });
    };

    const handleQuickTimeClick = (selectedTime) => {
        if (localFilters.time === selectedTime) {
            setLocalFilters({ ...localFilters, time: '' });
        } else {
            setLocalFilters({ ...localFilters, time: selectedTime, fromDate: '', toDate: '' });
        }
    };

    const handleCustomDateChange = (field, value) => {
        setLocalFilters({ ...localFilters, [field]: value, time: '' });
    };

    const handleCategoryToggle = (id) => {
        const stringId = String(id);
        setLocalFilters(prev => {
            const isSelected = prev.categoryId.includes(stringId);
            if (isSelected) {
                return { ...prev, categoryId: prev.categoryId.filter(catId => catId !== stringId) };
            } else {
                return { ...prev, categoryId: [...prev.categoryId, stringId] };
            }
        });
    };

    if (!categories) {
        return (
            <div className="flex justify-center items-center h-screen w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const displayedCategories = showAllCategories
        ? categories
        : categories.slice(0, VISIBLE_CATEGORIES_LIMIT);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sticky top-24">
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <Filter className="w-5 h-5 text-brand" /> Bộ lọc
                </h2>
                <button
                    type="button"
                    onClick={handleClearFilter}
                    className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
                >
                    <RotateCcw className="w-3.5 h-3.5" /> Làm mới
                </button>
            </div>

            <form onSubmit={handleApplyFilter} className="space-y-6">

                {/* 1. Type */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Hình thức</h3>
                    <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setLocalFilters({ ...localFilters, type: 'OFFLINE' })}
                            className={`py-1.5 text-sm font-medium rounded-md transition-all ${localFilters.type === 'OFFLINE' ?
                                'bg-white shadow-sm text-brand' : 'text-gray-600'}`}
                        >
                            Offline
                        </button>
                        <button
                            type="button"
                            onClick={() => setLocalFilters({ ...localFilters, type: 'ONLINE' })}
                            className={`py-1.5 text-sm font-medium rounded-md transition-all ${localFilters.type === 'ONLINE'
                                ? 'bg-white shadow-sm text-brand' : 'text-gray-600'}`}
                        >
                            Online
                        </button>
                    </div>
                </div>

                {/* 2. Date  */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Thời gian</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                        <button
                            type="button"
                            onClick={() => handleQuickTimeClick('thisWeek')}
                            className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${localFilters.time
                                === 'thisWeek' ? 'border-brand bg-brand/10 text-brand font-medium' :
                                'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                            Tuần này
                        </button>
                        <button
                            type="button"
                            onClick={() => handleQuickTimeClick('thisMonth')}
                            className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${localFilters.time
                                === 'thisMonth' ? 'border-brand bg-brand/10 text-brand font-medium' :
                                'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                            Tháng này
                        </button>
                    </div>

                    <div className="space-y-3 p-3 bg-gray-50 border border-gray-100 rounded-lg">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Hoặc chọn tùy chỉnh</p>
                        <DatePicker
                            label="Từ thời điểm"
                            value={localFilters.fromDate}
                            onChange={(val) => handleCustomDateChange('fromDate', val)}
                        />
                        <DatePicker
                            label="Đến thời điểm"
                            value={localFilters.toDate}
                            onChange={(val) => handleCustomDateChange('toDate', val)}
                        />
                    </div>
                </div>

                {/* 3. Category */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Danh mục</h3>
                    <div className="space-y-2.5">
                        {displayedCategories.map((category) => (
                            <label key={category.id} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    value={category.id}
                                    checked={localFilters.categoryId.includes(String(category.id))}
                                    onChange={() => handleCategoryToggle(category.id)}
                                    className="w-4 h-4 rounded text-brand border-gray-300 focus:ring-brand"
                                />
                                <span className="text-sm text-gray-700 group-hover:text-brand transition-colors">
                                    {category.name}</span>
                            </label>
                        ))}
                    </div>

                    {/* Button see more */}
                    {categories.length > VISIBLE_CATEGORIES_LIMIT && (
                        <button
                            type="button"
                            onClick={() => setShowAllCategories(!showAllCategories)}
                            className="mt-3 flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 
                            transition-colors"
                        >
                            {showAllCategories ? (
                                <>Thu gọn <ChevronUp className="w-4 h-4" /></>
                            ) : (
                                <>Xem thêm ({categories.length - VISIBLE_CATEGORIES_LIMIT}) <ChevronDown className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* 4. ticket price */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Mức giá (VNĐ)</h3>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            placeholder="Từ"
                            value={localFilters.priceFrom}
                            onChange={(e) => setLocalFilters({ ...localFilters, priceFrom: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-brand
                             focus:ring-1 focus:ring-brand outline-none"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            type="number"
                            placeholder="Đến"
                            value={localFilters.priceTo}
                            onChange={(e) => setLocalFilters({ ...localFilters, priceTo: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-brand
                             focus:ring-1 focus:ring-brand outline-none"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full py-2.5 mt-4 bg-black text-white rounded-lg font-medium hover:bg-gray-800
                     transition-colors shadow-sm"
                >
                    Áp dụng bộ lọc
                </button>
            </form>
        </div>
    );
};

export default FilterSidebar;