import React, { useState } from 'react';
import { GradeLevel, PracticeEntry, AIFeedback, UserProfile } from '../types';
import { INSTRUMENTS } from '../constants';
import FeedbackModal from './FeedbackModal';

interface PracticeFormProps {
    onSubmit: (entry: Omit<PracticeEntry, 'id' | 'date' | 'aiCoachResponse' | 'studentName' | 'grade' | 'userId' | 'ipAddress'>) => Promise<AIFeedback | undefined>;
    userProfile: UserProfile;
}

const PracticeForm: React.FC<PracticeFormProps> = ({ onSubmit, userProfile }) => {
    const [instrument, setInstrument] = useState(userProfile.instrument || INSTRUMENTS[0]);
    const [hours, setHours] = useState('');
    const [minutes, setMinutes] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const durationHours = parseInt(hours, 10) || 0;
        const durationMinutes = parseInt(minutes, 10) || 0;
        const totalMinutes = (durationHours * 60) + durationMinutes;

        if (totalMinutes <= 0) {
            setError('Please enter a valid practice duration.');
            return;
        }
        
        setIsSubmitting(true);
        setError('');

        try {
            const feedback = await onSubmit({ 
                instrument, 
                duration: totalMinutes,
                notes: notes.trim(),
            });

            if (feedback && feedback.feedbackText) {
                setAiFeedback(feedback);
            }
            
            setHours('');
            setMinutes('');
            setNotes('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <FeedbackModal
                isOpen={!!aiFeedback}
                feedback={aiFeedback}
                onClose={() => setAiFeedback(null)}
            />
            <div id="practice-form-container" className="bg-maroon-dark p-6 rounded-xl shadow-2xl sticky top-24">
                <h2 className="text-2xl font-heading mb-1 text-gold">Log Practice Time</h2>
                 <p className="text-gray-400 mb-4 text-sm">
                    Logging for <span className="font-bold text-white">{userProfile.name}</span> ({userProfile.grade})
                </p>
                {error && <p className="bg-red-500/20 text-red-300 p-3 rounded-md mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="instrument" className="block text-sm font-medium text-gray-300 mb-1">Instrument</label>
                        <select
                            id="instrument"
                            value={instrument}
                            onChange={(e) => setInstrument(e.target.value)}
                            className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-darkest"
                            disabled={isSubmitting}
                        >
                            {INSTRUMENTS.map((inst) => (
                                <option key={inst} value={inst}>{inst}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="duration-hours" className="block text-sm font-medium text-gray-300 mb-1">Hours</label>
                            <input
                                id="duration-hours"
                                type="number"
                                min="0"
                                value={hours}
                                onChange={(e) => setHours(e.target.value)}
                                placeholder="e.g., 1"
                                className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-darkest"
                                disabled={isSubmitting}
                            />
                        </div>
                        <div>
                            <label htmlFor="duration-minutes" className="block text-sm font-medium text-gray-300 mb-1">Minutes</label>
                            <input
                                id="duration-minutes"
                                type="number"
                                min="0"
                                max="59"
                                value={minutes}
                                onChange={(e) => setMinutes(e.target.value)}
                                placeholder="e.g., 30"
                                className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-darkest"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">Notes (Optional)</label>
                        <textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g., Worked on scales, struggled with high C."
                            className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-darkest"
                            rows={3}
                            disabled={isSubmitting}
                        />
                         <p className="text-xs text-gray-400 mt-1">Submit a note to get a helpful tip from our practice coach!</p>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gold hover:bg-gold-light text-maroon-darkest font-bold py-3 px-4 rounded-md shadow-lg transition-transform transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-darkest focus-visible:ring-gold"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Adding...' : 'Add Entry'}
                    </button>
                </form>
            </div>
        </>
    );
};

export default PracticeForm;