import React, { useMemo, useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';
import { PracticeEntry, Goal, GoalDetail } from '../types';
import { ALL_BADGES, calculateAchievements } from '../lib/achievements';
import BackArrowIcon from './icons/BackArrowIcon';
import FireIcon from './icons/FireIcon';
import GoalModal from './GoalModal';
import ProgressBar from './ProgressBar';
import TargetIcon from './icons/TargetIcon';
import PieChartIcon from './icons/PieChartIcon';
import EditEntryModal from './EditEntryModal';
import PencilIcon from './icons/PencilIcon';
import { InstrumentIcon } from './icons/InstrumentIcons';
import AICoachCorner from './AICoachCorner';
import ChatBubbleIcon from './icons/ChatBubbleIcon';
import ConfirmationModal from './ConfirmationModal';
import TrashIcon from './icons/TrashIcon';
import { usePrevious } from '../lib/usePrevious';
import Confetti from './Confetti';
import MusicNoteIcon from './icons/MusicNoteIcon';


interface StudentProfileProps {
    studentName: string;
    entries: PracticeEntry[];
    onBack?: () => void;
    goals: Record<string, Goal>;
    onSetGoal: (studentName: string, goal: Goal) => Promise<void>;
    isTeacher: boolean;
    onUpdateEntry: (entryId: string, data: Partial<Omit<PracticeEntry, 'id'>>) => Promise<void>;
    onDeleteEntry: (entryId: string) => Promise<void>;
    isOwner?: boolean;
}

const StudentProfile: React.FC<StudentProfileProps> = ({ studentName, entries, onBack, goals, onSetGoal, isTeacher, onUpdateEntry, onDeleteEntry, isOwner = false }) => {
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [entryToEdit, setEntryToEdit] = useState<PracticeEntry | null>(null);
    const [entryToDelete, setEntryToDelete] = useState<PracticeEntry | null>(null);
    const [editingNote, setEditingNote] = useState<{ entryId: string; text: string } | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);


    const studentEntries = useMemo(() => 
        entries
            .filter(e => e.studentName === studentName)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        [entries, studentName]
    );

    const studentGoal = goals[studentName];

    const {
        totalMinutes,
        averageDuration,
        grade,
        streak,
        earnedBadges,
        chartData,
        minutesThisWeek,
        minutesToday,
        instrumentData,
        yearlyChartData,
        latestFeedbackEntry,
        weeklyGoalAchieved,
        dailyGoalAchieved,
        minutesByInstrumentThisWeek,
        minutesByInstrumentToday,
    } = useMemo(() => {
        const { earnedBadges, streak } = calculateAchievements(studentEntries);

        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as start of week
        startOfWeek.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const thisWeekEntries = studentEntries.filter(e => new Date(e.date) >= startOfWeek);
        const currentWeekMinutes = thisWeekEntries.reduce((sum, entry) => sum + entry.duration, 0);

        const todayEntries = studentEntries.filter(e => {
            const entryDate = new Date(e.date);
            entryDate.setHours(0, 0, 0, 0);
            return entryDate.getTime() === today.getTime();
        });
        const currentDayMinutes = todayEntries.reduce((sum, entry) => sum + entry.duration, 0);
        
        const instMinutesThisWeek: Record<string, number> = {};
        thisWeekEntries.forEach(entry => {
            instMinutesThisWeek[entry.instrument] = (instMinutesThisWeek[entry.instrument] || 0) + entry.duration;
        });

        const instMinutesToday: Record<string, number> = {};
        todayEntries.forEach(entry => {
            instMinutesToday[entry.instrument] = (instMinutesToday[entry.instrument] || 0) + entry.duration;
        });

        const feedbackEntry = studentEntries.find(e => e.aiCoachResponse);

        const currentStudentGoal = goals[studentName];
        const weeklyGoal = Number(currentStudentGoal?.overall?.weeklyMinutes ?? 0);
        const dailyGoal = Number(currentStudentGoal?.overall?.dailyMinutes ?? 0);


        if (studentEntries.length === 0) {
            return {
                totalMinutes: 0,
                averageDuration: '0.0',
                grade: 'N/A',
                streak: 0,
                earnedBadges: [],
                chartData: [],
                minutesThisWeek: 0,
                minutesToday: 0,
                instrumentData: [],
                yearlyChartData: [],
                latestFeedbackEntry: null,
                weeklyGoalAchieved: false,
                dailyGoalAchieved: false,
                minutesByInstrumentThisWeek: {},
                minutesByInstrumentToday: {},
            };
        }

        const total = studentEntries.reduce((sum, entry) => sum + entry.duration, 0);
        const avg = (total / studentEntries.length).toFixed(1);
        const mostRecentGrade = studentEntries[0]?.grade || 'N/A';
        
        const reversedEntries = [...studentEntries].reverse().slice(-30);
        const lineChartData = reversedEntries.map(entry => ({
            date: new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            duration: entry.duration,
        }));
        
        const instrumentTotals: { [instrument: string]: number } = {};
        studentEntries.forEach(entry => {
            if (!instrumentTotals[entry.instrument]) {
                instrumentTotals[entry.instrument] = 0;
            }
            instrumentTotals[entry.instrument] += entry.duration;
        });

        const pieChartData = Object.entries(instrumentTotals).map(([name, value]) => ({
            name,
            value,
        }));
        
        // Yearly chart data calculation
        const yearlyMonths = [...Array(12)].map((_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - (11 - i));
            return d.toLocaleString('default', { month: 'short' });
        });
        const yearlyTotals = Array(12).fill(0);
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
        twelveMonthsAgo.setDate(1);
        twelveMonthsAgo.setHours(0, 0, 0, 0);

        studentEntries.forEach(entry => {
            const entryDate = new Date(entry.date);
            if (entryDate >= twelveMonthsAgo) {
                const monthsAgo = (now.getFullYear() - entryDate.getFullYear()) * 12 + (now.getMonth() - entryDate.getMonth());
                const index = 11 - monthsAgo;
                if (index >= 0 && index < 12) {
                    yearlyTotals[index] += entry.duration;
                }
            }
        });

        const finalYearlyChartData = yearlyMonths.map((month, index) => ({
            name: month,
            hours: parseFloat((yearlyTotals[index] / 60).toFixed(1)),
        }));


        return {
            totalMinutes: total,
            averageDuration: avg,
            grade: mostRecentGrade,
            streak,
            earnedBadges,
            chartData: lineChartData,
            minutesThisWeek: currentWeekMinutes,
            minutesToday: currentDayMinutes,
            instrumentData: pieChartData,
            yearlyChartData: finalYearlyChartData,
            latestFeedbackEntry: feedbackEntry,
            weeklyGoalAchieved: weeklyGoal > 0 && currentWeekMinutes >= weeklyGoal,
            dailyGoalAchieved: dailyGoal > 0 && currentDayMinutes >= dailyGoal,
            minutesByInstrumentThisWeek: instMinutesThisWeek,
            minutesByInstrumentToday: instMinutesToday,
        };
    }, [studentEntries, goals, studentName]);

    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    const weeklyGoal = Number(studentGoal?.overall?.weeklyMinutes ?? 0);
    const weeklyGoalProgress = weeklyGoal > 0 ? Math.min((minutesThisWeek / weeklyGoal) * 100, 100) : 0;
    
    const dailyGoal = Number(studentGoal?.overall?.dailyMinutes ?? 0);
    const dailyGoalProgress = dailyGoal > 0 ? Math.min((minutesToday / dailyGoal) * 100, 100) : 0;
    
    const instrumentGoalEntries = Object.entries(studentGoal?.instruments || {}).filter(
      // Cast goal to GoalDetail because TypeScript infers it as `unknown` from Object.entries.
      ([_, goal]) => (Number((goal as GoalDetail).weeklyMinutes ?? 0)) > 0 || (Number((goal as GoalDetail).dailyMinutes ?? 0)) > 0
    );

    const prevGoalsAchieved = usePrevious({ weeklyGoalAchieved, dailyGoalAchieved });

    useEffect(() => {
        if (prevGoalsAchieved) {
            const justAchievedWeekly = !prevGoalsAchieved.weeklyGoalAchieved && weeklyGoalAchieved;
            const justAchievedDaily = !prevGoalsAchieved.dailyGoalAchieved && dailyGoalAchieved;

            if (justAchievedWeekly || justAchievedDaily) {
                setShowConfetti(true);
            }
        }
    }, [weeklyGoalAchieved, dailyGoalAchieved, prevGoalsAchieved]);


    const handleSaveGoal = async (newGoals: Goal) => {
        await onSetGoal(studentName, newGoals);
        setIsGoalModalOpen(false);
    };

    const handleConfirmDelete = async () => {
        if (!entryToDelete) return;
        await onDeleteEntry(entryToDelete.id);
        setEntryToDelete(null); // Close modal on success
    };
    
    const handleEditNoteClick = (entry: PracticeEntry) => {
        setEditingNote({ entryId: entry.id, text: entry.teacherNotes || '' });
    };

    const handleCancelEditNote = () => {
        setEditingNote(null);
    };

    const handleSaveNote = async () => {
        if (!editingNote) return;
        try {
            await onUpdateEntry(editingNote.entryId, { teacherNotes: editingNote.text.trim() });
            setEditingNote(null);
        } catch (error) {
            console.error("Failed to save teacher note:", error);
            alert("Could not save the note. Please try again.");
        }
    };


    const PIE_COLORS = ['#FFC72C', '#DAA520', '#8A4F4F', '#a0aec0', '#6D282B'];
    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent * 100 < 5) return null; // Don't render labels for tiny slices

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={14} fontWeight="bold">
                {`%${(percent * 100).toFixed(0)}`}
            </text>
        );
    };

    const renderCustomLegend = (props: any) => {
        const { payload } = props;
        return (
            <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 mt-4 text-sm text-gray-300">
                {payload.map((entry: any, index: number) => (
                    <div key={`item-${index}`} className="flex items-center space-x-2">
                        <InstrumentIcon 
                            instrument={entry.value} 
                            className="w-4 h-4" 
                            style={{ color: entry.color }}
                        />
                        <span>{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    };
    
    return (
        <div className="space-y-8">
            {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
            <GoalModal
                isOpen={isGoalModalOpen}
                onClose={() => setIsGoalModalOpen(false)}
                onSave={handleSaveGoal}
                studentName={studentName}
                currentGoal={studentGoal}
                studentInstruments={[...new Set(studentEntries.map(e => e.instrument))]}
            />
            <EditEntryModal
                isOpen={!!entryToEdit}
                onClose={() => setEntryToEdit(null)}
                onSave={onUpdateEntry}
                entry={entryToEdit}
            />
            <ConfirmationModal
                isOpen={!!entryToDelete}
                onClose={() => setEntryToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Confirm Deletion"
                confirmText="Delete"
                confirmButtonVariant="danger"
            >
                <p>Are you sure you want to permanently delete this practice entry?</p>
                {entryToDelete && (
                    <div className="mt-4 bg-maroon p-3 rounded-md text-sm">
                        <p><span className="font-semibold text-gray-400">Date:</span> {new Date(entryToDelete.date).toLocaleDateString()}</p>
                        <p><span className="font-semibold text-gray-400">Instrument:</span> {entryToDelete.instrument}</p>
                        <p><span className="font-semibold text-gray-400">Duration:</span> {entryToDelete.duration} min</p>
                    </div>
                )}
            </ConfirmationModal>

            {onBack && (
                <div className="flex items-center">
                    <button 
                        onClick={onBack} 
                        className="flex items-center space-x-2 text-sm text-gold hover:text-gold-light transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-md p-2 -ml-2"
                        aria-label={isTeacher ? "Back to dashboard" : "Back to my dashboard"}
                    >
                        <BackArrowIcon className="w-5 h-5" />
                        <span>{isTeacher ? "Back to Dashboard" : "Back to My Dashboard"}</span>
                    </button>
                </div>
            )}
            
            <div className="text-center">
                <h2 className="text-4xl font-heading text-gold-light">{studentName}</h2>
                <p className="text-lg text-gray-400">{grade}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-maroon-dark p-6 rounded-lg shadow-inner text-center">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Total Practice Time</h3>
                    <p className="text-5xl font-bold text-gold">{totalHours}<span className="text-2xl">h</span> {remainingMinutes}<span className="text-2xl">m</span></p>
                    <p className="text-xs text-gray-500 mt-1">{totalMinutes} total minutes</p>
                </div>
                 <div className="bg-maroon-dark p-6 rounded-lg shadow-inner text-center flex flex-col items-center justify-center">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Practice Streak</h3>
                    <div className="flex items-center space-x-2">
                        <FireIcon className={`w-12 h-12 ${streak > 0 ? 'text-amber-500' : 'text-gray-600'}`} />
                        <p className="text-5xl font-bold text-gold">{streak}<span className="text-2xl"> days</span></p>
                    </div>
                     <p className="text-xs text-gray-500 mt-1">Consecutive days practiced</p>
                </div>
                <div className="bg-maroon-dark p-6 rounded-lg shadow-inner text-center">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Average Session</h3>
                    <p className="text-5xl font-bold text-gold">{averageDuration}<span className="text-2xl"> min</span></p>
                    <p className="text-xs text-gray-500 mt-1">{studentEntries.length} sessions logged</p>
                </div>
            </div>

            {latestFeedbackEntry && (
                <AICoachCorner entry={latestFeedbackEntry} />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className={`bg-maroon-dark p-6 rounded-xl shadow-2xl flex flex-col transition-shadow duration-500 ${weeklyGoalAchieved ? 'animate-glow' : ''}`}>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                        <div className="flex items-center space-x-3">
                            <TargetIcon className="w-8 h-8 text-gold" />
                            <h3 className="text-2xl font-heading text-gold">Overall Weekly Goal</h3>
                        </div>
                        {(isTeacher || isOwner) && (
                            <button 
                                onClick={() => setIsGoalModalOpen(true)}
                                className="bg-maroon hover:bg-maroon-light text-gold font-bold py-2 px-4 rounded-md text-sm transition-colors shadow-md w-full sm:w-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-dark"
                            >
                                {studentGoal ? 'Edit Goals' : 'Set Goals'}
                            </button>
                        )}
                    </div>
                    {weeklyGoal > 0 ? (
                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <span className={`font-bold text-lg ${weeklyGoalAchieved ? 'text-gold-light' : 'text-white'}`}>
                                    {minutesThisWeek} / {weeklyGoal} min
                                </span>
                                {weeklyGoalAchieved && <span className="font-bold text-gold-light text-sm animate-pulse">Goal Achieved! ✨</span>}
                            </div>
                            <ProgressBar progress={weeklyGoalProgress} />
                        </div>
                    ) : (
                        <div className="text-center py-6 text-gray-500 flex-grow flex items-center justify-center">
                            <p>No weekly goal set. {!(isTeacher || isOwner) ? 'A teacher can set one.' : ''}</p>
                        </div>
                    )}
                </div>
                <div className={`bg-maroon-dark p-6 rounded-xl shadow-2xl flex flex-col transition-shadow duration-500 ${dailyGoalAchieved ? 'animate-glow' : ''}`}>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                         <div className="flex items-center space-x-3">
                            <TargetIcon className="w-8 h-8 text-gold" />
                            <h3 className="text-2xl font-heading text-gold">Overall Daily Goal</h3>
                        </div>
                    </div>
                    {dailyGoal > 0 ? (
                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <span className={`font-bold text-lg ${dailyGoalAchieved ? 'text-gold-light' : 'text-white'}`}>
                                    {minutesToday} / {dailyGoal} min
                                </span>
                                {dailyGoalAchieved && <span className="font-bold text-gold-light text-sm animate-pulse">Goal Achieved! ✨</span>}
                            </div>
                            <ProgressBar progress={dailyGoalProgress} />
                        </div>
                    ) : (
                        <div className="text-center py-6 text-gray-500 flex-grow flex items-center justify-center">
                            <p>No daily goal set. {(isTeacher || isOwner) ? '' : 'A teacher can set one.'}</p>
                        </div>
                    )}
                </div>
            </div>
            
            {instrumentGoalEntries.length > 0 && (
              <div className="bg-maroon-dark p-6 rounded-xl shadow-2xl">
                <div className="flex items-center space-x-3 mb-4">
                    <MusicNoteIcon className="w-8 h-8 text-gold" />
                    <h3 className="text-2xl font-heading text-gold">Instrument Goals</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {instrumentGoalEntries.map(([instrument, goal]) => {
                    // Cast goal to GoalDetail because TypeScript infers it as `unknown` from Object.entries.
                    const instrumentWeeklyGoal = Number((goal as GoalDetail).weeklyMinutes ?? 0);
                    // Cast goal to GoalDetail because TypeScript infers it as `unknown` from Object.entries.
                    const instrumentDailyGoal = Number((goal as GoalDetail).dailyMinutes ?? 0);
                    const minutesThisWeekForInstrument = minutesByInstrumentThisWeek[instrument] || 0;
                    const minutesTodayForInstrument = minutesByInstrumentToday[instrument] || 0;

                    const weeklyProgress = instrumentWeeklyGoal > 0 ? Math.min((minutesThisWeekForInstrument / instrumentWeeklyGoal) * 100, 100) : 0;
                    const dailyProgress = instrumentDailyGoal > 0 ? Math.min((minutesTodayForInstrument / instrumentDailyGoal) * 100, 100) : 0;
                    
                    const isWeeklyAchieved = instrumentWeeklyGoal > 0 && minutesThisWeekForInstrument >= instrumentWeeklyGoal;
                    const isDailyAchieved = instrumentDailyGoal > 0 && minutesTodayForInstrument >= instrumentDailyGoal;

                    return (
                      <div key={instrument} className="bg-maroon p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-3">
                           <InstrumentIcon instrument={instrument} className="w-6 h-6 text-gray-300" />
                           <h4 className="font-bold text-lg text-white">{instrument}</h4>
                        </div>
                        <div className="space-y-4">
                            {instrumentWeeklyGoal > 0 && (
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">Weekly Goal</p>
                                    <div className="flex justify-between items-end mb-1 text-sm">
                                        <span className={isWeeklyAchieved ? 'text-gold-light' : 'text-white'}>
                                            {minutesThisWeekForInstrument} / {instrumentWeeklyGoal} min
                                        </span>
                                        {isWeeklyAchieved && <span className="font-bold text-gold-light text-xs animate-pulse">Achieved! ✨</span>}
                                    </div>
                                    <ProgressBar progress={weeklyProgress} />
                                </div>
                            )}
                            {instrumentDailyGoal > 0 && (
                                <div>
                                     <p className="text-xs text-gray-400 mb-1">Daily Goal</p>
                                    <div className="flex justify-between items-end mb-1 text-sm">
                                        <span className={isDailyAchieved ? 'text-gold-light' : 'text-white'}>
                                            {minutesTodayForInstrument} / {instrumentDailyGoal} min
                                        </span>
                                        {isDailyAchieved && <span className="font-bold text-gold-light text-xs animate-pulse">Achieved! ✨</span>}
                                    </div>
                                    <ProgressBar progress={dailyProgress} />
                                </div>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                 <div className="bg-maroon-dark p-6 rounded-xl shadow-2xl h-96">
                    <h3 className="text-2xl font-heading mb-4 text-gold">Practice Trend (Last 30 Sessions)</h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#8A4F4F" />
                            <XAxis dataKey="date" stroke="#a0aec0" fontSize={12} />
                            <YAxis stroke="#a0aec0" fontSize={12} unit="m" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#3C1618', border: '1px solid #8A4F4F', color: '#e2e8f0' }}
                                labelStyle={{ color: '#a0aec0' }}
                                cursor={{ stroke: '#DAA520' }}
                            />
                            <Line type="monotone" dataKey="duration" name="Duration" stroke="#FFC72C" strokeWidth={2} dot={{ r: 4, fill: '#FFC72C' }} activeDot={{ r: 8 }}/>
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-maroon-dark p-6 rounded-xl shadow-2xl h-96">
                    <div className="flex items-center space-x-3 mb-4">
                        <PieChartIcon className="w-7 h-7 text-gold" />
                        <h3 className="text-2xl font-heading text-gold">Practice Breakdown by Instrument</h3>
                    </div>
                    {instrumentData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="85%">
                            <PieChart>
                                <Pie
                                    data={instrumentData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                >
                                    {instrumentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#3C1618', border: '1px solid #8A4F4F' }} 
                                    formatter={(value: number) => [`${value} minutes`, undefined]}
                                />
                                <Legend content={renderCustomLegend} verticalAlign="bottom" />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 -mt-8">
                            <p>No practice data to display.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-maroon-dark p-6 rounded-xl shadow-2xl">
                <h3 className="text-2xl font-heading text-gold mb-4">Yearly Practice History</h3>
                {yearlyChartData.some(d => d.hours > 0) ? (
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={yearlyChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#8A4F4F" />
                            <XAxis dataKey="name" stroke="#a0aec0" fontSize={12} />
                            <YAxis stroke="#a0aec0" fontSize={12} unit="h" label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: '#a0aec0', fontSize: 12, dx: -10 }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#3C1618', border: '1px solid #8A4F4F', color: '#e2e8f0' }}
                                labelStyle={{ color: '#a0aec0' }}
                                cursor={{ fill: 'rgba(138, 79, 79, 0.2)' }}
                                formatter={(value: number) => [`${value} hours`, 'Total Practice']}
                            />
                            <Bar dataKey="hours" fill="#FFC72C" name="Total Hours" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 py-16">
                        <p>No practice data available for the last 12 months.</p>
                    </div>
                )}
            </div>
            
             <div className="bg-maroon-dark p-6 rounded-xl shadow-2xl">
                <h3 className="text-2xl font-heading text-gold mb-4">Achievements</h3>
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {ALL_BADGES.map(badge => {
                        const isEarned = earnedBadges.some(b => b.id === badge.id);
                        return (
                            <div 
                                key={badge.id} 
                                className={`group relative flex flex-col items-center text-center p-4 bg-maroon rounded-lg space-y-2 transition-all duration-300 ${!isEarned ? 'filter grayscale opacity-50' : ''}`}
                            >
                                <badge.icon className="w-16 h-16 text-gold-light" />
                                <p className="text-sm font-semibold text-white h-10 flex items-center">{badge.name}</p>

                                {/* Tooltip */}
                                <div className="absolute bottom-full mb-2 w-max max-w-xs p-3 text-sm text-white bg-maroon-darkest rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                    <h4 className="font-bold text-gold-light mb-1">{badge.name}</h4>
                                    <p className="text-gray-300">{badge.description}</p>
                                    {!isEarned && <p className="text-xs text-gray-500 mt-2 italic">Not yet earned</p>}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="bg-maroon-dark p-6 rounded-xl shadow-2xl">
                <h3 className="text-2xl font-heading text-gold mb-4">Recent Activity</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-maroon">
                        <thead className="bg-maroon/50">
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">Date</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Instrument</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Duration</th>
                                {(isTeacher || isOwner) && (
                                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-maroon/50">
                            {studentEntries.slice(0, 15).map(entry => (
                                <React.Fragment key={entry.id}>
                                    <tr className="hover:bg-maroon/30">
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-300 sm:pl-6">{new Date(entry.date).toLocaleDateString()}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400">
                                            <div className="flex items-center space-x-2">
                                                <InstrumentIcon instrument={entry.instrument} className="w-5 h-5 text-gray-500" />
                                                <span>{entry.instrument}</span>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-gold">{entry.duration} min</td>
                                        {(isTeacher || isOwner) && (
                                            <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => setEntryToEdit(entry)}
                                                        className="text-gold hover:text-gold-light p-1 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-dark focus-visible:ring-gold"
                                                        aria-label={`Edit entry from ${new Date(entry.date).toLocaleDateString()}`}
                                                    >
                                                        <PencilIcon className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setEntryToDelete(entry)}
                                                        className="text-gray-500 hover:text-red-500 p-1 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-dark focus-visible:ring-red-500"
                                                        aria-label={`Delete entry from ${new Date(entry.date).toLocaleDateString()}`}
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                    {(isTeacher || entry.teacherNotes) && (
                                        <tr className="bg-maroon/20">
                                            <td colSpan={(isTeacher || isOwner) ? 4 : 3} className="px-6 py-4 text-sm">
                                                {editingNote?.entryId === entry.id ? (
                                                    <div className="space-y-2">
                                                        <label htmlFor={`teacher-note-${entry.id}`} className="block text-sm font-medium text-gray-300">Editing Teacher Note</label>
                                                        <textarea
                                                            id={`teacher-note-${entry.id}`}
                                                            value={editingNote.text}
                                                            onChange={(e) => setEditingNote({ ...editingNote, text: e.target.value })}
                                                            className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-dark"
                                                            rows={3}
                                                            placeholder="Add your feedback here..."
                                                        />
                                                        <div className="flex justify-end space-x-2">
                                                            <button onClick={handleCancelEditNote} className="px-3 py-1 rounded-md text-gray-300 hover:bg-maroon-light/50 transition-colors text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-dark">Cancel</button>
                                                            <button onClick={handleSaveNote} className="px-3 py-1 rounded-md bg-gold text-maroon-darkest font-bold hover:bg-gold-light transition-colors text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-dark">Save Note</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="flex items-center space-x-2 mb-2">
                                                                <ChatBubbleIcon className="w-5 h-5 text-gray-400" />
                                                                <h4 className="font-semibold text-gray-300">Teacher Note</h4>
                                                            </div>
                                                            {entry.teacherNotes ? (
                                                                <p className="text-gray-200 whitespace-pre-wrap">{entry.teacherNotes}</p>
                                                            ) : (
                                                                <p className="text-gray-500 italic">No note added yet.</p>
                                                            )}
                                                        </div>
                                                        {isTeacher && (
                                                            <button onClick={() => handleEditNoteClick(entry)} className="flex items-center space-x-1 text-xs text-gold hover:text-gold-light transition-colors p-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-dark">
                                                                <PencilIcon className="w-4 h-4" />
                                                                <span>{entry.teacherNotes ? 'Edit' : 'Add Note'}</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                    {studentEntries.length === 0 && (
                        <div className="text-center py-8 text-gray-500">No practice sessions logged for this student.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;