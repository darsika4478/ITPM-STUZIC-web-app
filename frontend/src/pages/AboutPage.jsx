import React from 'react';
import LandingHeader from '../components/landing/LandingHeader';
import LandingFooter from '../components/landing/LandingFooter';

export default function AboutPage() {
    return (
        <div style={pageStyle}>
            <LandingHeader />
            
            <main style={mainContentStyle}>
                <section style={heroSectionStyle}>
                    <h1 style={titleStyle}>About <span style={highlightStyle}>STUZIC</span></h1>
                    <p style={subtitleStyle}>
                        Empowering students to find their flow, manage their time, and achieve their academic goals through a unified, distraction-free workspace.
                    </p>
                </section>

                <section style={gridSectionStyle}>
                    <div style={cardStyle}>
                        <div style={iconStyle}>🎯</div>
                        <h2 style={cardTitleStyle}>Our Mission</h2>
                        <p style={cardTextStyle}>
                            We believe that academic success shouldn't come at the cost of mental well-being. STUZIC is designed to reduce the friction of student life by providing intuitive tools for organization and focus.
                        </p>
                    </div>

                    <div style={cardStyle}>
                        <div style={iconStyle}>💡</div>
                        <h2 style={cardTitleStyle}>The Problem</h2>
                        <p style={cardTextStyle}>
                            Students today are overwhelmed with multiple apps for notes, tasks, and music. Switching between them breaks focus. STUZIC brings it all into one premium environment.
                        </p>
                    </div>

                    <div style={cardStyle}>
                        <div style={iconStyle}>🚀</div>
                        <h2 style={cardTitleStyle}>Our Vision</h2>
                        <p style={cardTextStyle}>
                            To become the ultimate companion for every learner, from high school to PhD, helping them build sustainable study habits that last a lifetime.
                        </p>
                    </div>
                </section>

                <section style={focusSectionStyle}>
                    <h2 style={sectionTitleStyle}>Built for Students, by Students</h2>
                    <p style={sectionDescStyle}>
                        Every feature in STUZIC—from the Mood-Based Music Recommendation to the Task Planner—is crafted based on real student feedback and psychological principles of productivity.
                    </p>
                </section>
            </main>

            <LandingFooter />
        </div>
    );
}

const pageStyle = {
    background: 'linear-gradient(135deg, #1c1848 0%, #231f5c 50%, #2b2570 100%)',
    color: '#f0ecff',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
};

const mainContentStyle = {
    paddingTop: '120px',
    flex: 1,
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    paddingBottom: '5rem',
};

const heroSectionStyle = {
    textAlign: 'center',
    padding: '4rem 1.5rem',
};

const titleStyle = {
    fontSize: 'clamp(2.5rem, 6vw, 4rem)',
    fontWeight: 900,
    marginBottom: '1.5rem',
    letterSpacing: '-0.02em',
};

const highlightStyle = {
    background: 'linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
};

const subtitleStyle = {
    fontSize: '1.25rem',
    color: '#8F8BB6',
    maxWidth: '700px',
    margin: '0 auto',
    lineHeight: 1.6,
};

const gridSectionStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    padding: '2rem 1.5rem',
};

const cardStyle = {
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '24px',
    padding: '2.5rem',
    border: '1px solid rgba(167, 139, 250, 0.1)',
    backdropFilter: 'blur(10px)',
    textAlign: 'center',
};

const iconStyle = {
    fontSize: '3rem',
    marginBottom: '1.5rem',
};

const cardTitleStyle = {
    fontSize: '1.5rem',
    fontWeight: 700,
    marginBottom: '1rem',
    color: '#fff',
};

const cardTextStyle = {
    fontSize: '1rem',
    lineHeight: 1.6,
    color: '#8F8BB6',
};

const focusSectionStyle = {
    textAlign: 'center',
    padding: '6rem 1.5rem 2rem',
};

const sectionTitleStyle = {
    fontSize: '2.5rem',
    fontWeight: 800,
    marginBottom: '1.5rem',
};

const sectionDescStyle = {
    fontSize: '1.1rem',
    color: '#8F8BB6',
    maxWidth: '800px',
    margin: '0 auto',
    lineHeight: 1.7,
};
