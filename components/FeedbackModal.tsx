import React, { useEffect, useRef } from 'react';
import LightbulbIcon from './icons/LightbulbIcon';
import { AIFeedback } from '../types';
import FingeringGuide from './FingeringGuide';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    feedback: AIFeedback | null;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, feedback }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const lastFocusedElementRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (isOpen) {
            lastFocusedElementRef.current = document.activeElement as HTMLElement;

            setTimeout(() => {
                modalRef.current?.querySelectorAll<HTMLElement>('button')[0]?.focus();
            }, 100);

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    onClose();
                }

                 if (e.key === 'Tab') {
                    // Since there's only one focusable element (the button), we trap focus there.
                    const button = modalRef.current?.querySelector('button');
                    if (button) {
                        button.focus();
                        e.preventDefault();
                    }
                }
            };
            
            document.addEventListener('keydown', handleKeyDown);
            return () => {
                document.removeEventListener('keydown', handleKeyDown);
                lastFocusedElementRef.current?.focus();
            };
        }
    }, [isOpen, onClose]);

    if (!isOpen || !feedback) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" 
            onClick={onClose}
        >
            <div 
                ref={modalRef}
                className="bg-maroon-dark p-8 rounded-xl shadow-2xl w-full max-w-lg mx-auto flex flex-col items-center text-center overflow-y-auto max-h-[90vh]" 
                role="dialog"
                aria-modal="true"
                aria-labelledby="feedback-modal-title"
                aria-describedby="feedback-modal-description"
                onClick={e => e.stopPropagation()}
            >
                <div className="bg-gold/20 p-3 rounded-full mb-4">
                     <LightbulbIcon className="w-10 h-10 text-gold-light" />
                </div>
                <h4 id="feedback-modal-title" className="text-2xl font-heading text-gold mb-2">Practice Coach Tip</h4>
                <div id="feedback-modal-description">
                    <p className="text-gray-300 mb-6">Here's a helpful tip based on your practice notes:</p>
                    
                     <blockquote className="border-l-4 border-gold-dark pl-4 text-left mb-6 w-full">
                        <p className="text-gray-200 italic">"{feedback.feedbackText}"</p>
                    </blockquote>

                    {feedback.fingeringGuide && (
                        <FingeringGuide guideData={feedback.fingeringGuide} />
                    )}
                </div>

                <button 
                    type="button"
                    onClick={onClose}
                    className="bg-gold hover:bg-gold-light text-maroon-darkest font-bold py-2 px-8 rounded-md transition-colors shadow-md mt-6 flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-dark"
                >
                    Got It!
                </button>
            </div>
        </div>
    );
};

export default FeedbackModal;