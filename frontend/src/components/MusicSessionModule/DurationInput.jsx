import React from 'react';

export default function DurationInput({ duration, setDuration, isActive }) {
  const handleChange = (e) => {
    setDuration(e.target.value);
  };

  const error = duration !== '' && (isNaN(duration) || duration < 1 || duration > 120);

  return (
    <div className="flex flex-col mb-4">
      <label className="text-[#8F8BB6] font-semibold mb-2">Duration (minutes) [1-120]</label>
      <input
        type="number"
        value={duration}
        onChange={handleChange}
        disabled={isActive}
        className="px-4 py-2 rounded-xl bg-[#3C436B]/60 text-white border border-[#8F8BB6]/30 focus:outline-none focus:border-[#8F8BB6] disabled:opacity-50"
        placeholder="Enter minutes..."
      />
      {error && <span className="text-red-400 text-sm mt-1">Duration must be a number between 1 and 120.</span>}
    </div>
  );
}
