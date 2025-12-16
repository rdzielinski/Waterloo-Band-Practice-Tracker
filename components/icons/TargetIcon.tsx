
import React from 'react';

const TargetIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        {...props}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.82m5.84-2.56a12.025 12.025 0 0 1-5.84 7.38m0-12.22a12.025 12.025 0 0 0-5.84 7.38m5.84-7.38v-4.82m0 4.82a6 6 0 0 0 5.84-2.56m-5.84 2.56a12.023 12.023 0 0 0-5.84-2.56m0 0A12.025 12.025 0 0 1 9.75 2.25V7.07m0 0a6 6 0 0 0 5.84 2.56m-5.84-2.56a12.025 12.025 0 0 0-5.84 2.56" />
    </svg>
);

export default TargetIcon;
