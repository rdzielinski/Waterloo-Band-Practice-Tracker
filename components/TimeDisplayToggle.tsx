import React from 'react';
import { TimeDisplayUnit } from '../lib/timeUtils';

interface TimeDisplayToggleProps {
  unit: TimeDisplayUnit;
  setUnit: (unit: TimeDisplayUnit) => void;
  className?: string;
}

const TimeDisplayToggle: React.FC<TimeDisplayToggleProps> = ({ unit, setUnit, className = '' }) => {
  const baseClasses = 'px-3 py-1 text-xs font-bold rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold';
  const activeClasses = 'bg-gold text-maroon-darkest';
  const inactiveClasses = 'bg-maroon-dark hover:bg-maroon text-gray-300';
  
  return (
    <div className={`flex items-center space-x-1 bg-maroon-darkest p-1 rounded-lg ${className}`}>
      <button
        onClick={() => setUnit('minutes')}
        className={`${baseClasses} ${unit === 'minutes' ? activeClasses : inactiveClasses}`}
        aria-pressed={unit === 'minutes'}
      >
        Minutes
      </button>
      <button
        onClick={() => setUnit('hoursAndMinutes')}
        className={`${baseClasses} ${unit === 'hoursAndMinutes' ? activeClasses : inactiveClasses}`}
        aria-pressed={unit === 'hoursAndMinutes'}
      >
        Hours & Mins
      </button>
    </div>
  );
};

export default TimeDisplayToggle;
