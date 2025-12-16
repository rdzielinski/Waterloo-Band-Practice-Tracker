import React from 'react';

export enum GradeLevel {
  FIFTH = '5th Grade',
  SIXTH = '6th Grade',
  SEVENTH_EIGHTH = '7th/8th Grade',
  HIGH_SCHOOL = 'High School Band',
}

export interface PracticeEntry {
  id: string;
  userId: string;
  studentName: string;
  instrument: string;
  grade: GradeLevel;
  duration: number; // in minutes
  date: string;
  notes?: string;
  aiCoachResponse?: string;
  teacherNotes?: string;
  ipAddress?: string;
}

export interface UserProfile {
  id: string; // Corresponds to Firebase Auth UID
  name: string;
  email: string;
  role: 'student' | 'teacher';
  grade?: GradeLevel;
  instrument?: string;
  isAdmin?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export interface GoalDetail {
  weeklyMinutes?: number;
  dailyMinutes?: number;
}

export interface Goal {
  overall?: GoalDetail;
  instruments?: Record<string, GoalDetail>;
}

export interface ReportData {
    title: string;
    studentName: string; // "All Students" or a specific name
    periodLabel: string;
    startDate: string;
    endDate: string;
    totalHours: string;
    totalSessions: number;
    averageMinutes: string;
    achievements?: Badge[]; // Only for single student reports
    chartData: any[]; // Data for the report's chart
    isAllStudents: boolean;
}

export interface PracticeResource {
  id: string;
  title: string;
  description: string;
  url: string;
  tags?: string[];
}

export interface ResourceCategory {
  id: string;
  name: string;
  resources: PracticeResource[];
}

export interface FingeringGuideData {
  instrument: string;
  noteName: string;
  fingeringDescription: string;
  fingeringMachineReadable?: string;
  alternatesMachineReadable?: string[];
  playingTip?: string;
}

export interface AIFeedback {
  feedbackText: string;
  fingeringGuide?: FingeringGuideData;
}

// FIX: Add missing LessonPlan related interfaces to fix import errors.
export interface LessonPlanItem {
    title: string;
    description: string;
}

export interface LessonPlanRepertoire {
    title: string;
    composer: string;
    reasoning: string;
}

export interface LessonPlan {
    grade: GradeLevel;
    instruments: string[];
    goals: string;
    repertoire?: string;
    warmUps: LessonPlanItem[];
    techniqueExercises: LessonPlanItem[];
    repertoireSuggestions: LessonPlanRepertoire[];
    createdAt: string; // ISO string
}
