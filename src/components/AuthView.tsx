import React, { useState } from 'react';
import { api } from '../api';
import AuthIcon from './icons/AuthIcon';
import { GradeLevel, INSTRUMENTS } from '../constants';
import GoogleIcon from './icons/GoogleIcon';

interface AuthViewProps {
    onAuthSuccess: () => void;
    onEnterGuestMode: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess, onEnterGuestMode }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [grade, setGrade] = useState(GradeLevel.FIFTH);
    const [instrument, setInstrument] = useState(INSTRUMENTS[0]);
    
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const getFriendlyErrorMessage = (err: any) => {
        if (err.code) {
            switch (err.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    return 'Invalid email or password.';
                case 'auth/invalid-email':
                    return 'Please enter a valid email address.';
                case 'auth/email-already-in-use':
                    return 'An account with this email already exists. Please log in.';
                case 'auth/weak-password':
                    return 'Password should be at least 6 characters long.';
                
                // Added for provider sign-ins
                case 'auth/popup-blocked-by-browser':
                    return 'The sign-in popup was blocked by your browser. Please allow popups for this site.';
                case 'auth/unauthorized-domain':
                    return 'This domain is not authorized for Google Sign-In. Please check your Firebase project settings under Authentication > Settings > Authorized domains.';
                case 'auth/operation-not-allowed':
                     return 'Google Sign-In is not enabled for this project. Please enable it in the Firebase console.';
                case 'auth/internal-error':
                     return 'An internal authentication error occurred. This may be a configuration issue in the Google Cloud Console (OAuth consent screen).';

                default:
                    console.error("Firebase Auth Error:", err);
                    return `Authentication failed. Please try again. (Error: ${err.code})`;
            }
        }
        console.error("Unexpected Auth Error:", err);
        return 'An unexpected error occurred.';
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Email and password are required.');
            return;
        }
        setIsLoading(true);
        setError('');

        try {
            await api.signIn(email, password);
            // onAuthStateChanged in App.tsx will handle success
        } catch (err) {
            setError(getFriendlyErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password || !name) {
            setError('Name, email, and password are required.');
            return;
        }
        setIsLoading(true);
        setError('');

        try {
            await api.signUpAndCreateProfile(email, password, { name, grade, instrument });
            // onAuthStateChanged in App.tsx will handle success
        } catch (err) {
            setError(getFriendlyErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError('');
        try {
            await api.signInWithGoogle();
            // onAuthStateChanged in App.tsx will handle the rest
        } catch (err: any) {
            // Don't show an error if the user closes the popup
            if (err.code !== 'auth/popup-closed-by-user') {
                setError(getFriendlyErrorMessage(err));
            }
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
                        {isLoginView ? 'Practice Tracker Login' : 'Create Student Account'}
                    </h2>
                    <p className="text-gray-400">
                        {isLoginView ? 'Log in to view dashboards and track practice.' : 'Fill out your info to get started.'}
                    </p>
                </div>

                 <div className="bg-maroon-darkest p-1 rounded-lg flex mb-6">
                    <button
                        onClick={() => setIsLoginView(true)}
                        className={`w-1/2 py-2 text-sm font-bold rounded-md transition-colors ${isLoginView ? 'bg-gold text-maroon-darkest' : 'text-gray-300'}`}
                    >
                        Log In
                    </button>
                    <button
                        onClick={() => setIsLoginView(false)}
                        className={`w-1/2 py-2 text-sm font-bold rounded-md transition-colors ${!isLoginView ? 'bg-gold text-maroon-darkest' : 'text-gray-300'}`}
                    >
                        Sign Up
                    </button>
                </div>
                
                {error && <p className="bg-red-500/20 text-red-300 p-3 rounded-md mb-6 text-center">{error}</p>}

                {isLoginView ? (
                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Login Form */}
                        <div>
                            <label htmlFor="email-login" className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                            <input
                                id="email-login"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@school.edu"
                                className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold"
                                disabled={isLoading}
                                required
                                autoFocus
                            />
                        </div>
                        <div>
                            <label htmlFor="password-login" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                            <input
                                id="password-login"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold"
                                disabled={isLoading}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-gold hover:bg-gold-light text-maroon-darkest font-bold py-3 px-4 rounded-md shadow-lg transition-transform transform hover:scale-105 disabled:opacity-60"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Logging In...' : 'Log In'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSignUp} className="space-y-4">
                        {/* Sign Up Form */}
                        <div>
                            <label htmlFor="name-signup" className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                            <input id="name-signup" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold" disabled={isLoading} required />
                        </div>
                         <div>
                            <label htmlFor="email-signup" className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                            <input id="email-signup" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@email.com" className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold" disabled={isLoading} required />
                        </div>
                        <div>
                            <label htmlFor="password-signup" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                            <input id="password-signup" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6+ characters" className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold" disabled={isLoading} required />
                        </div>
                         <div>
                            <label htmlFor="grade-signup" className="block text-sm font-medium text-gray-300 mb-1">Class</label>
                            <select id="grade-signup" value={grade} onChange={(e) => setGrade(e.target.value as GradeLevel)} className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold" disabled={isLoading}>
                                {(Object.values(GradeLevel) as GradeLevel[]).map(level => <option key={level} value={level}>{level}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="instrument-signup" className="block text-sm font-medium text-gray-300 mb-1">Primary Instrument</label>
                            <select id="instrument-signup" value={instrument} onChange={(e) => setInstrument(e.target.value)} className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold" disabled={isLoading}>
                                {INSTRUMENTS.map(inst => <option key={inst} value={inst}>{inst}</option>)}
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-gold hover:bg-gold-light text-maroon-darkest font-bold py-3 px-4 rounded-md shadow-lg transition-transform transform hover:scale-105 disabled:opacity-60"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </form>
                )}
                 <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-maroon-light" />
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-maroon-dark px-2 text-sm text-gray-400">OR</span>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full flex justify-center items-center gap-3 bg-white hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-md shadow-lg transition-transform transform hover:scale-105 disabled:opacity-60"
                >
                    <GoogleIcon className="w-5 h-5" />
                    Continue with Google
                </button>
                 <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={onEnterGuestMode}
                        disabled={isLoading}
                        className="w-full bg-transparent border-2 border-gold text-gold font-bold py-3 px-4 rounded-md shadow-lg transition-all transform hover:scale-105 hover:bg-gold hover:text-maroon-darkest disabled:opacity-60"
                    >
                        Continue as Guest
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthView;