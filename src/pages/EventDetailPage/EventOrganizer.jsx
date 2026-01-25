import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';

const EventOrganizer = ({ organizer }) => {
    if (!organizer) return null;

    return (
        <div className="flex  items-center
         justify-between  bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <Avatar className="w-14 h-14 border-2 border-white shadow-sm">
                        <AvatarImage src={organizer.avatar} alt={organizer.fullName} />
                        <AvatarFallback>{organizer.fullName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-lg">{organizer.fullName}</h3>
                </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2 rounded-lg">
                <Plus className="w-4 h-4" /> Theo dõi
            </Button>
        </div>
    );
};

export default EventOrganizer;