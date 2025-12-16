import React, { useMemo, useState } from 'react';
import { GradeLevel, PracticeEntry } from '../types';
import { calculateAchievements } from '../lib/achievements';
import FireIcon from './icons/FireIcon';
import { INSTRUMENT_GROUPS } from '../constants';
import { InstrumentIcon } from './icons/InstrumentIcons';
import { TimeDisplayUnit, formatDuration } from '../lib/timeUtils';
import { MedalIcon, TrophyIcon } from './icons/BadgeIcons';
import ClipboardListIcon from './icons/ClipboardListIcon';

interface FullLeaderboardProps {
    entries: PracticeEntry[];
    onSelectStudent: (studentName: string) => void;
    timeDisplayUnit: TimeDisplayUnit;
}

type SortByType = 'totalMinutes' | 'streak' | 'averageDuration';

const FullLeaderboard: React.FC<FullLeaderboardProps> = ({ entries, onSelectStudent, timeDisplayUnit }) => {
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

        return students;
    }, [entries, selectedGrade, selectedInstrumentGroup, sortBy]);

    // Create a key that changes when filters/sort change to force remount and re-animate
    const tableBodyKey = `${selectedGrade}-${selectedInstrumentGroup}-${sortBy}`;

    const renderRank = (index: number) => {
        if (index === 0) return <TrophyIcon className="w-5 h-5 text-yellow-400 mx-auto" />;
        if (index === 1) return <MedalIcon className="w-5 h-5 text-gray-300 mx-auto" />;
        if (index === 2) return <MedalIcon className="w-5 h-5 text-amber-600 mx-auto" />;
        return <span className="text-gray-500 font-mono text-sm">{index + 1}</span>;
    };

    return (
        <div className="bg-maroon-dark p-6 rounded-xl shadow-2xl flex flex-col h-full">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-maroon p-2 rounded-lg">
                        <ClipboardListIcon className="w-6 h-6 text-gold" />
                    </div>
                    <h3 className="text-2xl font-heading text-gold">Full Roster</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full lg:w-auto">
                    <div className="relative">
                        <select
                            id="fullLeaderboardSortBy"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortByType)}
                            className="w-full appearance-none bg-maroon-darkest border border-maroon rounded-lg px-4 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-gold focus:border-transparent cursor-pointer"
                        >
                            <option value="totalMinutes">Sort: Total Time</option>
                            <option value="streak">Sort: Streak</option>
                            <option value="averageDuration">Sort: Avg Session</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                    
                    <div className="relative">
                        <select
                            id="fullLeaderboardGradeFilter"
                            value={selectedGrade}
                            onChange={(e) => setSelectedGrade(e.target.value)}
                            className="w-full appearance-none bg-maroon-darkest border border-maroon rounded-lg px-4 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-gold focus:border-transparent cursor-pointer"
                        >
                            <option value="all">All Classes</option>
                            {(Object.values(GradeLevel) as GradeLevel[]).map((level) => (
                                <option key={level} value={level}>{level}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                    
                    <div className="relative">
                        <select
                            id="fullLeaderboardInstrumentGroupFilter"
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

             <div className="overflow-hidden rounded-lg border border-maroon bg-maroon-darkest flex-grow">
                <div className="overflow-x-auto max-h-[600px] scrollbar-thin scrollbar-thumb-maroon scrollbar-track-maroon-darkest">
                    <table className="min-w-full divide-y divide-maroon">
                        <thead className="bg-maroon text-gray-200 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th scope="col" className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider w-16">Rank</th>
                                <th scope="col" className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider">Student</th>
                                <th scope="col" className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider hidden sm:table-cell">Class</th>
                                <th scope="col" className="py-3 px-4 text-right text-xs font-bold uppercase tracking-wider">Total Time</th>
                                <th scope="col" className="py-3 px-4 text-right text-xs font-bold uppercase tracking-wider hidden md:table-cell">Avg Sess</th>
                                <th scope="col" className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider">Streak</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-maroon/30" key={tableBodyKey}>
                            {leaderboardData.map((student, index) => {
                                 const formattedTime = formatDuration(student.totalMinutes, timeDisplayUnit);
                                return (
                                    <tr 
                                        key={student.studentName} 
                                        className="transition-colors hover:bg-maroon/20 animate-list-item group"
                                        style={{ animationDelay: `${Math.min(index * 20, 500)}ms` }}
                                    >
                                        <td className="whitespace-nowrap py-3 px-4 text-center">
                                            {renderRank(index)}
                                        </td>
                                        <td className="whitespace-nowrap py-3 px-4 text-sm font-medium text-white">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-maroon-dark flex items-center justify-center mr-3 border border-maroon group-hover:border-gold/50 transition-colors">
                                                    <InstrumentIcon instrument={student.primaryInstrument} className="w-4 h-4 text-gray-400 group-hover:text-gold transition-colors" />
                                                </div>
                                                <button 
                                                    onClick={() => onSelectStudent(student.studentName)}
                                                    className="bg-transparent border-none p-0 m-0 font-medium text-white hover:text-gold-light hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded text-left"
                                                    aria-label={`View profile for ${student.studentName}`}
                                                >
                                                    {student.studentName}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap py-3 px-4 text-xs text-gray-400 hidden sm:table-cell">{student.grade}</td>
                                        <td className="whitespace-nowrap py-3 px-4 text-sm font-bold text-right text-gold-light font-mono">{formattedTime}</td>
                                        <td className="whitespace-nowrap py-3 px-4 text-sm text-right text-gray-300 hidden md:table-cell">{student.averageDuration.toFixed(0)}m</td>
                                        <td className="whitespace-nowrap py-3 px-4 text-center">
                                            {student.streak > 0 ? (
                                                <div className="inline-flex items-center space-x-1 px-2 py-1 rounded-full bg-amber-900/30 border border-amber-900/50">
                                                    <FireIcon className="w-3 h-3 text-amber-500" />
                                                    <span className="text-xs font-bold text-amber-500">{student.streak}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-600 text-xs">-</span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                             {leaderboardData.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-gray-500">
                                        <p className="text-lg">No students found.</p>
                                        <p className="text-sm opacity-75">Try adjusting the filters.</p>
                                    </td>
                                </tr>
                             )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FullLeaderboard;