export default function Footer() {
  return (
    <footer
      style={{
        marginTop: 40,
        background: "var(--c-surface)",
        borderTop: "1px solid rgba(182,180,187,0.2)",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "18px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ color: "var(--c-text)" }}>
          <strong>STUZIC</strong>{" "}
          <span style={{ color: "var(--c-accent)" }}>
            Smart Study Planner with Mood-based Focus Music
          </span>
        </div>

        <div style={{ display: "flex", gap: 14, color: "var(--c-text)" }}>
          <span style={{ opacity: 0.8 }}>About</span>
          <span style={{ opacity: 0.8 }}>Privacy</span>
          <span style={{ opacity: 0.8 }}>Contact</span>
        </div>

        <div style={{ opacity: 0.8 }}>
          © {new Date().getFullYear()} STUZIC
        </div>
      </div>
    </footer>
  );
}