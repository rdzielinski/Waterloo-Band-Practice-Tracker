import React, { useState } from 'react';
import { api } from '../api';
import { GradeLevel, INSTRUMENTS } from '../constants';
import type firebase from 'firebase/compat/app';
import AuthIcon from './icons/AuthIcon';

interface CompleteProfileViewProps {
    user: firebase.User;
    onProfileComplete: () => void;
}

const CompleteProfileView: React.FC<CompleteProfileViewProps> = ({ user, onProfileComplete }) => {
    const [name, setName] = useState(user.displayName || '');
    const [grade, setGrade] = useState(GradeLevel.FIFTH);
    const [instrument, setInstrument] = useState(INSTRUMENTS[0]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Please enter your full name.');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            await api.createProfile(user, { name, grade, instrument });
            onProfileComplete();
        } catch (err) {
            setError('Failed to save profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-8 animate-fade-in-up">
            <div className="bg-maroon-dark p-8 rounded-xl shadow-2xl">
                <div className="text-center mb-6">
                    <AuthIcon className="w-16 h-16 mx-auto text-gold" />
                    <h2 className="text-3xl font-heading text-gold-light mt-4">
                        Complete Your Profile
                    </h2>
                    <p className="text-gray-400">
                        Welcome, <span className="font-bold text-white">{user.displayName || 'new student'}</span>! Just a few more details to get started.
                    </p>
                </div>
                
                {error && <p className="bg-red-500/20 text-red-300 p-3 rounded-md mb-6 text-center">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name-complete" className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                        <input 
                            id="name-complete" 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder="Jane Doe" 
                            className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold" 
                            disabled={isLoading} 
                            required 
                        />
                    </div>
                    <div>
                        <label htmlFor="grade-complete" className="block text-sm font-medium text-gray-300 mb-1">Class</label>
                        <select 
                            id="grade-complete" 
                            value={grade} 
                            onChange={(e) => setGrade(e.target.value as GradeLevel)} 
                            className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold" 
                            disabled={isLoading}
                        >
                            {(Object.values(GradeLevel) as GradeLevel[]).map(level => <option key={level} value={level}>{level}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="instrument-complete" className="block text-sm font-medium text-gray-300 mb-1">Primary Instrument</label>
                        <select 
                            id="instrument-complete" 
                            value={instrument} 
                            onChange={(e) => setInstrument(e.target.value)} 
                            className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold" 
                            disabled={isLoading}
                        >
                            {INSTRUMENTS.map(inst => <option key={inst} value={inst}>{inst}</option>)}
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gold hover:bg-gold-light text-maroon-darkest font-bold py-3 px-4 rounded-md shadow-lg transition-transform transform hover:scale-105 disabled:opacity-60"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Saving...' : 'Complete Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CompleteProfileView;