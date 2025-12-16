import React from 'react';

const PrinterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6 18.25m10.56-4.421c.24.03.48.062.72.096m-.72-.096L18 18.25m-12 0h12m-12 0a2.25 2.25 0 0 1-2.25-2.25V6.75A2.25 2.25 0 0 1 6 4.5h12a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25-2.25m-12 0H3.75a2.25 2.25 0 0 0-2.25 2.25V21a2.25 2.25 0 0 0 2.25 2.25h16.5A2.25 2.25 0 0 0 22.5 21v-2.25a2.25 2.25 0 0 0-2.25-2.25H18m-12 0h12" />
    </svg>
);

export default PrinterIcon;
