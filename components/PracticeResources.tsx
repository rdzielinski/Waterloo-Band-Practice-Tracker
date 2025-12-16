import React, { useState, useMemo } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { PRACTICE_RESOURCES } from '../resources';
import { INSTRUMENTS } from '../constants';
import BookOpenIcon from './icons/BookOpenIcon';
import ExternalLinkIcon from './icons/ExternalLinkIcon';
import SearchIcon from './icons/SearchIcon';
import FingeringChartTool from './FingeringChartTool';
import SparklesIcon from './icons/SparklesIcon';
import MusicNoteIcon from './icons/MusicNoteIcon';
import { ClockIcon } from './icons/BadgeIcons';
import { HelpCircle } from 'lucide-react';

const AIMusicLibrarian: React.FC = () => {
    const [query, setQuery] = useState('');
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [sources, setSources] = useState<{ uri: string; title: string; }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        setIsLoading(true);
        setError('');
        setAiResponse(null);
        setSources([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `You are a helpful and knowledgeable music librarian for student musicians. Your expertise is in musical concepts, music history, and instrument care. Provide a clear, concise, and encouraging answer to the following question, ensuring your response is relevant to a student musician. Keep the response to a few paragraphs. Question: "${query}"`,
                config: {
                    tools: [{ googleSearch: {} }],
                },
            });

            setAiResponse(response.text);

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
                setSources(webSources);
            }

        } catch (e) {
            console.error("AI Librarian search failed:", e);
            setError("Sorry, the AI Librarian couldn't find an answer. Please check your internet connection and try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="bg-maroon/50 p-6 rounded-xl mb-8 border border-maroon-light">
            <div className="flex items-center space-x-3 mb-3">
                <HelpCircle className="w-8 h-8 text-gold-light" />
                <h4 className="text-2xl font-heading text-gold">AI Music Librarian</h4>
            </div>
            <p className="text-sm text-gray-300 mb-4">Have a music question? Ask about composers, music history, or practice techniques to get an answer from the web.</p>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 items-center">
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="e.g., Who was John Philip Sousa?"
                    className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold px-4 py-2"
                    aria-label="Ask the AI Music Librarian"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !query.trim()}
                    className="w-full sm:w-auto bg-gold hover:bg-gold-light text-maroon-darkest font-bold py-2 px-6 rounded-md shadow-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Searching...' : 'Ask'}
                </button>
            </form>

            {error && <p className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-md text-sm">{error}</p>}

            {isLoading && (
                <div className="mt-4 text-center text-gray-400 animate-pulse">
                    <p>Searching the archives...</p>
                </div>
            )}

            {aiResponse && !isLoading && (
                <div className="mt-6 space-y-4 bg-maroon-dark p-4 rounded-md animate-flash">
                    <h5 className="font-bold text-gold-light">Answer:</h5>
                    <p className="text-gray-200 text-sm whitespace-pre-wrap">{aiResponse}</p>
                    {sources.length > 0 && (
                        <div className="pt-4 border-t border-maroon-light">
                            <h6 className="font-semibold text-gray-300 mb-2">Sources from the web:</h6>
                            <ul className="space-y-2">
                                {sources.map((source, index) => (
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
    );
};


const ScaleCoach: React.FC = () => {
    const MAJOR_SCALES = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
    const [selectedScale, setSelectedScale] = useState(MAJOR_SCALES[0]);
    const [selectedInstrument, setSelectedInstrument] = useState(INSTRUMENTS[0]);
    const [aiResponse, setAiResponse] = useState<{ techniqueTip: string; practiceMethod: string; } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        setIsLoading(true);
        setError('');
        setAiResponse(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `You are an expert and encouraging band director providing a practice prompt for a student who plays the ${selectedInstrument} and is learning the ${selectedScale} Major scale. Provide a tip that is highly specific to the challenges of playing this scale on this particular instrument.

            Provide the following in a JSON object:
            1. "techniqueTip": A short, specific, and actionable technique tip. Focus on common challenges for the ${selectedScale} Major scale on the ${selectedInstrument} (e.g., tricky finger patterns for a flute in F#, intonation for a trumpet's sharp notes, or smooth articulation for a trombone's slide changes).
            2. "practiceMethod": A creative practice method. Suggest a specific rhythm, articulation pattern, or metronome exercise to apply to the scale, relevant to the instrument.

            Example for F Major on Trumpet:
            - Technique Tip: "On trumpet, the note B-flat (first valve) in the F major scale can sometimes be a bit flat. Focus on firm air support and listen carefully to match the pitch, especially when moving from C (open)."
            - Practice Method: "Play the scale using only 'doo' articulation (legato tongue) to build smooth connections between notes, especially over the break. Set a metronome to 72 bpm and play quarter notes."
            `;
            
            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    techniqueTip: {
                        type: Type.STRING,
                        description: "A short, actionable tip on technique, intonation, or articulation for the selected major scale on the specified instrument."
                    },
                    practiceMethod: {
                        type: Type.STRING,
                        description: "A suggested practice method, like using a metronome or a specific rhythm, relevant to the instrument."
                    }
                }
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                },
            });
            
            if (response.text) {
                const jsonStr = response.text.trim();
                const cleanedJsonStr = jsonStr.startsWith('```json') ? jsonStr.replace(/```json\n|```/g, '') : jsonStr;
                const parsed = JSON.parse(cleanedJsonStr);
                setAiResponse(parsed);
            } else {
                throw new Error("Received an empty response from the model.");
            }

        } catch (e) {
            console.error("Failed to generate scale tip:", e);
            setError("Sorry, the practice coach couldn't generate a tip right now. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-maroon/50 p-4 rounded-lg my-4 border border-maroon-light">
            <div className="flex items-center space-x-3 mb-3">
                <SparklesIcon className="w-6 h-6 text-gold-light" />
                <h5 className="font-bold text-white text-lg">Scale Practice Coach</h5>
            </div>
            <p className="text-sm text-gray-300 mb-4">Select your instrument and a major scale to get a custom practice tip!</p>
            
            <div className="flex flex-col sm:flex-row gap-2 items-center flex-wrap">
                <select 
                    value={selectedInstrument} 
                    onChange={e => setSelectedInstrument(e.target.value)}
                    className="w-full sm:w-auto bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold"
                    aria-label="Select an instrument"
                    disabled={isLoading}
                >
                    {INSTRUMENTS.map(inst => <option key={inst} value={inst}>{inst}</option>)}
                </select>
                <select 
                    value={selectedScale} 
                    onChange={e => setSelectedScale(e.target.value)}
                    className="w-full sm:w-auto bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold"
                    aria-label="Select a major scale"
                    disabled={isLoading}
                >
                    {MAJOR_SCALES.map(scale => <option key={scale} value={scale}>{scale} Major</option>)}
                </select>
                <button 
                    onClick={handleGenerate} 
                    disabled={isLoading}
                    className="w-full sm:w-auto bg-gold hover:bg-gold-light text-maroon-darkest font-bold py-2 px-4 rounded-md shadow-md transition-colors disabled:opacity-60"
                >
                    {isLoading ? 'Generating...' : 'Get Tip'}
                </button>
            </div>

            {error && <p className="mt-4 text-red-400 bg-red-900/50 p-2 rounded-md text-sm">{error}</p>}

            {isLoading && (
                <div className="mt-4 text-center text-gray-400 animate-pulse">
                    <p>Thinking of a great tip...</p>
                </div>
            )}

            {aiResponse && !isLoading && (
                <div className="mt-4 space-y-4 bg-maroon-dark p-4 rounded-md animate-flash">
                    <div>
                        <div className="flex items-center space-x-2 mb-1">
                            <MusicNoteIcon className="w-5 h-5 text-gold" />
                            <h6 className="font-semibold text-gold-light">Technique Tip</h6>
                        </div>
                        <p className="text-gray-200 text-sm pl-7">{aiResponse.techniqueTip}</p>
                    </div>
                     <div>
                        <div className="flex items-center space-x-2 mb-1">
                            <ClockIcon className="w-5 h-5 text-gold" />
                            <h6 className="font-semibold text-gold-light">Practice Method</h6>
                        </div>
                        <p className="text-gray-200 text-sm pl-7">{aiResponse.practiceMethod}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const FILTER_CATEGORIES: { [key: string]: string } = {
    all: 'Show All',
    general: 'General',
    woodwind: 'Woodwinds',
    brass: 'Brass',
    percussion: 'Percussion',
};

const PracticeResources: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');

    const filteredResources = useMemo(() => {
        let resourcesByCategory = PRACTICE_RESOURCES;

        // 1. Filter by active category tag
        if (activeFilter !== 'all') {
            resourcesByCategory = PRACTICE_RESOURCES
                .map(category => ({
                    ...category,
                    resources: category.resources.filter(resource =>
                        resource.tags?.includes(activeFilter)
                    ),
                }))
                .filter(category => category.resources.length > 0);
        }

        // 2. Filter by search query
        if (!searchQuery.trim()) {
            return resourcesByCategory;
        }

        const lowercasedQuery = searchQuery.toLowerCase();

        return resourcesByCategory
            .map(category => ({
                ...category,
                resources: category.resources.filter(resource =>
                    resource.title.toLowerCase().includes(lowercasedQuery) ||
                    resource.description.toLowerCase().includes(lowercasedQuery)
                )
            }))
            .filter(category => category.resources.length > 0);
    }, [searchQuery, activeFilter]);

    const totalResourcesFound = useMemo(() =>
        filteredResources.reduce((count, category) => count + category.resources.length, 0),
        [filteredResources]
    );

    return (
        <div className="bg-maroon-dark p-6 rounded-xl shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div className="flex items-center space-x-3">
                    <BookOpenIcon className="w-8 h-8 text-gold" />
                    <h3 className="text-2xl font-heading text-gold">Practice Resources</h3>
                </div>
            </div>

            <AIMusicLibrarian />
            
            <div className="border-t border-maroon-light my-8"></div>


            <div className="relative w-full sm:max-w-xs mb-4">
                 <input
                    type="text"
                    placeholder="Search static resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-maroon-darkest border-maroon rounded-md shadow-sm text-gray-200 focus:ring-gold focus:border-gold pl-10 pr-4 py-2"
                    aria-label="Search static practice resources"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="w-5 h-5 text-gray-400" />
                </div>
            </div>


            <div className="mb-8">
                <p className="text-sm font-medium text-gray-300 mb-2">Filter by Category:</p>
                <div className="flex flex-wrap gap-2">
                    {Object.entries(FILTER_CATEGORIES).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setActiveFilter(key)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                activeFilter === key
                                ? 'bg-gold text-maroon-darkest shadow-md'
                                : 'text-gray-300 bg-maroon hover:bg-maroon-light'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <FingeringChartTool />

            <p className="text-gray-400 mb-8 pt-8 mt-8 border-t border-maroon">
                {activeFilter === 'all'
                    ? 'Or, browse these helpful tools and materials to enhance your practice sessions.'
                    : `Browsing helpful ${FILTER_CATEGORIES[activeFilter]} resources...`
                }
            </p>

            <div className="space-y-8">
                {filteredResources.map(category => (
                    <div key={category.id}>
                        <h4 className="text-xl font-bold text-gold-light mb-4 border-b-2 border-maroon pb-2">{category.name}</h4>
                        
                        {category.id === 'scales' && <ScaleCoach />}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {category.resources.map(resource => (
                                <a
                                    key={resource.id}
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group bg-maroon/50 p-4 rounded-lg flex flex-col justify-between transition-all duration-300 hover:bg-maroon hover:shadow-lg hover:-translate-y-1"
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h5 className="font-bold text-white group-hover:text-gold transition-colors">{resource.title}</h5>
                                            <ExternalLinkIcon className="w-5 h-5 text-gray-400 group-hover:text-gold-light transition-colors flex-shrink-0 ml-2" />
                                        </div>
                                        <p className="text-sm text-gray-300">{resource.description}</p>
                                    </div>
                                    <div className="text-xs text-gold-dark mt-4 font-mono truncate">
                                        {resource.url.replace(/^https?:\/\/(www\.)?/, '')}
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {totalResourcesFound === 0 && (
                <div className="text-center py-16 text-gray-500">
                    <h4 className="text-xl font-bold text-white">No Resources Found</h4>
                    <p>
                        {searchQuery.trim()
                            ? `Your search for "${searchQuery}" did not match any resources in the "${FILTER_CATEGORIES[activeFilter]}" category.`
                            : `There are no resources in the "${FILTER_CATEGORIES[activeFilter]}" category.`
                        }
                    </p>
                </div>
            )}
        </div>
    );
};

export default PracticeResources;