import React from 'react';

const FingeringDisplay: React.FC<{instrument: any, fingering: string, alternates?: string[]}> = ({ instrument, fingering, alternates = [] }) => {
    
    const renderFingering = (f: string, isAlternate: boolean) => {
        // --- Slide Instruments (Trombone) ---
        if (instrument.category.includes('Slide')) {
            const primaryPosition = parseInt(f, 10); // "1 or 6" becomes 1, which is fine for visual
            if (isNaN(primaryPosition)) {
                // Fallback for non-numeric fingerings
                return <div className="text-5xl font-extrabold text-gold-light">{f}</div>;
            }
            const totalPositions = 7;
            const clampedPosition = Math.max(1, Math.min(primaryPosition, totalPositions));
            const percentage = ((clampedPosition - 1) / (totalPositions - 1)) * 100;

            return (
                <div className="flex flex-col items-center w-full max-w-[200px] mx-auto">
                    {/* The text number is still important */}
                    <span className={`font-extrabold mb-3 ${isAlternate ? 'text-4xl text-gold' : 'text-5xl text-gold-light'}`}>{f}</span>
                    {/* The visual representation */}
                    <div className="w-full h-3 bg-maroon-darkest rounded-full relative shadow-inner">
                        <div 
                            className="absolute top-1/2 -translate-y-1/2 -left-1 w-2.5 h-2.5 border-2 border-gray-400 rounded-full"
                            title="Position 1"
                        ></div>
                        <div 
                            className="absolute top-1/2 -translate-y-1/2 -right-1 w-2.5 h-2.5 border-2 border-gray-400 rounded-full"
                            title="Position 7"
                        ></div>
                        {/* Slide Handle */}
                        <div 
                            className="absolute -top-1 w-5 h-5 bg-gold-light border-2 border-white rounded-full shadow-lg transform -translate-x-1/2"
                            style={{ left: `${percentage}%` }}
                            title={`Position ${f}`}
                        ></div>
                    </div>
                </div>
            );
        }

        // --- Valved Brass Instruments (Trumpet, Horn, Tuba, etc.) ---
        if (instrument.category.includes('Valves')) {
            const valvesPressed = f.split('').map(Number);
            const isAllOpen = f === '0';
            const size = isAlternate ? 'w-8 h-8' : 'w-12 h-12';
            const textSize = isAlternate ? 'text-md' : 'text-lg';
            
            if (isAllOpen) {
                return (
                    <div className="flex items-center justify-center min-h-[64px]">
                        <span className={`font-extrabold text-gold-light ${isAlternate ? 'text-3xl' : 'text-5xl'}`}>Open</span>
                    </div>
                );
            }

            const valvePressedClasses = isAlternate
                ? 'bg-gold text-maroon-darkest border-gold-dark shadow-inner shadow-maroon-darkest/50'
                : 'bg-gold-light text-maroon-darkest border-gold shadow-inner shadow-black/30';

            return (
                 <div className={`flex items-center justify-center p-2 min-h-[64px] ${isAlternate ? 'space-x-2' : 'space-x-4'}`}>
                    {[1, 2, 3].map(valveNum => {
                        const isPressed = valvesPressed.includes(valveNum);
                        return (
                            <div key={valveNum} 
                                className={`${size} rounded-full flex items-center justify-center ${textSize} font-bold transition-all duration-200 border-2 ${
                                    isPressed
                                        ? valvePressedClasses
                                        : 'bg-transparent border-gray-500 text-gray-400'
                                }`}
                            >
                                {valveNum}
                            </div>
                        );
                    })}
                </div>
            );
        }

        // --- Woodwind Instruments (Flute, Clarinet, Sax, etc.) ---
        const groups = f.split(' | ');
        const labels = instrument.hands_layout || [];
        const keySize = isAlternate ? 'w-5 h-5' : 'w-6 h-6';
        const specialKeySize = isAlternate ? 'w-auto px-1.5 h-5' : 'w-auto px-2 h-6';

        const pressedKeyStyle = isAlternate
            ? 'bg-gold border-gold-dark'
            : 'bg-gold-light border-gold shadow-inner shadow-black/30';
        
        const specialKeyStyle = isAlternate
            ? 'bg-gold-dark text-white border-gold-dark'
            : 'bg-gold text-maroon-darkest border-gold-dark';

        return (
            <div className={`flex justify-center flex-wrap gap-2 text-center w-full ${isAlternate ? '' : 'sm:gap-6'}`}>
                {groups.map((group, index) => (
                    <div key={index} className={`flex flex-col items-center p-2 rounded-lg bg-maroon-dark/50 shadow-md min-w-[60px] ${isAlternate ? 'sm:min-w-[70px]' : 'sm:min-w-[80px]'}`}>
                        {!isAlternate && <span className="text-gray-400 text-xs font-semibold uppercase mb-2 tracking-wider">{labels[index]}</span>}
                        <div className="flex flex-wrap gap-1.5 justify-center items-center min-h-[24px]">
                            {group.split(' ').map((key, keyIndex) => {
                                const isSpecial = key !== 'X' && key !== 'O';
                                
                                const keyShape = isSpecial ? 'rounded-md' : 'rounded-full';
                                const size = isSpecial ? specialKeySize : keySize;
                                const content = isSpecial ? key.replace(/-/g, '') : '';
                                
                                let keyStyle = '';
                                if (isSpecial) {
                                    keyStyle = specialKeyStyle;
                                } else if (key === 'X') {
                                    keyStyle = pressedKeyStyle;
                                } else { // O
                                    keyStyle = 'bg-transparent border-gray-500';
                                }

                                return (
                                    <div
                                        key={keyIndex}
                                        title={`Key: ${key}`}
                                        className={`${size} ${keyShape} transition-colors duration-200 text-xs font-bold flex items-center justify-center border-2 ${keyStyle}`}
                                    >
                                        {content}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    
    return (
        <div className="w-full">
            <div className="min-h-[100px] flex flex-col justify-center">
                {renderFingering(fingering, false)}
            </div>

            {alternates && alternates.length > 0 && (
                <div className="mt-6 pt-4 border-t border-maroon-light/50 w-full text-center">
                    <h4 className="text-gray-300 text-sm font-semibold uppercase mb-3 tracking-wider">Alternates</h4>
                    <div className="flex flex-wrap justify-center gap-4">
                        {alternates.map((alt, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-maroon-dark rounded-md shadow-sm">
                                <span className="font-bold text-sm text-gold-dark self-center">ALT:</span>
                                <div>{renderFingering(alt, true)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FingeringDisplay;
