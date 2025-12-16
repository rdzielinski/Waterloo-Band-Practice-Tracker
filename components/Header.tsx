import React from 'react';
import PirateLogo from './icons/PirateLogo';
import { UserProfile } from '../types';

interface HeaderProps {
    userProfile: UserProfile | null;
    onSignOut: () => void;
    isGuestMode?: boolean;
    currentView: 'dashboard' | 'resources';
    onNavigate: (view: 'dashboard' | 'resources') => void;
}

const Header: React.FC<HeaderProps> = ({ userProfile, onSignOut, isGuestMode, currentView, onNavigate }) => {
    
    const NavButton: React.FC<{ view: 'dashboard' | 'resources', label: string }> = ({ view, label }) => {
        const isActive = currentView === view;
        return (
            <button
                onClick={() => onNavigate(view)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-darkest ${
                    isActive
                    ? 'bg-gold text-maroon-darkest shadow-md'
                    : 'text-gray-300 hover:bg-maroon'
                }`}
                aria-current={isActive ? 'page' : undefined}
            >
                {label}
            </button>
        );
    };

    return (
        <header className="bg-maroon-dark/50 backdrop-blur-sm shadow-lg sticky top-0 z-10">
            <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <PirateLogo className="w-12 h-12" />
                    <h1 className="text-2xl md:text-3xl font-heading tracking-wider text-gold-light">
                        Waterloo Pirates Practice Tracker
                    </h1>
                </div>

                {userProfile && (
                    <nav className="hidden md:flex items-center space-x-2 absolute left-1/2 -translate-x-1/2" aria-label="Main navigation">
                        <NavButton view="dashboard" label="Dashboard" />
                        <NavButton view="resources" label="Resources" />
                    </nav>
                )}

                <div className="flex items-center space-x-4">
                     {userProfile ? (
                        <>
                            <span className="text-gray-300 text-sm hidden sm:block">
                                Welcome, <span className="font-bold text-white">{userProfile.name}</span>
                                {userProfile.isAdmin && <span className="text-xs font-bold ml-2 text-red-400">(Admin)</span>}
                                {isGuestMode && <span className="text-xs text-gold ml-2">(Guest Mode)</span>}
                            </span>
                             <button
                                onClick={onSignOut}
                                className="px-4 py-2 text-sm font-medium rounded-md transition-colors text-gray-300 bg-maroon-dark hover:bg-maroon-light/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-maroon-darkest"
                            >
                                {isGuestMode ? 'Exit Guest Mode' : 'Sign Out'}
                            </button>
                        </>
                    ) : (
                        <span className="text-gray-400 text-sm">Please log in or sign up.</span>
                    )}
                </div>
            </div>
             {userProfile && (
                <nav className="md:hidden bg-maroon-dark/30 px-4 pb-3 -mt-2" aria-label="Main navigation">
                    <div className="flex items-center space-x-2 justify-center">
                        <NavButton view="dashboard" label="Dashboard" />
                        <NavButton view="resources" label="Resources" />
                    </div>
                </nav>
            )}
        </header>
    );
};

export default Header;
