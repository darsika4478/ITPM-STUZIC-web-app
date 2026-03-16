import React from 'react';
import logoIcon from '../../assets/logo.png';

const AuthHeader = ({ variant = 'login' }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <img
            src={logoIcon}
            alt="STUZIC Logo"
            style={{ height: '90px', width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
        />
        {variant === 'login' && (
            <p style={{ marginTop: '6px', fontSize: '0.875rem', color: '#a78bfa' }}>Study. Organize. Focus.</p>
        )}
        {variant === 'signup' && (
            <>
                <h1 style={{ marginTop: '10px', fontSize: '1.75rem', fontWeight: 600, color: '#f0ecff', letterSpacing: '0.02em' }}>
                    Create Account
                </h1>
                <p style={{ marginTop: '4px', fontSize: '0.875rem', color: '#a78bfa' }}>Join STUZIC to manage tasks.</p>
            </>
        )}
    </div>
);

export default AuthHeader;
