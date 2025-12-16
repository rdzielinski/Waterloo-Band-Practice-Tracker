import React from 'react';
import { LessonPlan } from '../types';
import ClipboardListIcon from './icons/ClipboardListIcon';

interface LessonPlanDisplayProps {
    lessonPlan: LessonPlan;
}

const PlanSection: React.FC<{title: string, items: {title: string; description?: string; composer?: string; reasoning?: string}[]}> = ({title, items}) => (
    <div>
        <h4 className="text-lg font-bold text-gold mb-2">{title}</h4>
        <ul className="space-y-3">
            {items.map((item, index) => (
                <li key={index} className="bg-maroon/50 p-3 rounded-lg">
                    <p className="font-semibold text-white">{item.title} {item.composer && <span className="font-normal text-gray-400 text-sm">- {item.composer}</span>}</p>
                    <p className="text-sm text-gray-300 mt-1">{item.description || item.reasoning}</p>
                </li>
            ))}
        </ul>
    </div>
);

const LessonPlanDisplay: React.FC<LessonPlanDisplayProps> = ({ lessonPlan }) => {
    return (
        <div className="bg-maroon-dark p-6 rounded-xl shadow-2xl border-l-4 border-gold">
            <div className="flex items-center space-x-3 mb-4">
                <ClipboardListIcon className="w-8 h-8 text-gold" />
                <div>
                    <h3 className="text-2xl font-heading text-gold">Weekly Focus from Your Teacher</h3>
                    <p className="text-xs text-gray-400">Published on {new Date(lessonPlan.createdAt).toLocaleDateString()}</p>
                </div>
            </div>

            <div className="bg-maroon p-4 rounded-lg mb-4 text-sm">
                <p><span className="font-semibold text-gray-300">Grade:</span> {lessonPlan.grade}</p>
                <p><span className="font-semibold text-gray-300">Focus:</span> {lessonPlan.goals}</p>
                {lessonPlan.repertoire && <p><span className="font-semibold text-gray-300">Repertoire:</span> {lessonPlan.repertoire}</p>}
            </div>

            <div className="space-y-4">
                {lessonPlan.warmUps?.length > 0 && <PlanSection title="Warm-Ups" items={lessonPlan.warmUps} />}
                {lessonPlan.techniqueExercises?.length > 0 && <PlanSection title="Technique Exercises" items={lessonPlan.techniqueExercises} />}
                {lessonPlan.repertoireSuggestions?.length > 0 && <PlanSection title="Repertoire Suggestions" items={lessonPlan.repertoireSuggestions} />}
            </div>
        </div>
    );
};

export default LessonPlanDisplay;