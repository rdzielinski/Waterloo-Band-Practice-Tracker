
import React, { useState } from 'react';
import { FingeringGuideData } from '../types';
import { InstrumentIcon } from './icons/InstrumentIcons';
import AcademicCapIcon from './icons/AcademicCapIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import LightbulbIcon from './icons/LightbulbIcon';
import FingeringDisplay from './FingeringDisplay';
import { INSTRUMENT_DATA } from '../lib/fingeringData';

interface FingeringGuideProps {
    guideData: FingeringGuideData;
}

const FingeringGuide: React.FC<FingeringGuideProps> = ({ guideData }) => {
    const { instrument, noteName, fingeringDescription, playingTip, fingeringMachineReadable, alternatesMachineReadable } = guideData;
    const [isExpanded, setIsExpanded] = useState(true); 
    
    const instrumentData = INSTRUMENT_DATA.find(inst => inst.name === instrument);
    
    return (
        <div className="w-full bg-maroon p-4 rounded-lg text-left mt-2 border border-maroon-light transition-all duration-300">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex justify-between items-center text-left focus:outline-none focus:ring-2 focus:ring-gold-dark rounded-md -m-1 p-1"
                aria-expanded={isExpanded}
                aria-controls="fingering-guide-content"
            >
                <div className="flex items-center space-x-3">
                    <AcademicCapIcon className="w-7 h-7 text-gold" />
                    <h5 className="text-xl font-heading text-gold">Fingering Guide</h5>
                </div>
                <ChevronDownIcon 
                    className={`w-6 h-6 text-gold transition-transform duration-300 ${isExpanded ? 'transform rotate-180' : ''}`} 
                />
            </button>
            
            <div
                id="fingering-guide-content"
                className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] mt-4 pt-4 border-t border-maroon-light' : 'grid-rows-[0fr]'}`}
            >
                <div className="overflow-hidden">
                    <div className="flex items-center justify-between bg-maroon-dark p-3 rounded-md">
                         <div className="flex items-center space-x-2">
                            <InstrumentIcon instrument={instrument} className="w-6 h-6 text-gray-400" />
                            <span className="text-gray-300">{instrument}</span>
                        </div>
                        <span className="text-2xl font-bold text-white">{noteName}</span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-maroon-light/50 space-y-6">
                        {instrumentData && fingeringMachineReadable && (
                            <div>
                                <p className="text-sm text-gray-400 mb-2 text-center uppercase tracking-wider">Visual Guide</p>
                                <FingeringDisplay
                                    instrument={instrumentData}
                                    fingering={fingeringMachineReadable}
                                    alternates={alternatesMachineReadable}
                                />
                            </div>
                        )}

                        <div>
                            <p className="text-sm text-gray-400 mb-1 uppercase tracking-wider">Text Description</p>
                            <p className="text-gray-200 font-semibold whitespace-pre-wrap">{fingeringDescription}</p>
                        </div>
                        
                        {playingTip && (
                            <div>
                                <div className="flex items-start space-x-2">
                                    <LightbulbIcon className="w-5 h-5 text-gold-light mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold text-gold-light">Pro Tip</h4>
                                        <p className="text-sm text-gray-300 italic">{playingTip}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FingeringGuide;
