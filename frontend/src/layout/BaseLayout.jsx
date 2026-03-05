import Navbar from "./Navbar";
import Footer from "./Footer";

export default function BaseLayout({ children }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={{ flex: 1, maxWidth: 1100, width: "100%", margin: "0 auto", padding: "18px 16px" }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}