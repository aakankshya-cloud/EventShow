import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import SplashScreen from "../components/SplashScreen";
import RevealText from "../components/RevealText";
import useScrollReveal from "../hooks/useScrollReveal";

/* ─────────────────────────────────────────────
   AMBIENT MUSIC  — Web Audio API, no file needed
   Deep cinematic minor pad in D minor
───────────────────────────────────────────── */
function useAmbientAudio() {
  const audioRef = useRef(null);
  useEffect(() => {
    audioRef.current = new Audio("/ambient.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.25;
    return () => audioRef.current?.pause();
  }, []);
  return audioRef;
}

/* ─────────────────────────────────────────────
   TICKET DATA  — one per "Concerts, movies, sports
   and plays" so the carousel mirrors the hero copy
───────────────────────────────────────────── */
const TICKETS = [
  {
    brand: "EVENTSHOW",
    type: "LIVE",
    pre: "YOU'RE GOING TO",
    title: "COLDPLAY",
    sub: "Music of the Spheres World Tour",
    date: "10 JUL 2026",
    venue: "DY Patil Stadium",
    seat: "A · 12",
  },
  {
    brand: "EVENTSHOW",
    type: "SCREENING",
    pre: "YOU'RE WATCHING",
    title: "DUNE: PART THREE",
    sub: "IMAX 70mm Experience",
    date: "22 JUL 2026",
    venue: "PVR ICON, Lower Parel",
    seat: "G2 · 14",
  },
  {
    brand: "EVENTSHOW",
    type: "MATCH",
    pre: "YOU'RE COURTSIDE FOR",
    title: "INDIA vs AUS",
    sub: "ICC World Cup — Semi Final",
    date: "04 AUG 2026",
    venue: "Wankhede Stadium",
    seat: "Grandstand · 88",
  },
  {
    brand: "EVENTSHOW",
    type: "SHOW",
    pre: "YOU'RE SEEING",
    title: "HAMILTON",
    sub: "The Original Broadway Musical",
    date: "15 AUG 2026",
    venue: "NCPA, Mumbai",
    seat: "B · 7",
  },
];

/* ─────────────────────────────────────────────
   SINGLE TICKET CARD  — identical visual design
   to before, now data-driven so it can repeat
───────────────────────────────────────────── */
function TicketCard({ data }) {
  return (
    <div className="ticket-wrap">
      {/* Main ticket face */}
      <div className="ticket-face ticket-front">
        <div className="ticket-topbar">
          <span className="ticket-brand">{data.brand}</span>
          <span className="ticket-type">{data.type}</span>
        </div>

        <div className="ticket-event-name">
          <span className="ticket-event-pre">{data.pre}</span>
          <h3 className="ticket-event-title">{data.title}</h3>
          <span className="ticket-event-sub">{data.sub}</span>
        </div>

        <div className="ticket-sep">
          <div className="ticket-notch ticket-notch-l" />
          <div className="ticket-dots" />
          <div className="ticket-notch ticket-notch-r" />
        </div>

        <div className="ticket-meta">
          <div className="ticket-meta-item">
            <span className="ticket-meta-label">DATE</span>
            <span className="ticket-meta-value">{data.date}</span>
          </div>
          <div className="ticket-meta-item">
            <span className="ticket-meta-label">VENUE</span>
            <span className="ticket-meta-value">{data.venue}</span>
          </div>
          <div className="ticket-meta-item">
            <span className="ticket-meta-label">SEAT</span>
            <span className="ticket-meta-value">{data.seat}</span>
          </div>
        </div>

        <div className="ticket-barcode">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="ticket-bar"
              style={{ height: `${Math.random() * 60 + 40}%`, opacity: Math.random() * 0.5 + 0.5 }}
            />
          ))}
        </div>

        <div className="ticket-shine" />
        <div className="ticket-holo" />
      </div>

      {/* Back face (seen as each ticket swings around) */}
      <div className="ticket-face ticket-back">
        <div className="ticket-back-pattern" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   TICKET ORBIT  — multiple tickets arranged on a
   ring that spins continuously (CSS keyframes),
   with mouse parallax tilt layered on the stage
───────────────────────────────────────────── */
function TicketOrbit() {
  const stageRef = useRef(null);
  const frameRef = useRef(null);
  const current  = useRef({ rx: -6, ry: 0 });
  const target   = useRef({ rx: -6, ry: 0 });

  useEffect(() => {
    const onMove = (e) => {
      const nx = (e.clientX / window.innerWidth  - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      target.current = { rx: -6 + ny * -10, ry: nx * 12 };
    };
    window.addEventListener("mousemove", onMove);

    const animate = () => {
      current.current.rx += (target.current.rx - current.current.rx) * 0.06;
      current.current.ry += (target.current.ry - current.current.ry) * 0.06;
      if (stageRef.current) {
        stageRef.current.style.transform =
          `rotateX(${current.current.rx}deg) rotateY(${current.current.ry}deg)`;
      }
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const count  = TICKETS.length;
  const radius = 120 + (count - 2) * 25; // spreads tickets out a bit more as you add more

  return (
    <div className="ticket-orbit-scene" aria-hidden="true">
      <div className="ticket-glow" />

      <div className="ticket-orbit-stage" ref={stageRef}>
        <div className="ticket-orbit-ring">
          {TICKETS.map((t, i) => {
            const angle = (360 / count) * i;
            return (
              <div
                key={t.title}
                className="ticket-orbit-item"
                style={{
                  transform: `translate(-50%, -50%) rotateY(${angle}deg) translateZ(${radius}px)`,
                }}
              >
                <TicketCard data={t} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Orbiting ambient dots, sitting outside the ticket ring */}
      {[0, 60, 120, 180, 240, 300].map((deg, i) => (
        <div
          key={i}
          className="ticket-orbit-dot"
          style={{ "--deg": `${deg}deg`, "--delay": `${i * 0.4}s` }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MUSIC TOGGLE BUTTON
───────────────────────────────────────────── */
function MusicToggle({ playing, onToggle }) {
  return (
    <button
      className="music-btn"
      onClick={onToggle}
      aria-label={playing ? "Mute music" : "Play ambient music"}
    >
      <span className="music-icon">
        {playing ? "♪" : "♩"}
      </span>
      <span className="music-bars">
        {[1,2,3,4].map(i => (
          <span key={i} className={`mbar mbar-${i} ${playing ? "mbar-active" : ""}`} />
        ))}
      </span>
    </button>
  );
}

/* ─────────────────────────────────────────────
   STAT COUNTER
───────────────────────────────────────────── */
function StatCounter({ n, label }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      const target = parseInt(n.replace(/\D/g, ""));
      const suffix = n.replace(/[0-9]/g, "");
      let start = 0;
      const step = Math.ceil(target / 60);
      const timer = setInterval(() => {
        start = Math.min(start + step, target);
        setCount(start + suffix);
        if (start >= target) clearInterval(timer);
      }, 25);
      observer.disconnect();
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [n]);

  return (
    <div className="stat-item" ref={ref}>
      <span className="stat-n">{count || "0"}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN LANDING PAGE
───────────────────────────────────────────── */
export default function Landing() {
  const [splashDone, setSplashDone] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [scrollY, setScrollY] = useState(0);
 const audioRef = useAmbientAudio();
  const revealRef1 = useScrollReveal();
  const revealRef2 = useScrollReveal();
  const revealRef3 = useScrollReveal();

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-start music after splash

  const toggleMusic = useCallback(() => {
  if (!audioRef.current) return;
  if (musicPlaying) {
    audioRef.current.pause();
    setMusicPlaying(false);
  } else {
    audioRef.current.play();
    setMusicPlaying(true);
  }
}, [musicPlaying]);

  const heroOpacity   = Math.max(0, 1 - scrollY / 500);
  const heroTranslate = scrollY * 0.18;

  return (
    <>
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}

      {/* Concert background */}
      <div
        className="land-bg"
        style={{ transform: `scale(${1 + scrollY * 0.0002})` }}
        aria-hidden="true"
      >
        <div className="land-bg-scrim" />
        {/* Spotlight beam */}
        <div className="land-spotlight" />
        <div className="land-spotlight-core" />
        {/* Bottom fog */}
        <div className="land-fog">
          <div className="land-fog-1" />
          <div className="land-fog-2" />
        </div>
        {/* Vignette */}
        <div className="land-vignette" />
        {/* Blue tint overlay to match Luna palette */}
        <div className="land-blue-tint" />
      </div>

      <MusicToggle playing={musicPlaying} onToggle={toggleMusic} />

      <div className="page-wrapper land-page">
        <Navbar />

        {/* ── HERO ── */}
        <section
          className="land-hero"
          style={{
            opacity: heroOpacity,
            transform: `translateY(${heroTranslate}px)`,
          }}
        >
          <div className="land-hero-left">
            <span className="section-label">The Platform for Live Experiences</span>

            <h1 className="land-h1">
              Book the<br />
              moment<br />
              <span>before it<br />happens.</span>
            </h1>

            <p className="land-sub">
              Concerts, movies, sports and plays —<br />
              best seats across India, zero hassle.
            </p>

            <div className="land-cta">
              <Link to="/register" className="btn-primary land-btn">
                Browse Events
              </Link>
              <Link to="/login" className="btn-ghost">
                Sign In
              </Link>
            </div>

            <div className="land-scroll-cue">
              <div className="land-scroll-arrow" />
              <span>Scroll to explore</span>
            </div>
          </div>

          {/* Rotating ticket carousel */}
          <div className="land-hero-right">
            <TicketOrbit />
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="land-stats">
          <StatCounter n="5+" label="Live Events" />
          <div className="stat-divider" />
          <StatCounter n="5+" label="Tickets Sold" />
          <div className="stat-divider" />
          <StatCounter n="5" label="Cities" />
          <div className="stat-divider" />
          <StatCounter n="4+" label="Avg Rating" />
        </section>


        {/* ── SCROLL REVEAL: WHY ── */}
        <section className="land-reveal-section" ref={revealRef1}>
          <span className="section-label">Why EventShow</span>
          <h2 className="land-reveal-h2">
            <RevealText text="Built for the experience. Not just the ticket." />
          </h2>
          <div className="land-features">
            {[
              { n:"01", h:"Instant Booking",    b:"Confirmed in under 10 seconds. No waiting, no page refreshing." },
              { n:"02", h:"Live Seat Maps",      b:"Interactive seat maps with real-time availability across every venue." },
              { n:"03", h:"Zero Hidden Fees",    b:"The price you see is the price you pay. Always." },
            ].map(f => (
              <div key={f.n} className="land-feature">
                <span className="land-feature-n">{f.n}</span>
                <h3 className="land-feature-h">{f.h}</h3>
                <p className="land-feature-b">{f.b}</p>
                <div className="land-feature-line" />
              </div>
            ))}
          </div>
        </section>

        {/* ── CITIES ── */}
        <section className="land-cities-section" ref={revealRef2}>
          <span className="section-label">Across India</span>
          <h2 className="land-reveal-h2">
            <RevealText text="Every city. Every stage. Every night." />
          </h2>
          <div className="land-cities">
            {["Mumbai", "Delhi", "Chennai", "Hyderabad", "Bangalore"].map((city, i) => (
              <div
                key={city}
                className="land-city animate-slideUp"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {city}
              </div>
            ))}
          </div>
        </section>

        {/* ── FINALE ── */}
        <section className="land-finale" ref={revealRef3}>
          <h2 className="land-finale-h">
            <RevealText text="Live is better in person." />
          </h2>
          <Link to="/register" className="btn-primary land-btn land-finale-btn">
            Create Free Account
          </Link>
          <p className="land-finale-note">No credit card required to browse</p>
        </section>

        {/* ── FOOTER ── */}
        <footer className="land-footer">
          <span className="navbar-logo">Event<span>Show</span></span>
          <span className="land-footer-copy">© 2026 EventShow. All rights reserved.</span>
        </footer>
      </div>

      <style>{CSS}</style>
    </>
  );
}

/* ─────────────────────────────────────────────
   ALL STYLES
───────────────────────────────────────────── */
const CSS = `
  /* ── BACKGROUND ── */
  .land-bg {
    position: fixed;
    inset: -5%;
    z-index: 0;
    isolation: isolate;
    background-image: url('/concert.jpg');
    background-size: cover;
    background-position: center 50%;
    will-change: transform;
    transition: transform 0.1s linear;
    /* The source photo runs warm (stage haze + phone lights). Desaturating
       it slightly before the navy scrim/tint go on top keeps every photo
       reading in the same cool Luna-blue family instead of fighting it. */
    filter: saturate(0.75) brightness(0.92) contrast(1.05);
  }
  .land-bg-scrim    { position:absolute; inset:0; background:rgba(0,8,20,0.78); }
  .land-blue-tint   { position:absolute; inset:0; background:rgba(1,28,64,0.55); mix-blend-mode:color; }
  .land-vignette    { position:absolute; inset:0; background:radial-gradient(ellipse at center, transparent 20%, rgba(0,5,15,0.95) 100%); }

  /* Spotlight */
  .land-spotlight {
    position:absolute; top:-60px; left:50%; transform:translateX(-50%);
    width:0; height:0;
    border-left:300px solid transparent;
    border-right:300px solid transparent;
    border-top:1000px solid rgba(167,235,242,0.03);
    filter:blur(50px);
    animation:spotPulse 6s ease-in-out infinite;
  }
  .land-spotlight-core {
    position:absolute; top:-10px; left:50%; transform:translateX(-50%);
    width:0; height:0;
    border-left:80px solid transparent;
    border-right:80px solid transparent;
    border-top:700px solid rgba(84,172,191,0.06);
    filter:blur(16px);
    animation:spotPulse 6s ease-in-out infinite;
  }
  @keyframes spotPulse { 0%,100%{opacity:.7} 50%{opacity:1} }

  /* Fog */
  .land-fog { position:absolute; bottom:0; left:0; right:0; height:35%; overflow:hidden; }
  .land-fog-1,.land-fog-2 {
    position:absolute; bottom:0; left:-20%; width:140%; border-radius:50%;
    background:radial-gradient(ellipse at center bottom, rgba(84,172,191,0.06) 0%, transparent 70%);
  }
  .land-fog-1 { height:200px; animation:fogD1 20s ease-in-out infinite; }
  .land-fog-2 { height:130px; left:-30%; animation:fogD2 26s ease-in-out infinite; opacity:.6; }
  @keyframes fogD1 { 0%,100%{transform:translateX(0)} 50%{transform:translateX(40px)} }
  @keyframes fogD2 { 0%,100%{transform:translateX(0)} 50%{transform:translateX(-50px)} }

  /* ── MUSIC BUTTON ── */
  .music-btn {
    position:fixed; top:80px; right:24px; z-index:1000;
    background:rgba(1,28,64,0.8);
    border:1px solid rgba(84,172,191,0.3);
    border-radius:12px;
    padding:10px 14px;
    color:var(--primary);
    display:flex; align-items:center; gap:10px;
    backdrop-filter:blur(14px);
    cursor:pointer;
    font-family:var(--font-body);
    transition:all 0.3s ease;
  }
  .music-btn:hover { border-color:var(--primary); box-shadow:0 0 20px rgba(84,172,191,0.2); }
  .music-icon { font-size:15px; }
  .music-bars { display:flex; align-items:flex-end; gap:2px; height:14px; }
  .mbar { width:3px; background:var(--primary); border-radius:2px; opacity:0.3; }
  .mbar-1{height:4px} .mbar-2{height:8px} .mbar-3{height:6px} .mbar-4{height:10px}
  .mbar-active { opacity:1; }
  .mbar-1.mbar-active{animation:mb1 .9s ease-in-out infinite alternate}
  .mbar-2.mbar-active{animation:mb2 .7s ease-in-out infinite alternate}
  .mbar-3.mbar-active{animation:mb3 1.1s ease-in-out infinite alternate}
  .mbar-4.mbar-active{animation:mb4 .8s ease-in-out infinite alternate}
  @keyframes mb1{from{height:3px}to{height:12px}}
  @keyframes mb2{from{height:6px}to{height:14px}}
  @keyframes mb3{from{height:4px}to{height:11px}}
  @keyframes mb4{from{height:9px}to{height:4px}}

  /* ── PAGE ── */
  .land-page { overflow-x:hidden; position:relative; z-index:2; }

  /* ── HERO ── */
  .land-hero {
    min-height:100vh;
    padding:110px 80px 80px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:40px;
    max-width:1400px;
    margin:0 auto;
    transition:opacity 0.1s linear;
  }
  .land-hero-left { flex:1; max-width:560px; }

  .land-h1 {
    font-size:clamp(52px,7vw,100px);
    font-weight:800;
    letter-spacing:-4px;
    line-height:0.93;
    margin:20px 0 28px;
    color:var(--white);
  }
  .land-h1 span { color:var(--primary); }

  .land-sub {
    font-size:15px;
    color:var(--text-muted);
    line-height:1.8;
    margin-bottom:40px;
  }

  .land-cta { display:flex; gap:14px; flex-wrap:wrap; align-items:center; }

  .land-btn {
    background:linear-gradient(135deg,var(--primary),#2A7A8C) !important;
    box-shadow:0 4px 24px rgba(84,172,191,0.3);
    padding:15px 36px !important;
    font-size:13px !important;
    letter-spacing:1.5px !important;
  }
  .land-btn:hover {
    background:linear-gradient(135deg,var(--primary-hover),var(--primary)) !important;
    box-shadow:0 8px 36px rgba(84,172,191,0.45) !important;
    transform:translateY(-2px);
  }

  .land-scroll-cue {
    display:flex; align-items:center; gap:10px;
    margin-top:52px;
    font-size:10px; letter-spacing:2px;
    color:var(--text-muted); text-transform:uppercase; opacity:.7;
  }
  .land-scroll-arrow {
    width:16px; height:16px;
    border-right:1.5px solid var(--primary);
    border-bottom:1.5px solid var(--primary);
    transform:rotate(45deg);
    animation:scrollB 2s ease-in-out infinite;
  }
  @keyframes scrollB {
    0%,100%{transform:rotate(45deg) translate(0,0);opacity:.5}
    50%{transform:rotate(45deg) translate(4px,4px);opacity:1}
  }

  /* ── HERO RIGHT ── */
  .land-hero-right {
    width:460px; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
  }

  /* ── TICKET ORBIT (carousel of tickets spinning in a circle) ── */
  .ticket-orbit-scene {
    position:relative;
    width:420px; height:480px;
    display:flex; align-items:center; justify-content:center;
    perspective:1100px;
    animation:ticketFloat 6s ease-in-out infinite;
  }
  @keyframes ticketFloat {
    0%,100%{transform:translateY(0)}
    50%{transform:translateY(-18px)}
  }

  .ticket-glow {
    position:absolute;
    width:320px; height:320px;
    border-radius:50%;
    background:radial-gradient(ellipse,rgba(84,172,191,0.25) 0%,transparent 70%);
    filter:blur(34px);
    animation:glowP 4s ease-in-out infinite;
    pointer-events:none;
  }
  @keyframes glowP{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.12)}}

  /* Mouse-tilt layer (updated imperatively via JS every frame) */
  .ticket-orbit-stage {
    position:relative;
    transform-style:preserve-3d;
    transition:transform 0.1s linear;
    will-change:transform;
  }

  /* Auto-spin layer — this is what makes every ticket travel in a circle */
  .ticket-orbit-ring {
    position:relative;
    transform-style:preserve-3d;
    animation:ringSpin 22s linear infinite;
  }
  @keyframes ringSpin {
    from { transform:rotateY(0deg); }
    to   { transform:rotateY(360deg); }
  }

  /* Each ticket's fixed seat on the ring: rotateY places it around the
     circle, translateZ pushes it out to the ring's radius. Because this
     rotation travels WITH the spinning ring, every card swings into view
     face-on, then edges away, then shows its back, all the way around. */
  .ticket-orbit-item {
    position:absolute;
    top:0; left:0;
    transform-style:preserve-3d;
  }

  .ticket-wrap {
    position:relative;
    width:300px; height:400px;
    transform-style:preserve-3d;
    scale:0.6;
  }

  .ticket-face {
    position:absolute; inset:0;
    border-radius:20px;
    backface-visibility:hidden;
    -webkit-backface-visibility:hidden;
  }

  /* FRONT */
  .ticket-front {
    background:linear-gradient(160deg,rgba(2,56,89,0.95) 0%,rgba(1,28,64,0.98) 100%);
    border:1px solid rgba(84,172,191,0.35);
    box-shadow:
      0 0 0 1px rgba(84,172,191,0.1),
      0 20px 60px rgba(0,0,0,0.6),
      inset 0 1px 0 rgba(167,235,242,0.15);
    overflow:hidden;
    padding:28px 24px 20px;
    display:flex; flex-direction:column; gap:16px;
  }

  .ticket-topbar {
    display:flex; justify-content:space-between; align-items:center;
  }
  .ticket-brand {
    font-family:var(--font-head);
    font-size:11px; font-weight:800; letter-spacing:3px;
    color:var(--primary);
  }
  .ticket-type {
    font-size:9px; font-weight:700; letter-spacing:2px;
    padding:3px 10px;
    border:1px solid rgba(84,172,191,0.4);
    border-radius:20px;
    color:var(--secondary);
  }

  .ticket-event-name { display:flex; flex-direction:column; gap:4px; }
  .ticket-event-pre  {
    font-size:9px; letter-spacing:2px; text-transform:uppercase;
    color:var(--text-muted); font-weight:600;
  }
  .ticket-event-title {
    font-family:var(--font-head);
    font-size:38px; font-weight:800; letter-spacing:-2px;
    line-height:0.95;
    color:var(--white);
    text-shadow:0 0 40px rgba(167,235,242,0.3);
  }
  .ticket-event-sub {
    font-size:11px; color:var(--text-muted); line-height:1.4;
  }

  /* Dotted separator */
  .ticket-sep {
    position:relative; display:flex; align-items:center;
    margin:0 -24px;
  }
  .ticket-notch {
    width:20px; height:20px; border-radius:50%;
    background:var(--bg); flex-shrink:0;
    box-shadow:inset 0 0 0 1px rgba(84,172,191,0.2);
  }
  .ticket-notch-l { margin-left:-1px; }
  .ticket-notch-r { margin-right:-1px; }
  .ticket-dots {
    flex:1; height:1px;
    background:repeating-linear-gradient(90deg,
      rgba(84,172,191,0.3) 0,rgba(84,172,191,0.3) 4px,
      transparent 4px,transparent 12px);
  }

  /* Meta */
  .ticket-meta { display:flex; gap:0; }
  .ticket-meta-item {
    flex:1; display:flex; flex-direction:column; gap:3px;
    padding-right:12px;
  }
  .ticket-meta-item:not(:last-child) {
    border-right:1px solid rgba(84,172,191,0.15);
    margin-right:12px;
  }
  .ticket-meta-label {
    font-size:8px; letter-spacing:1.5px; text-transform:uppercase;
    color:var(--text-muted); font-weight:700;
  }
  .ticket-meta-value {
    font-size:12px; font-weight:600; color:var(--white);
    font-family:var(--font-head);
  }

  /* Barcode */
  .ticket-barcode {
    display:flex; align-items:center; gap:1.5px;
    height:44px; padding:4px 0;
    border-top:1px solid rgba(84,172,191,0.1);
    margin-top:auto;
  }
  .ticket-bar {
    flex:1; border-radius:1px;
    background:rgba(167,235,242,0.7);
    min-width:1.5px;
  }

  /* Shine */
  .ticket-shine {
    position:absolute; inset:0; border-radius:20px;
    background:linear-gradient(135deg,
      rgba(255,255,255,0.08) 0%,
      transparent 40%,
      rgba(84,172,191,0.04) 100%);
    pointer-events:none;
  }

  /* Holographic strip */
  .ticket-holo {
    position:absolute; top:0; left:0; bottom:0;
    width:6px; border-radius:20px 0 0 20px;
    background:linear-gradient(180deg,
      #54ACBF,#A7EBF2,#26658C,#54ACBF,#A7EBF2);
    opacity:0.8;
    animation:holoShift 3s linear infinite;
  }
  @keyframes holoShift {
    0%{filter:hue-rotate(0deg)}
    100%{filter:hue-rotate(360deg)}
  }

  /* BACK */
  .ticket-back {
    background:linear-gradient(160deg,#011C40,#022B4A);
    border:1px solid rgba(84,172,191,0.15);
    transform:rotateY(180deg);
    overflow:hidden;
  }
  .ticket-back-pattern {
    position:absolute; inset:0;
    background-image:
      repeating-linear-gradient(45deg,rgba(84,172,191,0.04) 0,rgba(84,172,191,0.04) 1px,transparent 1px,transparent 12px),
      repeating-linear-gradient(-45deg,rgba(84,172,191,0.04) 0,rgba(84,172,191,0.04) 1px,transparent 1px,transparent 12px);
  }

  /* Ambient orbit dots — sit outside the ticket ring */
  .ticket-orbit-dot {
    position:absolute;
    width:5px; height:5px; border-radius:50%;
    background:var(--primary);
    opacity:0.6;
    box-shadow:0 0 8px var(--primary);
    top:50%; left:50%;
    animation:orbitDot 8s linear infinite;
    animation-delay:var(--delay);
    transform-origin:0 0;
  }
  @keyframes orbitDot {
    from {
      transform:rotate(var(--deg)) translateX(230px) translateY(-50%);
    }
    to {
      transform:rotate(calc(var(--deg) + 360deg)) translateX(230px) translateY(-50%);
    }
  }

  /* ── STATS ── */
  .land-stats {
    position:relative; z-index:2;
    display:flex; justify-content:center; align-items:center;
    border-top:1px solid var(--border);
    border-bottom:1px solid var(--border);
    background:rgba(1,28,64,0.7);
    backdrop-filter:blur(12px);
  }
  .stat-item {
    flex:1; max-width:220px;
    padding:32px 24px; text-align:center;
    display:flex; flex-direction:column; gap:6px;
  }
  .stat-divider { width:1px; height:60px; background:var(--border); }
  .stat-n {
    font-family:var(--font-head);
    font-size:38px; font-weight:800; letter-spacing:-1.5px;
    color:var(--primary);
  }
  .stat-label { font-size:10px; color:var(--text-muted); letter-spacing:2px; text-transform:uppercase; }

  /* ── REVEAL SECTIONS ── */
  .land-reveal-section,
  .land-cities-section {
    position:relative; z-index:2;
    padding:120px 80px;
    max-width:1300px; margin:0 auto;
    border-top:1px solid var(--border);
  }

  .land-reveal-h2 {
    font-size:clamp(36px,5vw,68px);
    font-weight:800;
    letter-spacing:-2.5px;
    line-height:1.0;
    margin:16px 0 56px;
    max-width:900px;
    color:var(--white);
  }

  /* Reveal words — override for dark bg */
  .land-page .reveal-word     { color:rgba(84,172,191,0.2); }
  .land-page .reveal-word.lit { color:var(--white); }

  /* Features */
  .land-features { display:grid; grid-template-columns:repeat(3,1fr); gap:48px; }
  .land-feature  { display:flex; flex-direction:column; gap:12px; }
  .land-feature-n {
    font-size:10px; font-weight:700; letter-spacing:2px;
    color:var(--primary);
  }
  .land-feature-h {
    font-size:20px; font-weight:700; letter-spacing:-0.5px;
    color:var(--white);
  }
  .land-feature-b { font-size:14px; color:var(--text-muted); line-height:1.7; }
  .land-feature-line {
    height:1px; width:40px;
    background:linear-gradient(90deg,var(--primary),transparent);
    margin-top:8px;
  }

  /* Cities */
  .land-cities { display:flex; gap:12px; flex-wrap:wrap; }
  .land-city {
    padding:14px 28px;
    border:1px solid var(--border2);
    border-radius:100px;
    font-size:15px; font-weight:600;
    color:var(--text-secondary);
    transition:var(--transition);
    cursor:default;
    opacity:0;
  }
  .land-city:hover { border-color:var(--primary); color:var(--primary); }

  /* ── FINALE ── */
  .land-finale {
    position:relative; z-index:2;
    padding:140px 80px;
    text-align:center;
    border-top:1px solid var(--border);
    display:flex; flex-direction:column; align-items:center; gap:24px;
  }
  .land-finale-h {
    font-size:clamp(48px,7vw,96px);
    font-weight:800;
    letter-spacing:-4px;
    line-height:1.0;
    color:var(--white);
    margin-bottom:12px;
  }
  .land-finale-btn { padding:18px 56px !important; font-size:14px !important; letter-spacing:2px !important; }
  .land-finale-note { font-size:12px; color:var(--text-muted); }

  /* ── FOOTER ── */
  .land-footer {
    position:relative; z-index:2;
    padding:36px 80px;
    border-top:1px solid var(--border);
    display:flex; justify-content:space-between; align-items:center;
    background:rgba(1,28,64,0.5);
  }
  .land-footer-copy { font-size:12px; color:var(--text-muted); }

  /* ── RESPONSIVE ── */
  @media (max-width:1100px) {
    .land-hero { padding:100px 40px 80px; }
    .land-hero-right { width:380px; transform:scale(0.84); }
  }
  @media (max-width:900px) {
    .land-hero {
      flex-direction:column; padding:80px 24px 60px;
      text-align:center; align-items:center; min-height:auto;
    }
    .land-hero-left { max-width:100%; }
    .land-hero-right { width:100%; transform:scale(0.78); margin:-20px 0; }
    .land-cta { justify-content:center; }
    .land-scroll-cue { justify-content:center; }
    .land-reveal-section,
    .land-cities-section,
    .land-finale {
      padding:80px 24px;
    }
    .land-features { grid-template-columns:1fr; gap:40px; }
    .land-cities { justify-content:center; }
    .land-footer {
      flex-direction:column; gap:12px;
      padding:32px 24px; text-align:center;
    }
    .stat-item { padding:24px 16px; }
  }
  @media (max-width:560px) {
    .land-h1 { letter-spacing:-2px; }
    .land-sub br { display:none; }
    .land-hero-right { transform:scale(0.62); margin:-50px 0; }
    .land-stats { flex-wrap:wrap; }
    .stat-item { flex:1 1 45%; max-width:none; }
    .stat-divider { display:none; }
    .land-finale-h { letter-spacing:-2px; }
    .land-finale-btn { padding:16px 40px !important; }
    .music-btn { top:72px; right:16px; padding:8px 12px; }
  }
`;