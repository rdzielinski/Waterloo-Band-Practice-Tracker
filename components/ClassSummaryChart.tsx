

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GradeLevel, PracticeEntry } from '../types';
import { TimeDisplayUnit, formatDuration } from '../lib/timeUtils';

interface ClassSummaryChartProps {
    entries: PracticeEntry[];
    timeDisplayUnit: TimeDisplayUnit;
}

const ClassSummaryChart: React.FC<ClassSummaryChartProps> = ({ entries, timeDisplayUnit }) => {
    const data = useMemo(() => {
        const totals: Record<string, number> = {
            [GradeLevel.FIFTH]: 0,
            [GradeLevel.SIXTH]: 0,
            [GradeLevel.SEVENTH_EIGHTH]: 0,
            [GradeLevel.HIGH_SCHOOL]: 0,
        };

        entries.forEach(entry => {
            if (entry.grade in totals) {
                totals[entry.grade] += entry.duration;
            }
        });

        return Object.entries(totals).map(([name, minutes]) => ({
            name,
            minutes: minutes,
        }));
    }, [entries]);

    const yAxisTickFormatter = (value: number) => formatDuration(value, timeDisplayUnit);
    const tooltipFormatter = (value: number) => [formatDuration(value, timeDisplayUnit), "Practice Time"];


    return (
        <div className="bg-maroon-dark p-6 rounded-xl shadow-2xl h-96">
            <h3 className="text-2xl font-heading mb-4 text-gold">Total Practice Time by Class</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#8A4F4F" />
                    <XAxis dataKey="name" stroke="#a0aec0" fontSize={12} />
                    <YAxis stroke="#a0aec0" fontSize={12} tickFormatter={yAxisTickFormatter}/>
                    <Tooltip
                        contentStyle={{ backgroundColor: '#3C1618', border: '1px solid #8A4F4F', color: '#e2e8f0' }}
                        labelStyle={{ color: '#a0aec0' }}
                        cursor={{ fill: 'rgba(138, 79, 79, 0.2)' }}
                        formatter={tooltipFormatter}
                    />
                    <Legend wrapperStyle={{ color: '#e2e8f0' }}/>
                    <Bar dataKey="minutes" fill="#FFC72C" name="Practice Time" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ClassSummaryChart;