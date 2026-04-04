import React, { useState } from 'react';
import LandingHeader from '../components/landing/LandingHeader';
import LandingFooter from '../components/landing/LandingFooter';

export default function ReportPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        issueType: 'Technical',
        description: '',
    });

    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would normally send the data to a backend or Firebase
        console.log('Report submitted:', formData);
        setIsSubmitted(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div style={pageStyle}>
            <LandingHeader />
            
            <main style={mainContentStyle}>
                <section style={heroSectionStyle}>
                    <h1 style={titleStyle}>Report an <span style={highlightStyle}>Issue</span></h1>
                    <p style={subtitleStyle}>
                        Encountered a bug or have a suggestion? Tell us about it, and we'll help as soon as possible.
                    </p>
                </section>

                <section style={formSectionStyle}>
                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit} style={formCardStyle}>
                            <div style={inputContainerStyle}>
                                <label style={labelStyle}>Your Name</label>
                                <input 
                                    type="text" 
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your name" 
                                    style={inputStyle} 
                                    required 
                                />
                            </div>

                            <div style={inputContainerStyle}>
                                <label style={labelStyle}>Email Address</label>
                                <input 
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email" 
                                    style={inputStyle} 
                                    required 
                                />
                            </div>

                            <div style={inputContainerStyle}>
                                <label style={labelStyle}>Issue Category</label>
                                <select 
                                    name="issueType"
                                    value={formData.issueType}
                                    onChange={handleChange}
                                    style={inputStyle}
                                >
                                    <option value="Technical">Technical Bug</option>
                                    <option value="UI/UX">UI/UX Inconsistency</option>
                                    <option value="Audio">Audio/Music Issue</option>
                                    <option value="Suggestion">Feature Suggestion</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div style={inputContainerStyle}>
                                <label style={labelStyle}>Issue Details</label>
                                <textarea 
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe what happened..." 
                                    style={textareaStyle} 
                                    required 
                                />
                            </div>

                            <button type="submit" style={submitButtonStyle}>
                                Submit Report
                            </button>
                        </form>
                    ) : (
                        <div style={successCardStyle}>
                            <div style={successIconStyle}>✅</div>
                            <h2 style={successTitleStyle}>Report Received!</h2>
                            <p style={successTextStyle}>
                                Thank you for helping us improve STUZIC. Our team will look into your request and get back to you via email if needed.
                            </p>
                            <button onClick={() => setIsSubmitted(false)} style={resetButtonStyle}>
                                Send Another Report
                            </button>
                        </div>
                    )}
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
    maxWidth: '800px',
    margin: '0 auto',
    width: '100%',
    paddingBottom: '5rem',
};

const heroSectionStyle = {
    textAlign: 'center',
    padding: '4rem 1.5rem 2rem',
};

const titleStyle = {
    fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
    fontWeight: 900,
    marginBottom: '1rem',
};

const highlightStyle = {
    background: 'linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
};

const subtitleStyle = {
    fontSize: '1.2rem',
    color: '#8F8BB6',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: 1.6,
};

const formSectionStyle = {
    padding: '2rem 1.5rem',
};

const formCardStyle = {
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '28px',
    padding: '3rem',
    border: '1px solid rgba(167, 139, 250, 0.1)',
    backdropFilter: 'blur(16px)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
};

const inputContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
};

const labelStyle = {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#c4b5fd',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
};

const inputStyle = {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1.2px solid rgba(167, 139, 250, 0.15)',
    borderRadius: '16px',
    padding: '1rem 1.25rem',
    color: '#fff',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.2s',
};

const textareaStyle = {
    ...inputStyle,
    minHeight: '150px',
    resize: 'vertical',
};

const submitButtonStyle = {
    marginTop: '1rem',
    borderRadius: '16px',
    padding: '1.2rem',
    fontSize: '1rem',
    fontWeight: 800,
    color: '#fff',
    border: 'none',
    background: 'linear-gradient(135deg, #6d5fe7 0%, #9b7ef8 100%)',
    boxShadow: '0 8px 32px rgba(109,95,231,0.4)',
    cursor: 'pointer',
    transition: 'transform 0.2s',
};

const successCardStyle = {
    ...formCardStyle,
    alignItems: 'center',
    textAlign: 'center',
};

const successIconStyle = {
    fontSize: '4rem',
    marginBottom: '1rem',
};

const successTitleStyle = {
    fontSize: '2rem',
    fontWeight: 800,
    color: '#fff',
    marginBottom: '1rem',
};

const successTextStyle = {
    fontSize: '1.1rem',
    color: '#8F8BB6',
    lineHeight: 1.6,
    marginBottom: '2rem',
};

const resetButtonStyle = {
    padding: '12px 24px',
    background: 'transparent',
    border: '1px solid rgba(167, 139, 250, 0.3)',
    color: '#c4b5fd',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: 600,
};
