

import React, { useMemo, useState } from 'react';
import { PracticeEntry, Goal } from '../types';
import BellIcon from './icons/BellIcon';
import XMarkIcon from './icons/XMarkIcon';

interface MissedGoalsAlertProps {
    entries: PracticeEntry[];
    goals: Record<string, Goal>;
    onSelectStudent: (studentName: string) => void;
}

const MissedGoalsAlert: React.FC<MissedGoalsAlertProps> = ({ entries, goals, onSelectStudent }) => {
    const [isVisible, setIsVisible] = useState(true);

    const studentsMissingGoals = useMemo(() => {
        const studentsWithGoals = Object.keys(goals).filter(
            studentName => goals[studentName]?.overall?.weeklyMinutes && goals[studentName].overall!.weeklyMinutes! > 0
        );

        if (studentsWithGoals.length === 0) {
            return [];
        }

        // Define week boundaries (Sunday to Saturday)
        const today = new Date();
        const dayOfWeek = today.getDay();
        
        const endOfLastWeek = new Date();
        endOfLastWeek.setDate(today.getDate() - dayOfWeek - 1);
        endOfLastWeek.setHours(23, 59, 59, 999);

        const startOfLastWeek = new Date(endOfLastWeek);
        startOfLastWeek.setDate(endOfLastWeek.getDate() - 6);
        startOfLastWeek.setHours(0, 0, 0, 0);

        const endOfWeekBeforeLast = new Date(startOfLastWeek);
        endOfWeekBeforeLast.setDate(startOfLastWeek.getDate() - 1);
        endOfWeekBeforeLast.setHours(23, 59, 59, 999);

        const startOfWeekBeforeLast = new Date(endOfWeekBeforeLast);
        startOfWeekBeforeLast.setDate(endOfWeekBeforeLast.getDate() - 6);
        startOfWeekBeforeLast.setHours(0, 0, 0, 0);

        const flaggedStudents: string[] = [];

        for (const studentName of studentsWithGoals) {
            const studentEntries = entries.filter(e => e.studentName === studentName);
            const studentGoal = goals[studentName].overall!.weeklyMinutes!;

            const entriesLastWeek = studentEntries.filter(e => {
                const entryDate = new Date(e.date);
                return entryDate >= startOfLastWeek && entryDate <= endOfLastWeek;
            });
            const minutesLastWeek = entriesLastWeek.reduce((sum, e) => sum + e.duration, 0);
            const missedLastWeek = entriesLastWeek.length > 0 && minutesLastWeek < studentGoal;

            const entriesWeekBeforeLast = studentEntries.filter(e => {
                const entryDate = new Date(e.date);
                return entryDate >= startOfWeekBeforeLast && entryDate <= endOfWeekBeforeLast;
            });
            const minutesWeekBeforeLast = entriesWeekBeforeLast.reduce((sum, e) => sum + e.duration, 0);
            const missedWeekBeforeLast = entriesWeekBeforeLast.length > 0 && minutesWeekBeforeLast < studentGoal;

            if (missedLastWeek && missedWeekBeforeLast) {
                flaggedStudents.push(studentName);
            }
        }

        return flaggedStudents;

    }, [entries, goals]);

    if (!isVisible || studentsMissingGoals.length === 0) {
        return null;
    }

    return (
        <div className="bg-gradient-to-r from-amber-600/20 to-maroon-dark p-6 rounded-xl shadow-2xl border-l-4 border-amber-500">
            <div className="flex items-start space-x-4">
                <div className="bg-amber-500/20 p-3 rounded-full flex-shrink-0">
                    <BellIcon className="w-8 h-8 text-amber-400" />
                </div>
                <div className="flex-grow">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-heading text-amber-400">Heads-Up</h3>
                        <button 
                            onClick={() => setIsVisible(false)} 
                            className="text-gray-500 hover:text-white transition-colors"
                            aria-label="Dismiss notification"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <p className="text-sm text-gray-300 mt-1 mb-3">
                        The following students have missed their weekly practice goal for two consecutive weeks. It might be a good time to check in with them.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {studentsMissingGoals.map(studentName => (
                            <button
                                key={studentName}
                                onClick={() => onSelectStudent(studentName)}
                                className="bg-maroon hover:bg-maroon-light text-white font-semibold py-1 px-3 rounded-full text-sm transition-colors"
                            >
                                {studentName}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MissedGoalsAlert;