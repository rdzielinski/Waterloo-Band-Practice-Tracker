import React, { useState, useMemo } from 'react';
import { GoalDetail, PracticeEntry, GradeLevel } from '../types';
import { INSTRUMENT_GROUPS, INSTRUMENTS } from '../constants';
import UsersPlusIcon from './icons/UsersPlusIcon';
import ConfirmationModal from './ConfirmationModal';

interface GroupGoalSetterProps {
    entries: PracticeEntry[];
    onSetGroupGoal: (studentNames: string[], goal: GoalDetail) => Promise<void>;
}

type TargetType = 'all' | 'grade' | 'instrumentGroup' | 'instrument';

const GroupGoalSetter: React.FC<GroupGoalSetterProps> = ({ entries, onSetGroupGoal }) => {
    const [targetType, setTargetType] = useState<TargetType>('all');
    const [filterValue, setFilterValue] = useState<string>('');
    const [weeklyMinutes, setWeeklyMinutes] = useState('');
    const [dailyMinutes, setDailyMinutes] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [isConfirming, setIsConfirming] = useState(false);
    
    const studentsToUpdate = useMemo(() => {
        if (targetType === 'all') {
            return [...new Set(entries.map(e => e.studentName))];
        }
        if (targetType === 'grade' && filterValue) {
            return [...new Set(entries.filter(e => e.grade === filterValue).map(e => e.studentName))];
        }
        if (targetType === 'instrumentGroup' && filterValue) {
            const instruments = INSTRUMENT_GROUPS[filterValue] || [];
            return [...new Set(entries.filter(e => instruments.includes(e.instrument)).map(e => e.studentName))];
        }
        if (targetType === 'instrument' && filterValue) {
            return [...new Set(entries.filter(e => e.instrument === filterValue).map(e => e.studentName))];
        }
        return [];
    }, [targetType, filterValue, entries]);

    const handleTargetTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setTargetType(e.target.value as TargetType);
        setFilterValue(''); // Reset filter when type changes
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const numWeekly = parseInt(weeklyMinutes, 10) || 0;
        const numDaily = parseInt(dailyMinutes, 10) || 0;

        if (numWeekly < 0 || numDaily < 0) {
            setError('Goals must be non-negative numbers.');
            return;
        }
        if (numWeekly === 0 && numDaily === 0) {
            setError('Please set at least one goal.');
            return;
        }
        if (targetType !== 'all' && !filterValue) {
            setError('Please select a specific group, grade, or instrument.');
            return;
        }
        
        setError('');
        setIsConfirming(true);
    };

    const handleConfirmSetGoal = async () => {
        setIsSaving(true);
        const goal: GoalDetail = {};
        const numWeekly = parseInt(weeklyMinutes, 10);
        const numDaily = parseInt(dailyMinutes, 10);

        if (!isNaN(numWeekly) && numWeekly >= 0) {
            goal.weeklyMinutes = numWeekly;
        }
        if (!isNaN(numDaily) && numDaily >= 0) {
            goal.dailyMinutes = numDaily;
        }

        try {
            await onSetGroupGoal(studentsToUpdate, goal);
            // Reset form on success
            setWeeklyMinutes('');
            setDailyMinutes('');
            setIsConfirming(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsSaving(false);
        }
    };
    
    const renderFilterDropdown = () => {
        if (targetType === 'grade') {
            return (
                <div>
                    <label htmlFor="gradeFilter" className="block text-sm font-medium text-gray-300 mb-1">Grade Level</label>
                    <select id="gradeFilter" value={filterValue} onChange={e => setFilterValue(e.target.value)} className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold">
                        <option value="">-- Select Grade --</option>
                        {(Object.values(GradeLevel) as GradeLevel[]).map(level => <option key={level} value={level}>{level}</option>)}
                    </select>
                </div>
            );
        }
        if (targetType === 'instrumentGroup') {
            return (
                <div>
                    <label htmlFor="instrumentGroupFilter" className="block text-sm font-medium text-gray-300 mb-1">Instrument Group</label>
                    <select id="instrumentGroupFilter" value={filterValue} onChange={e => setFilterValue(e.target.value)} className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold">
                        <option value="">-- Select Group --</option>
                        {Object.keys(INSTRUMENT_GROUPS).map(group => <option key={group} value={group}>{group}</option>)}
                    </select>
                </div>
            );
        }
        if (targetType === 'instrument') {
            return (
                <div>
                    <label htmlFor="instrumentFilter" className="block text-sm font-medium text-gray-300 mb-1">Instrument</label>
                    <select id="instrumentFilter" value={filterValue} onChange={e => setFilterValue(e.target.value)} className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold">
                        <option value="">-- Select Instrument --</option>
                        {INSTRUMENTS.map(instrument => <option key={instrument} value={instrument}>{instrument}</option>)}
                    </select>
                </div>
            );
        }
        return null;
    };
    
    const getConfirmationMessage = () => {
        let targetText = '';
        if (targetType === 'all') targetText = 'all students';
        else if (targetType === 'grade' && filterValue) targetText = `all students in ${filterValue}`;
        else if (targetType === 'instrumentGroup' && filterValue) targetText = `all students in the ${filterValue} group`;
        else if (targetType === 'instrument' && filterValue) targetText = `all students who play ${filterValue}`;
        else targetText = 'the selected students';
        
        return (
            <div>
                <p>You are about to set an <span className="font-bold text-white">overall goal</span> for <span className="font-bold text-white">{studentsToUpdate.length}</span> student(s) matching the criteria: <span className="font-bold text-white">{targetText}</span>.</p>
                <ul className="list-disc list-inside mt-2 text-gray-400">
                    {weeklyMinutes && <li>Weekly Goal: {weeklyMinutes} minutes</li>}
                    {dailyMinutes && <li>Daily Goal: {dailyMinutes} minutes</li>}
                </ul>
                <p className="mt-4">This will overwrite any existing <span className="font-bold text-white">overall</span> goals for these students but will not affect their instrument-specific goals. Are you sure you want to proceed?</p>
            </div>
        );
    };

    return (
        <>
            <ConfirmationModal
                isOpen={isConfirming}
                onClose={() => setIsConfirming(false)}
                onConfirm={handleConfirmSetGoal}
                title="Confirm Group Goal"
                confirmText="Set Goals"
            >
                {getConfirmationMessage()}
            </ConfirmationModal>

            <div className="bg-maroon-dark p-6 rounded-xl shadow-2xl">
                <div className="flex items-center space-x-3 mb-4">
                    <UsersPlusIcon className="w-8 h-8 text-gold" />
                    <h3 className="text-2xl font-heading text-gold">Set Group Goals</h3>
                </div>
                {error && <p className="bg-red-500/20 text-red-300 p-3 rounded-md mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="targetType" className="block text-sm font-medium text-gray-300 mb-1">Target</label>
                            <select id="targetType" value={targetType} onChange={handleTargetTypeChange} className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold">
                                <option value="all">All Students</option>
                                <option value="grade">By Grade Level</option>
                                <option value="instrumentGroup">By Instrument Group</option>
                                <option value="instrument">By Specific Instrument</option>
                            </select>
                        </div>
                        {renderFilterDropdown()}
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="groupWeeklyMinutes" className="block text-sm font-medium text-gray-300 mb-1">Weekly Goal (minutes)</label>
                            <input id="groupWeeklyMinutes" type="number" value={weeklyMinutes} onChange={e => setWeeklyMinutes(e.target.value)} placeholder="e.g., 120" className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold"/>
                        </div>
                         <div>
                            <label htmlFor="groupDailyMinutes" className="block text-sm font-medium text-gray-300 mb-1">Daily Goal (minutes)</label>
                            <input id="groupDailyMinutes" type="number" value={dailyMinutes} onChange={e => setDailyMinutes(e.target.value)} placeholder="e.g., 20" className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold"/>
                        </div>
                    </div>
                    <div className="flex justify-end items-center pt-2">
                        <span className="text-sm text-gray-400 mr-4">
                           Affects {studentsToUpdate.length} student(s)
                        </span>
                        <button type="submit" className="bg-gold hover:bg-gold-light text-maroon-darkest font-bold py-2 px-4 rounded-md shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50" disabled={isSaving || (targetType !== 'all' && !filterValue)}>
                            {isSaving ? 'Saving...' : 'Set Goals for Group'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default GroupGoalSetter;