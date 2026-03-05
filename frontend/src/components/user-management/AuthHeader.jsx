import React from 'react';
import logo from '../../assets/logo.png';

const AuthHeader = ({ variant = 'login' }) => (
    <div className="flex flex-col items-center text-center">
        <img
            src={logo}
            alt="STUZIC Logo"
            className="block h-[90px] w-auto md:h-[110px] object-contain mx-auto"
        />
        {variant === 'login' && (
            <p className="mt-1.5 text-sm text-[#3C436B]/80">Study. Organize. Focus.</p>
        )}
        {variant === 'signup' && (
            <>
                <h1 className="mt-2.5 text-3xl font-semibold tracking-wide text-[#3C436B]">
                    Create Account
                </h1>
                <p className="mt-1 text-sm text-[#3C436B]/80">Join STUZIC to manage tasks.</p>
            </>
        )}
    </div>
);

export default AuthHeader;
