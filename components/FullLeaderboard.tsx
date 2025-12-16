import React, { useMemo, useState } from 'react';
import { GradeLevel, PracticeEntry } from '../types';
import { calculateAchievements } from '../lib/achievements';
import FireIcon from './icons/FireIcon';
import { INSTRUMENT_GROUPS } from '../constants';
import { InstrumentIcon } from './icons/InstrumentIcons';
import { TimeDisplayUnit, formatDuration } from '../lib/timeUtils';

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

    const getRankColor = (rank: number) => {
        if (rank === 0) return 'text-gold-light';
        if (rank === 1) return 'text-gray-300';
        if (rank === 2) return 'text-gold-dark';
        return 'text-gray-400';
    }

    return (
        <div className="bg-maroon-dark p-6 rounded-xl shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                <h3 className="text-2xl font-heading text-gold">Full Student Leaderboard</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                    <div>
                        <label htmlFor="fullLeaderboardSortBy" className="sr-only">Sort by</label>
                        <select
                            id="fullLeaderboardSortBy"
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
                        <label htmlFor="fullLeaderboardGradeFilter" className="sr-only">Filter by Class</label>
                        <select
                            id="fullLeaderboardGradeFilter"
                            value={selectedGrade}
                            onChange={(e) => setSelectedGrade(e.target.value)}
                            className="w-full sm:w-auto bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-darkest"
                        >
                            <option value="all">All Classes</option>
                            {(Object.values(GradeLevel) as GradeLevel[]).map((level) => (
                                <option key={level} value={level}>{level}</option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="fullLeaderboardInstrumentGroupFilter" className="sr-only">Filter by Instrument Group</label>
                        <select
                            id="fullLeaderboardInstrumentGroupFilter"
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

             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-maroon">
                    <thead className="bg-maroon/50">
                        <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6 w-16">Rank</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Student</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white hidden sm:table-cell">Class</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Total Time</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white hidden md:table-cell">Avg Session</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Streak</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-maroon/50" key={tableBodyKey}>
                        {leaderboardData.map((student, index) => {
                             const formattedTime = formatDuration(student.totalMinutes, timeDisplayUnit);
                            return (
                                <tr 
                                    key={student.studentName} 
                                    className="transition-colors hover:bg-maroon/30 animate-list-item"
                                    style={{ animationDelay: `${index * 20}ms` }}
                                >
                                    <td className={`whitespace-nowrap py-4 pl-4 pr-3 text-lg font-bold sm:pl-6 ${getRankColor(index)}`}>{index + 1}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-white">
                                        <div className="flex items-center">
                                            <InstrumentIcon instrument={student.primaryInstrument} className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0" />
                                            <button 
                                                onClick={() => onSelectStudent(student.studentName)}
                                                className="bg-transparent border-none p-0 m-0 font-medium text-white hover:text-gold-light hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
                                                aria-label={`View profile for ${student.studentName}`}
                                            >
                                                {student.studentName}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400 hidden sm:table-cell">{student.grade}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-gold">{formattedTime}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-gold hidden md:table-cell">{student.averageDuration.toFixed(0)} min</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                                        {student.streak > 0 ? (
                                            <div className="flex items-center space-x-1 text-amber-500" title={`${student.streak}-day practice streak`}>
                                                <FireIcon className="w-5 h-5" />
                                                <span className="font-semibold">{student.streak}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-500">0</span>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                         {leaderboardData.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-gray-500">No entries match the current filters.</td>
                            </tr>
                         )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FullLeaderboard;