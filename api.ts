// filename: api.ts

// Keep all Firestore usage on compat to match firebase.ts.
// Do NOT import from "firebase/firestore" modular here.
import { db, auth, firebase, googleProvider } from "./firebase";
// FIX: Import LessonPlan from types
import { PracticeEntry, Goal, GradeLevel, GoalDetail, UserProfile, LessonPlan } from "./types";
// FIX: Use a default import for the firebase namespace, aliased as firebaseType.
// This allows TypeScript to correctly resolve the type augmentations from 'firebase/compat/firestore'
// and 'firebase/compat/auth'. A type-only import was not sufficient.
import type firebaseType from 'firebase/compat/app';
import "firebase/compat/firestore";
import "firebase/compat/auth";


// Compat typings
// FIX: Use the aliased firebase type import for correct type definitions.
type DocumentData = firebaseType.firestore.DocumentData;
// FIX: Use the aliased firebase type import for correct type definitions.
type QueryDocumentSnapshot = firebaseType.firestore.QueryDocumentSnapshot<DocumentData>;
// FIX: Use the aliased firebase type import for correct type definitions.
type User = firebaseType.User;

const { Timestamp } = firebase.firestore;

const toISODateString = (d: any): string => {
    if (!d) {
        return new Date(0).toISOString();
    }
    // Firestore Timestamp
    if (typeof d.toDate === 'function') {
        return d.toDate().toISOString();
    }
    // JS Date, ISO string, or milliseconds number
    const date = new Date(d);
    if (!isNaN(date.getTime())) {
        return date.toISOString();
    }
    // Fallback for unknown formats
    return new Date(0).toISOString();
};

// Convert snapshot to a plain PracticeEntry
const docToPracticeEntry = (snap: QueryDocumentSnapshot): PracticeEntry => {
  const data = snap.data();
  return {
    id: snap.id,
    userId: String(data.userId ?? ""),
    studentName: String(data.studentName ?? ""),
    instrument: String(data.instrument ?? ""),
    grade: String(data.grade ?? "") as GradeLevel,
    duration: Number(data.duration ?? 0),
    date: toISODateString(data.date),
    notes: String(data.notes ?? ""),
    aiCoachResponse: String(data.aiCoachResponse ?? ""),
    teacherNotes: String(data.teacherNotes ?? ""),
    ipAddress: String(data.ipAddress ?? ""),
  };
};

// Convert a plain JSON object (from a cloud function) to a PracticeEntry
const jsonToPracticeEntry = (data: any): PracticeEntry => {
  return {
    id: String(data.id ?? `missing-id-${Math.random()}`),
    userId: String(data.userId ?? ""),
    studentName: String(data.studentName ?? ""),
    instrument: String(data.instrument ?? ""),
    grade: String(data.grade ?? "") as GradeLevel,
    duration: Number(data.duration ?? 0),
    date: toISODateString(data.date),
    notes: String(data.notes ?? ""),
    aiCoachResponse: String(data.aiCoachResponse ?? ""),
    teacherNotes: String(data.teacherNotes ?? ""),
    ipAddress: String(data.ipAddress ?? ""),
  };
};

interface AddEntryViaFunctionData {
  studentName: string;
  grade: GradeLevel;
  instrument: string;
  duration: number;
  notes?: string;
  dateMs: number;
}
export interface LessonPlanDataForDb extends Omit<LessonPlan, 'createdAt'> {
  createdAt: firebaseType.firestore.Timestamp;
}
interface Api {
  // Auth
  setAuthPersistence: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<User | null>;
  signInWithGoogle: () => Promise<firebaseType.auth.UserCredential>;
  signUpAndCreateProfile: (email: string, password: string, profileData: Omit<UserProfile, 'id' | 'email' | 'role'>) => Promise<User | null>;
  createProfile: (user: User, profileData: { name: string; grade: GradeLevel; instrument: string }) => Promise<void>;
  signOut: () => Promise<void>;
  onAuthStateChanged: (callback: (user: User | null) => void) => () => void;
  getUserProfile: (userId: string) => Promise<UserProfile | null>;
  // Entries
  getEntries: () => Promise<PracticeEntry[]>;
  addEntry: (entry: Omit<PracticeEntry, "id">) => Promise<string>;
  updateEntry: (id: string, updates: Partial<PracticeEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  clearAllEntries: () => Promise<void>;
  getEntryById: (id: string) => Promise<PracticeEntry | null>;
  getStudentEntriesByUserId: (userId: string) => Promise<PracticeEntry[]>;
  addEntryViaFunction: (entryData: AddEntryViaFunctionData) => Promise<string>;
  // Goals
  getGoals: () => Promise<Record<string, Goal>>;
  getStudentGoal: (studentName: string) => Promise<Goal | null>;
  setGoal: (id: string, goal: Goal) => Promise<void>;
  setGroupGoal: (studentNames: string[], goal: GoalDetail) => Promise<void>;
  getGradeGoals: () => Promise<Record<string, GoalDetail>>;
  setGradeGoal: (grade: GradeLevel, goal: GoalDetail) => Promise<void>;
  // Lesson Plans
  setLessonPlanForGrade: (grade: GradeLevel, planData: Omit<LessonPlan, 'createdAt'>) => Promise<void>;
  getLessonPlanForGrade: (grade: GradeLevel) => Promise<LessonPlan | null>;
}

export const api: Api = {
  // --- Auth ---
  setAuthPersistence: async (): Promise<void> => {
    try {
      // Attempt to set session persistence. This is the preferred method for sandboxed
      // environments as it uses sessionStorage, which is often less restricted than localStorage.
      await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
    } catch (error) {
      // If sessionStorage is also unavailable or blocked, the above call will fail.
      // We log the warning and fall back to in-memory persistence ('none').
      // This prevents the app from crashing due to the 'operation-not-supported-in-this-environment'
      // error, ensuring the app remains functional for the current session. The user
      // will be logged out upon page refresh, which is the tradeoff for this environment.
      console.warn(
        "Firebase session persistence is not available. Falling back to in-memory persistence. User will be logged out on refresh.",
        error
      );
      await auth.setPersistence(firebase.auth.Auth.Persistence.NONE);
    }
  },

  signIn: (email: string, password: string): Promise<User | null> => {
    return auth.signInWithEmailAndPassword(email, password).then(credential => credential.user);
  },

  signInWithGoogle: (): Promise<firebaseType.auth.UserCredential> => {
    return auth.signInWithPopup(googleProvider);
  },

  signUpAndCreateProfile: async (email: string, password: string, profileData: Omit<UserProfile, 'id' | 'email' | 'role'>): Promise<User | null> => {
    const credential = await auth.createUserWithEmailAndPassword(email, password);
    if (!credential.user) {
        return null;
    }
    const userProfile: Omit<UserProfile, 'id'> = {
        ...profileData,
        email,
        role: 'student' // All public signups are students
    };
    await db.collection("users").doc(credential.user.uid).set(userProfile);
    return credential.user;
  },
  
  createProfile: async (user: User, profileData: { name: string; grade: GradeLevel; instrument: string }): Promise<void> => {
      const userProfile: Omit<UserProfile, 'id'> = {
          ...profileData,
          email: user.email!,
          role: 'student',
      };
      await db.collection("users").doc(user.uid).set(userProfile);
  },
  
  signOut: (): Promise<void> => {
    return auth.signOut();
  },

  onAuthStateChanged: (callback: (user: User | null) => void): (() => void) => {
    return auth.onAuthStateChanged(callback);
  },
  
  async getUserProfile(userId: string): Promise<UserProfile | null> {
      const doc = await db.collection("users").doc(userId).get();
      if (!doc.exists) {
          // Fallback for teachers created before profiles existed
          const user = auth.currentUser;
          if (user && user.uid === userId && user.email?.endsWith('@waterlooschools.org')) {
              const teacherProfile: UserProfile = {
                  id: userId,
                  email: user.email!,
                  name: user.email!.split('@')[0],
                  role: 'teacher',
              };
              await db.collection("users").doc(userId).set(teacherProfile);
              // Add a temporary flag for the client to detect that this profile was just created.
              // This helps handle a race condition where security rules may not see the new
              // document immediately, causing permission errors on subsequent data fetches.
              (teacherProfile as any)._isNew = true;
              return teacherProfile;
          }
          return null;
      }
      const data = doc.data() as Omit<UserProfile, 'id'>;
      return {
          id: doc.id,
          ...data
      };
  },


  // --- Entries ---
  async getEntries(): Promise<PracticeEntry[]> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated for getEntries");
    }

    // Try direct Firestore access first for everyone (including students).
    // The security rules now allow 'read' for all signed-in users.
    try {
        const snapshot = await db.collection("practiceEntries").get();
        const entries = snapshot.docs.map(docToPracticeEntry);
        return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
        console.error("Error fetching entries:", error);
        throw error;
    }
  },

  async addEntry(entry: Omit<PracticeEntry, "id">): Promise<string> {
    // Validate that userId is set - this is required by Firestore security rules
    if (!entry.userId) {
      throw new Error("Cannot submit practice entry: User ID is missing. Please sign out and sign back in.");
    }

    const payload: Record<string, unknown> = {
      userId: entry.userId,
      studentName: entry.studentName,
      instrument: entry.instrument,
      grade: entry.grade,
      duration: entry.duration,
      date: Timestamp.fromDate(new Date(entry.date ?? new Date().toISOString())),
      notes: entry.notes ?? "",
      aiCoachResponse: entry.aiCoachResponse ?? "",
      teacherNotes: entry.teacherNotes ?? "",
      ipAddress: entry.ipAddress ?? "",
    };
    const ref = await db.collection("practiceEntries").add(payload);
    return ref.id;
  },

  async updateEntry(id: string, updates: Partial<PracticeEntry>): Promise<void> {
    const ref = db.collection("practiceEntries").doc(id);
    const toUpdate: Record<string, unknown> = {};
    if (updates.studentName !== undefined) toUpdate.studentName = updates.studentName;
    if (updates.instrument !== undefined) toUpdate.instrument = updates.instrument;
    if (updates.grade !== undefined) toUpdate.grade = updates.grade;
    if (updates.duration !== undefined) toUpdate.duration = updates.duration;
    if (updates.date !== undefined) toUpdate.date = Timestamp.fromDate(new Date(updates.date));
    if (updates.teacherNotes !== undefined) toUpdate.teacherNotes = updates.teacherNotes;
    await ref.update(toUpdate);
  },

  async deleteEntry(id: string): Promise<void> {
    await db.collection("practiceEntries").doc(id).delete();
  },

  async clearAllEntries(): Promise<void> {
    const batch = db.batch();
    const snapshot = await db.collection("practiceEntries").get();
    snapshot.forEach((snap) => batch.delete(snap.ref));
    await batch.commit();
  },

  async getEntryById(id: string): Promise<PracticeEntry | null> {
    const snap = await db.collection("practiceEntries").doc(id).get();
    if (!snap.exists) return null;
    return docToPracticeEntry(snap as QueryDocumentSnapshot);
  },
  
  async getStudentEntriesByUserId(userId: string): Promise<PracticeEntry[]> {
    const q = db
      .collection("practiceEntries")
      .where("userId", "==", userId);
    const snapshot = await q.get();
    const entries = snapshot.docs.map(docToPracticeEntry);
    // Sort on the client to ensure descending order by date and avoid a 'failed-precondition' error
    // which occurs if a composite Firestore index (userId, date) is not manually created.
    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async addEntryViaFunction(entryData: AddEntryViaFunctionData): Promise<string> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }
    const token = await user.getIdToken();

    // Calls the 'recordPracticeEntry' Firebase Cloud Function to log an entry.
    // This server-side approach is used to securely record metadata like the user's IP address.
    const url = "https://us-central1-band-practice-tracker-c2eed.cloudfunctions.net/recordPracticeEntry";

    const payload = {
      entry: {
        studentName: entryData.studentName,
        grade: entryData.grade,
        instrument: entryData.instrument,
        duration: entryData.duration,
        notes: entryData.notes ?? "",
        date: entryData.dateMs,
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `Server responded with ${response.status}`);
    }

    if (!result.ok || !result.recordedId) {
      throw new Error(result.message || "Function call failed to record entry.");
    }

    return result.recordedId;
  },

  // --- Goals ---
  async getGoals(): Promise<Record<string, Goal>> {
    const snapshot = await db.collection("goals").get();
    if (snapshot.empty) return {};
    const goals: Record<string, Goal> = {};
    snapshot.forEach((snap) => {
      const data = snap.data() as any;
      if (data.overall || data.instruments) {
        // New format exists, use it
        goals[snap.id] = {
          overall: data.overall ?? {},
          instruments: data.instruments ?? {},
        };
      } else {
        // Old format, needs migration
        goals[snap.id] = {
          overall: {
            weeklyMinutes: Number(data.weeklyMinutes ?? 0),
            dailyMinutes: Number(data.dailyMinutes ?? 0),
          },
          instruments: {},
        };
      }
    });
    return goals;
  },

  async getStudentGoal(studentName: string): Promise<Goal | null> {
    const doc = await db.collection("goals").doc(studentName).get();
    if (!doc.exists) {
      return null;
    }
    const data = doc.data() as any;
    if (data.overall || data.instruments) {
      return {
        overall: data.overall ?? {},
        instruments: data.instruments ?? {},
      };
    } else {
      return {
        overall: {
          weeklyMinutes: Number(data.weeklyMinutes ?? 0),
          dailyMinutes: Number(data.dailyMinutes ?? 0),
        },
        instruments: {},
      };
    }
  },

  async setGoal(id: string, goal: Goal): Promise<void> {
    const goalRef = db.collection("goals").doc(id);
    await goalRef.set(goal);
  },

  async setGroupGoal(studentNames: string[], goal: GoalDetail): Promise<void> {
    if (studentNames.length === 0) {
        return;
    }
    const batch = db.batch();
    
    const payload = { overall: goal };

    studentNames.forEach(studentName => {
        const goalRef = db.collection("goals").doc(studentName);
        batch.set(goalRef, payload, { merge: true });
    });

    await batch.commit();
  },

  async getGradeGoals(): Promise<Record<string, GoalDetail>> {
    const snapshot = await db.collection("gradeGoals").get();
    if (snapshot.empty) return {};
    const goals: Record<string, GoalDetail> = {};
    snapshot.forEach((snap) => {
      const data = snap.data();
      // FIX: Sanitize the document ID when reading to match the sanitized ID on write.
      // This ensures the client-side `gradeGoals` object has consistent keys.
      goals[snap.id.replace(/-/g, '/')] = {
        weeklyMinutes: Number((data as any).weeklyMinutes ?? 0),
        dailyMinutes: Number((data as any).dailyMinutes ?? 0),
      };
    });
    return goals;
  },

  async setGradeGoal(grade: GradeLevel, goal: GoalDetail): Promise<void> {
    // FIX: Sanitize the grade level string to create a valid Firestore document ID.
    // Replaces '/' with '-' to handle '7th/8th Grade'.
    const docId = grade.replace(/\//g, '-');
    const goalRef = db.collection("gradeGoals").doc(docId);
    const payload: { [key: string]: number } = {};
    if (goal.weeklyMinutes !== undefined) payload.weeklyMinutes = goal.weeklyMinutes;
    if (goal.dailyMinutes !== undefined) payload.dailyMinutes = goal.dailyMinutes;
    await goalRef.set(payload, { merge: true });
  },

  // --- Lesson Plans ---
  async setLessonPlanForGrade(grade: GradeLevel, planData: Omit<LessonPlan, 'createdAt'>): Promise<void> {
    // FIX: Sanitize the grade level string to create a valid Firestore document ID.
    const docId = grade.replace(/\//g, '-');
    const planRef = db.collection("lessonPlans").doc(docId);
    const payload: LessonPlanDataForDb = {
        ...planData,
        grade, // ensure grade is part of the document data
        createdAt: Timestamp.now(),
    };
    await planRef.set(payload);
  },

  async getLessonPlanForGrade(grade: GradeLevel): Promise<LessonPlan | null> {
      if (!grade) return null;
      // FIX: Sanitize the grade level string to create a valid Firestore document ID.
      const docId = grade.replace(/\//g, '-');
      const planRef = db.collection("lessonPlans").doc(docId);
      const doc = await planRef.get();
      if (!doc.exists) {
          return null;
      }
      const data = doc.data() as LessonPlanDataForDb;
      return {
          ...data,
          createdAt: toISODateString(data.createdAt),
      };
  },
};