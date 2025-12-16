
import React from 'react';

interface ProgressBarProps {
    progress: number; // 0 to 100
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
    const isComplete = progress >= 100;
    
    const progressBarClasses = [
        'h-4',
        'rounded-full',
        'transition-all',
        'duration-500',
        'ease-out',
        'relative', // For pseudo-element positioning
        'overflow-hidden', // To contain the shimmer
        isComplete ? 'bg-gold-light' : 'bg-gold',
        isComplete ? 'progress-bar-stripes animate-glow progress-bar-shimmer' : '',
    ].filter(Boolean).join(' ');

    return (
        <div className="w-full bg-maroon-darkest rounded-full h-4 shadow-inner overflow-hidden">
            <div
                className={progressBarClasses}
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
            ></div>
        </div>
    );
};

export default ProgressBar;
