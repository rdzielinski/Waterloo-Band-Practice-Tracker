
import React, { useState, useEffect, useRef } from 'react';
import { GoalDetail, GradeLevel } from '../types';

interface ClassGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (goals: GoalDetail) => void;
    currentGoal?: GoalDetail;
    grade: GradeLevel | null;
}

const ClassGoalModal: React.FC<ClassGoalModalProps> = ({ isOpen, onClose, onSave, currentGoal, grade }) => {
    const [weeklyMinutes, setWeeklyMinutes] = useState('');
    const [dailyMinutes, setDailyMinutes] = useState('');
    const [error, setError] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);
    const lastFocusedElementRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (isOpen) {
            setWeeklyMinutes(currentGoal?.weeklyMinutes ? String(currentGoal.weeklyMinutes) : '');
            setDailyMinutes(currentGoal?.dailyMinutes ? String(currentGoal.dailyMinutes) : '');
            setError('');

            lastFocusedElementRef.current = document.activeElement as HTMLElement;

            setTimeout(() => {
                modalRef.current?.querySelectorAll<HTMLElement>('input')[0]?.focus();
            }, 100);

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    onClose();
                }
                // Focus trap logic
                if (e.key === 'Tab') {
                    const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
                        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                    );
                    if (!focusableElements || focusableElements.length === 0) return;

                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];

                    if (e.shiftKey) {
                        if (document.activeElement === firstElement) {
                            lastElement.focus();
                            e.preventDefault();
                        }
                    } else {
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
    }, [isOpen, currentGoal, onClose]);

    if (!isOpen) {
        return null;
    }

    const handleSave = () => {
        const numWeeklyMinutes = parseInt(weeklyMinutes, 10) || 0;
        const numDailyMinutes = parseInt(dailyMinutes, 10) || 0;

        if ((weeklyMinutes && (isNaN(numWeeklyMinutes) || numWeeklyMinutes < 0)) || (dailyMinutes && (isNaN(numDailyMinutes) || numDailyMinutes < 0))) {
            setError('Please enter a valid, non-negative number of minutes.');
            return;
        }
        
        setError('');
        onSave({ weeklyMinutes: numWeeklyMinutes, dailyMinutes: numDailyMinutes });
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
                aria-labelledby="class-goal-modal-title"
                aria-describedby="class-goal-modal-description"
                onClick={e => e.stopPropagation()}
            >
                <h4 id="class-goal-modal-title" className="text-xl font-heading text-gold mb-2">Set Goals for {grade}</h4>
                <p id="class-goal-modal-description" className="text-gray-300 mb-6">Set a daily and weekly practice goal for all students in this grade level.</p>
                
                {error && <p className="bg-red-500/20 text-red-300 p-3 rounded-md mb-4 text-sm">{error}</p>}
                
                <div className="space-y-4">
                    <div>
                        <label htmlFor="class-goal-weekly-minutes" className="block text-sm font-medium text-gray-300 mb-1">Weekly Goal (minutes)</label>
                        <input
                            id="class-goal-weekly-minutes"
                            type="number"
                            value={weeklyMinutes}
                            onChange={(e) => setWeeklyMinutes(e.target.value)}
                            placeholder="e.g., 1000"
                            className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-dark"
                            autoFocus
                        />
                        <p className="text-xs text-gray-400 mt-1">Total minutes for this grade to practice per week.</p>
                    </div>
                    <div>
                        <label htmlFor="class-goal-daily-minutes" className="block text-sm font-medium text-gray-300 mb-1">Daily Goal (minutes)</label>
                        <input
                            id="class-goal-daily-minutes"
                            type="number"
                            value={dailyMinutes}
                            onChange={(e) => setDailyMinutes(e.target.value)}
                            placeholder="e.g., 200"
                            className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-dark"
                        />
                        <p className="text-xs text-gray-400 mt-1">Total minutes for this grade to practice per day.</p>
                    </div>
                </div>

                <div className="mt-8 flex justify-end space-x-4">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-md text-gray-200 hover:bg-maroon transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-dark"
                    >
                        Cancel
                    </button>
                    <button 
                        type="button"
                        onClick={handleSave}
                        className="bg-gold hover:bg-gold-light text-maroon-darkest font-bold py-2 px-4 rounded-md transition-colors shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-dark"
                    >
                        Save Goals
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClassGoalModal;