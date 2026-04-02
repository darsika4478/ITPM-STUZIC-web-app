import React from 'react';
import logoText from '../../assets/logo-text.png';
import { Link } from 'react-router-dom';

export default function LandingFooter() {
    return (
        <footer style={{ 
            position: 'relative', 
            zIndex: 10, 
            borderTop: '1px solid rgba(109,95,231,0.15)', 
            padding: '4rem 4rem 2rem', 
            background: 'rgba(10, 8, 36, 0.4)',
            color: '#c4b5fd' 
        }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start', 
                maxWidth: '1200px', 
                margin: '0 auto 4rem',
                flexWrap: 'wrap',
                gap: '3rem'
            }}>
                <div style={{ flex: '1 1 300px' }}>
                    <img src={logoText} alt="STUZIC" style={{ height: '40px', width: 'auto', marginBottom: '1.5rem', opacity: 0.8 }} />
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.6, opacity: 0.7, maxWidth: '280px' }}>
                        Your ultimate workspace for studying smarter. Organising tasks, focusing with music, and tracking your progress in one place.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h4 style={{ fontWeight: 700, color: '#f0ecff', margin: '0 0 0.5rem' }}>Solutions</h4>
                        <Link to="/" style={footerLinkStyle}>Task Management</Link>
                        <Link to="/" style={footerLinkStyle}>Focus Timer</Link>
                        <Link to="/" style={footerLinkStyle}>Study Music</Link>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h4 style={{ fontWeight: 700, color: '#f0ecff', margin: '0 0 0.5rem' }}>Company</h4>
                        <Link to="/about" style={footerLinkStyle}>About Us</Link>
                        <Link to="/feedback" style={footerLinkStyle}>Feedback</Link>
                        <Link to="/contact" style={footerLinkStyle}>Contact</Link>
                    </div>
                </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(167, 139, 250, 0.1)', paddingTop: '2rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.85rem', opacity: 0.5, margin: 0 }}>
                    © {new Date().getFullYear()} STUZIC. Built for students, by students. All rights reserved.
                </p>
            </div>
        </footer>
    );
}

const footerLinkStyle = {
    fontSize: '0.9rem',
    color: '#8F8BB6',
    textDecoration: 'none',
    transition: 'color 0.2s',
    cursor: 'pointer'
};
