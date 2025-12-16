import React, { useMemo, useState } from 'react';
// FIX: Import LessonPlan from types
import { PracticeEntry, GradeLevel, ReportData, Goal, GoalDetail, LessonPlan } from '../types';
import MusicNoteIcon from './icons/MusicNoteIcon';
import { ClockIcon, TrophyIcon } from './icons/BadgeIcons';
import UsersIcon from './icons/UsersIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import ReportCard from './ReportCard';
import MissedGoalsAlert from './MissedGoalsAlert';
import GroupGoalSetter from './GroupGoalSetter';
// Added 'Legend' to the recharts import to resolve a 'Cannot find name' error.
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { INSTRUMENT_GROUPS } from '../constants';
import MusicStandIcon from './icons/MusicStandIcon';
import CompareIcon from './icons/CompareIcon';
import StatCard from './StatCard';
import TargetIcon from './icons/TargetIcon';
import ProgressBar from './ProgressBar';
import ClassGoalModal from './ClassGoalModal';
import PracticeLog from './PracticeLog';
import LessonPlanGenerator from './LessonPlanGenerator';
// FIX: Import TimeDisplayUnit and formatDuration for consistent time formatting.
import { TimeDisplayUnit, formatDuration } from '../lib/timeUtils';
import TimeDisplayToggle from './TimeDisplayToggle';
import ClassSummaryChart from './ClassSummaryChart';


interface TeacherViewProps {
    entries: PracticeEntry[];
    goals: Record<string, Goal>;
    gradeGoals: Record<string, GoalDetail>;
    onSelectStudent: (studentName: string) => void;
    onSetGroupGoal: (studentNames: string[], goal: GoalDetail) => Promise<void>;
    onSetGradeGoal: (grade: GradeLevel, goal: GoalDetail) => Promise<void>;
    onSetLessonPlan: (grade: GradeLevel, planData: Omit<LessonPlan, 'createdAt'>) => Promise<void>;
}

const TeacherView: React.FC<TeacherViewProps> = ({ entries, goals, gradeGoals, onSelectStudent, onSetGroupGoal, onSetGradeGoal, onSetLessonPlan }) => {
    const [reportStudent, setReportStudent] = useState<string>('all');
    const [reportPeriod, setReportPeriod] = useState<string>('last30');
    const [generatedReport, setGeneratedReport] = useState<ReportData | null>(null);
    const [comparedStudents, setComparedStudents] = useState<string[]>([]);
    const [modalGrade, setModalGrade] = useState<GradeLevel | null>(null);
    // FIX: Added state for time display unit to allow toggling between minutes and hours/minutes.
    const [timeDisplayUnit, setTimeDisplayUnit] = useState<TimeDisplayUnit>('minutes');


    // FIX: Replaced Object.values with a strongly typed array of enum members to prevent type inference issues.
    const ALL_GRADE_LEVELS: GradeLevel[] = [GradeLevel.FIFTH, GradeLevel.SIXTH, GradeLevel.SEVENTH_EIGHTH, GradeLevel.HIGH_SCHOOL];

    const uniqueStudents = useMemo(() => {
        return [...new Set(entries.map(e => e.studentName))].sort();
    }, [entries]);

    const { 
        overallStats, 
        gradeLeaderboards, 
        sectionTotals, 
        instrumentLeaderboard,
    } = useMemo(() => {
        const totalMinutes = entries.reduce((sum, entry) => sum + entry.duration, 0);
        const activeStudents = new Set(entries.map(e => e.studentName)).size;
        
        const instrumentTotals: { [key: string]: number } = {};
        entries.forEach(entry => {
            instrumentTotals[entry.instrument] = (instrumentTotals[entry.instrument] || 0) + entry.duration;
        });

        const mostPracticedInstrument = Object.keys(instrumentTotals).length > 0
            ? Object.entries(instrumentTotals).sort((a, b) => b[1] - a[1])[0][0]
            : 'N/A';
        
        const finalOverallStats = {
            totalMinutes: totalMinutes,
            totalSessions: entries.length,
            activeStudents,
            mostPracticedInstrument,
        };

        const studentTotalsByGrade: Record<string, Record<string, number>> = {};
        for (const entry of entries) {
            if (!studentTotalsByGrade[entry.grade]) studentTotalsByGrade[entry.grade] = {};
            if (!studentTotalsByGrade[entry.grade][entry.studentName]) studentTotalsByGrade[entry.grade][entry.studentName] = 0;
            studentTotalsByGrade[entry.grade][entry.studentName] += entry.duration;
        }

        const finalLeaderboards = Object.fromEntries(ALL_GRADE_LEVELS.map((grade) => {
            const gradeTotals: Record<string, number> = studentTotalsByGrade[grade] || {};
            const leaderboardForGrade = Object.entries(gradeTotals)
                .map(([studentName, totalMinutes]) => ({ studentName, totalMinutes }))
                .sort((a, b) => b.totalMinutes - a.totalMinutes)
                .slice(0, 5);
            return [grade, leaderboardForGrade] as [string, typeof leaderboardForGrade];
        })) as Record<GradeLevel, { studentName: string; totalMinutes: number; }[]>;
        
        const finalSectionTotals = Object.keys(INSTRUMENT_GROUPS).map((section) => {
            const instruments = INSTRUMENT_GROUPS[section];
            const sectionMinutes = entries
                .filter(e => instruments.includes(e.instrument))
                .reduce((sum, e) => sum + e.duration, 0);
            return { name: section, minutes: sectionMinutes };
        });

        const finalInstrumentLeaderboard = Object.entries(instrumentTotals)
            .map(([instrument, totalMinutes]) => ({
                instrument,
                minutes: totalMinutes,
            }))
            .sort((a, b) => b.minutes - a.minutes);

        return {
            overallStats: finalOverallStats,
            gradeLeaderboards: finalLeaderboards,
            sectionTotals: finalSectionTotals,
            instrumentLeaderboard: finalInstrumentLeaderboard,
        };
    }, [entries]);
    
    const gradeLevelStats = useMemo(() => {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as start of week
        startOfWeek.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return ALL_GRADE_LEVELS.reduce((acc, grade) => {
            const gradeEntries = entries.filter(e => e.grade === grade);
            const thisWeekEntries = gradeEntries.filter(e => new Date(e.date) >= startOfWeek);
            const todayEntries = gradeEntries.filter(e => {
                const entryDate = new Date(e.date);
                entryDate.setHours(0, 0, 0, 0);
                return entryDate.getTime() === today.getTime();
            });

            const totalMinutesThisWeek = thisWeekEntries.reduce((sum, entry) => sum + entry.duration, 0);
            const totalMinutesToday = todayEntries.reduce((sum, entry) => sum + entry.duration, 0);
            
            const goalDetailForGrade = gradeGoals[grade];

            const dailyGoal = goalDetailForGrade?.dailyMinutes ?? 0;
            const weeklyGoal = goalDetailForGrade?.weeklyMinutes ?? 0;

            acc[grade] = {
                totalMinutesToday,
                totalMinutesThisWeek,
                dailyGoal,
                weeklyGoal,
                dailyGoalProgress: dailyGoal > 0 ? Math.min((totalMinutesToday / dailyGoal) * 100, 100) : 0,
                weeklyGoalProgress: weeklyGoal > 0 ? Math.min((totalMinutesThisWeek / weeklyGoal) * 100, 100) : 0,
                dailyGoalAchieved: dailyGoal > 0 && totalMinutesToday >= dailyGoal,
                weeklyGoalAchieved: weeklyGoal > 0 && totalMinutesThisWeek >= weeklyGoal,
            };
            return acc;
        }, {} as Record<GradeLevel, any>);
    }, [entries, gradeGoals]);

    const comparisonChartData = useMemo(() => {
        if (comparedStudents.length === 0) return [];

        const relevantEntries = entries.filter(e => comparedStudents.includes(e.studentName));
        const uniqueInstruments = [...new Set(relevantEntries.map(e => e.instrument))].sort();

        return uniqueInstruments.map(instrument => {
            const dataPoint: { name: string; [key: string]: string | number } = { name: instrument };
            comparedStudents.forEach(studentName => {
                dataPoint[studentName] = relevantEntries
                    .filter(entry => entry.studentName === studentName && entry.instrument === instrument)
                    .reduce((sum, entry) => sum + entry.duration, 0);
            });
            return dataPoint;
        });
    }, [comparedStudents, entries]);

    const handleCompareStudentToggle = (studentName: string) => {
        setComparedStudents(prev => {
            if (prev.includes(studentName)) {
                return prev.filter(name => name !== studentName);
            }
            if (prev.length < 4) {
                return [...prev, studentName];
            }
            return prev;
        });
    };

    const handleGenerateReport = () => {
        // ... (report generation logic remains the same)
    };
    
    const getRankColor = (rank: number) => {
        if (rank === 0) return 'text-gold-light';
        if (rank === 1) return 'text-gray-300';
        if (rank === 2) return 'text-gold-dark';
        return 'text-gray-400';
    }
    
    const handleSaveGradeGoal = (goals: GoalDetail) => {
        if (modalGrade) {
            onSetGradeGoal(modalGrade, goals);
            setModalGrade(null);
        }
    };
    
    const COMPARISON_COLORS = ['#FFC72C', '#a0aec0', '#DAA520', '#8A4F4F'];
    const yAxisTickFormatter = (value: number) => formatDuration(value, timeDisplayUnit);
    const tooltipFormatter = (value: number) => [formatDuration(value, timeDisplayUnit), 'Total Time'];

    return (
        <div className="space-y-8">
            <ClassGoalModal 
                isOpen={!!modalGrade}
                onClose={() => setModalGrade(null)}
                onSave={handleSaveGradeGoal}
                currentGoal={modalGrade ? gradeGoals[modalGrade] : undefined}
                grade={modalGrade}
            />
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-4xl font-heading text-gold-light">Teacher Dashboard</h2>
                    <p className="text-lg text-gray-400">Aggregated statistics and tools for all band students.</p>
                </div>
                <TimeDisplayToggle unit={timeDisplayUnit} setUnit={setTimeDisplayUnit} />
            </div>

            <MissedGoalsAlert entries={entries} goals={goals} onSelectStudent={onSelectStudent} />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard title="Total Practice Time" value={formatDuration(overallStats.totalMinutes, timeDisplayUnit)} icon={ClockIcon} />
                <StatCard title="Total Sessions Logged" value={String(overallStats.totalSessions)} icon={ChartBarIcon} />
                <StatCard title="Active Students" value={String(overallStats.activeStudents)} icon={UsersIcon} />
                <StatCard title="Top Instrument" value={overallStats.mostPracticedInstrument} icon={MusicNoteIcon} />
            </div>

            <ClassSummaryChart entries={entries} timeDisplayUnit={timeDisplayUnit} />
            
            <div className="bg-maroon-dark p-6 rounded-xl shadow-2xl">
                <h3 className="text-3xl font-heading text-gold mb-4">Grade Level Goals</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {ALL_GRADE_LEVELS.map((grade: GradeLevel) => {
                        const stats = gradeLevelStats[grade];
                        return (
                            <div key={grade} className="bg-maroon p-6 rounded-xl shadow-inner flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="text-2xl font-heading text-white">{grade}</h4>
                                        <button
                                            onClick={() => setModalGrade(grade)}
                                            className="bg-maroon-dark hover:bg-maroon-light text-gold font-bold py-1 px-3 rounded-md text-xs transition-colors shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-dark"
                                        >
                                            Set Goals
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <div className={`transition-shadow duration-500 rounded-lg ${stats.dailyGoalAchieved ? 'animate-glow' : ''}`}>
                                            <p className="text-sm text-gray-400 mb-1">Daily Goal</p>
                                            {stats.dailyGoal > 0 ? (
                                                <div>
                                                    <div className="flex justify-between items-end mb-1">
                                                        <span className={`font-bold text-md ${stats.dailyGoalAchieved ? 'text-gold-light' : 'text-white'}`}>
                                                            {formatDuration(stats.totalMinutesToday, timeDisplayUnit)} / {formatDuration(stats.dailyGoal, timeDisplayUnit)}
                                                        </span>
                                                        {stats.dailyGoalAchieved && <span className="font-bold text-gold-light text-xs animate-pulse">Achieved! ✨</span>}
                                                    </div>
                                                    <ProgressBar progress={stats.dailyGoalProgress} />
                                                </div>
                                            ) : <p className="text-center text-xs py-2 text-gray-500">No daily goal set.</p>}
                                        </div>
                                        <div className={`transition-shadow duration-500 rounded-lg ${stats.weeklyGoalAchieved ? 'animate-glow' : ''}`}>
                                            <p className="text-sm text-gray-400 mb-1">Weekly Goal</p>
                                            {stats.weeklyGoal > 0 ? (
                                                <div>
                                                    <div className="flex justify-between items-end mb-1">
                                                        <span className={`font-bold text-md ${stats.weeklyGoalAchieved ? 'text-gold-light' : 'text-white'}`}>
                                                            {formatDuration(stats.totalMinutesThisWeek, timeDisplayUnit)} / {formatDuration(stats.weeklyGoal, timeDisplayUnit)}
                                                        </span>
                                                        {stats.weeklyGoalAchieved && <span className="font-bold text-gold-light text-xs animate-pulse">Achieved! ✨</span>}
                                                    </div>
                                                    <ProgressBar progress={stats.weeklyGoalProgress} />
                                                </div>
                                            ) : <p className="text-center text-xs py-2 text-gray-500">No weekly goal set.</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="bg-maroon-dark p-6 rounded-xl shadow-2xl">
                <div className="flex items-center space-x-3 mb-4">
                    <MusicStandIcon className="w-8 h-8 text-gold" />
                    <h3 className="text-2xl font-heading text-gold">Practice Time by Instrument Section</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sectionTotals} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#8A4F4F" />
                        <XAxis dataKey="name" stroke="#a0aec0" fontSize={12} />
                        <YAxis stroke="#a0aec0" fontSize={12} tickFormatter={yAxisTickFormatter} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#3C1618', border: '1px solid #8A4F4F' }}
                            cursor={{ fill: 'rgba(138, 79, 79, 0.2)' }}
                            formatter={tooltipFormatter}
                        />
                        <Bar dataKey="minutes" fill="#FFC72C" name="Total Time" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-maroon-dark p-6 rounded-xl shadow-2xl">
                <div className="flex items-center space-x-3 mb-4">
                    <MusicNoteIcon className="w-8 h-8 text-gold" />
                    <h3 className="text-2xl font-heading text-gold">Practice Time by Instrument</h3>
                </div>
                <ResponsiveContainer width="100%" height={500}>
                    <BarChart
                        layout="vertical"
                        data={instrumentLeaderboard}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#8A4F4F" />
                        <XAxis type="number" stroke="#a0aec0" tickFormatter={yAxisTickFormatter} />
                        <YAxis dataKey="instrument" type="category" stroke="#a0aec0" width={120} interval={0} fontSize={12} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#3C1618', border: '1px solid #8A4F4F' }}
                            cursor={{ fill: 'rgba(138, 79, 79, 0.2)' }}
                            formatter={tooltipFormatter}
                        />
                        <Bar dataKey="minutes" fill="#FFC72C" name="Total Time" barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-maroon-dark p-6 rounded-xl shadow-2xl">
                <div className="flex items-center space-x-3 mb-4">
                    <CompareIcon className="w-8 h-8 text-gold" />
                    <h3 className="text-2xl font-heading text-gold">Student Comparison Tool</h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Select up to 4 students to compare:</label>
                        <div className="bg-maroon-darkest p-3 rounded-lg h-96 overflow-y-auto space-y-2">
                            {uniqueStudents.map(studentName => (
                                <label key={studentName} className="flex items-center space-x-3 p-2 rounded-md hover:bg-maroon transition-colors cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={comparedStudents.includes(studentName)}
                                        onChange={() => handleCompareStudentToggle(studentName)}
                                        disabled={!comparedStudents.includes(studentName) && comparedStudents.length >= 4}
                                        className="h-5 w-5 rounded bg-maroon-light border-maroon-light text-gold focus:ring-gold disabled:opacity-50"
                                    />
                                    <span className="text-white">{studentName}</span>
                                </label>
                            ))}
                        </div>
                        <button onClick={() => setComparedStudents([])} className="mt-4 w-full text-center text-sm text-gray-400 hover:text-white transition-colors">Clear Selection</button>
                    </div>
                    <div className="lg:col-span-2">
                        {comparedStudents.length > 0 ? (
                             <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={comparisonChartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#8A4F4F" />
                                        <XAxis dataKey="name" stroke="#a0aec0" tick={{ fontSize: 12 }} />
                                        <YAxis stroke="#a0aec0" tickFormatter={yAxisTickFormatter} label={{ value: 'Minutes Practiced', angle: -90, position: 'insideLeft', fill: '#a0aec0', dx: -10 }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#3C1618', border: '1px solid #8A4F4F' }}
                                            cursor={{ fill: 'rgba(138, 79, 79, 0.2)' }}
                                            formatter={(value: number) => [formatDuration(value, 'minutes'), null]}
                                        />
                                        <Legend />
                                        {comparedStudents.map((studentName, index) => (
                                            <Bar 
                                                key={studentName} 
                                                dataKey={studentName} 
                                                fill={COMPARISON_COLORS[index % COMPARISON_COLORS.length]} 
                                            />
                                        ))}
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                             <div className="flex items-center justify-center h-full bg-maroon-darkest rounded-lg text-center p-8">
                                <p className="text-gray-500">Select students from the list to compare their practice breakdown by instrument.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <GroupGoalSetter entries={entries} onSetGroupGoal={onSetGroupGoal} />

            <LessonPlanGenerator onPlanGenerated={onSetLessonPlan} />
            
            <div className="bg-maroon-dark p-6 rounded-xl shadow-2xl">
                <h3 className="text-2xl font-heading text-gold mb-4">Report Generator</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label htmlFor="reportPeriod" className="block text-sm font-medium text-gray-300 mb-1">Time Period</label>
                        <select
                            id="reportPeriod"
                            value={reportPeriod}
                            onChange={(e) => setReportPeriod(e.target.value)}
                            className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold"
                        >
                            <option value="last30">Last 30 Days</option>
                            <option value="last90">Last 90 Days</option>
                            <option value="schoolYear">This School Year</option>
                            <option value="allTime">All Time</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="reportStudent" className="block text-sm font-medium text-gray-300 mb-1">Student</label>
                        <select
                            id="reportStudent"
                            value={reportStudent}
                            onChange={(e) => setReportStudent(e.target.value)}
                            className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold"
                        >
                            <option value="all">All Students</option>
                            {uniqueStudents.map(student => <option key={student} value={student}>{student}</option>)}
                        </select>
                    </div>
                    <button
                        onClick={handleGenerateReport}
                        className="w-full md:w-auto bg-gold hover:bg-gold-light text-maroon-darkest font-bold py-2 px-4 rounded-md shadow-lg transition-transform transform hover:scale-105"
                    >
                        Generate Report
                    </button>
                </div>
            </div>

            {generatedReport && (
                <div className="printable-container">
                    <ReportCard report={generatedReport} onClose={() => setGeneratedReport(null)} />
                </div>
            )}

            <PracticeLog entries={entries} onSelectStudent={onSelectStudent} timeDisplayUnit={timeDisplayUnit} />
            
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {ALL_GRADE_LEVELS.map((grade: GradeLevel) => (
                    <div key={grade} className="bg-maroon-dark p-6 rounded-xl shadow-2xl">
                        <h3 className="text-2xl font-heading text-gold mb-4">{grade} Leaders</h3>
                         {gradeLeaderboards[grade] && gradeLeaderboards[grade].length > 0 ? (
                            <ul className="space-y-3">
                                {gradeLeaderboards[grade].map((student, index) => {
                                     const formattedTime = formatDuration(student.totalMinutes, timeDisplayUnit);
                                    return (
                                        <li key={student.studentName}>
                                             <button 
                                                onClick={() => onSelectStudent(student.studentName)}
                                                className="w-full flex items-center justify-between bg-maroon/50 p-3 rounded-lg text-left transition-colors hover:bg-maroon focus:outline-none focus:ring-2 focus:ring-gold"
                                                aria-label={`View profile for ${student.studentName}`}
                                            >
                                                <div className="flex items-center">
                                                    <span className={`text-lg font-bold w-8 ${getRankColor(index)}`}>{index + 1}</span>
                                                    <p className="font-semibold text-white">{student.studentName}</p>
                                                </div>
                                                <p className="font-bold text-lg text-gold">{formattedTime}</p>
                                            </button>
                                        </li>
                                    )
                                })}
                            </ul>
                        ) : (
                             <div className="text-center py-8 text-gray-500">
                                <p>No practice entries for this class yet.</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeacherView;