import React, { useMemo, useState } from 'react';
import { PracticeEntry, AIFeedback, UserProfile, Goal, LessonPlan } from '../types';
import PracticeForm from './PracticeForm';
import StatCard from './StatCard';
import ProgressBar from './ProgressBar';
import { calculateAchievements } from '../lib/achievements';
import FireIcon from './icons/FireIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import TargetIcon from './icons/TargetIcon';
import { ClockIcon } from './icons/BadgeIcons';
import { ArrowRight } from 'lucide-react';
import { InstrumentIcon } from './icons/InstrumentIcons';
import Leaderboard from './Leaderboard';
import FullLeaderboard from './FullLeaderboard';
import PracticeResources from './PracticeResources';
import LessonPlanDisplay from './LessonPlanDisplay';
import { TimeDisplayUnit } from '../lib/timeUtils';
import TimeDisplayToggle from './TimeDisplayToggle';

interface StudentDashboardProps {
  userProfile: UserProfile;
  practiceEntries: PracticeEntry[];
  allEntries: PracticeEntry[];
  goals: Record<string, Goal>;
  lessonPlan: LessonPlan | null;
  addPracticeEntry: (entry: Omit<PracticeEntry, 'id' | 'date' | 'aiCoachResponse' | 'studentName' | 'grade' | 'userId' | 'ipAddress'>) => Promise<AIFeedback | undefined>;
  newlyAddedEntryId: string | null;
  onViewFullProfile: () => void;
  onSelectStudent: (studentName: string) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ userProfile, practiceEntries, allEntries, addPracticeEntry, newlyAddedEntryId, goals, lessonPlan, onViewFullProfile, onSelectStudent }) => {
  const [activeTab, setActiveTab] = useState<'mine' | 'community'>('mine');
  const [timeDisplayUnit, setTimeDisplayUnit] = useState<TimeDisplayUnit>('minutes');

  const {
    totalMinutes,
    averageDuration,
    streak,
    minutesThisWeek,
    minutesToday,
  } = useMemo(() => {
    if (practiceEntries.length === 0) {
      return {
        totalMinutes: 0,
        averageDuration: '0',
        streak: 0,
        minutesThisWeek: 0,
        minutesToday: 0,
      };
    }

    const { streak } = calculateAchievements(practiceEntries);
    const total = practiceEntries.reduce((sum, entry) => sum + entry.duration, 0);
    const avg = (total / practiceEntries.length).toFixed(0);

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const minutesThisWeek = practiceEntries
      .filter(e => new Date(e.date) >= startOfWeek)
      .reduce((sum, entry) => sum + entry.duration, 0);

    const minutesToday = practiceEntries
        .filter(e => {
            const entryDate = new Date(e.date);
            entryDate.setHours(0,0,0,0);
            return entryDate.getTime() === today.getTime();
        })
        .reduce((sum, entry) => sum + entry.duration, 0);


    return {
      totalMinutes: total,
      averageDuration: avg,
      streak,
      minutesThisWeek,
      minutesToday,
    };
  }, [practiceEntries]);

  const totalHours = (totalMinutes / 60).toFixed(1);

  const studentGoal = goals[userProfile.name];
  const weeklyGoal = studentGoal?.overall?.weeklyMinutes ?? 0;
  const weeklyGoalProgress = weeklyGoal > 0 ? Math.min((minutesThisWeek / weeklyGoal) * 100, 100) : 0;
  const weeklyGoalAchieved = weeklyGoal > 0 && minutesThisWeek >= weeklyGoal;
  
  const dailyGoal = studentGoal?.overall?.dailyMinutes ?? 0;
  const dailyGoalProgress = dailyGoal > 0 ? Math.min((minutesToday / dailyGoal) * 100, 100) : 0;
  const dailyGoalAchieved = dailyGoal > 0 && minutesToday >= dailyGoal;
  
  const TabButton: React.FC<{tab: 'mine' | 'community', label: string}> = ({tab, label}) => (
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

  const MyDashboard = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8 mt-6">
      <div className="lg:col-span-1 mb-8 lg:mb-0">
        <PracticeForm onSubmit={addPracticeEntry} userProfile={userProfile} />
      </div>
      <div className="lg:col-span-2 space-y-6">
        <div className="text-left">
          <h2 className="text-4xl font-heading text-gold-light">Welcome, {userProfile.name}!</h2>
          <p className="text-lg text-gray-400">Here's a quick look at your practice summary.</p>
        </div>

        {lessonPlan && <LessonPlanDisplay lessonPlan={lessonPlan} />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className={`bg-maroon-dark p-6 rounded-xl shadow-2xl transition-shadow duration-500 ${weeklyGoalAchieved ? 'animate-glow' : ''}`}>
                <div className="flex items-center space-x-3 mb-4">
                    <TargetIcon className="w-8 h-8 text-gold" />
                    <h3 className="text-xl font-heading text-gold">Weekly Goal</h3>
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
                    <div className="text-center py-2 text-gray-500">
                        <p>No weekly goal set. Ask your teacher to set one!</p>
                    </div>
                )}
           </div>
            <div className={`bg-maroon-dark p-6 rounded-xl shadow-2xl transition-shadow duration-500 ${dailyGoalAchieved ? 'animate-glow' : ''}`}>
                <div className="flex items-center space-x-3 mb-4">
                    <TargetIcon className="w-8 h-8 text-gold" />
                    <h3 className="text-xl font-heading text-gold">Daily Goal</h3>
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
                     <div className="text-center py-2 text-gray-500">
                        <p>No daily goal set.</p>
                    </div>
                )}
           </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard title="Practice Streak" value={`${streak} days`} icon={FireIcon} />
          <StatCard title="Total Time" value={`${totalHours} hrs`} icon={ClockIcon} />
          <StatCard title="Avg. Session" value={`${averageDuration} min`} icon={ChartBarIcon} />
        </div>

        <div className="bg-maroon-dark p-6 rounded-xl shadow-2xl">
          <h3 className="text-xl font-heading text-gold mb-4">Recent Activity</h3>
          {practiceEntries.length > 0 ? (
            <ul className="space-y-3">
              {practiceEntries.slice(0, 3).map(entry => (
                <li key={entry.id} className={`bg-maroon/50 p-3 rounded-lg flex items-center justify-between ${entry.id === newlyAddedEntryId ? 'animate-flash' : ''}`}>
                  <div className="flex items-center space-x-3">
                     <InstrumentIcon instrument={entry.instrument} className="w-6 h-6 text-gray-400" />
                    <div>
                      <p className="font-semibold text-white">{entry.instrument}</p>
                      <p className="text-xs text-gray-400">{new Date(entry.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                  <span className="font-bold text-lg text-gold">{entry.duration} min</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-4">Your practice sessions will appear here once you log them.</p>
          )}
        </div>

        <button 
          onClick={onViewFullProfile}
          className="w-full bg-maroon-light hover:bg-maroon text-gold font-bold py-3 px-4 rounded-lg shadow-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          <span>View Full Profile & Achievements</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
  
  const CommunityDashboard = () => (
    <div className="space-y-8 mt-6">
        <div className="bg-maroon-dark p-6 rounded-xl shadow-2xl h-48 flex items-center justify-center text-center border-2 border-dashed border-maroon-light/50">
            <div>
                <ClockIcon className="w-12 h-12 text-gold mx-auto mb-4 opacity-70" />
                <p className="text-xl font-heading text-gold animate-pulse">This Data Will Not Be Displayed In The Week Leading Up To The Concert!</p>
            </div>
        </div>
        
        <div className="flex justify-end">
            <TimeDisplayToggle unit={timeDisplayUnit} setUnit={setTimeDisplayUnit} />
        </div>

        <Leaderboard entries={allEntries} onSelectStudent={onSelectStudent} timeDisplayUnit={timeDisplayUnit} />
        <FullLeaderboard entries={allEntries} onSelectStudent={onSelectStudent} timeDisplayUnit={timeDisplayUnit} />
        <PracticeResources />
    </div>
  );


  return (
    <div>
      <div id="student-dashboard-tabs" className="bg-maroon-dark p-3 rounded-xl shadow-2xl">
          <div className="flex items-center space-x-2 flex-wrap gap-2">
             <TabButton tab="mine" label="My Dashboard" />
             <TabButton tab="community" label="Community & Leaderboards" />
          </div>
      </div>
      
      {activeTab === 'mine' ? <MyDashboard /> : <CommunityDashboard />}
    </div>
  );
};

export default StudentDashboard;