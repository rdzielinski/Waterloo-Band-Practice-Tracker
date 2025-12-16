import { PracticeEntry, Badge } from '../types';
import {
    ClockIcon, StarIcon, TrophyIcon, CalendarIcon, MedalIcon, HourglassIcon,
    SunIcon, MoonIcon, BookCopyIcon, TrendingUpIcon, RepeatIcon, CalendarDaysIcon,
    SnowflakeIcon, SchoolIcon, AwardIcon,ZapIcon, CoffeeIcon, RocketIcon,
    GiftIcon, CalendarCheckIcon
} from '../components/icons/BadgeIcons';
import { INSTRUMENT_GROUPS } from '../constants';
import MusicNoteIcon from '../components/icons/MusicNoteIcon';
import FireIcon from '../components/icons/FireIcon';


export const ALL_BADGES: Badge[] = [
    // Onboarding (4)
    { id: 'first_session', name: 'First Session', description: 'Logged your first practice session.', icon: MusicNoteIcon },
    { id: 'first_note', name: 'Practice Coach', description: 'Left your first practice note for the AI coach.', icon: ZapIcon },
    { id: 'first_week', name: 'First Week Down', description: 'Logged practice on at least one day in your first 7 days of activity.', icon: CalendarIcon },
    { id: 'weekend_warrior', name: 'Weekend Warrior', description: 'Practiced on a Saturday and Sunday in the same calendar week.', icon: AwardIcon },
    
    // Time Milestones (10)
    { id: 'first_hour', name: 'First Hour', description: 'Reached 1 total hour of practice.', icon: ClockIcon },
    { id: 'five_hours', name: 'Five Hour Club', description: 'Reached 5 total hours of practice.', icon: ClockIcon },
    { id: 'ten_hours', name: '10 Hour Club', description: 'Accumulated 10 total hours of practice.', icon: StarIcon },
    { id: 'twenty_five_hours', name: 'Quarter Century Club', description: 'Reached 25 total hours of practice.', icon: StarIcon },
    { id: 'fifty_hours', name: '50 Hour Virtuoso', description: 'Mastered 50 total hours of practice.', icon: TrophyIcon },
    { id: 'seventy_five_hours', name: '75 Hour Pro', description: 'Reached 75 total hours of practice.', icon: TrophyIcon },
    { id: 'one_hundred_hours', name: 'Centurion', description: 'Reached 100 total hours of practice.', icon: MedalIcon },
    { id: 'one_fifty_hours', name: '150 Hour Club', description: 'Reached 150 total hours of practice.', icon: MedalIcon },
    { id: 'two_hundred_hours', name: 'Double Century Club', description: 'Reached 200 total hours of practice.', icon: RocketIcon },
    { id: 'five_hundred_hours', name: 'Maestro', description: 'Reached 500 total hours of practice.', icon: RocketIcon },

    // Session Dedication (4)
    { id: 'focused_practice', name: 'Focused Practice', description: 'Completed a single practice session of 30 minutes or more.', icon: HourglassIcon },
    { id: 'dedicated_session', name: 'Dedicated Session', description: 'Completed a single practice session of 60 minutes or more.', icon: HourglassIcon },
    { id: 'endurance_builder', name: 'Endurance Builder', description: 'Completed a single practice session of 90 minutes or more.', icon: MedalIcon },
    { id: 'marathon_musician', name: 'Marathon Musician', description: 'Completed a single practice session of 120 minutes or more.', icon: MedalIcon },

    // Streaks (8)
    { id: 'two_day_streak', name: 'Heating Up', description: 'Practiced 2 days in a row.', icon: FireIcon },
    { id: 'three_day_streak', name: 'On a Roll', description: 'Practiced 3 days in a row.', icon: FireIcon },
    { id: 'five_day_streak', name: 'Five-Day Focus', description: 'Practiced 5 days in a row.', icon: TrendingUpIcon },
    { id: 'streak_7', name: '7-Day Streak', description: 'Practiced 7 days in a row.', icon: TrendingUpIcon },
    { id: 'streak_14', name: 'Fortnight Follow-through', description: 'Practiced 14 days in a row.', icon: TrendingUpIcon },
    { id: 'streak_30', name: 'Monthly Master', description: 'Practiced 30 days in a row.', icon: TrendingUpIcon },
    { id: 'streak_65', name: 'Seasoned Pro', description: 'Practiced 65 days in a row.', icon: RocketIcon },
    { id: 'streak_100', name: 'Unstoppable', description: 'Practiced 100 days in a row.', icon: RocketIcon },

    // Frequency & Volume (6)
    { id: 'consistent', name: 'Consistent Practicer', description: 'Practiced on 3 or more days in the last 7 days.', icon: CalendarIcon },
    { id: 'frequent_flyer', name: 'Frequent Flyer', description: 'Logged 5 or more sessions in a single week.', icon: RepeatIcon },
    { id: 'heavy_hitter', name: 'Heavy Hitter', description: 'Logged over 3 hours (180 mins) in a single week.', icon: RepeatIcon },
    { id: 'power_hour', name: 'Power Hour', description: 'Logged over 60 minutes in a single day (can be multiple sessions).', icon: ClockIcon },
    { id: 'daily_double', name: 'Daily Double', description: 'Logged two separate sessions in one day.', icon: RepeatIcon },
    { id: 'perfect_week', name: 'Perfect Week', description: 'Practiced all 7 days in a calendar week (Sun-Sat).', icon: StarIcon },

    // Instrument & Diversity (8)
    { id: 'loyalist_10', name: 'Instrument Loyalist', description: 'Logged 10 hours on a single instrument.', icon: AwardIcon },
    { id: 'loyalist_50', name: 'Instrument Master', description: 'Logged 50 hours on a single instrument.', icon: MedalIcon },
    { id: 'loyalist_100', name: 'Instrument Champion', description: 'Logged 100 hours on a single instrument.', icon: TrophyIcon },
    { id: 'polymath_prelude', name: 'Polymath Prelude', description: 'Logged practice on two different instruments.', icon: BookCopyIcon },
    { id: 'polymath_virtuoso', name: 'Polymath Virtuoso', description: 'Logged practice on three or more different instruments.', icon: BookCopyIcon },
    { id: 'woodwind_specialist', name: 'Woodwind Specialist', description: 'Logged 5 hours on any woodwind instrument.', icon: AwardIcon },
    { id: 'brass_specialist', name: 'Brass Specialist', description: 'Logged 5 hours on any brass instrument.', icon: AwardIcon },
    { id: 'percussion_specialist', name: 'Percussion Specialist', description: 'Logged 5 hours on percussion.', icon: AwardIcon },

    // Time of Day (3)
    { id: 'early_bird', name: 'Early Bird', description: 'Logged a session before 8 AM.', icon: SunIcon },
    { id: 'night_owl', name: 'Night Owl', description: 'Logged a session after 9 PM.', icon: MoonIcon },
    { id: 'lunchtime_largo', name: 'Lunchtime Largo', description: 'Logged a session between 12 PM and 2 PM.', icon: CoffeeIcon },

    // Calendar & Special (9)
    { id: 'monthly_milestone', name: 'Monthly Milestone', description: 'Practiced at least once a month for 3 consecutive months.', icon: CalendarDaysIcon },
    { id: 'quarterly_quest', name: 'Quarterly Quest', description: 'Practiced at least once a month for 6 consecutive months.', icon: CalendarDaysIcon },
    { id: 'yearly_yodel', name: 'Yearly Yodel', description: 'Practiced at least once a month for 12 consecutive months.', icon: CalendarDaysIcon },
    { id: 'daily_dedication', name: 'Monthly Dedication', description: 'Logged practice every single day of a past calendar month.', icon: CalendarCheckIcon },
    { id: 'summer_soldier', name: 'Summer Soldier', description: 'Logged 10+ hours during summer (June, July, August).', icon: SunIcon },
    { id: 'winter_warmer', name: 'Winter Warmer', description: 'Logged 10+ hours during winter (December, January, February).', icon: SnowflakeIcon },
    { id: 'back_to_school', name: 'Back to School', description: 'Logged a session in the first week of September.', icon: SchoolIcon },
    { id: 'holiday_harmonizer', name: 'Holiday Harmonizer', description: 'Logged a session on New Year\'s Day, July 4th, or Christmas Day.', icon: GiftIcon },
    { id: 'leap_day_legend', name: 'Leap Day Legend', description: 'Logged a session on February 29th.', icon: StarIcon },
];

const getBadgeById = (id: string): Badge => {
    const badge = ALL_BADGES.find(b => b.id === id);
    if (!badge) throw new Error(`Badge with id "${id}" not found.`);
    return badge;
};

export const calculateAchievements = (entries: PracticeEntry[]): { earnedBadges: Badge[], streak: number } => {
    const earnedBadges: Badge[] = [];
    if (entries.length === 0) {
        return { earnedBadges, streak: 0 };
    }

    // --- 1. Pre-computation & Data Structuring ---
    const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const allEntryDates = sortedEntries.map(e => new Date(e.date));
    const uniquePracticeDays = [...new Set(sortedEntries.map(e => new Date(e.date).toDateString()))]
        .map(d => new Date(d))
        .sort((a, b) => a.getTime() - b.getTime());

    const totalMinutes = entries.reduce((sum, e) => sum + e.duration, 0);
    const totalHours = totalMinutes / 60;
    const maxSessionDuration = Math.max(...entries.map(e => e.duration));

    // --- 2. Streak Calculation ---
    let currentStreak = 0;
    if (uniquePracticeDays.length > 0) {
        const today = new Date(new Date().toDateString());
        const lastPracticeDate = uniquePracticeDays[uniquePracticeDays.length - 1];
        const diffFromToday = (today.getTime() - lastPracticeDate.getTime()) / (1000 * 3600 * 24);

        if (diffFromToday <= 1) {
            currentStreak = 1;
            for (let i = uniquePracticeDays.length - 1; i > 0; i--) {
                const day = uniquePracticeDays[i];
                const prevDay = uniquePracticeDays[i - 1];
                const diffTime = day.getTime() - prevDay.getTime();
                const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
                if (diffDays === 1) {
                    currentStreak++;
                } else {
                    break;
                }
            }
        }
    }

    // --- 3. Badge Checks ---
    
    // Onboarding
    if (entries.length >= 1) earnedBadges.push(getBadgeById('first_session'));
    if (sortedEntries.some(e => e.notes && e.notes.trim().length > 0)) earnedBadges.push(getBadgeById('first_note'));
    if (uniquePracticeDays.length > 0) {
        const firstDay = uniquePracticeDays[0];
        const sevenDaysAfter = new Date(firstDay);
        sevenDaysAfter.setDate(firstDay.getDate() + 7);
        if (new Date() <= sevenDaysAfter) {
            earnedBadges.push(getBadgeById('first_week'));
        }
    }

    // Time Milestones
    if (totalHours >= 1) earnedBadges.push(getBadgeById('first_hour'));
    if (totalHours >= 5) earnedBadges.push(getBadgeById('five_hours'));
    if (totalHours >= 10) earnedBadges.push(getBadgeById('ten_hours'));
    if (totalHours >= 25) earnedBadges.push(getBadgeById('twenty_five_hours'));
    if (totalHours >= 50) earnedBadges.push(getBadgeById('fifty_hours'));
    if (totalHours >= 75) earnedBadges.push(getBadgeById('seventy_five_hours'));
    if (totalHours >= 100) earnedBadges.push(getBadgeById('one_hundred_hours'));
    if (totalHours >= 150) earnedBadges.push(getBadgeById('one_fifty_hours'));
    if (totalHours >= 200) earnedBadges.push(getBadgeById('two_hundred_hours'));
    if (totalHours >= 500) earnedBadges.push(getBadgeById('five_hundred_hours'));

    // Session Dedication
    if (maxSessionDuration >= 30) earnedBadges.push(getBadgeById('focused_practice'));
    if (maxSessionDuration >= 60) earnedBadges.push(getBadgeById('dedicated_session'));
    if (maxSessionDuration >= 90) earnedBadges.push(getBadgeById('endurance_builder'));
    if (maxSessionDuration >= 120) earnedBadges.push(getBadgeById('marathon_musician'));

    // Streaks
    if (currentStreak >= 2) earnedBadges.push(getBadgeById('two_day_streak'));
    if (currentStreak >= 3) earnedBadges.push(getBadgeById('three_day_streak'));
    if (currentStreak >= 5) earnedBadges.push(getBadgeById('five_day_streak'));
    if (currentStreak >= 7) earnedBadges.push(getBadgeById('streak_7'));
    if (currentStreak >= 14) earnedBadges.push(getBadgeById('streak_14'));
    if (currentStreak >= 30) earnedBadges.push(getBadgeById('streak_30'));
    if (currentStreak >= 65) earnedBadges.push(getBadgeById('streak_65'));
    if (currentStreak >= 100) earnedBadges.push(getBadgeById('streak_100'));

    // Frequency, Volume, and Calendar Checks
    const entriesByDay: { [key: string]: PracticeEntry[] } = {};
    const entriesByWeek: { [key: string]: { entries: PracticeEntry[], days: Set<number> } } = {};
    const practiceMonths = new Set<string>();

    sortedEntries.forEach(entry => {
        const d = new Date(entry.date);
        const dayString = d.toDateString();
        if (!entriesByDay[dayString]) entriesByDay[dayString] = [];
        entriesByDay[dayString].push(entry);

        const dayOfWeek = d.getDay();
        const firstDayOfWeek = new Date(d);
        firstDayOfWeek.setDate(d.getDate() - dayOfWeek);
        const weekString = firstDayOfWeek.toDateString();
        
        if (!entriesByWeek[weekString]) entriesByWeek[weekString] = { entries: [], days: new Set() };
        entriesByWeek[weekString].entries.push(entry);
        entriesByWeek[weekString].days.add(dayOfWeek);

        practiceMonths.add(`${d.getFullYear()}-${d.getMonth()}`);
    });

    Object.values(entriesByDay).forEach(dayEntries => {
        const totalDuration = dayEntries.reduce((sum, e) => sum + e.duration, 0);
        if (totalDuration >= 60) earnedBadges.push(getBadgeById('power_hour'));
        if (dayEntries.length >= 2) earnedBadges.push(getBadgeById('daily_double'));
    });
    
    let practicedSaturday = false;
    let practicedSunday = false;
    
    Object.values(entriesByWeek).forEach(weekData => {
        if (weekData.entries.length >= 5) earnedBadges.push(getBadgeById('frequent_flyer'));
        const totalWeekMinutes = weekData.entries.reduce((sum, e) => sum + e.duration, 0);
        if (totalWeekMinutes >= 180) earnedBadges.push(getBadgeById('heavy_hitter'));
        if (weekData.days.size === 7) earnedBadges.push(getBadgeById('perfect_week'));
        if(weekData.days.has(6)) practicedSaturday = true;
        if(weekData.days.has(0)) practicedSunday = true;
        if(practicedSaturday && practicedSunday) earnedBadges.push(getBadgeById('weekend_warrior'));
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentPracticeDays = uniquePracticeDays.filter(d => d >= sevenDaysAgo).length;
    if (recentPracticeDays >= 3) earnedBadges.push(getBadgeById('consistent'));

    // Instrument & Diversity
    const uniqueInstruments = [...new Set(entries.map(e => e.instrument))];
    if (uniqueInstruments.length >= 2) earnedBadges.push(getBadgeById('polymath_prelude'));
    if (uniqueInstruments.length >= 3) earnedBadges.push(getBadgeById('polymath_virtuoso'));

    const minutesByInstrument: { [key: string]: number } = {};
    entries.forEach(e => {
        minutesByInstrument[e.instrument] = (minutesByInstrument[e.instrument] || 0) + e.duration;
    });

    if (Object.values(minutesByInstrument).some(mins => mins >= 600)) earnedBadges.push(getBadgeById('loyalist_10'));
    if (Object.values(minutesByInstrument).some(mins => mins >= 3000)) earnedBadges.push(getBadgeById('loyalist_50'));
    if (Object.values(minutesByInstrument).some(mins => mins >= 6000)) earnedBadges.push(getBadgeById('loyalist_100'));
    
    const woodwindMins = entries.filter(e => INSTRUMENT_GROUPS.Woodwinds.includes(e.instrument)).reduce((s, e) => s + e.duration, 0);
    const brassMins = entries.filter(e => INSTRUMENT_GROUPS.Brass.includes(e.instrument)).reduce((s, e) => s + e.duration, 0);
    const percussionMins = entries.filter(e => INSTRUMENT_GROUPS.Percussion.includes(e.instrument)).reduce((s, e) => s + e.duration, 0);
    if (woodwindMins >= 300) earnedBadges.push(getBadgeById('woodwind_specialist'));
    if (brassMins >= 300) earnedBadges.push(getBadgeById('brass_specialist'));
    if (percussionMins >= 300) earnedBadges.push(getBadgeById('percussion_specialist'));


    // Time of Day
    if (allEntryDates.some(d => d.getHours() < 8)) earnedBadges.push(getBadgeById('early_bird'));
    if (allEntryDates.some(d => d.getHours() >= 21)) earnedBadges.push(getBadgeById('night_owl'));
    if (allEntryDates.some(d => d.getHours() >= 12 && d.getHours() < 14)) earnedBadges.push(getBadgeById('lunchtime_largo'));
    
    // Calendar & Special
    if (allEntryDates.some(d => d.getMonth() === 1 && d.getDate() === 29)) earnedBadges.push(getBadgeById('leap_day_legend'));

    const sortedMonths = [...practiceMonths].sort();
    let consecutiveMonths = 0;
    let maxConsecutiveMonths = 0;
    if (sortedMonths.length > 0) {
        consecutiveMonths = 1;
        maxConsecutiveMonths = 1;
        for (let i = 1; i < sortedMonths.length; i++) {
            const [year, month] = sortedMonths[i].split('-').map(Number);
            const [prevYear, prevMonth] = sortedMonths[i - 1].split('-').map(Number);
            if ((year === prevYear && month === prevMonth + 1) || (year === prevYear + 1 && month === 0 && prevMonth === 11)) {
                consecutiveMonths++;
            } else {
                consecutiveMonths = 1;
            }
            maxConsecutiveMonths = Math.max(maxConsecutiveMonths, consecutiveMonths);
        }
    }

    if (maxConsecutiveMonths >= 3) earnedBadges.push(getBadgeById('monthly_milestone'));
    if (maxConsecutiveMonths >= 6) earnedBadges.push(getBadgeById('quarterly_quest'));
    if (maxConsecutiveMonths >= 12) earnedBadges.push(getBadgeById('yearly_yodel'));
    
    const summerMins = entries.filter(e => [5, 6, 7].includes(new Date(e.date).getMonth())).reduce((s, e) => s + e.duration, 0);
    if (summerMins >= 600) earnedBadges.push(getBadgeById('summer_soldier'));

    const winterMins = entries.filter(e => [11, 0, 1].includes(new Date(e.date).getMonth())).reduce((s, e) => s + e.duration, 0);
    if (winterMins >= 600) earnedBadges.push(getBadgeById('winter_warmer'));

    if (allEntryDates.some(d => d.getMonth() === 8 && d.getDate() <= 7)) earnedBadges.push(getBadgeById('back_to_school'));

    const holidays = new Set(['1-1', '7-4', '12-25']); // NYD, July 4th, Christmas
    if (allEntryDates.some(d => holidays.has(`${d.getMonth() + 1}-${d.getDate()}`))) {
        earnedBadges.push(getBadgeById('holiday_harmonizer'));
    }

    // Daily dedication logic
    const practiceDaysByMonth: { [key: string]: Set<number> } = {};
    uniquePracticeDays.forEach(d => {
        const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
        if (!practiceDaysByMonth[monthKey]) {
            practiceDaysByMonth[monthKey] = new Set();
        }
        practiceDaysByMonth[monthKey].add(d.getDate());
    });

    let achievedMonthlyDedication = false;
    const today = new Date();
    for (const monthKey in practiceDaysByMonth) {
        const [year, month] = monthKey.split('-').map(Number);
        
        // Don't check the current, incomplete month for this badge
        if (year === today.getFullYear() && month === today.getMonth()) {
            continue;
        }

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        if (practiceDaysByMonth[monthKey].size === daysInMonth) {
            achievedMonthlyDedication = true;
            break;
        }
    }
    if (achievedMonthlyDedication) {
        earnedBadges.push(getBadgeById('daily_dedication'));
    }

    // Return unique badges
    const uniqueBadgeIds = new Set(earnedBadges.map(b => b.id));
    const finalBadges = [...uniqueBadgeIds].map(id => getBadgeById(id));

    return { earnedBadges: finalBadges, streak: currentStreak };
};