

import React, { useState, useEffect, useRef } from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    title: string;
    confirmText?: string;
    confirmButtonVariant?: 'default' | 'danger';
    children: React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    confirmText = 'Confirm',
    confirmButtonVariant = 'default',
    children 
}) => {
    const [isConfirming, setIsConfirming] = useState(false);
    const [error, setError] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);
    const lastFocusedElementRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (isOpen) {
            setIsConfirming(false);
            setError('');

            lastFocusedElementRef.current = document.activeElement as HTMLElement;

            setTimeout(() => {
                modalRef.current?.querySelectorAll<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                )[0]?.focus();
            }, 100);

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    onClose();
                }

                if (e.key === 'Tab') {
                    const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
                        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                    );
                    if (!focusableElements || focusableElements.length === 0) return;

                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];

                    if (e.shiftKey) { // Shift + Tab
                        if (document.activeElement === firstElement) {
                            lastElement.focus();
                            e.preventDefault();
                        }
                    } else { // Tab
                        if (document.activeElement === lastElement) {
                            firstElement.focus();
                            e.preventDefault();
                        }
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

    if (!isOpen) {
        return null;
    }

    const handleConfirm = async () => {
        setIsConfirming(true);
        setError('');
        try {
            await onConfirm();
            // Parent component is responsible for closing the modal on success
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
            setIsConfirming(false);
        }
    };

    const confirmButtonClasses = {
        default: 'bg-gold hover:bg-gold-light text-maroon-darkest',
        danger: 'bg-red-700 hover:bg-red-600 text-white',
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" 
            onClick={onClose}
        >
            <div 
                ref={modalRef}
                className="bg-maroon-dark p-8 rounded-xl shadow-2xl w-full max-w-md mx-4" 
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirmation-modal-title"
                aria-describedby="confirmation-modal-description"
                onClick={e => e.stopPropagation()}
            >
                <h4 id="confirmation-modal-title" className="text-xl font-heading text-gold mb-2">{title}</h4>
                <div id="confirmation-modal-description" className="text-gray-300 mb-6">
                    {children}
                </div>
                
                {error && <p className="bg-red-500/20 text-red-300 p-3 rounded-md mb-4 text-sm">{error}</p>}
                
                <div className="mt-8 flex justify-end space-x-4">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-md text-gray-200 hover:bg-maroon transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-dark"
                        disabled={isConfirming}
                    >
                        Cancel
                    </button>
                    <button 
                        type="button"
                        onClick={handleConfirm}
                        className={`font-bold py-2 px-4 rounded-md transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-dark ${confirmButtonClasses[confirmButtonVariant]}`}
                        disabled={isConfirming}
                    >
                        {isConfirming ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;