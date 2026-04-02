export default function GlassCard({ children, className = "", onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl border border-white/10 bg-white/5 backdrop-blur
        p-5 transition-all duration-200
        hover:bg-white/[0.07] hover:shadow-lg hover:shadow-black/20
        ${className}
      `}
    >
      {children}
    </div>
  );
}
