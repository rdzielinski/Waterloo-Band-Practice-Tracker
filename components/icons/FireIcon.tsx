import React from 'react';

const FireIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        {...props}
    >
        <path 
            fillRule="evenodd" 
            d="M12.963 2.286a.75.75 0 00-1.071 1.052A9.75 9.75 0 0110.5 18c0-5.39-.232-9.566-1.612-11.668a.75.75 0 00-1.15-.632A11.25 11.25 0 006 18c0 3.436 2.786 6.25 6.25 6.25 3.464 0 6.25-2.814 6.25-6.25 0-5.996-2.64-11.25-6.287-12.714z" 
            clipRule="evenodd" 
        />
    </svg>
);

export default FireIcon;
