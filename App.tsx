// filename: src/App.tsx

import React, { useState, useEffect } from 'react';
// FIX: Import LessonPlan from types
import { PracticeEntry, Goal, AIFeedback, GradeLevel, GoalDetail, UserProfile, LessonPlan } from './types';
import Header from './components/Header';
import StudentDashboard from './components/StudentDashboard';
import StudentProfile from './components/StudentProfile';
import TeacherView from './components/TeacherView';
import AuthView from './components/AuthView';
import { api } from './api';
import TutorialOverlay from './components/TutorialOverlay';
import { GoogleGenAI, Type } from '@google/genai';
import { INSTRUMENT_DATA } from './lib/fingeringData';
import { ToastContainer, ToastMessage } from './components/Toast';
import type firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import CompleteProfileView from './components/CompleteProfileView';
import { mockUserProfile, generateMockEntries, mockGoals } from './lib/mockData';
import PracticeResources from './components/PracticeResources';


const App: React.FC = () => {
  const [practiceEntries, setPracticeEntries] = useState<PracticeEntry[]>([]);
  const [allPracticeEntries, setAllPracticeEntries] = useState<PracticeEntry[]>([]);
  const [goals, setGoals] = useState<Record<string, Goal>>({});
  const [gradeGoals, setGradeGoals] = useState<Record<string, GoalDetail>>({});
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [selectedStudentByTeacher, setSelectedStudentByTeacher] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newlyAddedEntryId, setNewlyAddedEntryId] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [view, setView] = useState<'dashboard' | 'resources'>('dashboard');

  const [currentUser, setCurrentUser] = useState<firebase.User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isCompletingProfile, setIsCompletingProfile] = useState(false);
  const [isStudentViewingProfile, setIsStudentViewingProfile] = useState(false);
  const [studentViewingStudentName, setStudentViewingStudentName] = useState<string | null>(null);
  const [isGuestMode, setIsGuestMode] = useState(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getFriendlyErrorMessage = (error: any): string => {
    console.error("API/Error:", error);
    if (error && error.code) {
      switch (error.code) {
        case 'unavailable':
          return 'The service is currently unavailable. Check your internet and try again.';
        case 'permission-denied':
          return 'You do not have permission to access this data. Students can only view their own entries.';
        case 'unauthenticated':
          return 'You are not authenticated. Please log in again.';
        case 'deadline-exceeded':
          return 'The request took too long to complete. Please try again.';
        case 'not-found':
          return 'The requested data could not be found.';
        case 'resource-exhausted':
          return 'The service is temporarily busy. Please try again in a moment.';
        default:
          return `Unexpected error (${error.code}). Please try again later.`;
      }
    }
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        return 'Could not connect to the server. Please check your internet connection.';
      }
      return error.message.includes('API key not valid')
        ? 'The application is not configured correctly. Please contact support.'
        : error.message;
    }
    return 'An unknown error occurred.';
  };

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }

    if (isGuestMode) {
      setAuthLoading(false);
      return;
    }

    let unsubscribe: () => void;

    const setupAuth = async () => {
      try {
        await api.setAuthPersistence();
      } catch (authError) {
        console.warn("Could not set auth persistence, continuing with default.", authError);
      }

      unsubscribe = api.onAuthStateChanged(async (user) => {
        if (user) {
          const profile = await api.getUserProfile(user.uid);
          if (profile) {
            setCurrentUser(user);
            setUserProfile(profile);
            setIsCompletingProfile(false);
          } else {
            setCurrentUser(user);
            setUserProfile(null);
            setIsCompletingProfile(true);
          }
        } else {
          setCurrentUser(null);
          setUserProfile(null);
          setIsCompletingProfile(false);
        }
        setAuthLoading(false);
      });
    };

    setupAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isGuestMode]);

  useEffect(() => {
    if (newlyAddedEntryId) {
      const timer = setTimeout(() => setNewlyAddedEntryId(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [newlyAddedEntryId]);

  useEffect(() => {
    if (isGuestMode) {
        setIsLoading(false);
        setAllPracticeEntries(practiceEntries);
        return;
    }
    const loadData = async () => {
      if (!currentUser || !userProfile) return;
      
      if (userProfile.role === 'teacher' && (userProfile as any)._isNew) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      setIsLoading(true);
      setError(null);
      try {
        if (userProfile.role === 'teacher') {
          const [entries, goalsData, gradeGoalsData] = await Promise.all([
            api.getEntries(),
            api.getGoals(),
            api.getGradeGoals(),
          ]);
          setPracticeEntries(entries);
          setAllPracticeEntries(entries);
          setGoals(goalsData);
          setGradeGoals(gradeGoalsData);
        } else {
          // For students, fetch only their own data to prevent permission errors.
          // The call to api.getEntries() is removed.
          const [studentEntries, goalData, studentLessonPlan] = await Promise.all([
            api.getStudentEntriesByUserId(currentUser.uid),
            api.getStudentGoal(userProfile.name),
            api.getLessonPlanForGrade(userProfile.grade!),
          ]);

          setPracticeEntries(studentEntries);
          
          // Attempt to fetch all entries for the leaderboard.
          // If this fails (e.g. strict security rules), fall back to only showing the student's own entries.
          try {
             const allEntries = await api.getEntries();
             setAllPracticeEntries(allEntries);
          } catch (e) {
             console.warn("Could not fetch full leaderboard, falling back to own entries", e);
             setAllPracticeEntries(studentEntries);
          }

          setGoals(goalData ? { [userProfile.name]: goalData } : {});
          setLessonPlan(studentLessonPlan);
          setGradeGoals({});
        }
      } catch (err) {
        const message = getFriendlyErrorMessage(err);
        setError(`Could not load practice data. Reason: ${message}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading && currentUser && userProfile && !isCompletingProfile) {
      loadData();
    } else if (!authLoading && !currentUser) {
      setIsLoading(false);
    }
  }, [authLoading, currentUser, userProfile, isGuestMode, isCompletingProfile]);

  const addPracticeEntry = async (
    entry: Omit<PracticeEntry, 'id' | 'date' | 'aiCoachResponse' | 'studentName' | 'grade' | 'userId' | 'ipAddress'>
  ): Promise<AIFeedback | undefined> => {
    if (!currentUser || !userProfile || userProfile.role !== 'student') {
      throw new Error("You must be logged in as a student to add an entry.");
    }

    try {
      let aiFeedback: AIFeedback | undefined = undefined;

      if (entry.notes && entry.notes.trim()) {
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const instrumentInfo = INSTRUMENT_DATA.find(inst =>
            inst.name.toLowerCase().includes(entry.instrument.toLowerCase())
          );

          const fingeringKnowledge = instrumentInfo
            ? `This data is for the instrument: ${instrumentInfo.name}.
The notation key is: "${instrumentInfo.notation_key}".
The fingerings are provided in a list of objects, where 'note' is the note name and 'fingering' is the machine-readable fingering.
${JSON.stringify(instrumentInfo.notes, null, 2)}`
            : 'No specific fingering data available for this instrument. Use general knowledge.';

          const prompt = `A student in ${userProfile.grade} who plays ${entry.instrument} just finished a ${entry.duration}-minute practice session.
Here is their practice note: "${entry.notes}"

Analyze the note and provide feedback. If they mention a specific note they are struggling with, also provide the fingering for it using the provided chart data.`;

          const responseSchema = {
            type: Type.OBJECT,
            properties: {
              feedbackText: {
                type: Type.STRING,
                description:
                  "A short (2-3 sentences), positive, and specific musical tip based on the student's note. Maintain an encouraging and friendly tone. The advice must be practical and actionable for a student of their grade level."
              },
              fingeringGuide: {
                type: Type.OBJECT,
                nullable: true,
                description:
                  "If the student's note explicitly mentions a struggle with a specific musical note (e.g., 'high C', 'F#', 'low B flat'), provide the fingering. Otherwise, this should be null.",
                properties: {
                  instrument: { type: Type.STRING },
                  noteName: { type: Type.STRING },
                  fingeringDescription: { type: Type.STRING },
                  fingeringMachineReadable: { type: Type.STRING },
                  alternatesMachineReadable: {
                    type: Type.ARRAY,
                    nullable: true,
                    items: { type: Type.STRING }
                  },
                  playingTip: { type: Type.STRING, nullable: true }
                }
              }
            }
          };

          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              systemInstruction: `You are an expert and friendly band director providing feedback. Your goal is to be encouraging while giving one concrete, actionable tip. You must respond in JSON format matching the provided schema.

### Feedback Rules
Tailor feedback to the student's grade level.

### Fingering Guide Rules
Use the provided FINGERING CHART DATA for written notes (not concert pitch). Provide fingeringDescription, fingeringMachineReadable, and alternatesMachineReadable from the chart data when a specific note is mentioned.

### FINGERING CHART DATA for ${entry.instrument}
${fingeringKnowledge}`,
              responseMimeType: "application/json",
              responseSchema,
            },
          });

          if (response.text) {
            try {
              const jsonStr = response.text.trim();
              const cleanedJsonStr = jsonStr.startsWith('```json')
                ? jsonStr.replace(/```json\n|```/g, '')
                : jsonStr;
              const parsedJson = JSON.parse(cleanedJsonStr);

              if (parsedJson.feedbackText) {
                if (
                  parsedJson.fingeringGuide &&
                  (!parsedJson.fingeringGuide.noteName || !parsedJson.fingeringGuide.fingeringDescription)
                ) {
                  parsedJson.fingeringGuide = null;
                }
                aiFeedback = parsedJson;
              }
            } catch (e) {
              console.error("Failed to parse AI JSON response:", response.text, e);
              aiFeedback = { feedbackText: response.text };
            }
          }
        } catch (aiError) {
          console.error("Failed to get AI coach feedback:", aiError);
        }
      }
      
      const newEntryForDb: Omit<PracticeEntry, 'id'> = {
        userId: currentUser.uid,
        studentName: userProfile.name,
        instrument: entry.instrument,
        grade: userProfile.grade!,
        duration: entry.duration,
        date: new Date().toISOString(),
        notes: entry.notes,
        aiCoachResponse: aiFeedback?.feedbackText,
      };

      const recordedId = await api.addEntry(newEntryForDb);

      const newCompleteEntry: PracticeEntry = {
        ...newEntryForDb,
        id: recordedId,
      };

      setPracticeEntries(prev =>
        [newCompleteEntry, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
      setAllPracticeEntries(prev =>
        [newCompleteEntry, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
      setNewlyAddedEntryId(recordedId);
      addToast('Practice entry added successfully!', 'success');

      return aiFeedback;
    } catch (err) {
      const message = getFriendlyErrorMessage(err);
      addToast(message, 'error');
      throw new Error(message);
    }
  };
  
  const addPracticeEntryForGuest = async (
    entry: Omit<PracticeEntry, 'id' | 'date' | 'aiCoachResponse' | 'studentName' | 'grade' | 'userId' | 'ipAddress'>
  ): Promise<AIFeedback | undefined> => {
    if (!userProfile) return;

    const newEntry: PracticeEntry = {
        ...entry,
        id: `mock-entry-${Date.now()}`,
        date: new Date().toISOString(),
        studentName: userProfile.name,
        grade: userProfile.grade!,
        userId: userProfile.id,
    };
    
    setPracticeEntries(prev => 
        [newEntry, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
    setAllPracticeEntries(prev => 
        [newEntry, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
    setNewlyAddedEntryId(newEntry.id);
    addToast('Practice entry added successfully!', 'success');

    if (entry.notes) {
        const mockFeedback: AIFeedback = {
            feedbackText: "This is a mock AI response for guest mode. In the real app, you'd get a personalized tip here!",
        };
        return mockFeedback;
    }

    return undefined;
};

  const handleUpdatePracticeEntry = async (entryId: string, data: Partial<Omit<PracticeEntry, 'id'>>) => {
    try {
      await api.updateEntry(entryId, data);
      const updateFn = (entries: PracticeEntry[]) => entries
        .map(entry => (entry.id === entryId ? { ...entry, ...data } : entry))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setPracticeEntries(updateFn);
      setAllPracticeEntries(updateFn);
      addToast('Entry updated successfully!', 'success');
    } catch (err) {
      const message = getFriendlyErrorMessage(err);
      addToast(message, 'error');
      throw new Error(message);
    }
  };

  const handleDeletePracticeEntry = async (entryId: string) => {
    try {
      await api.deleteEntry(entryId);
      setPracticeEntries(prevEntries => prevEntries.filter(e => e.id !== entryId));
      setAllPracticeEntries(prevEntries => prevEntries.filter(e => e.id !== entryId));
      addToast('Entry deleted.', 'info');
    } catch (err) {
      const message = getFriendlyErrorMessage(err);
      addToast(message, 'error');
      throw new Error(message);
    }
  };

  const handleExitGuestMode = () => {
    setIsGuestMode(false);
    setCurrentUser(null);
    setUserProfile(null);
    setPracticeEntries([]);
    setAllPracticeEntries([]);
    setGoals({});
    setGradeGoals({});
    setSelectedStudentByTeacher(null);
    setIsCompletingProfile(false);
    setIsStudentViewingProfile(false);
    setStudentViewingStudentName(null);
    setError(null);
    setAuthLoading(true);
    setView('dashboard');
  };

  const handleSignOut = async () => {
    if (isGuestMode) {
      handleExitGuestMode();
      return;
    }
    await api.signOut();
    setSelectedStudentByTeacher(null);
    setIsCompletingProfile(false);
    setIsStudentViewingProfile(false);
    setStudentViewingStudentName(null);
    setView('dashboard');
  };

  const handleSelectStudent = (studentName: string) => {
    setSelectedStudentByTeacher(studentName);
  };

  const handleBackToDashboard = () => {
    setSelectedStudentByTeacher(null);
  };

  const handleSetGoal = async (studentName: string, goal: Goal) => {
    try {
      await api.setGoal(studentName, goal);
      setGoals(prev => ({ ...prev, [studentName]: goal }));
      addToast(`Goals updated for ${studentName}.`, 'success');
    } catch (err) {
      const message = getFriendlyErrorMessage(err);
      addToast(message, 'error');
      throw new Error(message);
    }
  };

  const handleSetGroupGoal = async (studentNames: string[], goal: GoalDetail) => {
    try {
      await api.setGroupGoal(studentNames, goal);
      setGoals(prevGoals => {
        const next = { ...prevGoals };
        studentNames.forEach(name => {
          next[name] = { ...(next[name] || {}), overall: goal };
        });
        return next;
      });
      addToast(`Goals updated for ${studentNames.length} students.`, 'success');
    } catch (err) {
      const message = getFriendlyErrorMessage(err);
      addToast(message, 'error');
      throw new Error(message);
    }
  };

  const handleSetGradeGoal = async (grade: GradeLevel, goal: GoalDetail) => {
    try {
      await api.setGradeGoal(grade, goal);
      setGradeGoals(prev => ({ ...prev, [grade]: goal }));
      addToast(`Goals updated for ${grade}.`, 'success');
    } catch (err) {
      const message = getFriendlyErrorMessage(err);
      addToast(message, 'error');
      throw new Error(message);
    }
  };
  
  const handleSetLessonPlan = async (grade: GradeLevel, planData: Omit<LessonPlan, 'createdAt'>) => {
    try {
      await api.setLessonPlanForGrade(grade, planData);
      if (userProfile?.role === 'student' && userProfile.grade === grade) {
        const newPlan = await api.getLessonPlanForGrade(grade);
        setLessonPlan(newPlan);
      }
      addToast(`Lesson plan published for ${grade}.`, 'success');
    } catch (err) {
      const message = getFriendlyErrorMessage(err);
      addToast(message, 'error');
      throw new Error(message);
    }
  };

  const handleTutorialFinish = () => {
    localStorage.setItem('hasSeenTutorial', 'true');
    setShowTutorial(false);
  };
  
  const handleEnterGuestMode = () => {
    const mockEntries = generateMockEntries(mockUserProfile);
    setUserProfile(mockUserProfile);
    setPracticeEntries(mockEntries);
    setAllPracticeEntries(mockEntries);
    setGoals(mockGoals);
    setIsGuestMode(true);
    setAuthLoading(false);
    setIsLoading(false);
  };

  const renderContent = () => {
    if (authLoading) {
      return (
        <div className="min-h-screen bg-maroon-darkest flex items-center justify-center">
          <p className="text-gold text-xl font-heading animate-pulse">Authenticating...</p>
        </div>
      );
    }

    if (view === 'resources' && (userProfile || isGuestMode)) {
      return <PracticeResources />;
    }

    if (isGuestMode) {
      if (!userProfile) return null; // Should not happen

      if (isStudentViewingProfile) {
        return (
          <StudentProfile
            studentName={userProfile.name}
            entries={practiceEntries}
            onBack={() => setIsStudentViewingProfile(false)}
            goals={goals}
            onSetGoal={async () => { addToast("Goals can't be saved in guest mode.", 'info'); }}
            isTeacher={false}
            isOwner={true}
            onUpdateEntry={async () => { addToast("Entries can't be edited in guest mode.", 'info'); }}
            onDeleteEntry={async () => { addToast("Entries can't be deleted in guest mode.", 'info'); }}
          />
        );
      }
      return (
        <StudentDashboard
          userProfile={userProfile}
          practiceEntries={practiceEntries}
          allEntries={allPracticeEntries}
          addPracticeEntry={addPracticeEntryForGuest}
          newlyAddedEntryId={newlyAddedEntryId}
          goals={goals}
          lessonPlan={lessonPlan}
          onViewFullProfile={() => setIsStudentViewingProfile(true)}
          onSelectStudent={(name) => addToast(`Viewing other student profiles is disabled in guest mode.`)}
        />
      );
    }

    if (isCompletingProfile && currentUser) {
      return (
        <CompleteProfileView
          user={currentUser}
          onProfileComplete={async () => {
            if (!currentUser) return;
            const profile = await api.getUserProfile(currentUser.uid);
            if (profile) {
              setUserProfile(profile);
              setPracticeEntries([]);
              setAllPracticeEntries([]);
              setGoals({});
              setIsLoading(false);
              setIsCompletingProfile(false);
            }
          }}
        />
      );
    }

    if (!currentUser || !userProfile) {
      return <AuthView onAuthSuccess={() => { /* Auth listener will re-render */ }} onEnterGuestMode={handleEnterGuestMode} />;
    }

    if (isLoading) {
      return (
        <div className="min-h-screen bg-maroon-darkest flex items-center justify-center">
          <p className="text-gold text-xl font-heading animate-pulse">Loading Practice Data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen bg-maroon-darkest flex items-center justify-center text-center p-4">
          <div>
            <h1 className="text-3xl font-heading text-red-400 mb-4">An Error Occurred</h1>
            <p className="text-gray-300">{error}</p>
          </div>
        </div>
      );
    }

    if (userProfile.role === 'teacher') {
      if (selectedStudentByTeacher) {
        return (
          <StudentProfile
            studentName={selectedStudentByTeacher}
            entries={allPracticeEntries}
            onBack={handleBackToDashboard}
            goals={goals}
            onSetGoal={handleSetGoal}
            isTeacher={true}
            onUpdateEntry={handleUpdatePracticeEntry}
            onDeleteEntry={handleDeletePracticeEntry}
          />
        );
      }
      return (
        <TeacherView
          entries={allPracticeEntries}
          goals={goals}
          gradeGoals={gradeGoals}
          onSelectStudent={handleSelectStudent}
          onSetGroupGoal={handleSetGroupGoal}
          onSetGradeGoal={handleSetGradeGoal}
          onSetLessonPlan={handleSetLessonPlan}
        />
      );
    }

    if (userProfile.role === 'student') {
      if (studentViewingStudentName) {
        return (
           <StudentProfile
                studentName={studentViewingStudentName}
                entries={allPracticeEntries}
                onBack={() => setStudentViewingStudentName(null)}
                goals={goals}
                onSetGoal={async () => { /* No-op */}}
                isTeacher={false}
                isOwner={false}
                onUpdateEntry={async () => { /* No-op */}}
                onDeleteEntry={async () => { /* No-op */}}
            />
        );
      }
      
      if (isStudentViewingProfile) {
        return (
          <StudentProfile
            studentName={userProfile.name}
            entries={practiceEntries}
            onBack={() => setIsStudentViewingProfile(false)}
            goals={goals}
            onSetGoal={handleSetGoal}
            isTeacher={false}
            isOwner={true}
            onUpdateEntry={handleUpdatePracticeEntry}
            onDeleteEntry={handleDeletePracticeEntry}
          />
        );
      }
      return (
        <StudentDashboard
          userProfile={userProfile}
          practiceEntries={practiceEntries}
          allEntries={allPracticeEntries}
          addPracticeEntry={addPracticeEntry}
          newlyAddedEntryId={newlyAddedEntryId}
          goals={goals}
          lessonPlan={lessonPlan}
          onViewFullProfile={() => setIsStudentViewingProfile(true)}
          onSelectStudent={setStudentViewingStudentName}
        />
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-maroon-darkest text-gray-200 font-sans">
      {!isLoading && showTutorial && <TutorialOverlay onFinish={handleTutorialFinish} />}
      <Header 
        userProfile={userProfile} 
        onSignOut={handleSignOut} 
        isGuestMode={isGuestMode}
        currentView={view}
        onNavigate={setView}
      />
      <main className="container mx-auto p-4 md:p-8">
        {renderContent()}
      </main>
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

export default App;