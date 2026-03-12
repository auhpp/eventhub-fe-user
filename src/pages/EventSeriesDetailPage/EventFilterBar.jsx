import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'; 
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import DatePicker from '@/components/DatePicker';

const EventFilterBar = ({ filters, setFilters }) => {
    const [searchParams, setSearchParams] = useSearchParams(); 

    const [localSearchName, setLocalSearchName] = useState(filters.name || '');

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocalSearchName(filters.name || '');
    }, [filters.name]);

    const handleCustomDateChange = (field, val) => {
        setFilters(prev => ({ ...prev, [field]: val, page: 1 }));
    };

    const handleStatusChange = (status) => {
        setFilters(prev => ({ ...prev, eventSearchStatus: status, page: 1 }));

        searchParams.set('status', status);
        searchParams.set('page', '1');
        setSearchParams(searchParams);
    };

    const handleSearchInputChange = (e) => {
        setLocalSearchName(e.target.value);
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setFilters(prev => ({ ...prev, name: localSearchName, page: 1 }));
        }
    };

    return (
        <div className="flex flex-col space-y-4">
            {/* Header / Tabs */}
            <div className="flex items-center justify-between ">
                <h2 className="text-xl font-semibold">Sự kiện</h2>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-center lg:items-center bg-slate-50 p-4 
            rounded-lg">

                {/* Tabs */}
                <div className="flex bg-white rounded-md p-1 border shadow-sm">
                    <button
                        onClick={() => handleStatusChange('COMING')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-sm ${filters.eventSearchStatus === 'COMING' ?
                             'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        Sắp tới
                    </button>
                    <button
                        onClick={() => handleStatusChange('PAST')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-sm ${filters.eventSearchStatus === 'PAST' ? 
                            'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        Đã qua
                    </button>
                </div>

                {/* Date Filters & Search */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <DatePicker
                        label="Từ ngày"
                        value={filters.fromDate}
                        onChange={(val) => handleCustomDateChange('fromDate', val)}
                    />
                    <DatePicker
                        label="Đến ngày"
                        value={filters.toDate}
                        onChange={(val) => handleCustomDateChange('toDate', val)}
                    />
                    <div className="relative w-full sm:w-64 mt-6 bg-white">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 " />
                        <Input
                            placeholder="Tìm kiếm sự kiện..."
                            className="pl-9"
                            value={localSearchName}
                            onChange={handleSearchInputChange}
                            onKeyDown={handleSearchKeyDown}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventFilterBar;