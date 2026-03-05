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
        </div>
      </div>
    </header>
  );
}