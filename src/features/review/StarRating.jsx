import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, setRating, readonly = false, size = "w-5 h-5" }) => {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-colors duration-200`}
                    onClick={() => !readonly && setRating(star)}
                    onMouseEnter={() => !readonly && setHover(star)}
                    onMouseLeave={() => !readonly && setHover(0)}
                >
                    <Star
                        className={`${size} ${star <= (hover || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-slate-100 text-slate-300'
                            }`}
                    />
                </button>
            ))}
        </div>
    );
};

export default StarRating;