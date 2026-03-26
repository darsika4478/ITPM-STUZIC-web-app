<<<<<<< HEAD
import { Link, NavLink } from "react-router-dom";

const linkStyle = ({ isActive }) => ({
  color: isActive ? "var(--c-text)" : "var(--c-text)",
  textDecoration: "none",
  padding: "8px 12px",
  borderRadius: "10px",
  background: isActive ? "var(--c-primary)" : "transparent",
});

export default function Navbar() {
  return (
    <header
      style={{
        background: "var(--c-surface)",
        borderBottom: "1px solid rgba(182,180,187,0.2)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        {/* Left: Logo */}
        <Link
          to="/"
          style={{
            color: "var(--c-text)",
            textDecoration: "none",
            fontWeight: 800,
            letterSpacing: 0.5,
          }}
        >
          STUZIC
          <span style={{ color: "var(--c-accent)", fontWeight: 700 }}>
            {" "}
            •
          </span>
        </Link>

        {/* Middle: Nav Links */}
        <nav style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <NavLink to="/" style={linkStyle}>
            Home
          </NavLink>
          <NavLink to="/dashboard" style={linkStyle}>
            Dashboard
          </NavLink>
        </nav>

        {/* Right: Auth Links */}
        <div style={{ display: "flex", gap: 8 }}>
          <NavLink to="/login" style={linkStyle}>
            Login
          </NavLink>
          <NavLink to="/register" style={linkStyle}>
            Register
          </NavLink>
=======
import { useState, useRef, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Planner", path: "/planner" },
    { name: "Schedule", path: "/schedule" },
    { name: "Mood Music", path: "/music" },
    { name: "History", path: "/history" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#3C436B]/80 backdrop-blur-md border-b border-[#8F8BB6]/15 transition-all duration-300">
      <div className="max-w-screen-2xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        
        {/* Left: Logo */}
        <Link
          to="/dashboard"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          {/* Logo replacement */}
          <img
            src="/stuzic-logo.png" 
            alt="STUZIC"
            className="h-9 w-auto object-contain"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextElementSibling.style.display = "block";
            }}
          />
          <span
            className="hidden text-[#B6B4BB] font-bold text-lg tracking-wide"
            style={{ display: "none" }}
          >
            STUZIC
          </span>
        </Link>

        {/* Middle: Nav Links in Exact Order */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ease-in-out ${
                  isActive
                    ? "bg-[#585296] text-white shadow-[0_4px_16px_rgba(88,82,150,0.4)]"
                    : "text-[#B6B4BB] hover:bg-[#585296]/20 hover:text-white"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Right: User Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-[#8F8BB6]/10 transition-colors border border-transparent hover:border-[#8F8BB6]/20"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#585296] to-[#8F8BB6] flex items-center justify-center text-white font-bold text-sm shadow-md">
              U
            </div>
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#3C436B] border border-[#8F8BB6]/20 rounded-xl shadow-xl py-2 flex flex-col z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <Link
                to="/profile"
                className="px-4 py-2 text-sm text-[#B6B4BB] hover:bg-[#585296]/40 hover:text-white transition-colors"
                onClick={() => setIsProfileOpen(false)}
              >
                Profile
              </Link>
              <button
                className="w-full text-left px-4 py-2 text-sm text-[#B6B4BB] hover:bg-[#585296]/40 hover:text-white transition-colors"
                onClick={() => {
                  setIsProfileOpen(false);
                  console.log("Logout action");
                }}
              >
                Logout
              </button>
            </div>
          )}
>>>>>>> Darshikan/feature/firebase-setup
        </div>
      </div>
    </header>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> Darshikan/feature/firebase-setup
