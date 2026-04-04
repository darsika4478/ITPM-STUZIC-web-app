import { useMusicPlayer } from '../context/useMusicPlayer';

const MOTIVATIONAL_MESSAGES = {
  milestone_1: {
    text: '🎉 Great start! You\'ve completed your first session!',
    emoji: '🎉',
  },
  milestone_5: {
    text: '⭐ Amazing! 5 sessions completed. You\'re building great habits!',
    emoji: '⭐',
  },
  milestone_10: {
    text: '🚀 Incredible! 10 sessions done. You\'re a focus champion!',
    emoji: '🚀',
  },
  milestone_20: {
    text: '👑 You are a MASTER! 20 sessions completed. Unstoppable!',
    emoji: '👑',
  },
  streak_3_days: {
    text: '🔥 3-day streak! Your consistency is paying off!',
    emoji: '🔥',
  },
  streak_7_days: {
    text: '🌟 7-day streak! You\'re a focusing machine!',
    emoji: '🌟',
  },
};

const MOOD_EMOJIS = {
  focus: '🎯',
  chill: '😎',
  deepwork: '🧠',
  relax: '🌊',
  night: '🌙',
};

const HistoryPage = () => {
  const { sessions } = useMusicPlayer();

  // Calculate statistics
  const stats = {
    totalSessions: sessions.length,
    totalMinutes: sessions.reduce((sum, s) => sum + (s.duration || 25), 0),
    moodBreakdown: calculateMoodBreakdown(sessions),
    streakDays: calculateStreak(sessions),
  };

  // Get motivational messages
  const motivations = getMotivationalMessages(stats);

  return (
    <div className="history-page">
      {/* Motivational Section */}
      <div className="motivational-section">
        {motivations.map((msg, idx) => (
          <div key={idx} className="motivation-card">
            <span className="motivation-emoji">{msg.emoji}</span>
            <p className="motivation-text">{msg.text}</p>
          </div>
        ))}
      </div>

      {/* Statistics Section */}
      <div className="stats-section">
        <h2>Your Progress</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-icon">📊</span>
              <h3>Total Sessions</h3>
            </div>
            <div className="stat-content">
              <div className="stat-big-number">{stats.totalSessions}</div>
              <p className="stat-subtitle">sessions completed</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-icon">⏱️</span>
              <h3>Total Focus Time</h3>
            </div>
            <div className="stat-content">
              <div className="stat-big-number">{stats.totalMinutes}</div>
              <p className="stat-subtitle">minutes focused</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-icon">🔥</span>
              <h3>Current Streak</h3>
            </div>
            <div className="stat-content">
              <div className="stat-big-number">{stats.streakDays}</div>
              <p className="stat-subtitle">days in a row</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-icon">🎵</span>
              <h3>Avg Session</h3>
            </div>
            <div className="stat-content">
              <div className="stat-big-number">
                {stats.totalSessions > 0 ? Math.round(stats.totalMinutes / stats.totalSessions) : 0}
              </div>
              <p className="stat-subtitle">minutes per session</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mood Breakdown */}
      <div className="mood-breakdown-section">
        <h2>Mood Preferences</h2>
        <div className="mood-breakdown-grid">
          {Object.entries(stats.moodBreakdown).map(([mood, count]) => (
            count > 0 && (
              <div key={mood} className="mood-breakdown-card">
                <div className="mood-breakdown-emoji">{MOOD_EMOJIS[mood] || '🎵'}</div>
                <h3 className="mood-breakdown-name">{mood.charAt(0).toUpperCase() + mood.slice(1)}</h3>
                <p className="mood-breakdown-count">{count} sessions</p>
                <div className="mood-breakdown-bar">
                  <div
                    className="mood-breakdown-fill"
                    style={{
                      width: `${(count / Math.max(...Object.values(stats.moodBreakdown), 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Session History */}
      <div className="session-history-section">
        <h2>Session History</h2>
        <div className="sessions-list">
          {sessions.length > 0 ? (
            sessions.map((session, idx) => (
              <div key={session.id || idx} className="session-item">
                <div className="session-index">{idx + 1}</div>
                <div className="session-details">
                  <div className="session-header">
                    <span className="session-mood">{MOOD_EMOJIS[session.mood] || '🎵'}</span>
                    <h4 className="session-track">{session.goal ? `Target: ${session.goal}` : (session.trackTitle || 'Track')}</h4>
                    <span className="session-duration">{session.duration || session.durationMinutes || 25} min</span>
                  </div>
                  {session.subject && (
                    <p className="text-xs text-purple-300/60 mt-1">
                      📚 {session.subject} • 🎯 {session.topic}
                    </p>
                  )}
                  <p className="session-time">{session.timestamp || session.date || (session.startTime ? new Date(session.startTime).toLocaleString() : '')}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="no-sessions">
              <p>No sessions yet. Start focusing and build your streak! 🎯</p>
            </div>
          )}
        </div>
      </div>

      {/* Achievement Badge */}
      {stats.totalSessions >= 10 && (
        <div className="achievement-section">
          <div className="achievement-badge">
            <span className="achievement-emoji">🏆</span>
            <p className="achievement-text">You're a Focus Champion!</p>
            <p className="achievement-subtext">{stats.totalSessions} sessions completed</p>
          </div>
        </div>
      )}
    </div>
  );
};

function calculateMoodBreakdown(sessions) {
  const breakdown = {
    focus: 0,
    chill: 0,
    deepwork: 0,
    relax: 0,
    night: 0,
  };

  sessions.forEach(session => {
    if (session.mood && Object.prototype.hasOwnProperty.call(breakdown, session.mood)) {
      breakdown[session.mood]++;
    }
  });

  return breakdown;
}

function calculateStreak(sessions) {
  if (sessions.length === 0) return 0;

  let streak = 1;
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp)
  );

  for (let i = 0; i < sortedSessions.length - 1; i++) {
    const currentDate = new Date(sortedSessions[i].date || sortedSessions[i].timestamp);
    const nextDate = new Date(sortedSessions[i + 1].date || sortedSessions[i + 1].timestamp);
    const diffTime = currentDate - nextDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays <= 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function getMotivationalMessages(stats) {
  const messages = [];

  if (stats.totalSessions >= 1 && stats.totalSessions < 5) {
    messages.push(MOTIVATIONAL_MESSAGES.milestone_1);
  }
  if (stats.totalSessions >= 5 && stats.totalSessions < 10) {
    messages.push(MOTIVATIONAL_MESSAGES.milestone_5);
  }
  if (stats.totalSessions >= 10 && stats.totalSessions < 20) {
    messages.push(MOTIVATIONAL_MESSAGES.milestone_10);
  }
  if (stats.totalSessions >= 20) {
    messages.push(MOTIVATIONAL_MESSAGES.milestone_20);
  }
  if (stats.streakDays >= 7) {
    messages.push(MOTIVATIONAL_MESSAGES.streak_7_days);
  } else if (stats.streakDays >= 3) {
    messages.push(MOTIVATIONAL_MESSAGES.streak_3_days);
  }

  return messages.length > 0 ? messages : [{ text: '🌟 Start your first session and build great habits!', emoji: '🌟' }];
}

export default HistoryPage;
