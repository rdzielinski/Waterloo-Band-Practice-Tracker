
import React from 'react';

const FingerprintIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        {...props}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0 1 19.5 10.5c0 2.92-.556 5.709-1.588 8.26l-4.708-4.709a.75.75 0 0 0-1.061 1.06l4.709 4.709a7.5 7.5 0 0 1-12.26 0l4.708-4.709a.75.75 0 0 0-1.06-1.06l-4.709 4.709A7.5 7.5 0 0 1 7.864 4.243Z" />
    </svg>
);

export default FingerprintIcon;
