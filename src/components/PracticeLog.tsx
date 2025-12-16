import React, { useMemo, useState } from 'react';
import { GradeLevel, PracticeEntry } from '../types';
import { InstrumentIcon } from './icons/InstrumentIcons';
import { TimeDisplayUnit, formatDuration } from '../lib/timeUtils';

interface PracticeLogProps {
    entries: PracticeEntry[];
    onSelectStudent: (studentName: string) => void;
    newlyAddedEntryId?: string | null;
    timeDisplayUnit: TimeDisplayUnit;
}

const PracticeLog: React.FC<PracticeLogProps> = ({ entries, onSelectStudent, newlyAddedEntryId, timeDisplayUnit }) => {
    const [selectedGrade, setSelectedGrade] = useState<string>('all');
    const [selectedStudent, setSelectedStudent] = useState<string>('all');
    
    const uniqueStudents = useMemo(() => {
        return [...new Set(entries.map(e => e.studentName))].sort();
    }, [entries]);

    const filteredEntries = useMemo(() => {
        return entries
            .filter(entry => selectedGrade === 'all' || entry.grade === selectedGrade)
            .filter(entry => selectedStudent === 'all' || entry.studentName === selectedStudent);
    }, [entries, selectedGrade, selectedStudent]);

    return (
        <div className="bg-maroon-dark p-6 rounded-xl shadow-2xl">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-heading text-gold">Practice Log</h3>
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                     <label htmlFor="gradeFilter" className="block text-sm font-medium text-gray-300 mb-1">Filter by Class</label>
                     <select
                        id="gradeFilter"
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value)}
                        className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-darkest"
                    >
                        <option value="all">All Classes</option>                         
                        {(Object.values(GradeLevel) as GradeLevel[]).map((level) => (
                            <option key={level} value={level}>{level}</option>
                        ))}
                    </select>
                </div>
                <div>
                     <label htmlFor="studentFilter" className="block text-sm font-medium text-gray-300 mb-1">Filter by Student</label>
                     <select
                        id="studentFilter"
                        value={selectedStudent}
                        onChange={(e) => setSelectedStudent(e.target.value)}
                        className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-darkest"
                    >
                        <option value="all">All Students</option>                         {uniqueStudents.map((student) => (
                            <option key={student} value={student}>{student}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-maroon">
                    <thead className="bg-maroon/50">
                        <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">Date</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Student</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white hidden md:table-cell">Instrument</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white hidden sm:table-cell">Class</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Duration</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-maroon/50">
                        {filteredEntries.map(entry => (
                            <tr key={entry.id} className={`transition-colors hover:bg-maroon/30 ${entry.id === newlyAddedEntryId ? 'animate-flash' : ''}`}>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-300 sm:pl-6">{new Date(entry.date).toLocaleDateString()}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-white">
                                    <button 
                                        onClick={() => onSelectStudent(entry.studentName)}
                                        className="bg-transparent border-none p-0 m-0 font-medium text-white hover:text-gold-light hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
                                        aria-label={`View profile for ${entry.studentName}`}
                                    >
                                        {entry.studentName}
                                    </button>
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400 hidden md:table-cell">
                                    <div className="flex items-center space-x-2">
                                        <InstrumentIcon instrument={entry.instrument} className="w-5 h-5 text-gray-500" />
                                        <span>{entry.instrument}</span>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400 hidden sm:table-cell">{entry.grade}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-gold">{formatDuration(entry.duration, timeDisplayUnit)}</td>
                            </tr>
                        ))}
                         {filteredEntries.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-500">No entries match the current filters.</td>
                            </tr>
                         )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PracticeLog;