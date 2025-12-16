export type TimeDisplayUnit = 'minutes' | 'hoursAndMinutes';

export const formatDuration = (totalMinutes: number, unit: TimeDisplayUnit): string => {
    if (isNaN(totalMinutes) || totalMinutes < 0) totalMinutes = 0;

    if (unit === 'minutes') {
        return `${Math.round(totalMinutes)} min`;
    }
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
};
