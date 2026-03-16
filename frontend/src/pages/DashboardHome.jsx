import React from 'react';
import { Link } from 'react-router-dom';

const DashboardHome = () => {
    const cardStyle = {
        background: 'rgba(255,255,255,0.06)',
        borderRadius: '20px',
        padding: '1.5rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        border: '1px solid rgba(167,139,250,0.15)',
        backdropFilter: 'blur(20px)',
    };

    return (
        <div style={{
            margin: '-2rem',
            padding: '2rem',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1c1848 0%, #231f5c 50%, #2b2570 100%)',
        }}>
            <div style={{ maxWidth: '896px', margin: '0 auto' }}>
                <div>
                
                    <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#a78bfa', marginBottom: 0 }}>Quick glance at your study tasks and progress.</p>
                </div>

                {/* Stats Row */}
                <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {[
                        { label: "Today's Tasks", value: '5', icon: '📅', color: '#fbbf24' },
                        { label: 'Completed', value: '12', icon: '✅', color: '#34d399' },
                        { label: 'Upcoming', value: '3', icon: '⏳', color: '#60a5fa' },
                    ].map((card) => (
                        <div key={card.label} style={cardStyle}>
                            <span style={{ fontSize: '1.5rem' }}>{card.icon}</span>
                            <p style={{ marginTop: '0.5rem', fontSize: '1.875rem', fontWeight: 700, color: card.color, marginBottom: 0 }}>{card.value}</p>
                            <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#c4b5fd', marginBottom: 0 }}>{card.label}</p>
                        </div>
                    ))}
                </div>

                {/* Quick Access */}
                <h2 style={{ marginTop: '2.5rem', marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 600, color: '#f0ecff' }}>Quick Access</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    <Link
                        to="/dashboard/tasks"
                        style={{ ...cardStyle, textDecoration: 'none', display: 'block', transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.4)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.35)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.15)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.25)'; }}
                    >
                        <span style={{ fontSize: '1.875rem' }}>📋</span>
                        <h3 style={{ marginTop: '0.75rem', fontSize: '1.125rem', fontWeight: 600, color: '#f0ecff', marginBottom: 0 }}>Task Planner</h3>
                        <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#c4b5fd', marginBottom: 0 }}>
                            Manage your assignments, set deadlines & track progress.
                        </p>
                    </Link>
                    <Link
                        to="/dashboard/profile"
                        style={{ ...cardStyle, textDecoration: 'none', display: 'block', transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.4)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.35)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(167,139,250,0.15)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.25)'; }}
                    >
                        <span style={{ fontSize: '1.875rem' }}>👤</span>
                        <h3 style={{ marginTop: '0.75rem', fontSize: '1.125rem', fontWeight: 600, color: '#f0ecff', marginBottom: 0 }}>My Profile</h3>
                        <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#c4b5fd', marginBottom: 0 }}>
                            Edit your name, avatar, password & account settings.
                        </p>
                    </Link>
                </div>

                {/* Focus Section */}
                <div style={{ ...cardStyle, marginTop: '2rem' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#f0ecff', margin: 0 }}>🎯 Focus Today</h2>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#c4b5fd' }}>
                        Plan your tasks, stay consistent, and keep your study streak alive.
                    </p>
                    <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                        <div style={{
                            borderRadius: '14px', border: '1px solid rgba(167,139,250,0.2)',
                            background: 'rgba(255,255,255,0.04)', padding: '1rem',
                        }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#a78bfa', margin: 0 }}>Study Plan</p>
                            <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#e0d9ff', marginBottom: 0 }}>Review module notes and practice quizzes.</p>
                        </div>
                        <div style={{
                            borderRadius: '14px', border: '1px solid rgba(167,139,250,0.2)',
                            background: 'rgba(255,255,255,0.04)', padding: '1rem',
                        }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#a78bfa', margin: 0 }}>Music Playlist</p>
                            <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#e0d9ff', marginBottom: 0 }}>Lo-fi focus session, 45 minutes.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
