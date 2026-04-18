const CircleProgress = ({ percentage }) => {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center w-24 h-24">
            <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="text-amber-500 transition-all duration-1000 ease-in-out"
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute flex items-center justify-center text-lg font-bold text-amber-600">
                {percentage}%
            </div>
        </div>
    );
};

export default CircleProgress