import { PracticeEntry, UserProfile, GradeLevel, Goal } from '../types';
import { INSTRUMENTS } from '../constants';

export const mockUserProfile: UserProfile = {
  id: 'guest-user',
  name: 'Alex Pirate',
  email: 'guest@example.com',
  role: 'student',
  grade: GradeLevel.SEVENTH_EIGHTH,
  instrument: 'Trumpet',
};

export const mockGoals: Record<string, Goal> = {
    [mockUserProfile.name]: {
        overall: {
            weeklyMinutes: 150,
            dailyMinutes: 20,
        },
        instruments: {
            'Trumpet': {
                weeklyMinutes: 120,
            },
            'Piano': {
                dailyMinutes: 15,
            }
        }
    }
};

const getRandomInstrument = () => {
    const commonInstruments = ['Trumpet', 'Flute', 'B-flat Clarinet', 'Alto Saxophone', 'Trombone', 'Percussion', 'Piano'];
    return commonInstruments[Math.floor(Math.random() * commonInstruments.length)];
};

export const generateMockEntries = (profile: UserProfile): PracticeEntry[] => {
    const entries: PracticeEntry[] = [];
    const today = new Date();
    
    // Generate about 25 entries over the last 45 days
    for (let i = 0; i < 25; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - Math.floor(Math.random() * 45));
        
        const hasNotes = Math.random() > 0.4;
        const notes = hasNotes ? `Worked on scales and long tones. The ${Math.random() > 0.5 ? 'high' : 'low'} register feels a bit airy.` : undefined;
        const aiResponse = hasNotes && Math.random() > 0.3 ? `Great job focusing on the fundamentals! For a clearer tone, try doing some mouthpiece buzzing before you start. It helps center your embouchure.` : undefined;

        entries.push({
            id: `mock-entry-${i}`,
            userId: profile.id,
            studentName: profile.name,
            grade: profile.grade!,
            instrument: i % 5 === 0 ? 'Piano' : getRandomInstrument(),
            duration: Math.floor(Math.random() * 30) + 15, // 15 to 45 minutes
            date: date.toISOString(),
            notes: notes,
            aiCoachResponse: aiResponse,
        });
    }

    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const generateCommunityMockEntries = (): PracticeEntry[] => {
    const entries: PracticeEntry[] = [];
    const names = ['Sarah T.', 'Mike R.', 'Jessica L.', 'David K.', 'Emily W.', 'Chris P.', 'Tom H.', 'Linda B.'];
    const instruments = ['Flute', 'Clarinet', 'Alto Saxophone', 'Trumpet', 'Trombone', 'Percussion', 'French Horn', 'Tuba'];
    const today = new Date();

    names.forEach((name, idx) => {
        const instrument = instruments[idx % instruments.length];
        // Generate between 10 and 20 entries for each student
        const numEntries = Math.floor(Math.random() * 10) + 10;
        
        for (let i = 0; i < numEntries; i++) {
             const date = new Date(today);
             date.setDate(today.getDate() - Math.floor(Math.random() * 30)); // Last 30 days
             entries.push({
                id: `mock-comm-${name.replace(/\s/g,'')}-${i}`,
                userId: `mock-user-${name.replace(/\s/g,'')}`,
                studentName: name,
                grade: idx % 2 === 0 ? GradeLevel.SIXTH : GradeLevel.SEVENTH_EIGHTH,
                instrument: instrument,
                duration: Math.floor(Math.random() * 45) + 15,
                date: date.toISOString(),
                notes: '',
             });
        }
    });
    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};