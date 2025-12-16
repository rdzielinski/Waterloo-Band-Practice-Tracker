
import { GradeLevel } from './types';

export const INSTRUMENTS = [
  'Flute', 
  'Oboe',
  'B-flat Clarinet',
  'Bass Clarinet', 
  'Alto Saxophone',
  'Tenor Saxophone',
  'Baritone Saxophone',
  'French Horn', 
  'Trumpet', 
  'Trombone', 
  'Baritone/Euphonium',
  'Tuba', 
  'Percussion', 
  'Piano'
];

export const INSTRUMENT_GROUPS: { [key: string]: string[] } = {
  'Woodwinds': ['Flute', 'Oboe', 'B-flat Clarinet', 'Bass Clarinet', 'Alto Saxophone', 'Tenor Saxophone', 'Baritone Saxophone'],
  'Brass': ['French Horn', 'Trumpet', 'Trombone', 'Baritone/Euphonium', 'Baritone/Euphonium (T.C.)', 'Tuba'],
  'Percussion': ['Percussion'],
  'Keyboard/Other': ['Piano'],
};

// FIX: Re-export GradeLevel so it can be imported from this module.
export { GradeLevel };
