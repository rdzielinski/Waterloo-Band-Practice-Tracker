import React from 'react';

const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        {...props}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.962a3.75 3.75 0 1 0-7.5 0 3.75 3.75 0 0 0 7.5 0ZM12 15.75a3.75 3.75 0 1 0-7.5 0 3.75 3.75 0 0 0 7.5 0Zm4.508 3.316a3 3 0 0 0-4.682-2.72m0 0a3.75 3.75 0 0 1-7.5 0c0-1.55.99-2.9 2.343-3.5" />
    </svg>
);

export default UsersIcon;
