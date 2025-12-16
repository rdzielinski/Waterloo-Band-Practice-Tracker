import { ResourceCategory } from './types';

export const PRACTICE_RESOURCES: ResourceCategory[] = [
    {
        id: 'tools',
        name: 'Essential Tools',
        resources: [
            {
                id: 'metronome',
                title: 'Online Metronome',
                description: 'A simple, free metronome to help you keep a steady tempo during practice.',
                url: 'https://www.metronomeonline.com/',
                tags: ['general'],
            },
            {
                id: 'tuner',
                title: 'Online Tuner',
                description: 'Use your device\'s microphone to check your tuning and improve your intonation.',
                url: 'https://tuner.ninja/',
                tags: ['general'],
            },
             {
                id: 'music-theory',
                title: 'MusicTheory.net',
                description: 'Free lessons and exercises for everything from reading notes to complex chords.',
                url: 'https://www.musictheory.net/',
                tags: ['general'],
            },
        ]
    },
    {
        id: 'warmups',
        name: 'Warm-Ups & Fundamentals',
        resources: [
            {
                id: 'long-tones',
                title: 'The Importance of Long Tones',
                description: 'A great article explaining why long tones are crucial for developing good tone on a wind instrument.',
                url: 'https://www.banddirector.com/article/pg-concert-band/the-importance-of-long-tones',
                tags: ['woodwind', 'brass'],
            },
            {
                id: 'breathing-gym',
                title: 'The Breathing Gym Basics',
                description: 'Learn the foundational breathing exercises that will dramatically improve your sound and endurance.',
                url: 'https://www.youtube.com/watch?v=19g5G_8T4_Q',
                tags: ['woodwind', 'brass'],
            },
        ]
    },
    {
        id: 'scales',
        name: 'Scales & Technique',
        resources: [
            {
                id: 'major-scales',
                title: 'Major Scale Fingering Charts',
                description: 'Printable fingering charts for all 12 major scales for every common band instrument.',
                url: 'https://www.music-for-music-teachers.com/major-scales.html',
                tags: ['general'],
            },
            {
                id: 'articulation',
                title: 'Basics of Articulation',
                description: 'A video lesson explaining the different types of articulation (legato, staccato, accents) and how to practice them.',
                url: 'https://www.youtube.com/watch?v=J_gDQ-T-yig',
                tags: ['woodwind', 'brass'],
            },
             {
                id: 'sight-reading',
                title: 'Sight Reading Factory',
                description: 'Generate unlimited sight-reading exercises for your instrument. A great tool for daily practice.',
                url: 'https://www.sightreadingfactory.com/',
                tags: ['general'],
            },
        ]
    },
    {
        id: 'musicianship',
        name: 'Musicianship & Performance',
        resources: [
            {
                id: 'rhythm-trainer',
                title: 'The Rhythm Trainer',
                description: 'Improve your rhythm skills with this interactive rhythm training game.',
                url: 'https://www.therhythmtrainer.com/',
                tags: ['general'],
            },
            {
                id: 'ear-training',
                title: 'Tonedear Ear Training',
                description: 'Comprehensive ear training exercises for intervals, chords, scales, and more.',
                url: 'https://tonedear.com/',
                tags: ['general'],
            },
            {
                id: 'performance-anxiety',
                title: 'Managing Performance Anxiety',
                description: 'Practical tips and strategies for overcoming stage fright from The Bulletproof Musician.',
                url: 'https://bulletproofmusician.com/how-to-manage-performance-anxiety-in-the-practice-room-so-you-dont-freak-out-on-stage/',
                tags: ['general'],
            },
        ]
    },
    {
        id: 'instrument_specifics',
        name: 'Instrument Care & Specifics',
        resources: [
            {
                id: 'instrument-care',
                title: 'Instrument Cleaning & Care Guide',
                description: 'General guides for cleaning and maintaining your woodwind or brass instrument.',
                url: 'https://www.wwbw.com/the-music-room/caring-for-your-instrument-woodwind-vs-brasswind',
                tags: ['woodwind', 'brass'],
            },
            {
                id: 'woodwind-reed-care',
                title: 'Woodwind Reed Selection & Care',
                description: 'A guide to choosing, breaking in, and storing reeds for clarinet and saxophone to maximize their lifespan and performance.',
                url: 'https://www.youtube.com/watch?v=N-3t6M-s_4s',
                tags: ['woodwind']
            },
            {
                id: 'flute-embouchure',
                title: 'Flute Embouchure Masterclass',
                description: 'A detailed video tutorial on forming the correct embouchure for a clear and consistent flute tone.',
                url: 'https://www.youtube.com/watch?v=dAbPa-wg6kE',
                tags: ['woodwind']
            },
            {
                id: 'brass-buzzing',
                title: 'Mouthpiece Buzzing for Brass',
                description: 'A video tutorial on the importance of mouthpiece buzzing and how to do it effectively.',
                url: 'https://www.youtube.com/watch?v=J24U_g_YSoM',
                tags: ['brass'],
            },
            {
                id: 'brass-lip-slurs',
                title: 'Essential Lip Slur Exercises',
                description: 'A video demonstrating fundamental lip slur exercises for all brass instruments to improve flexibility and range.',
                url: 'https://www.youtube.com/watch?v=Nn_Mrgcz0wI',
                tags: ['brass']
            },
            {
                id: 'percussion-rudiments',
                title: '40 Essential Percussion Rudiments',
                description: 'Learn and master the foundational rudiments for snare drum from Vic Firth.',
                url: 'https://vicfirth.zildjian.com/education/40-essential-rudiments.html',
                tags: ['percussion'],
            },
            {
                id: 'percussion-mallet-grip',
                title: 'Four-Mallet Grip Technique (Mallets)',
                description: 'A video breakdown of the two most common four-mallet grips for keyboard percussion: Stevens and Burton.',
                url: 'https://www.youtube.com/watch?v=u-2I-82_2yI',
                tags: ['percussion']
            },
            {
                id: 'percussion-timpani-tuning',
                title: 'An Introduction to Timpani Tuning',
                description: 'Learn the basics of how to clear a timpani head and tune to specific pitches using pedals and a tuner.',
                url: 'https://www.youtube.com/watch?v=ZfO4sQP0nNo',
                tags: ['percussion']
            }
        ]
    }
];