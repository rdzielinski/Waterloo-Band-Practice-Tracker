import React, { useState, useEffect, useRef } from 'react';
import { PracticeEntry } from '../types';
import { INSTRUMENTS } from '../constants';

interface EditEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (entryId: string, data: Partial<Omit<PracticeEntry, 'id'>>) => Promise<void>;
    entry: PracticeEntry | null;
}

const EditEntryModal: React.FC<EditEntryModalProps> = ({ isOpen, onClose, onSave, entry }) => {
    const [instrument, setInstrument] = useState('');
    const [hours, setHours] = useState('');
    const [minutes, setMinutes] = useState('');
    const [date, setDate] = useState('');
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const lastFocusedElementRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (isOpen && entry) {
            setInstrument(entry.instrument);
            
            const h = Math.floor(entry.duration / 60);
            const m = entry.duration % 60;
            setHours(h > 0 ? String(h) : '');
            setMinutes(m > 0 ? String(m) : '');

            const entryDate = new Date(entry.date);
            const formattedDate = entryDate.toISOString().split('T')[0];
            setDate(formattedDate);
            setError('');
            setIsSaving(false);

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
    }, [isOpen, entry, onClose]);

    if (!isOpen) {
        return null;
    }

    const handleSave = async () => {
        if (!entry) return;

        const durationHours = parseInt(hours, 10) || 0;
        const durationMinutes = parseInt(minutes, 10) || 0;
        const totalMinutes = (durationHours * 60) + durationMinutes;

        if (totalMinutes <= 0) {
            setError('Please enter a valid practice duration.');
            return;
        }
        if (!date) {
            setError('Please select a valid date.');
            return;
        }
        
        setError('');
        setIsSaving(true);
        try {
            // Re-constitute date as local time to avoid timezone shifts
            const updatedDate = new Date(date + 'T00:00:00').toISOString();
            await onSave(entry.id, {
                instrument,
                duration: totalMinutes,
                date: updatedDate,
            });
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        } finally {
            setIsSaving(false);
        }
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
                aria-labelledby="edit-entry-modal-title"
                aria-describedby="edit-entry-modal-description"
                onClick={e => e.stopPropagation()}
            >
                <h4 id="edit-entry-modal-title" className="text-xl font-heading text-gold mb-2">Edit Practice Entry</h4>
                {entry ? (
                    <p id="edit-entry-modal-description" className="text-gray-300 mb-6">
                        Modify details for {entry.studentName}'s session from {new Date(entry.date).toLocaleDateString()}.
                    </p>
                ) : (
                    <p id="edit-entry-modal-description" className="text-gray-300 mb-6">Modify the details for this practice session.</p>
                )}
                
                {error && <p className="bg-red-500/20 text-red-300 p-3 rounded-md mb-4 text-sm">{error}</p>}
                
                <div className="space-y-4">
                    <div>
                        <label htmlFor="edit-date" className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                        <input
                            id="edit-date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-dark"
                            disabled={isSaving}
                        />
                    </div>
                     <div>
                        <label htmlFor="edit-instrument" className="block text-sm font-medium text-gray-300 mb-1">Instrument</label>
                        <select
                            id="edit-instrument"
                            value={instrument}
                            onChange={(e) => setInstrument(e.target.value)}
                            className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-dark"
                            disabled={isSaving}
                        >
                            {INSTRUMENTS.map((inst) => (
                                <option key={inst} value={inst}>{inst}</option>
                            ))}
                        </select>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="edit-duration-hours" className="block text-sm font-medium text-gray-300 mb-1">Hours</label>
                            <input
                                id="edit-duration-hours"
                                type="number"
                                min="0"
                                value={hours}
                                onChange={(e) => setHours(e.target.value)}
                                placeholder="e.g., 1"
                                className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-dark"
                                disabled={isSaving}
                            />
                        </div>
                        <div>
                            <label htmlFor="edit-duration-minutes" className="block text-sm font-medium text-gray-300 mb-1">Minutes</label>
                            <input
                                id="edit-duration-minutes"
                                type="number"
                                min="0"
                                max="59"
                                value={minutes}
                                onChange={(e) => setMinutes(e.target.value)}
                                placeholder="e.g., 30"
                                className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-dark"
                                disabled={isSaving}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end space-x-4">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-md text-gray-200 hover:bg-maroon transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-dark"
                        disabled={isSaving}
                    >
                        Cancel
                    </button>
                    <button 
                        type="button"
                        onClick={handleSave}
                        className="bg-gold hover:bg-gold-light text-maroon-darkest font-bold py-2 px-4 rounded-md transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-dark"
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditEntryModal;