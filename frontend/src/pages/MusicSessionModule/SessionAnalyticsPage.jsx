import React from 'react';
import { useNavigate } from 'react-router-dom';
import BaseLayout from '../../layout/BaseLayout';
import HistoryCard from '../../components/MusicSessionModule/HistoryCard';

export default function SessionAnalyticsPage() {
  const navigate = useNavigate();
  
  const dummySessions = [
    { date: "2023-10-01", duration: 25, status: "Completed" },
    { date: "2023-10-02", duration: 40, status: "Completed" },
    { date: "2023-10-03", duration: 15, status: "Interrupted" },
  ];

  return (
    <BaseLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-extrabold text-[#B6B4BB]">Session Analytics</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HistoryCard title="Total Sessions" value="24" />
          <HistoryCard title="Total Study Time" value="12.5 hrs" />
        </div>

        <div className="bg-[#3C436B] border border-[#8F8BB6]/20 shadow-lg rounded-2xl p-6 mt-8">
          <h2 className="text-xl font-bold text-white mb-4">Past Sessions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[#B6B4BB]">
              <thead>
                <tr className="border-b border-[#8F8BB6]/20">
                  <th className="py-3 px-4 font-bold text-white">Date</th>
                  <th className="py-3 px-4 font-bold text-white">Duration (min)</th>
                  <th className="py-3 px-4 font-bold text-white">Status</th>
                </tr>
              </thead>
              <tbody>
                {dummySessions.map((s, i) => (
                  <tr key={i} className="border-b border-[#8F8BB6]/10 hover:bg-black/10 transition-colors">
                    <td className="py-3 px-4">{s.date}</td>
                    <td className="py-3 px-4">{s.duration}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs text-white font-semibold ${s.status === 'Completed' ? 'bg-green-500/80' : 'bg-red-500/80'}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/player/session')}
            className="flex-1 py-3 bg-[#3C436B] hover:bg-[#585296] text-white font-bold rounded-2xl transition-colors border border-[#8F8BB6]/20"
          >
            ← Back to Session
          </button>
          <button 
            onClick={() => navigate('/player')}
            className="flex-1 py-3 bg-[#585296] hover:bg-[#8F8BB6] text-white font-bold rounded-2xl transition-colors"
          >
            Back to Main Player
          </button>
        </div>
      </div>
    </BaseLayout>
  );
}
