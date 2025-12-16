import React from 'react';

const BassClefIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path 
            d="M40.1,29.5c0,8.5-6.9,15.4-15.4,15.4S9.3,38,9.3,29.5S16.2,14.1,24.7,14.1c5.8,0,10.8,2.9,13.4,7.4" 
            stroke="currentColor" 
            strokeWidth="8" 
            strokeLinecap="round"
        />
        <circle cx="48.5" cy="22.5" r="4.5" fill="currentColor" />
        <circle cx="48.5" cy="36.5" r="4.5" fill="currentColor" />
    </svg>
);

export default BassClefIcon;
