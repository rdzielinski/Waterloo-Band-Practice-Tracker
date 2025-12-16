
import React from 'react';
import { PracticeEntry } from '../types';
import LightbulbIcon from './icons/LightbulbIcon';

interface AICoachCornerProps {
    entry: PracticeEntry;
}

const AICoachCorner: React.FC<AICoachCornerProps> = ({ entry }) => {
    if (!entry.aiCoachResponse) {
        return null;
    }

    return (
        <div className="bg-gradient-to-br from-maroon to-maroon-dark p-6 rounded-xl shadow-2xl border-l-4 border-gold">
            <div className="flex items-start space-x-4">
                <div className="bg-gold/20 p-3 rounded-full">
                     <LightbulbIcon className="w-8 h-8 text-gold-light" />
                </div>
                <div>
                    <h3 className="text-2xl font-heading text-gold">Coach's Corner</h3>
                    <p className="text-sm text-gray-400 mb-3">Here's a tip based on your recent practice session:</p>
                    <blockquote className="border-l-4 border-gold-dark pl-4">
                        <p className="text-gray-200 italic">"{entry.aiCoachResponse}"</p>
                    </blockquote>
                    <p className="text-xs text-gray-500 mt-4">
                        Feedback for your {entry.duration} minute {entry.instrument} session on {new Date(entry.date).toLocaleDateString()}.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AICoachCorner;