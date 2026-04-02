import React, { useState } from "react";

export default function CalendarUI() {
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(today);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Previous month days to show at start
  const prevMonthDate = new Date(year, month, 0);
  const prevMonthDays = prevMonthDate.getDate();
  const prevMonthDates = Array.from(
    { length: firstDay },
    (_, i) => prevMonthDays - firstDay + i + 1
  );

  // Next month days to show at end
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const nextMonthDates = Array.from(
    { length: totalCells - (firstDay + daysInMonth) },
    (_, i) => i + 1
  );

  // Example events with more variety
  const events = {
    "2023-08-09": [
      { time: "09:00", title: "Design Meeting", category: "work" },
      { time: "14:00", title: "Client Call", category: "work" },
    ],
    "2023-08-11": [
      { time: "07:30", title: "Breakfast", category: "personal" },
      { time: "16:00", title: "Study Session", category: "education" },
    ],
    "2023-08-12": [
      { time: "10:00", title: "DB Lecture", category: "education" },
      { time: "19:00", title: "Birthday Party", category: "personal" },
    ],
    "2023-08-15": [
      { time: "13:00", title: "P2P Zoom", category: "work" },
      { time: "15:30", title: "Team Standup", category: "work" },
    ],
    "2023-08-20": [
      { time: "14:50", title: "Lunch with Client", category: "work" },
    ],
    "2023-08-22": [
      { time: "13:00", title: "Group Work", category: "education" },
    ],
    "2023-08-25": [
      { time: "10:30", title: "Design Review", category: "work" },
      { time: "16:30", title: "Bootcamp Session", category: "education" },
    ],
  };

  const goPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => {
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const formatDateKey = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const d = String(dateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const selectedKey = formatDateKey(selectedDate);
  const todayKey = formatDateKey(today);

  // Get event color based on category
  const getEventColor = (category) => {
    switch(category) {
      case 'work': return 'blue';
      case 'personal': return 'orange';
      case 'education': return 'green';
      default: return 'purple';
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        * {
          box-sizing: border-box;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 0;
        }

        body {
          margin: 0;
          background: #f8fafc;
        }

        .container {
          display: flex;
          height: 100vh;
        }

        /* Sidebar */
        .sidebar {
          width: 280px;
          background: white;
          border-right: 1px solid #e9eef2;
          padding: 24px 20px;
          overflow-y: auto;
        }

        .logo {
          font-size: 24px;
          font-weight: 700;
          color: #2469F0;
          margin-bottom: 28px;
          letter-spacing: -0.3px;
        }

        .section-title {
          font-size: 12px;
          font-weight: 600;
          color: #8a94a6;
          margin: 28px 0 14px 0;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .mini-calendar h3 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #1e293b;
        }

        .mini-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
          font-size: 12px;
          font-weight: 500;
        }

        .mini-grid span {
          text-align: center;
          padding: 6px;
          color: #475569;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .mini-grid span:hover {
          background: #f1f5f9;
        }

        .mini-grid .today-date {
          background: #2469F0;
          color: white;
          font-weight: 600;
        }

        .mini-grid .selected-date {
          background: #f97316;
          color: white;
          font-weight: 600;
        }

        /* Calendar Lists */
        .calendar-list {
          margin-top: 28px;
        }

        .calendar-item {
          display: flex;
          align-items: center;
          padding: 8px 0;
          font-size: 14px;
          color: #334155;
          cursor: pointer;
          border-radius: 6px;
          transition: background 0.2s;
        }

        .calendar-item:hover {
          background: #f8fafc;
        }

        .calendar-color {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          margin-right: 12px;
        }

        .calendar-name {
          flex: 1;
          font-weight: 500;
        }

        .calendar-count {
          color: #94a3b8;
          font-size: 12px;
        }

        .add-calendar {
          color: #2469F0;
          font-weight: 500;
          margin-top: 12px;
          padding: 8px 0;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .category {
          margin-top: 12px;
        }

        .category-item {
          padding: 8px 0;
          font-size: 14px;
          color: #475569;
          font-weight: 500;
          cursor: pointer;
          border-radius: 6px;
        }

        .category-item:hover {
          background: #f8fafc;
          padding-left: 8px;
        }

        /* Today Panel */
        .today-panel {
          margin-top: 32px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e9eef2;
        }

        .today-panel h3 {
          margin-bottom: 12px;
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
        }

        .event-item {
          margin-bottom: 8px;
          font-size: 13px;
          padding: 8px 10px;
          background: white;
          border-radius: 8px;
          border-left: 3px solid #2469F0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .event-item strong {
          color: #2469F0;
          font-weight: 600;
          margin-right: 6px;
        }

        .no-events {
          color: #94a3b8;
          font-size: 13px;
          font-style: italic;
          padding: 8px 0;
        }

        /* Main calendar */
        .main {
          flex: 1;
          padding: 28px 32px;
          overflow-y: auto;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
        }

        .header h1 {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.5px;
        }

        .nav-buttons {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .nav-btn {
          background: white;
          border: 1px solid #e2e8f0;
          color: #475569;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .nav-btn:hover {
          background: #f8fafc;
          border-color: #2469F0;
          color: #2469F0;
        }

        .today-btn {
          background: #2469F0;
          border: none;
          color: white;
          padding: 8px 20px;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          letter-spacing: 0.3px;
          transition: background 0.2s;
          margin-left: 8px;
        }

        .today-btn:hover {
          background: #1a4fc4;
        }

        .calendar {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 12px;
        }

        .day-header {
          text-align: center;
          font-weight: 600;
          font-size: 13px;
          color: #64748b;
          padding: 12px 0;
          letter-spacing: 0.5px;
        }

        .date-box {
          background: white;
          min-height: 120px;
          border-radius: 12px;
          padding: 10px;
          border: 1px solid #edf2f7;
          cursor: pointer;
          transition: all 0.2s;
        }

        .date-box:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border-color: #2469F0;
          transform: translateY(-2px);
        }

        .date-box.today-box {
          background: #2469F0;
          border-color: #2469F0;
        }

        .date-box.today-box .date {
          color: white;
        }

        .date-box.selected-box {
          background: #f97316;
          border-color: #f97316;
        }

        .date-box.selected-box .date {
          color: white;
        }

        .date-box.other-month {
          background: #f8fafc;
          border-color: #edf2f7;
          opacity: 0.6;
        }

        .date {
          font-weight: 600;
          font-size: 14px;
          color: #1e293b;
          display: block;
          margin-bottom: 6px;
        }

        .event {
          margin-top: 4px;
          padding: 4px 6px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          border-left: 3px solid transparent;
        }

        .event.blue {
          background: #e0f2fe;
          color: #0369a1;
          border-left-color: #0ea5e9;
        }

        .event.orange {
          background: #fff3cd;
          color: #856404;
          border-left-color: #fbbf24;
        }

        .event.green {
          background: #d1fae5;
          color: #065f46;
          border-left-color: #10b981;
        }

        .event.purple {
          background: #ede9fe;
          color: #5b21b6;
          border-left-color: #8b5cf6;
        }

        .event-time {
          font-weight: 600;
          margin-right: 4px;
        }
      `}</style>

      <div className="container">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="logo">📅 Calendly</div>

          {/* Mini Calendar */}
          <div className="mini-calendar">
            <h3>{monthName} {year}</h3>
            <div className="mini-grid">
              {dates.map((d) => {
                const dateObj = new Date(year, month, d);
                const key = formatDateKey(dateObj);
                const isToday = key === todayKey;
                const isSelected = key === selectedKey && !isToday;

                return (
                  <span
                    key={d}
                    className={`${isToday ? "today-date" : ""} ${isSelected ? "selected-date" : ""}`}
                    onClick={() => setSelectedDate(dateObj)}
                  >
                    {d}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Calendar Lists */}
          <div className="calendar-list">
            <div className="section-title">SCHEDULED</div>
            
            <div className="calendar-item">
              <div className="calendar-color" style={{background: '#8b5cf6'}}></div>
              <span className="calendar-name">Esther Howard</span>
              <span className="calendar-count">2</span>
            </div>
            <div className="calendar-item">
              <div className="calendar-color" style={{background: '#f97316'}}></div>
              <span className="calendar-name">Task</span>
              <span className="calendar-count">5</span>
            </div>
            <div className="calendar-item">
              <div className="calendar-color" style={{background: '#10b981'}}></div>
              <span className="calendar-name">Bootcamp</span>
              <span className="calendar-count">3</span>
            </div>
            <div className="calendar-item">
              <div className="calendar-color" style={{background: '#ec4899'}}></div>
              <span className="calendar-name">Birthday</span>
              <span className="calendar-count">1</span>
            </div>
            <div className="calendar-item">
              <div className="calendar-color" style={{background: '#eab308'}}></div>
              <span className="calendar-name">Reminders</span>
              <span className="calendar-count">4</span>
            </div>
            <div className="calendar-item">
              <div className="calendar-color" style={{background: '#0ea5e9'}}></div>
              <span className="calendar-name">Collage</span>
              <span className="calendar-count">2</span>
            </div>
            
            <div className="add-calendar">
              <span>+</span> Add other
            </div>
            
            <div className="section-title">OTHER CALENDARS</div>
            
            <div className="category">
              <div className="category-item">📁 Work</div>
              <div className="category-item">📁 Education</div>
            </div>
          </div>

          {/* Today Panel */}
          <div className="today-panel">
            <h3>{selectedDate.toDateString()}</h3>
            {events[selectedKey] ? (
              events[selectedKey].map((ev, i) => (
                <div key={i} className="event-item">
                  <strong>{ev.time}</strong> {ev.title}
                </div>
              ))
            ) : (
              <div className="no-events">No events scheduled</div>
            )}
          </div>
        </div>

        {/* Main Calendar */}
        <div className="main">
          <div className="header">
            <div className="nav-buttons">
              <button className="nav-btn" onClick={goPrevMonth}>←</button>
              <button className="nav-btn" onClick={goNextMonth}>→</button>
              <button className="today-btn" onClick={goToday}>Today</button>
            </div>
            <h1>{monthName} {year}</h1>
          </div>

          <div className="calendar">
            {days.map((day) => (
              <div key={day} className="day-header">{day}</div>
            ))}

            {/* Previous month days */}
            {prevMonthDates.map((date, i) => {
              const prevMonthDateObj = new Date(year, month - 1, date);
              const key = formatDateKey(prevMonthDateObj);
              
              return (
                <div
                  key={`prev-${i}`}
                  className="date-box other-month"
                  onClick={() => setSelectedDate(prevMonthDateObj)}
                >
                  <span className="date">{date}</span>
                </div>
              );
            })}

            {/* Current month days */}
            {dates.map((date) => {
              const dateObj = new Date(year, month, date);
              const key = formatDateKey(dateObj);
              const isToday = key === todayKey;
              const isSelected = key === selectedKey && !isToday;

              return (
                <div
                  key={date}
                  className={`date-box ${isToday ? "today-box" : ""} ${isSelected ? "selected-box" : ""}`}
                  onClick={() => setSelectedDate(dateObj)}
                >
                  <span className="date">{date}</span>
                  {events[key]?.map((ev, i) => (
                    <div key={i} className={`event ${getEventColor(ev.category)}`}>
                      <span className="event-time">{ev.time}</span> {ev.title}
                    </div>
                  ))}
                </div>
              );
            })}

            {/* Next month days */}
            {nextMonthDates.map((date, i) => {
              const nextMonthDateObj = new Date(year, month + 1, date);
              const key = formatDateKey(nextMonthDateObj);
              
              return (
                <div
                  key={`next-${i}`}
                  className="date-box other-month"
                  onClick={() => setSelectedDate(nextMonthDateObj)}
                >
                  <span className="date">{date}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}