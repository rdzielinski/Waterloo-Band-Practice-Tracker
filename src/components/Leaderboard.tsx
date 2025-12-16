import React, { useMemo, useState } from 'react';
import { GradeLevel, PracticeEntry } from '../types';
import { calculateAchievements } from '../lib/achievements';
import FireIcon from './icons/FireIcon';
import { INSTRUMENT_GROUPS } from '../constants';
import { InstrumentIcon } from './icons/InstrumentIcons';
import { TimeDisplayUnit, formatDuration } from '../lib/timeUtils';
import { TrophyIcon, MedalIcon } from './icons/BadgeIcons';

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

    const getRankStyle = (index: number) => {
        if (index === 0) return {
            containerClass: 'bg-gradient-to-r from-yellow-900/40 to-maroon/20 border-l-4 border-yellow-400',
            rankClass: 'text-yellow-400',
            icon: <TrophyIcon className="w-6 h-6 text-yellow-400 flex-shrink-0" />
        };
        if (index === 1) return {
            containerClass: 'bg-gradient-to-r from-gray-700/40 to-maroon/20 border-l-4 border-gray-400',
            rankClass: 'text-gray-300',
            icon: <MedalIcon className="w-6 h-6 text-gray-300 flex-shrink-0" />
        };
        if (index === 2) return {
            containerClass: 'bg-gradient-to-r from-amber-800/40 to-maroon/20 border-l-4 border-amber-600',
            rankClass: 'text-amber-600',
            icon: <MedalIcon className="w-6 h-6 text-amber-600 flex-shrink-0" />
        };
        return {
            containerClass: 'bg-maroon/20 hover:bg-maroon/40 border-l-4 border-transparent',
            rankClass: 'text-gray-500 font-mono',
            icon: <span className="w-6 text-center font-bold text-gray-500">{index + 1}</span>
        };
    };

    const renderMetric = (student: typeof leaderboardData[0]) => {
        if (sortBy === 'streak') {
            return (
                <div className="flex flex-col items-end">
                    <div className="flex items-center space-x-1 text-amber-500" title={`${student.streak}-day practice streak`}>
                        <FireIcon className="w-5 h-5" />
                        <span className="font-bold text-lg">{student.streak}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Day Streak</p>
                </div>
            );
        }
        if (sortBy === 'averageDuration') {
            return (
                <div className="flex flex-col items-end">
                    <p className="font-bold text-lg text-gold">{student.averageDuration.toFixed(0)} min</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Avg Session</p>
                </div>
            );
        }
        
        return (
            <div className="flex flex-col items-end">
                <p className="font-bold text-lg text-gold">{formatDuration(student.totalMinutes, timeDisplayUnit)}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Total Time</p>
            </div>
        );
    };

    return (
        <div className="bg-maroon-dark p-6 rounded-xl shadow-2xl">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-maroon p-2 rounded-lg">
                        <TrophyIcon className="w-6 h-6 text-gold" />
                    </div>
                    <h3 className="text-2xl font-heading text-gold">Leaderboard</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full lg:w-auto">
                    <div className="relative">
                        <select
                            id="leaderboardSortBy"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortByType)}
                            className="w-full appearance-none bg-maroon-darkest border border-maroon rounded-lg px-4 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-gold focus:border-transparent cursor-pointer"
                        >
                            <option value="totalMinutes">Total Time</option>
                            <option value="streak">Streak</option>
                            <option value="averageDuration">Avg Session</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                    
                    <div className="relative">
                        <select
                            id="leaderboardGradeFilter"
                            value={selectedGrade}
                            onChange={(e) => setSelectedGrade(e.target.value)}
                            className="w-full appearance-none bg-maroon-darkest border border-maroon rounded-lg px-4 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-gold focus:border-transparent cursor-pointer"
                        >
                            <option value="all">All Classes</option>
                            {Object.values(GradeLevel).map((level) => (
                                <option key={level} value={level}>{level}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                    
                    <div className="relative">
                        <select
                            id="leaderboardInstrumentGroupFilter"
                            value={selectedInstrumentGroup}
                            onChange={(e) => setSelectedInstrumentGroup(e.target.value)}
                            className="w-full appearance-none bg-maroon-darkest border border-maroon rounded-lg px-4 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-gold focus:border-transparent cursor-pointer"
                        >
                            <option value="all">All Instruments</option>
                            {Object.keys(INSTRUMENT_GROUPS).map((group) => (
                                <option key={group} value={group}>{group}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-3" key={listKey}>
                {leaderboardData.map((student, index) => {
                    const style = getRankStyle(index);
                    return (
                        <div 
                            key={student.studentName}
                            className={`animate-list-item rounded-lg transition-all duration-300 ${style.containerClass}`}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <button 
                                onClick={() => onSelectStudent(student.studentName)}
                                className="w-full flex items-center justify-between p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-lg group"
                                aria-label={`View profile for ${student.studentName}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`flex items-center justify-center w-8 ${style.rankClass}`}>
                                        {style.icon}
                                    </div>
                                    
                                    <div className="flex flex-col items-start">
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-white group-hover:text-gold transition-colors text-left">{student.studentName}</p>
                                            <InstrumentIcon instrument={student.primaryInstrument} className="w-4 h-4 text-gray-500" />
                                        </div>
                                        <p className="text-xs text-gray-400">{student.grade}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    {/* Secondary metric (Streak) shown if not primary sort */}
                                    {sortBy !== 'streak' && student.streak > 2 && (
                                        <div className="hidden sm:flex items-center space-x-1 text-gray-600" title="Current streak">
                                            <FireIcon className="w-4 h-4" />
                                            <span className="text-xs font-semibold">{student.streak}</span>
                                        </div>
                                    )}
                                    {renderMetric(student)}
                                </div>
                            </button>
                        </div>
                    );
                })}
            </div>
            
            {leaderboardData.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 bg-maroon/10 rounded-lg border border-maroon border-dashed">
                    <TrophyIcon className="w-12 h-12 mb-2 opacity-20" />
                    <p>No practice entries found for these filters.</p>
                </div>
            )}
        </div>
    );
};

export default Leaderboard;