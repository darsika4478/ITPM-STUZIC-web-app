import React from 'react';

export default function HistoryCard({ title, subtitle, value }) {
  return (
    <div className="bg-[#3C436B] border border-[#8F8BB6]/20 shadow-lg rounded-2xl p-6 flex items-center justify-between hover:shadow-[0_8px_30px_rgba(60,67,107,0.4)] transition-all">
      <div>
        <h3 className="text-white font-bold">{title}</h3>
        {subtitle && <p className="text-[#8F8BB6] text-sm">{subtitle}</p>}
      </div>
      <div className="text-xl font-extrabold text-[#585296]">{value}</div>
    </div>
  );
}
