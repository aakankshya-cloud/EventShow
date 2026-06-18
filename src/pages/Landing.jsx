import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import SplashScreen from "../components/Splashscreen";
import RevealText from "../components/RevealText";
import useScrollReveal from "../Hooks/useScrollReveal";

export default function Landing() {
  const [splashDone, setSplashDone] = useState(false);
  const revealRef1 = useScrollReveal();
  const revealRef2 = useScrollReveal();
  const revealRef3 = useScrollReveal();

  return (
    <>
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}

      <div className="page-wrapper landing-page">
        <Navbar />

        {/* ── HERO ── */}
        <section className="l-hero">
          <p className="section-label">The Platform for Live Experiences</p>
          <h1 className="l-hero-title">
            Every<br />
            <span>Event.</span><br />
            Every<br />
            Moment.
          </h1>
          <p className="l-hero-sub">
            Concerts, movies, sports and plays —<br />
            best seats, zero hassle.
          </p>
          <div className="l-hero-cta">
            <Link to="/register" className="btn-primary">Get Started</Link>
            <Link to="/login"    className="btn-ghost">Sign In</Link>
          </div>

          {/* floating cards */}
          <div className="l-hero-cards">
            {[
              { label: "COLDPLAY",    sub: "Mumbai · Jul 10" },
              { label: "KGF 3",       sub: "Chennai · Jun 20" },
              { label: "IPL FINAL",   sub: "Mumbai · Jun 28" },
              { label: "ARIJIT LIVE", sub: "Delhi · Jul 05" },
            ].map((c, i) => (
              <div key={i} className={`l-card stagger-${i + 1} animate-slideUp`}>
                <span className="l-card-title">{c.label}</span>
                <span className="l-card-sub">{c.sub}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── SCROLL REVEAL SECTION 1 ── */}
        <section className="l-reveal-section" ref={revealRef1}>
          <p className="section-label">Why EventShow</p>
          <h2 className="l-reveal-heading">
            <RevealText text="Book the moments that stay with you forever." />
          </h2>
          <div className="l-features">
            {[
              { n: "01", h: "Instant Booking",     b: "Tickets confirmed in under 10 seconds. No waiting, no refreshing." },
              { n: "02", h: "Best Seat Selection",  b: "Interactive seat maps with real-time availability across every venue." },
              { n: "03", h: "Zero Hidden Fees",     b: "The price you see is the price you pay. Always." },
            ].map(f => (
              <div key={f.n} className="l-feature">
                <span className="l-feature-num">{f.n}</span>
                <h3>{f.h}</h3>
                <p>{f.b}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SCROLL REVEAL SECTION 2 ── */}
        <section className="l-reveal-section l-reveal-section--dark" ref={revealRef2}>
          <p className="section-label">Across India</p>
          <h2 className="l-reveal-heading">
            <RevealText text="Every city. Every stage. Every night." />
          </h2>
          <div className="l-cities">
            {["Mumbai", "Delhi", "Chennai", "Hyderabad", "Bangalore"].map((city, i) => (
              <div key={city} className={`l-city stagger-${i + 1} animate-slideUp`}>
                <span>{city}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── SCROLL REVEAL SECTION 3 ── */}
        <section className="l-reveal-section" ref={revealRef3}>
          <h2 className="l-reveal-heading l-reveal-heading--xl">
            <RevealText text="Live is better in person." />
          </h2>
          <div className="l-cta-final">
            <Link to="/register" className="btn-primary">Create Free Account</Link>
            <p className="l-cta-note">No credit card required to browse</p>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="l-footer">
          <span className="navbar-logo">Event<span>Show</span></span>
          <span className="l-footer-copy">© 2026 EventShow. All rights reserved.</span>
        </footer>
      </div>

      <style>{`
        .landing-page { overflow-x: hidden; }

        /* ── HERO ── */
        .l-hero {
          min-height: 100vh;
          padding: 80px 80px 100px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          max-width: 1300px;
          margin: 0 auto;
        }

        .l-hero-title {
          font-size: clamp(72px, 10vw, 140px);
          font-weight: 800;
          letter-spacing: -5px;
          line-height: 0.88;
          margin: 20px 0 32px;
          color: var(--white);
        }
        .l-hero-title span { color: var(--primary); }

        .l-hero-sub {
          font-size: 15px;
          color: var(--text-muted);
          line-height: 1.8;
          margin-bottom: 40px;
          max-width: 340px;
        }

        .l-hero-cta { display: flex; gap: 14px; }

        /* floating cards */
        .l-hero-cards {
          position: absolute;
          right: 80px;
          top: 50%;
          transform: translateY(-50%);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          width: 380px;
        }
        .l-card {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 28px 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          transition: var(--transition);
          opacity: 0;
        }
        .l-card:hover {
          border-color: var(--border-hover);
          transform: translateY(-4px);
          box-shadow: var(--glow);
        }
        .l-card-title {
          font-family: var(--font-head);
          font-size: 15px;
          font-weight: 800;
          color: var(--primary);
          letter-spacing: -0.3px;
        }
        .l-card-sub {
          font-size: 11px;
          color: var(--text-muted);
          letter-spacing: 0.3px;
        }

        /* ── REVEAL SECTIONS ── */
        .l-reveal-section {
          padding: 120px 80px;
          max-width: 1300px;
          margin: 0 auto;
          border-top: 1px solid var(--border);
        }
        .l-reveal-section--dark {
          background: rgba(2,43,74,0.4);
          max-width: 100%;
          padding: 120px 80px;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }
        .l-reveal-section--dark > * { max-width: 1300px; margin-left: auto; margin-right: auto; }

        .l-reveal-heading {
          font-size: clamp(36px, 5vw, 72px);
          font-weight: 800;
          letter-spacing: -2.5px;
          line-height: 1.0;
          margin: 16px 0 60px;
          max-width: 900px;
        }
        .l-reveal-heading--xl {
          font-size: clamp(48px, 7vw, 96px);
          letter-spacing: -4px;
          max-width: 100%;
          text-align: center;
          margin-bottom: 48px;
        }

        /* FEATURES */
        .l-features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 48px;
        }
        .l-feature { display: flex; flex-direction: column; gap: 12px; }
        .l-feature-num {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          color: var(--primary);
        }
        .l-feature h3 { font-size: 20px; font-weight: 700; letter-spacing: -0.5px; color: var(--white); }
        .l-feature p  { font-size: 14px; color: var(--text-muted); line-height: 1.7; }

        /* CITIES */
        .l-cities {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .l-city {
          padding: 14px 28px;
          border: 1px solid var(--border2);
          border-radius: 100px;
          font-size: 15px;
          font-weight: 600;
          color: var(--text-secondary);
          transition: var(--transition);
          opacity: 0;
        }
        .l-city:hover { border-color: var(--primary); color: var(--primary); }

        /* FINAL CTA */
        .l-cta-final {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .l-cta-note { font-size: 12px; color: var(--text-muted); letter-spacing: 0.3px; }

        /* FOOTER */
        .l-footer {
          padding: 36px 80px;
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .l-footer-copy { font-size: 12px; color: var(--text-muted); }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .l-hero { padding: 60px 24px 80px; }
          .l-hero-cards { display: none; }
          .l-reveal-section { padding: 80px 24px; }
          .l-reveal-section--dark { padding: 80px 24px; }
          .l-features { grid-template-columns: 1fr; gap: 36px; }
          .l-footer { padding: 28px 24px; flex-direction: column; gap: 12px; text-align: center; }
        }
      `}</style>
    </>
  );
}
