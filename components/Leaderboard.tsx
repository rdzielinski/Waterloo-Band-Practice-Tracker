

import React, { useMemo, useState } from 'react';
import { GradeLevel, PracticeEntry } from '../types';
import { calculateAchievements } from '../lib/achievements';
import FireIcon from './icons/FireIcon';
import { INSTRUMENT_GROUPS } from '../constants';
import { InstrumentIcon } from './icons/InstrumentIcons';
import { TimeDisplayUnit, formatDuration } from '../lib/timeUtils';

interface LeaderboardProps {
    entries: PracticeEntry[];
    onSelectStudent: (studentName: string) => void;
    timeDisplayUnit: TimeDisplayUnit;
}

type SortByType = 'totalMinutes' | 'streak' | 'averageDuration';

const Leaderboard: React.FC<LeaderboardProps> = ({ entries, onSelectStudent, timeDisplayUnit }) => {
    const [selectedGrade, setSelectedGrade] = useState<string>('all');
    const [selectedInstrumentGroup, setSelectedInstrumentGroup] = useState<string>('all');
    const [sortBy, setSortBy] = useState<SortByType>('totalMinutes');

    const leaderboardData = useMemo(() => {
        const filteredEntries = entries
            .filter(entry => selectedGrade === 'all' || entry.grade === selectedGrade)
            .filter(entry => {
                if (selectedInstrumentGroup === 'all') return true;
                const instrumentsInGroup = INSTRUMENT_GROUPS[selectedInstrumentGroup] || [];
                return instrumentsInGroup.includes(entry.instrument);
            });

        const studentEntriesMap: { [name:string]: PracticeEntry[] } = {};
        filteredEntries.forEach(entry => {
            if (!studentEntriesMap[entry.studentName]) {
                studentEntriesMap[entry.studentName] = [];
            }
            studentEntriesMap[entry.studentName].push(entry);
        });

        const students = Object.entries(studentEntriesMap)
            .map(([studentName, studentEntries]) => {
                const totalMinutes = studentEntries.reduce((sum, entry) => sum + entry.duration, 0);
                const numberOfSessions = studentEntries.length;
                const averageDuration = numberOfSessions > 0 ? totalMinutes / numberOfSessions : 0;
                const { streak } = calculateAchievements(studentEntries);
                const grade = studentEntries[0]?.grade || 'N/A';

                const instrumentMinutes: { [key: string]: number } = {};
                studentEntries.forEach(entry => {
                    instrumentMinutes[entry.instrument] = (instrumentMinutes[entry.instrument] || 0) + entry.duration;
                });
                const primaryInstrument = Object.keys(instrumentMinutes).length > 0
                    ? Object.entries(instrumentMinutes).sort((a, b) => b[1] - a[1])[0][0]
                    : 'Default';

                return {
                    studentName,
                    totalMinutes,
                    grade,
                    streak,
                    primaryInstrument,
                    averageDuration,
                };
            });
        
        students.sort((a, b) => {
            if (sortBy === 'streak') {
                return b.streak - a.streak;
            }
            if (sortBy === 'averageDuration') {
                return b.averageDuration - a.averageDuration;
            }
            return b.totalMinutes - a.totalMinutes; // default
        });
        
        return students.slice(0, 10);
    }, [entries, selectedGrade, selectedInstrumentGroup, sortBy]);

    // Create a key that changes when filters/sort change to force remount and re-animate
    const listKey = `${selectedGrade}-${selectedInstrumentGroup}-${sortBy}`;

    const getRankColor = (rank: number) => {
        if (rank === 0) return 'text-gold-light';
        if (rank === 1) return 'text-gray-300';
        if (rank === 2) return 'text-gold-dark';
        return 'text-gray-400';
    }

    const renderMetric = (student: typeof leaderboardData[0]) => {
        if (sortBy === 'streak') {
            return (
                <>
                    <p className="font-bold text-lg text-gold">{student.streak}</p>
                    <p className="text-xs text-gray-500">Day Streak</p>
                </>
            );
        }
        if (sortBy === 'averageDuration') {
            return (
                <>
                    <p className="font-bold text-lg text-gold">{student.averageDuration.toFixed(0)} min</p>
                    <p className="text-xs text-gray-500">Average</p>
                </>
            );
        }
        
        return (
            <>
                <p className="font-bold text-lg text-gold">{formatDuration(student.totalMinutes, timeDisplayUnit)}</p>
                <p className="text-xs text-gray-500">Total</p>
            </>
        );
    };

    return (
        <div className="bg-maroon-dark p-6 rounded-xl shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                <h3 className="text-2xl font-heading text-gold">Top 10 Practicers</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                    <div>
                        <label htmlFor="leaderboardSortBy" className="sr-only">Sort by</label>
                        <select
                            id="leaderboardSortBy"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortByType)}
                            className="w-full sm:w-auto bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-darkest"
                        >
                            <option value="totalMinutes">Sort by: Total Time</option>
                            <option value="streak">Sort by: Practice Streak</option>
                            <option value="averageDuration">Sort by: Average Session</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="leaderboardGradeFilter" className="sr-only">Filter by Class</label>
                        <select
                            id="leaderboardGradeFilter"
                            value={selectedGrade}
                            onChange={(e) => setSelectedGrade(e.target.value)}
                            className="w-full sm:w-auto bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-darkest"
                        >
                            <option value="all">All Classes</option>
                            {Object.values(GradeLevel).map((level) => (
                                <option key={level} value={level}>{level}</option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="leaderboardInstrumentGroupFilter" className="sr-only">Filter by Instrument Group</label>
                        <select
                            id="leaderboardInstrumentGroupFilter"
                            value={selectedInstrumentGroup}
                            onChange={(e) => setSelectedInstrumentGroup(e.target.value)}
                            className="w-full sm:w-auto bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-darkest"
                        >
                            <option value="all">All Instrument Groups</option>
                            {Object.keys(INSTRUMENT_GROUPS).map((group) => (
                                <option key={group} value={group}>{group}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            <ul className="space-y-3" key={listKey}>
                {leaderboardData.map((student, index) => (
                        <li 
                            key={student.studentName}
                            className="animate-list-item"
                            style={{ animationDelay: `${index * 30}ms` }}
                        >
                            <button 
                                onClick={() => onSelectStudent(student.studentName)}
                                className="w-full flex items-center justify-between bg-maroon/50 p-3 rounded-lg text-left transition-colors hover:bg-maroon focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-darkest"
                                aria-label={`View profile for ${student.studentName}`}
                            >
                                <div className="flex items-center">
                                    <span className={`text-lg font-bold w-8 ${getRankColor(index)}`}>{index + 1}</span>
                                    <InstrumentIcon instrument={student.primaryInstrument} className="w-6 h-6 mx-2 text-gray-400 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-white">{student.studentName}</p>
                                        <p className="text-xs text-gray-400">{student.grade}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {student.streak > 0 && (
                                        <div className="flex items-center space-x-1 text-amber-500" title={`${student.streak}-day practice streak`}>
                                            <FireIcon className="w-5 h-5" />
                                            <span className="font-semibold text-sm">{student.streak}</span>
                                        </div>
                                    )}
                                    <div className="text-right">
                                       {renderMetric(student)}
                                    </div>
                                </div>
                            </button>
                        </li>
                    ))}
            </ul>
            {leaderboardData.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <p>No practice entries found for this filter combination.</p>
                </div>
            )}
        </div>
    );
};

export default Leaderboard;