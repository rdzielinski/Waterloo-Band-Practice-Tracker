
import React from 'react';
import { ReportData } from '../types';
import PrinterIcon from './icons/PrinterIcon';
import XMarkIcon from './icons/XMarkIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface ReportCardProps {
    report: ReportData;
    onClose: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onClose }) => {

    const handlePrint = () => {
        document.body.classList.add('is-printing');
        window.print();
        document.body.classList.remove('is-printing');
    };

    const ReportStat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
        <div className="text-center bg-maroon p-4 rounded-lg shadow-inner">
            <p className="text-sm text-gray-300 uppercase tracking-wider">{label}</p>
            <p className="text-3xl font-bold text-gold">{value}</p>
        </div>
    );

    const chartTitle = report.isAllStudents 
        ? "Total Hours by Class" 
        : "Minutes Per Week";

    return (
        <div className="bg-maroon-dark p-6 md:p-8 rounded-xl shadow-2xl printable-area border-2 border-gold/50">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-3xl font-heading text-gold-light">{report.title}</h3>
                    <p className="text-gray-400">{report.periodLabel} ({report.startDate} - {report.endDate})</p>
                </div>
                <div className="flex space-x-2">
                    <button onClick={handlePrint} className="text-gold hover:text-gold-light p-2 rounded-md hover:bg-maroon transition-colors" aria-label="Print Report">
                        <PrinterIcon className="w-6 h-6" />
                    </button>
                     <button onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-md hover:bg-maroon transition-colors" aria-label="Close Report">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                <ReportStat label="Total Practice Hours" value={report.totalHours} />
                <ReportStat label="Sessions Logged" value={String(report.totalSessions)} />
                <ReportStat label="Avg. Session (min)" value={report.averageMinutes} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <div className="bg-maroon p-6 rounded-lg h-80">
                    <h4 className="text-xl font-heading mb-4 text-gold">{chartTitle}</h4>
                    {report.chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="90%">
                            {report.isAllStudents ? (
                                <BarChart data={report.chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#8A4F4F" />
                                    <XAxis dataKey="name" stroke="#a0aec0" fontSize={12} />
                                    <YAxis stroke="#a0aec0" fontSize={12} />
                                    <Tooltip contentStyle={{ backgroundColor: '#3C1618', border: '1px solid #8A4F4F' }} />
                                    <Bar dataKey="hours" fill="#FFC72C" name="Practice Hours" />
                                </BarChart>
                            ) : (
                                <LineChart data={report.chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                     <CartesianGrid strokeDasharray="3 3" stroke="#8A4F4F" />
                                    <XAxis dataKey="date" name="Week Of" stroke="#a0aec0" fontSize={12} />
                                    <YAxis stroke="#a0aec0" fontSize={12} unit="m" />
                                    <Tooltip contentStyle={{ backgroundColor: '#3C1618', border: '1px solid #8A4F4F' }} />
                                    <Line type="monotone" dataKey="minutes" stroke="#FFC72C" strokeWidth={2} />
                                </LineChart>
                            )}
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 -mt-8">
                            <p>No chart data for this period.</p>
                        </div>
                    )}
                </div>

                {!report.isAllStudents && (
                     <div className="bg-maroon p-6 rounded-lg">
                        <h4 className="text-xl font-heading text-gold mb-4">Achievements Earned</h4>
                         {report.achievements && report.achievements.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {report.achievements.map(badge => (
                                    <div key={badge.id} title={badge.description} className="flex flex-col items-center text-center p-2 bg-maroon-dark rounded-lg space-y-1">
                                        <badge.icon className="w-12 h-12 text-gold-light" />
                                        <p className="text-xs font-semibold text-white">{badge.name}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <div className="text-center py-8 text-gray-500">
                                <p>No badges earned yet.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportCard;
