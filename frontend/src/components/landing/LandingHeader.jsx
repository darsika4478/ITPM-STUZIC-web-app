import React from 'react';
import { Link } from 'react-router-dom';
import logoText from '../../assets/logo-text.png';

export default function LandingHeader() {
    return (
        <nav style={{
            position: 'fixed', 
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '1.25rem 4.5rem',
            background: 'rgba(28, 24, 72, 0.85)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(167, 139, 250, 0.12)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)'
        }}>
            {/* Left: Logo */}
            <div style={{ flex: '1 1 0', display: 'flex', justifyContent: 'flex-start' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
                    <img src={logoText} alt="STUZIC" style={{ height: '65px', width: 'auto', objectFit: 'contain' }} />
                </Link>
            </div>
            
            {/* Center: Navigation Links */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '2.5rem',
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '8px 32px',
                borderRadius: '100px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                margin: '0 2rem'
            }}>
                <Link to="/" style={navLinkStyle}>Home</Link>
                <Link to="/about" style={navLinkStyle}>About Us</Link>
                <Link to="/report" style={navLinkStyle}>Report Issue</Link>
            </div>

            {/* Right: Auth Buttons */}
            <div style={{ 
                flex: '1 1 0', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'flex-end',
                gap: '1.25rem' 
            }}>
                <Link to="/login" style={{ 
                    fontSize: '0.9rem', 
                    fontWeight: 600, 
                    color: '#c4b5fd', 
                    textDecoration: 'none', 
                    padding: '8px 16px',
                    transition: 'all 0.2s',
                    opacity: 0.8
                }}>
                    Log In
                </Link>
                <Link to="/Register" style={{ 
                    borderRadius: '14px', 
                    padding: '12px 28px', 
                    fontSize: '0.9rem', 
                    fontWeight: 800, 
                    color: '#fff', 
                    textDecoration: 'none', 
                    background: 'linear-gradient(135deg, #6d5fe7 0%, #9b7ef8 100%)', 
                    boxShadow: '0 8px 24px rgba(109,95,231,0.4)',
                    transition: 'transform 0.2s'
                }}>
                    Sign Up Free
                </Link>
            </div>
        </nav>
    );
}

const navLinkStyle = {
    fontSize: '0.95rem',
    fontWeight: 500,
    color: '#B6B4BB',
    textDecoration: 'none',
    transition: 'color 0.2s',
    cursor: 'pointer'
};
