
import React, { useState, useEffect, useMemo } from 'react';

interface TutorialOverlayProps {
    onFinish: () => void;
}

interface TutorialStep {
    elementId?: string;
    title: string;
    description: string;
    position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const STEPS: TutorialStep[] = [
    {
        title: "Welcome to the Practice Tracker!",
        description: "Let's take a quick tour of the main features.",
        position: 'center',
    },
    {
        elementId: 'practice-form-container',
        title: 'Log Your Practice Time',
        description: 'This is where you can enter your daily practice sessions. Fill out your name, class, instrument, and how long you practiced.',
        position: 'right',
    },
    {
        elementId: 'dashboard-tabs-container',
        title: 'View Your Progress',
        description: 'Use these tabs to see a summary of practice hours by class, check the student leaderboard, or view the full log of all entries.',
        position: 'bottom',
    },
    {
        elementId: 'teacher-view-button',
        title: 'Teacher View',
        description: 'Teachers can click here to access a dashboard with aggregated data, class leaderboards, and a report generator.',
        position: 'left',
    },
    {
        title: "You're All Set!",
        description: 'Start logging your practice to climb the leaderboards. Happy practicing!',
        position: 'center',
    }
];

interface OverlayPositions {
    top: React.CSSProperties;
    bottom: React.CSSProperties;
    left: React.CSSProperties;
    right: React.CSSProperties;
}


const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onFinish }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
    const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
    const [overlayPositions, setOverlayPositions] = useState<OverlayPositions | null>(null);

    const step = useMemo(() => STEPS[currentStep], [currentStep]);

    useEffect(() => {
        const updatePositions = () => {
            if (step.elementId) {
                const element = document.getElementById(step.elementId);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    const padding = 10;
                    
                    setHighlightStyle({
                        top: `${rect.top - padding}px`,
                        left: `${rect.left - padding}px`,
                        width: `${rect.width + padding * 2}px`,
                        height: `${rect.height + padding * 2}px`,
                    });

                    setOverlayPositions({
                        top: { top: 0, left: 0, width: '100%', height: `${rect.top - padding}px` },
                        bottom: { top: `${rect.bottom + padding}px`, left: 0, width: '100%', height: `calc(100vh - ${rect.bottom + padding}px)` },
                        left: { top: `${rect.top - padding}px`, left: 0, width: `${rect.left - padding}px`, height: `${rect.height + padding * 2}px` },
                        right: { top: `${rect.top - padding}px`, left: `${rect.right + padding}px`, width: `calc(100vw - ${rect.right + padding}px)`, height: `${rect.height + padding * 2}px` }
                    });
                    
                    let newTooltipStyle: React.CSSProperties = {};
                    switch(step.position) {
                        case 'right':
                            newTooltipStyle = { top: `${rect.top}px`, left: `${rect.right + padding + 10}px` };
                            break;
                        case 'left':
                            newTooltipStyle = { top: `${rect.top}px`, right: `${window.innerWidth - rect.left + padding + 10}px` };
                            break;
                        case 'bottom':
                            newTooltipStyle = { top: `${rect.bottom + padding + 10}px`, left: `${rect.left}px` };
                            break;
                        case 'top':
                             newTooltipStyle = { bottom: `${window.innerHeight - rect.top + padding + 10}px`, left: `${rect.left}px` };
                            break;
                    }
                    setTooltipStyle(newTooltipStyle);

                }
            } else {
                setHighlightStyle({ display: 'none' });
                setOverlayPositions(null);
                setTooltipStyle({
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                });
            }
        };

        const element = step.elementId ? document.getElementById(step.elementId) : null;
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            const timer = setTimeout(updatePositions, 300); // Wait for scroll to finish
            window.addEventListener('resize', updatePositions);
            
            return () => {
                clearTimeout(timer);
                window.removeEventListener('resize', updatePositions);
            };
        } else {
            updatePositions(); // For centered steps
        }
        
    }, [step]);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onFinish();
        }
    };

    const isLastStep = currentStep === STEPS.length - 1;

    const renderOverlays = () => {
        const overlayClass = "fixed bg-black/80 backdrop-blur-sm transition-all duration-500 ease-in-out pointer-events-none";
        if (overlayPositions) {
            return (
                <>
                    <div className={overlayClass} style={overlayPositions.top}></div>
                    <div className={overlayClass} style={overlayPositions.bottom}></div>
                    <div className={overlayClass} style={overlayPositions.left}></div>
                    <div className={overlayClass} style={overlayPositions.right}></div>
                </>
            );
        }
        // Fallback for centered steps
        return <div className="fixed inset-0 bg-black/80 backdrop-blur-sm"></div>;
    };


    return (
        <div className="fixed inset-0 z-50">
            {/* Overlay */}
            {renderOverlays()}

            {/* Highlight Box */}
            <div
                className="absolute border-2 border-dashed border-gold rounded-lg shadow-2xl transition-all duration-500 ease-in-out animate-glow pointer-events-none"
                style={highlightStyle}
            ></div>

            {/* Tooltip / Info Box */}
            <div
                className="absolute bg-maroon-dark p-6 rounded-xl shadow-2xl w-full max-w-sm text-gray-200 transition-all duration-500 ease-in-out"
                style={tooltipStyle}
            >
                <h3 className="text-2xl font-heading text-gold mb-2">{step.title}</h3>
                <p className="text-gray-300 mb-6">{step.description}</p>
                <div className="flex justify-between items-center">
                    <button
                        onClick={onFinish}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        Skip Tutorial
                    </button>
                    <button
                        onClick={handleNext}
                        className="bg-gold hover:bg-gold-light text-maroon-darkest font-bold py-2 px-6 rounded-md transition-colors shadow-md"
                    >
                        {isLastStep ? 'Finish' : 'Next'}
                    </button>
                </div>
                <div className="flex justify-center mt-4 space-x-2">
                    {STEPS.map((_, index) => (
                        <div key={index} className={`w-2 h-2 rounded-full ${index === currentStep ? 'bg-gold' : 'bg-maroon'}`}></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TutorialOverlay;
