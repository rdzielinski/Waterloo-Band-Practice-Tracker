import React, { useState, useMemo } from 'react';
import { PracticeEntry } from '../types';
import ClassSummaryChart from './ClassSummaryChart';
import Leaderboard from './Leaderboard';
import PracticeLog from './PracticeLog';
import PracticeResources from './PracticeResources';
import FullLeaderboard from './FullLeaderboard';
import StatCard from './StatCard';
import UsersIcon from './icons/UsersIcon';
import { TrophyIcon } from './icons/BadgeIcons';
import ProgressBar from './ProgressBar';
import { TimeDisplayUnit, formatDuration } from '../lib/timeUtils';
import TimeDisplayToggle from './TimeDisplayToggle';

interface DashboardProps {
    entries: PracticeEntry[];
    onSelectStudent: (studentName: string) => void;
    newlyAddedEntryId?: string | null;
}

type ActiveTab = 'summary' | 'leaderboard' | 'full-leaderboard' | 'log' | 'resources';

const Dashboard: React.FC<DashboardProps> = ({ entries, onSelectStudent, newlyAddedEntryId }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('summary');
    const [timeDisplayUnit, setTimeDisplayUnit] = useState<TimeDisplayUnit>('minutes');

    const {
        uniqueStudents,
        totalHours,
        longTermGoalHours,
        longTermGoalProgress,
        longTermGoalAchieved
    } = useMemo(() => {
        const students = new Set(entries.map(e => e.studentName)).size;
        const totalMinutes = entries.reduce((sum, entry) => sum + entry.duration, 0);
        const hours = totalMinutes / 60;
        const goal = 2000;
        const progress = goal > 0 ? Math.min((hours / goal) * 100, 100) : 0;
        const achieved = goal > 0 && hours >= goal;

        return {
            uniqueStudents: students,
            totalHours: hours.toFixed(1),
            longTermGoalHours: goal,
            longTermGoalProgress: progress,
            longTermGoalAchieved: achieved
        };
    }, [entries]);
    
    const renderTabContent = () => {
        switch (activeTab) {
            case 'summary':
                return <ClassSummaryChart entries={entries} timeDisplayUnit={timeDisplayUnit} />;
            case 'leaderboard':
                return <Leaderboard entries={entries} onSelectStudent={onSelectStudent} timeDisplayUnit={timeDisplayUnit} />;
            case 'full-leaderboard':
                return <FullLeaderboard entries={entries} onSelectStudent={onSelectStudent} timeDisplayUnit={timeDisplayUnit} />;
            case 'log':
                return <PracticeLog entries={entries} onSelectStudent={onSelectStudent} newlyAddedEntryId={newlyAddedEntryId} timeDisplayUnit={timeDisplayUnit} />;
            case 'resources':
                return <PracticeResources />;
            default:
                return null;
        }
    };

    const TabButton: React.FC<{tab: ActiveTab, label: string}> = ({tab, label}) => (
         <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-darkest ${
                activeTab === tab 
                ? 'bg-gold text-maroon-darkest shadow-md' 
                : 'text-gray-300 hover:bg-maroon'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-8">
            <div className={`bg-maroon-dark p-6 rounded-xl shadow-2xl flex flex-col transition-shadow duration-500 ${longTermGoalAchieved ? 'animate-glow' : ''}`}>
                <div className="flex items-center space-x-3 mb-4">
                    <TrophyIcon className="w-8 h-8 text-gold" />
                    <h3 className="text-2xl font-heading text-gold">Band-Wide Goal: 2000 Hour Challenge</h3>
                </div>
                <div>
                    <div className="flex justify-between items-end mb-1">
                        <span className={`font-bold text-lg ${longTermGoalAchieved ? 'text-gold-light' : 'text-white'}`}>
                            {totalHours} / {longTermGoalHours} hours
                        </span>
                        {longTermGoalAchieved && <span className="font-bold text-gold-light text-sm animate-pulse">Challenge Complete! 🏆</span>}
                    </div>
                    <ProgressBar progress={longTermGoalProgress} />
                </div>
            </div>

            <StatCard 
                title="Total Active Students"
                value={String(uniqueStudents)}
                icon={UsersIcon}
            />
            
            <div className="flex flex-col sm:flex-row justify-between items-center bg-maroon-dark p-3 rounded-xl shadow-2xl gap-4">
                <div id="dashboard-tabs-container" className="flex items-center space-x-2 flex-wrap gap-2">
                   <TabButton tab="summary" label="Class Summary" />
                   <TabButton tab="leaderboard" label="Top 10" />
                   <TabButton tab="full-leaderboard" label="Full Leaderboard" />
                   <TabButton tab="log" label="Full Log" />
                   <TabButton tab="resources" label="Resources" />
                </div>
                <TimeDisplayToggle unit={timeDisplayUnit} setUnit={setTimeDisplayUnit} />
            </div>
            
            <div>
              {renderTabContent()}
            </div>
        </div>
    );
};

export default Dashboard;