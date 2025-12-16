import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { GradeLevel, INSTRUMENTS } from '../constants';
import { LessonPlan } from '../types';
import ClipboardListIcon from './icons/ClipboardListIcon';
import SparklesIcon from './icons/SparklesIcon';

interface GeneratedPlan {
    warmUps: { title: string; description: string }[];
    techniqueExercises: { title:string; description: string }[];
    repertoireSuggestions: { title: string; composer: string; reasoning: string }[];
}

interface LessonPlanGeneratorProps {
    onPlanGenerated: (grade: GradeLevel, plan: Omit<LessonPlan, 'createdAt'>) => void;
}


const LessonPlanGenerator: React.FC<LessonPlanGeneratorProps> = ({ onPlanGenerated }) => {
    const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
    const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(GradeLevel.SEVENTH_EIGHTH);
    const [practiceGoals, setPracticeGoals] = useState('Improving intonation and sight-reading skills.');
    const [currentRepertoire, setCurrentRepertoire] = useState('');
    
    const [lessonPlan, setLessonPlan] = useState<GeneratedPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInstrumentToggle = (instrument: string) => {
        setSelectedInstruments(prev => 
            prev.includes(instrument) 
                ? prev.filter(i => i !== instrument) 
                : [...prev, instrument]
        );
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedInstruments.length === 0) {
            setError('Please select at least one instrument.');
            return;
        }
        if (!practiceGoals.trim()) {
            setError('Please describe the practice goals.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setLessonPlan(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const repertoireInfo = currentRepertoire.trim() 
                ? `The band is currently working on the following pieces: ${currentRepertoire.trim()}. Please try to connect the warm-ups and technique exercises to potential challenges found in this repertoire.` 
                : '';

            const prompt = `Create a 45-minute band lesson plan for a ${selectedGrade} class. 
The available instruments are: ${selectedInstruments.join(', ')}.
The primary focus of this lesson should be on: "${practiceGoals}".
${repertoireInfo}
The plan should be structured with distinct sections for warm-ups, technique exercises, and repertoire suggestions. Ensure the exercises and repertoire are appropriate for the specified grade level and help achieve the stated goals.`;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    warmUps: {
                        type: Type.ARRAY,
                        description: "A list of 2-3 warm-up exercises, including title and a brief description of how to perform them.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                description: { type: Type.STRING }
                            },
                            required: ['title', 'description']
                        }
                    },
                    techniqueExercises: {
                        type: Type.ARRAY,
                        description: "A list of 2-3 skill-building exercises focused on the lesson's goals.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                description: { type: Type.STRING }
                            },
                            required: ['title', 'description']
                        }
                    },
                    repertoireSuggestions: {
                        type: Type.ARRAY,
                        description: "A list of 2 repertoire suggestions (musical pieces). Include the composer and a brief reasoning for why the piece is suitable.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                composer: { type: Type.STRING },
                                reasoning: { type: Type.STRING }
                            },
                            required: ['title', 'composer', 'reasoning']
                        }
                    }
                },
                required: ['warmUps', 'techniqueExercises', 'repertoireSuggestions']
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema,
                },
            });

            if (response.text) {
                const jsonStr = response.text.trim();
                const cleanedJsonStr = jsonStr.startsWith('```json') ? jsonStr.replace(/```json\n|```/g, '') : jsonStr;
                const generatedData: GeneratedPlan = JSON.parse(cleanedJsonStr);
                setLessonPlan(generatedData);

                const fullPlan: Omit<LessonPlan, 'createdAt'> = {
                    grade: selectedGrade,
                    instruments: selectedInstruments,
                    goals: practiceGoals,
                    repertoire: currentRepertoire,
                    ...generatedData
                };
                onPlanGenerated(selectedGrade, fullPlan);

            } else {
                throw new Error("Received an empty response from the AI.");
            }
        } catch (err) {
            console.error("Failed to generate lesson plan:", err);
            setError("Sorry, there was an error generating the lesson plan. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const PlanSection: React.FC<{title: string, items: {title: string; description?: string; composer?: string; reasoning?: string}[]}> = ({title, items}) => (
        <div>
            <h4 className="text-xl font-heading text-gold mb-3">{title}</h4>
            <ul className="space-y-4">
                {items.map((item, index) => (
                    <li key={index} className="bg-maroon/50 p-4 rounded-lg">
                        <p className="font-bold text-white">{item.title} {item.composer && <span className="font-normal text-gray-400">- {item.composer}</span>}</p>
                        <p className="text-sm text-gray-300 mt-1">{item.description || item.reasoning}</p>
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <div className="bg-maroon-dark p-6 rounded-xl shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
                <ClipboardListIcon className="w-8 h-8 text-gold" />
                <h3 className="text-2xl font-heading text-gold">AI Lesson Plan Generator</h3>
            </div>
            <p className="text-sm text-gray-400 mb-6">Select instruments, a grade level, and define your goals to generate a custom lesson plan for your ensemble.</p>
            
            <form onSubmit={handleGenerate} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">1. Select Instruments</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 bg-maroon-darkest p-3 rounded-lg max-h-48 overflow-y-auto">
                        {INSTRUMENTS.map(instrument => (
                            <label key={instrument} className="flex items-center space-x-2 p-2 rounded-md hover:bg-maroon transition-colors cursor-pointer">
                                <input 
                                    type="checkbox"
                                    checked={selectedInstruments.includes(instrument)}
                                    onChange={() => handleInstrumentToggle(instrument)}
                                    className="h-4 w-4 rounded bg-maroon-light border-maroon-light text-gold focus:ring-gold"
                                />
                                <span className="text-sm text-white">{instrument}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="lesson-grade" className="block text-sm font-medium text-gray-300 mb-2">2. Select Grade Level</label>
                        <select 
                            id="lesson-grade"
                            value={selectedGrade}
                            onChange={e => setSelectedGrade(e.target.value as GradeLevel)}
                            className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold"
                        >
                            {Object.values(GradeLevel).map(level => <option key={level} value={level}>{level}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="lesson-goals" className="block text-sm font-medium text-gray-300 mb-2">3. Define Practice Goals</label>
                        <textarea
                            id="lesson-goals"
                            value={practiceGoals}
                            onChange={e => setPracticeGoals(e.target.value)}
                            rows={3}
                            placeholder="e.g., Improving intonation, working on staccato articulation, sight-reading..."
                            className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="lesson-repertoire" className="block text-sm font-medium text-gray-300 mb-2">4. Current Repertoire (Optional)</label>
                    <textarea
                        id="lesson-repertoire"
                        value={currentRepertoire}
                        onChange={e => setCurrentRepertoire(e.target.value)}
                        rows={3}
                        placeholder="e.g., 'Imperium by Michael Sweeney', 'Centuria by James Swearingen'"
                        className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold"
                    />
                    <p className="text-xs text-gray-400 mt-1">Providing current songs helps the AI create more relevant exercises.</p>
                </div>

                <div className="text-right">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-gold hover:bg-gold-light text-maroon-darkest font-bold py-2 px-6 rounded-md shadow-lg transition-transform transform hover:scale-105 disabled:opacity-60 flex items-center gap-2"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        {isLoading ? 'Generating Plan...' : 'Generate & Publish'}
                    </button>
                </div>
            </form>

            {(isLoading || error || lessonPlan) && (
                <div className="mt-6 pt-6 border-t border-maroon-light">
                    {isLoading && <p className="text-center text-gold animate-pulse">Generating your custom lesson plan...</p>}
                    {error && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}
                    {lessonPlan && (
                        <div className="space-y-6 animate-flash">
                            <h3 className="text-2xl font-heading text-gold text-center mb-4">Generated Plan Preview</h3>
                            <PlanSection title="Warm-Ups" items={lessonPlan.warmUps} />
                            <PlanSection title="Technique Exercises" items={lessonPlan.techniqueExercises} />
                            <PlanSection title="Repertoire Suggestions" items={lessonPlan.repertoireSuggestions} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LessonPlanGenerator;
