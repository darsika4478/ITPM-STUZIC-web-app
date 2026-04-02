import React, { useState } from 'react';

const SessionConfigForm = ({ onConfigSubmit, isSessionActive }) => {
  const [formData, setFormData] = useState({
    sessionType: 'Deep Work',
    goal: '',
    subject: '',
    topic: '',
    focusLevel: 'Medium',
    breakReminder: true
  });
  
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.goal.trim()) {
      newErrors.goal = 'Session goal is required';
    } else if (formData.goal.length < 5) {
      newErrors.goal = 'Goal must be at least 5 characters long';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.length < 2) {
      newErrors.subject = 'Subject name is too short';
    }

    if (!formData.topic.trim()) {
      newErrors.topic = 'Topic is required';
    } else if (formData.topic.length < 3) {
      newErrors.topic = 'Topic name is too short';
    }
    
    if (!formData.sessionType) {
      newErrors.sessionType = 'Please select a session type';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onConfigSubmit(formData);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#3C436B] to-[#585296] rounded-3xl p-8 border border-[#8F8BB6]/30 shadow-2xl h-full">
      <h2 className="text-[#B6B4BB] text-sm font-semibold mb-6 uppercase tracking-wider">Session Settings</h2>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Session Type */}
        <div>
          <label className="text-[#B6B4BB] text-sm block mb-2 font-medium">Session Type</label>
          <select
            name="sessionType"
            value={formData.sessionType}
            onChange={handleChange}
            disabled={isSessionActive}
            className={`w-full px-4 py-3 bg-[#272D3E] border rounded-xl text-white focus:outline-none transition-all ${
              errors.sessionType ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-[#585296]/50 focus:border-[#8F8BB6]'
            } disabled:opacity-50 appearance-none`}
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23B6B4BB\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em' }}
          >
            <option value="Deep Work">🧠 Deep Work</option>
            <option value="Light Study">📖 Light Study</option>
            <option value="Exam Prep">📝 Exam Prep</option>
            <option value="Creative Session">🎨 Creative Session</option>
            <option value="General Study">🎓 General Study</option>
          </select>
          {errors.sessionType && <p className="text-red-400 text-xs mt-1 ml-1">{errors.sessionType}</p>}
        </div>

        {/* Session Goal */}
        <div>
          <label className="text-[#B6B4BB] text-sm block mb-2 font-medium">Primary Goal</label>
          <input
            type="text"
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            placeholder="What do you want to achieve?"
            disabled={isSessionActive}
            className={`w-full px-4 py-3 bg-[#272D3E] border rounded-xl text-white placeholder-[#8F8BB6]/50 focus:outline-none transition-all ${
              errors.goal ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-[#585296]/50 focus:border-[#8F8BB6]'
            } disabled:opacity-50`}
          />
          {errors.goal && <p className="text-red-400 text-xs mt-1 ml-1">{errors.goal}</p>}
        </div>

        {/* Subject and Topic (New Fields) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[#B6B4BB] text-sm block mb-2 font-medium">Subject/Module</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="e.g. Science"
              disabled={isSessionActive}
              className={`w-full px-4 py-3 bg-[#272D3E] border rounded-xl text-white placeholder-[#8F8BB6]/50 focus:outline-none transition-all ${
                errors.subject ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-[#585296]/50 focus:border-[#8F8BB6]'
              } disabled:opacity-50`}
            />
            {errors.subject && <p className="text-red-400 text-[10px] mt-1 ml-1">{errors.subject}</p>}
          </div>
          <div>
            <label className="text-[#B6B4BB] text-sm block mb-2 font-medium">Specific Topic</label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              placeholder="e.g. Algebra"
              disabled={isSessionActive}
              className={`w-full px-4 py-3 bg-[#272D3E] border rounded-xl text-white placeholder-[#8F8BB6]/50 focus:outline-none transition-all ${
                errors.topic ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-[#585296]/50 focus:border-[#8F8BB6]'
              } disabled:opacity-50`}
            />
            {errors.topic && <p className="text-red-400 text-[10px] mt-1 ml-1">{errors.topic}</p>}
          </div>
        </div>

        {/* Focus Level and Break Reminder Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[#B6B4BB] text-sm block mb-2 font-medium">Focus Level</label>
            <select
              name="focusLevel"
              value={formData.focusLevel}
              onChange={handleChange}
              disabled={isSessionActive}
              className="w-full px-4 py-3 bg-[#272D3E] border border-[#585296]/50 rounded-xl text-white focus:outline-none focus:border-[#8F8BB6] disabled:opacity-50 appearance-none"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23B6B4BB\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em' }}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Extreme">Extreme 🔥</option>
            </select>
          </div>
          
          <div className="flex flex-col">
            <label className="text-[#B6B4BB] text-sm block mb-2 font-medium">Break Reminder</label>
            <label className="relative flex items-center cursor-pointer py-3">
              <input
                type="checkbox"
                name="breakReminder"
                checked={formData.breakReminder}
                onChange={handleChange}
                disabled={isSessionActive}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#272D3E] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[14px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#585296] border border-[#585296]/50 shadow-inner"></div>
              <span className="ml-3 text-sm font-medium text-[#B6B4BB]">Enabled</span>
            </label>
          </div>
        </div>

        {!isSessionActive && (
          <button
            type="submit"
            className="w-full mt-4 py-3 bg-gradient-to-r from-[#585296] to-[#8F8BB6] hover:from-[#6d5fe7] hover:to-[#a9a7cc] text-white font-bold rounded-xl shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 active:scale-95 border border-white/10"
          >
            Save Configuration
          </button>
        )}
        
        {isSessionActive && (
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
            <p className="text-green-400 text-xs text-center font-medium">
              ✨ Session settings locked while active
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default SessionConfigForm;
