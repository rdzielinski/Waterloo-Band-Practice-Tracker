import React, { useState, useEffect, useRef } from 'react';
import { Goal, GoalDetail } from '../types';
import { INSTRUMENTS } from '../constants';
import TrashIcon from './icons/TrashIcon';

interface GoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (goals: Goal) => Promise<void>;
    studentName: string;
    currentGoal?: Goal;
    studentInstruments: string[];
}

const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, onSave, studentName, currentGoal, studentInstruments }) => {
    const [overallWeekly, setOverallWeekly] = useState('');
    const [overallDaily, setOverallDaily] = useState('');
    const [instrumentGoals, setInstrumentGoals] = useState<{ instrument: string; weekly: string; daily: string; id: number }[]>([]);
    
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const lastFocusedElementRef = useRef<HTMLElement | null>(null);

    const availableInstruments = [...new Set([...INSTRUMENTS, ...studentInstruments])].sort();

    useEffect(() => {
        if (isOpen) {
            setOverallWeekly(currentGoal?.overall?.weeklyMinutes ? String(currentGoal.overall.weeklyMinutes) : '');
            setOverallDaily(currentGoal?.overall?.dailyMinutes ? String(currentGoal.overall.dailyMinutes) : '');
            
            const instGoals = currentGoal?.instruments ? Object.entries(currentGoal.instruments).map(([instrument, detail], index) => ({
                instrument,
                // Cast detail to GoalDetail because TypeScript infers it as `unknown` from Object.entries.
                weekly: (detail as GoalDetail).weeklyMinutes ? String((detail as GoalDetail).weeklyMinutes) : '',
                // Cast detail to GoalDetail because TypeScript infers it as `unknown` from Object.entries.
                daily: (detail as GoalDetail).dailyMinutes ? String((detail as GoalDetail).dailyMinutes) : '',
                id: index,
            })) : [];
            setInstrumentGoals(instGoals);
            
            setError('');
            setIsSaving(false);

            lastFocusedElementRef.current = document.activeElement as HTMLElement;

            setTimeout(() => {
                const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (focusableElements && focusableElements.length > 0) {
                    focusableElements[0].focus();
                }
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
    }, [isOpen, currentGoal, onClose]);
    
    const handleAddInstrumentGoal = () => {
        const usedInstruments = new Set(instrumentGoals.map(g => g.instrument));
        const firstAvailable = availableInstruments.find(inst => !usedInstruments.has(inst)) || availableInstruments[0];
        setInstrumentGoals([...instrumentGoals, { instrument: firstAvailable, weekly: '', daily: '', id: Date.now() }]);
    };
    
    const handleInstrumentGoalChange = (id: number, field: 'instrument' | 'weekly' | 'daily', value: string) => {
        setInstrumentGoals(instrumentGoals.map(g => g.id === id ? { ...g, [field]: value } : g));
    };
    
    const handleRemoveInstrumentGoal = (id: number) => {
        setInstrumentGoals(instrumentGoals.filter(g => g.id !== id));
    };

    if (!isOpen) {
        return null;
    }

    const handleSave = async () => {
        // Validation logic here
        setError('');
        
        const finalGoal: Goal = {
            overall: {
                weeklyMinutes: parseInt(overallWeekly, 10) || undefined,
                dailyMinutes: parseInt(overallDaily, 10) || undefined,
            },
            instruments: {},
        };

        const instrumentSet = new Set<string>();
        for (const g of instrumentGoals) {
            if (instrumentSet.has(g.instrument)) {
                setError(`Duplicate goal found for ${g.instrument}. Each instrument can only have one goal.`);
                return;
            }
            if (g.instrument) {
                instrumentSet.add(g.instrument);
            }
            
            const weekly = parseInt(g.weekly, 10);
            const daily = parseInt(g.daily, 10);
            if(g.instrument && ((!isNaN(weekly) && weekly > 0) || (!isNaN(daily) && daily > 0))) {
                if (!finalGoal.instruments) finalGoal.instruments = {};
                finalGoal.instruments[g.instrument] = {
                    weeklyMinutes: weekly || undefined,
                    dailyMinutes: daily || undefined,
                }
            }
        }
        
        setIsSaving(true);
        try {
            await onSave(finalGoal);
            // On success, parent closes modal
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
            setIsSaving(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" 
            onClick={onClose}
        >
            <div 
                ref={modalRef}
                className="bg-maroon-dark p-8 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col" 
                role="dialog"
                aria-modal="true"
                aria-labelledby="goal-modal-title"
                aria-describedby="goal-modal-description"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex-shrink-0">
                    <h4 id="goal-modal-title" className="text-xl font-heading text-gold mb-2">Set Practice Goals</h4>
                    <p id="goal-modal-description" className="text-gray-300 mb-6">Set overall and instrument-specific goals for <span className="font-bold text-white">{studentName}</span>.</p>
                </div>
                
                <div className="flex-grow overflow-y-auto pr-2 space-y-6">
                    {error && <p className="bg-red-500/20 text-red-300 p-3 rounded-md text-sm">{error}</p>}
                    
                    <fieldset className="bg-maroon p-4 rounded-lg">
                        <legend className="text-lg font-semibold text-white px-2">Overall Goal</legend>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                             <div>
                                <label htmlFor="goal-weekly-minutes" className="block text-sm font-medium text-gray-300 mb-1">Weekly Goal (minutes)</label>
                                <input
                                    id="goal-weekly-minutes"
                                    type="number"
                                    value={overallWeekly}
                                    onChange={(e) => setOverallWeekly(e.target.value)}
                                    placeholder="e.g., 240"
                                    className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-dark"
                                    disabled={isSaving}
                                />
                            </div>
                            <div>
                                <label htmlFor="goal-daily-minutes" className="block text-sm font-medium text-gray-300 mb-1">Daily Goal (minutes)</label>
                                <input
                                    id="goal-daily-minutes"
                                    type="number"
                                    value={overallDaily}
                                    onChange={(e) => setOverallDaily(e.target.value)}
                                    placeholder="e.g., 30"
                                    className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-dark"
                                    disabled={isSaving}
                                />
                            </div>
                        </div>
                    </fieldset>
                    
                    <fieldset className="bg-maroon p-4 rounded-lg">
                        <legend className="text-lg font-semibold text-white px-2">Instrument Goals</legend>
                        <div className="space-y-4 mt-2">
                            {instrumentGoals.map((goal, index) => (
                                <div key={goal.id} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end bg-maroon-dark/50 p-3 rounded-md">
                                    <div className="sm:col-span-2">
                                        <label htmlFor={`inst-name-${index}`} className="block text-xs font-medium text-gray-300 mb-1">Instrument</label>
                                        <select
                                            id={`inst-name-${index}`}
                                            value={goal.instrument}
                                            onChange={(e) => handleInstrumentGoalChange(goal.id, 'instrument', e.target.value)}
                                            className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold"
                                            disabled={isSaving}
                                        >
                                            {availableInstruments.map(inst => <option key={inst} value={inst}>{inst}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor={`inst-weekly-${index}`} className="block text-xs font-medium text-gray-300 mb-1">Weekly (min)</label>
                                        <input
                                            id={`inst-weekly-${index}`}
                                            type="number"
                                            value={goal.weekly}
                                            onChange={(e) => handleInstrumentGoalChange(goal.id, 'weekly', e.target.value)}
                                            className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold"
                                            disabled={isSaving}
                                        />
                                    </div>
                                    <div className="flex items-center">
                                         <div className="flex-grow">
                                            <label htmlFor={`inst-daily-${index}`} className="block text-xs font-medium text-gray-300 mb-1">Daily (min)</label>
                                            <input
                                                id={`inst-daily-${index}`}
                                                type="number"
                                                value={goal.daily}
                                                onChange={(e) => handleInstrumentGoalChange(goal.id, 'daily', e.target.value)}
                                                className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold"
                                                disabled={isSaving}
                                            />
                                        </div>
                                        <button 
                                            onClick={() => handleRemoveInstrumentGoal(goal.id)}
                                            className="ml-2 text-gray-500 hover:text-red-500 transition-colors p-1"
                                            aria-label="Remove instrument goal"
                                            disabled={isSaving}
                                        >
                                            <TrashIcon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={handleAddInstrumentGoal}
                                className="w-full text-sm bg-maroon-dark hover:bg-maroon-light text-gold font-semibold py-2 px-4 rounded-md transition-colors"
                                disabled={isSaving}
                            >
                                + Add Instrument Goal
                            </button>
                        </div>
                    </fieldset>
                </div>

                <div className="mt-8 flex justify-end space-x-4 flex-shrink-0">
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
                        {isSaving ? 'Saving...' : 'Save Goals'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GoalModal;