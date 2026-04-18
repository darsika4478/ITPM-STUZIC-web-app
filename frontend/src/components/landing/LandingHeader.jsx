import React from 'react';
import { Link } from 'react-router-dom';
import logoText from '../../assets/logo-text.png';

export default function LandingHeader() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-[100] flex flex-wrap md:flex-nowrap items-center justify-between px-4 sm:px-6 md:px-12 py-2 md:py-3 bg-transparent">
            {/* Left: Logo */}
            <div className="flex flex-1 justify-start">
                <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
                    <img src={logoText} alt="STUZIC" className="h-[150px] sm:h-[180px] md:h-[220px] w-auto object-contain -my-12 sm:-my-16 md:-my-20" />
                </Link>
            </div>
            
            {/* Center: Navigation Links */}
            <div className="hidden md:flex items-center gap-6 lg:gap-10 bg-white/5 py-2 px-6 lg:px-8 rounded-full border border-white/5 mx-2 lg:mx-8">
                <Link to="/" style={navLinkStyle}>Home</Link>
                <Link to="/about" style={navLinkStyle}>About Us</Link>
                <Link to="/report" style={navLinkStyle}>Report Issue</Link>
            </div>

            {/* Right: Auth Buttons */}
            <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3 md:gap-4 lg:gap-5">
                <Link to="/login" style={{ color: '#ffffff', opacity: 1 }} className="text-xs sm:text-sm md:text-[0.95rem] font-bold bg-transparent border-[1.5px] border-[#a78bfa]/40 px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-[10px] rounded-[12px] md:rounded-[16px] hover:bg-[#ffffff15] hover:shadow-[0_0_20px_rgba(167,139,250,0.3)] transition-all duration-300 whitespace-nowrap">
                    Log In
                </Link>
                <Link to="/register" style={{ color: '#ffffff', opacity: 1 }} className="text-xs sm:text-sm md:text-[0.95rem] font-bold bg-gradient-to-r from-[#6d5fe7] to-[#9b7ef8] px-4 sm:px-5 md:px-7 py-1.5 sm:py-2 md:py-[10px] rounded-[12px] md:rounded-[16px] shadow-[0_0_28px_rgba(109,95,231,0.7)] hover:shadow-[0_0_38px_rgba(109,95,231,0.9)] hover:scale-105 transition-all duration-300 whitespace-nowrap">
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
