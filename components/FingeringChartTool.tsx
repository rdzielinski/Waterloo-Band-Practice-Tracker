import React, { useState, useMemo, useEffect } from 'react';
import { Hand, CheckCircle, Search } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { INSTRUMENT_DATA } from '../lib/fingeringData';
import FingeringDisplay from './FingeringDisplay';
import InteractiveStaff from './InteractiveStaff';
import SparklesIcon from './icons/SparklesIcon';
import XMarkIcon from './icons/XMarkIcon';
import ExternalLinkIcon from './icons/ExternalLinkIcon';

const AVAILABLE_INSTRUMENTS = INSTRUMENT_DATA.map(inst => inst.name);

const FingeringChartTool: React.FC = () => {
    const [selectedInstrumentName, setSelectedInstrumentName] = useState(AVAILABLE_INSTRUMENTS[0]);
    const [selectedNoteInfo, setSelectedNoteInfo] = useState<{ name: string; key: string } | null>(null);
    const [noteQuery, setNoteQuery] = useState('');
    
    // State for AI tips
    const [aiTips, setAiTips] = useState<string | null>(null);
    const [aiSources, setAiSources] = useState<{ uri: string; title: string; }[]>([]);
    const [isFetchingTips, setIsFetchingTips] = useState(false);
    const [tipsError, setTipsError] = useState<string | null>(null);


    const currentInstrument = useMemo(() => {
        return INSTRUMENT_DATA.find(inst => inst.name === selectedInstrumentName);
    }, [selectedInstrumentName]);

    // Effect to fetch AI tips when instrument changes
    useEffect(() => {
        const fetchTips = async () => {
            if (!selectedInstrumentName) return;

            setIsFetchingTips(true);
            setTipsError(null);
            setAiTips(null);
            setAiSources([]);

            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `Provide 2-3 concise, helpful care and technique tips for a student musician playing the ${selectedInstrumentName}. The tips should be practical and easy to understand for a middle or high school student. Format the output as a bulleted or numbered list.`,
                    config: {
                        tools: [{ googleSearch: {} }],
                    },
                });

                setAiTips(response.text);

                const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
                if (groundingChunks) {
                    const uniqueUris = new Set<string>();
                    const webSources = groundingChunks
                        .map((chunk: any) => chunk.web)
                        .filter(Boolean)
                        .filter((web: any) => {
                            if (web.uri && !uniqueUris.has(web.uri)) {
                                uniqueUris.add(web.uri);
                                return true;
                            }
                            return false;
                        })
                        .map((web: any) => ({ uri: web.uri, title: web.title || new URL(web.uri).hostname }));
                    setAiSources(webSources);
                }
            } catch (e) {
                console.error("Failed to fetch AI tips:", e);
                setTipsError("Could not fetch tips at this time. Please check your internet connection and try again.");
            } finally {
                setIsFetchingTips(false);
            }
        };

        fetchTips();
    }, [selectedInstrumentName]);

    // Effect to handle searching for a note from the input
    useEffect(() => {
        if (!currentInstrument) return;

        if (!noteQuery.trim()) {
            if (selectedNoteInfo !== null) {
                setSelectedNoteInfo(null);
            }
            return;
        }

        const findNoteByName = (query: string) => {
          const cleanedQuery = query.trim().toLowerCase().replace('sharp', '#').replace('flat', 'b');
          if (!cleanedQuery) return null;

          let partialMatch: { name: string; key: string } | null = null;

          for (const note of currentInstrument.notes) {
            const noteVariations = note.note.toLowerCase().split('/');
            const originalVariations = note.note.split('/');
            
            for (let i = 0; i < noteVariations.length; i++) {
                const variation = noteVariations[i];
                // Prioritize exact matches (e.g., "c4" matches "C4")
                if (variation === cleanedQuery) {
                    return { name: originalVariations[i], key: note.note };
                }
                // Store the first partial match found and continue searching for an exact match
                if (!partialMatch && variation.startsWith(cleanedQuery)) {
                    partialMatch = { name: originalVariations[i], key: note.note };
                }
            }
          }
          return partialMatch; // Return partial match if no exact match was found
        };
        
        const foundNote = findNoteByName(noteQuery);
        
        if (foundNote) {
            // Update only if the found note is different to prevent loops
            if (foundNote.name !== selectedNoteInfo?.name || foundNote.key !== selectedNoteInfo?.key) {
                setSelectedNoteInfo(foundNote);
            }
        } else {
            // Clear selection if no note is found
            if (selectedNoteInfo !== null) {
                setSelectedNoteInfo(null);
            }
        }
    }, [noteQuery, currentInstrument, selectedNoteInfo]);
    
     const handleNoteSelectFromStaff = (note: { name: string; key: string } | null) => {
        if (note?.name !== selectedNoteInfo?.name || note?.key !== selectedNoteInfo?.key) {
            setSelectedNoteInfo(note);
        }
        // Always sync the input field with the staff selection
        setNoteQuery(note ? note.name : '');
    };


    const result = useMemo(() => {
        if (!currentInstrument) {
            return null;
        }

        if (!selectedNoteInfo) {
            if (noteQuery.trim()) {
                return {
                    note: '?',
                    fingering: 'Note not found. Try again or click on the staff.',
                    notation: currentInstrument.notation_key || '',
                    fingeringLabel: 'Fingering',
                    instrument: currentInstrument,
                    alternates: [],
                };
            }
            return {
                note: '...',
                fingering: 'Select a note on the staff or search above.',
                notation: currentInstrument.notation_key || '',
                fingeringLabel: 'Fingering',
                instrument: currentInstrument,
                alternates: [],
            };
        }
        
        // Find the full fingering data using the unique key from the note info
        const noteData = currentInstrument.notes.find(n => n.note === selectedNoteInfo.key);

        const fingeringLabel = currentInstrument.category.includes('Slide') ? 'Slide Position' : 'Fingering';

        return {
            note: selectedNoteInfo.name,
            fingering: noteData ? noteData.fingering : 'Fingering not available.',
            alternates: noteData ? noteData.alternates : [],
            notation: currentInstrument.notation_key,
            fingeringLabel: fingeringLabel,
            instrument: currentInstrument,
        };
    }, [currentInstrument, selectedNoteInfo, noteQuery]);

    if (!result) return null; // Should not happen if an instrument is always selected

    return (
        <div className="bg-maroon p-6 rounded-xl shadow-inner">
            <div className="flex items-center space-x-3 mb-6">
                <CheckCircle className="w-8 h-8 text-gold" />
                <h3 className="text-2xl font-heading text-gold">Interactive Fingering Finder</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="md:col-span-2">
                     <div className="space-y-4">
                        <div>
                            <label htmlFor="instrument-select" className="block text-sm font-medium text-gray-300 mb-2">1. Select your instrument</label>
                            <select
                                id="instrument-select"
                                value={selectedInstrumentName}
                                onChange={e => {
                                    setSelectedInstrumentName(e.target.value);
                                    setNoteQuery(''); // Clear search on instrument change
                                    setSelectedNoteInfo(null);
                                }}
                                className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold"
                            >
                                {AVAILABLE_INSTRUMENTS.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="note-search" className="block text-sm font-medium text-gray-300 mb-2">2. Search for a note</label>
                             <div className="relative">
                                <input
                                    type="text"
                                    id="note-search"
                                    value={noteQuery}
                                    onChange={e => setNoteQuery(e.target.value)}
                                    placeholder="e.g., F#4, Bb"
                                    className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold pl-10 pr-10"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="w-5 h-5 text-gray-400" />
                                </div>
                                {noteQuery && (
                                    <button
                                        onClick={() => {
                                            setNoteQuery('');
                                            setSelectedNoteInfo(null);
                                        }}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white"
                                        aria-label="Clear search"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="mt-6">
                        <p className="block text-sm font-medium text-gray-300 mb-2">3. View the fingering</p>
                         <div className="bg-maroon-dark p-4 sm:p-6 rounded-xl shadow-lg">
                            <div className="flex flex-col items-center">
                                <div className="mb-4 text-center">
                                    <span className="text-gray-400 text-lg font-medium uppercase block">Selected Note</span>
                                    <span className="text-5xl font-bold block text-gold-light min-h-[60px]">
                                        {result.note}
                                    </span>
                                </div>

                                <div className="mb-6 text-center w-full min-h-[100px] flex flex-col justify-center">
                                <span className="text-gray-400 text-lg font-medium uppercase block mb-4">{result.fingeringLabel}</span>
                                {result.instrument && (
                                    <FingeringDisplay
                                        instrument={result.instrument}
                                        fingering={result.fingering}
                                        alternates={result.alternates}
                                    />
                                )}
                                </div>

                                <div className="mt-4 pt-4 border-t border-maroon-light/50 w-full text-center">
                                    <Hand className="w-6 h-6 inline-block mb-1 text-gray-400" />
                                    <p className="text-sm text-gray-400 font-light italic">
                                        {result.notation}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-3">
                    <p className="block text-sm font-medium text-gray-300 mb-2">... or click on the staff to select</p>
                    <InteractiveStaff 
                        onNoteSelect={handleNoteSelectFromStaff} 
                        selectedNoteName={selectedNoteInfo?.name ?? null}
                    />
                </div>
            </div>

            <div className="mt-6">
                <div className="bg-maroon-dark rounded-xl shadow-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                        <SparklesIcon className="w-6 h-6 text-gold" />
                        <h4 className="font-bold text-lg text-white">AI-Powered Care &amp; Technique Tips</h4>
                    </div>
                    {isFetchingTips && <p className="text-gray-400 animate-pulse">Fetching fresh tips from the web...</p>}
                    {tipsError && <p className="text-red-400 text-sm">{tipsError}</p>}
                    {aiTips && !isFetchingTips && (
                        <div className="space-y-4">
                            <div className="text-sm text-gray-300 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: aiTips.replace(/(\*|\d\.) /g, (match) => `&bull; ${' '.repeat(match.length-2)}`) }} />
                            {aiSources.length > 0 && (
                                <div className="pt-3 border-t border-maroon-light">
                                    <h6 className="font-semibold text-gray-300 text-xs uppercase tracking-wider mb-2">Sources from the web:</h6>
                                    <ul className="space-y-1">
                                        {aiSources.map((source, index) => (
                                            <li key={index}>
                                                <a
                                                    href={source.uri}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-gold hover:text-gold-light hover:underline flex items-center gap-2"
                                                >
                                                    <ExternalLinkIcon className="w-4 h-4 flex-shrink-0" />
                                                    <span className="truncate">{source.title}</span>
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

             <div className="mt-6 text-center text-gray-500 text-sm">
                <p>The visual grouping above separates hands for clarity. For alternate fingerings, consult your instructor.</p>
            </div>
        </div>
    );
};

export default FingeringChartTool;