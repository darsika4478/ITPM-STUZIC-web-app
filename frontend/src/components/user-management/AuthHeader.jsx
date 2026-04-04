import React from 'react';
import logoIcon from '../../assets/logo-icon.png';

/**
 * AuthHeader — Shared header for Login and Register pages
 *
 * Shows the STUZIC logo and a short tagline/heading depending on the page.
 * Props:
 *   variant — 'login' | 'signup'  (defaults to 'login')
 */
const AuthHeader = ({ variant = 'login' }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        {/* App logo */}
        <img
            src={logoIcon}
            alt="STUZIC Logo"
            style={{ display: 'block', height: '185px', width: 'auto', objectFit: 'contain', margin: '0 auto' }}
        />

        {/* Login variant: just a tagline below the logo */}
        {variant === 'login' && (
            <p style={{ marginTop: '-26px', fontSize: '0.875rem', color: '#c4b5fd' }}>Study. Organize. Focus.</p>
        )}

        {/* Signup variant: heading + tagline */}
        {variant === 'signup' && (
            <>
                <h1 style={{ marginTop: '-34px', fontSize: '1.875rem', fontWeight: 600, letterSpacing: '0.025em', color: '#f0ecff', margin: '-34px 0 0' }}>
                    Create Account
                </h1>
            </>
        )}
    </div>
);

export default AuthHeader;
