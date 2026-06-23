import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

const FEATURES = [
  {
    n: "01",
    icon: "⚡",
    h: "Instant Booking",
    b: "Tickets confirmed in under 10 seconds. No waiting, no page refreshing, no anxiety.",
    accent: "#54ACBF",
  },
  {
    n: "02",
    icon: "🎯",
    h: "Best Seat Selection",
    b: "Interactive 3D seat maps with live availability across every venue in India.",
    accent: "#A7EBF2",
  },
  {
    n: "03",
    icon: "✦",
    h: "Zero Hidden Fees",
    b: "The price you see is the price you pay. No booking fee surprises at checkout.",
    accent: "#7BC6D6",
  },
];

/** 3D mouse-tilt effect on hover */
function TiltCard({ children, accent }) {
  const cardRef = useRef(null);

  const handleMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
    card.style.transform = `
      perspective(600px)
      rotateY(${x * 10}deg)
      rotateX(${-y * 10}deg)
      translateZ(12px)
    `;
    card.style.boxShadow = `
      ${-x * 10}px ${y * 10}px 40px rgba(84,172,191,0.15),
      0 20px 60px rgba(0,0,0,0.4)
    `;
  };

  const handleLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(600px) rotateY(0deg) rotateX(0deg) translateZ(0px)";
    card.style.boxShadow = "0 8px 32px rgba(0,0,0,0.25)";
  };

  return (
    <div
      ref={cardRef}
      className="pfc-card-3d"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ "--accent": accent }}
    >
      {children}
    </div>
  );
}

export default function PinnedFeatureCards() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="pfc-section">
      <motion.p
        className="section-label"
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
      >
        Why EventShow
      </motion.p>

      <motion.h2
        className="pfc-heading"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        Built for the <span>experience.</span>
      </motion.h2>

      <div className="pfc-grid">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.n}
            initial={reduceMotion ? false : { opacity: 0, y: 40, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.65, delay: reduceMotion ? 0 : i * 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            <TiltCard accent={f.accent}>
              <div className="pfc-card-inner">
                <div className="pfc-card-top">
                  <span className="pfc-icon">{f.icon}</span>
                  <span className="pfc-num">{f.n}</span>
                </div>
                <h3 className="pfc-card-title">{f.h}</h3>
                <p className="pfc-card-body">{f.b}</p>
                <div className="pfc-card-glow" />
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </div>

      <style>{CSS}</style>
    </section>
  );
}

const CSS = `
  .pfc-section {
    position: relative;
    z-index: 2;
    padding: 120px 80px;
    max-width: 1300px;
    margin: 0 auto;
    border-top: 1px solid var(--border);
  }

  .pfc-heading {
    font-size: clamp(32px, 4vw, 56px);
    font-weight: 800;
    letter-spacing: -2px;
    margin: 12px 0 56px;
    color: var(--white);
  }
  .pfc-heading span { color: var(--primary); }

  .pfc-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 28px;
  }

  /* 3D CARD SHELL */
  .pfc-card-3d {
    border-radius: 20px;
    border: 1px solid var(--border2);
    background: rgba(2,43,74,0.5);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    transition: transform 0.12s ease, box-shadow 0.12s ease;
    transform-style: preserve-3d;
    cursor: default;
    overflow: hidden;
    position: relative;
  }

  .pfc-card-inner {
    padding: 36px 30px 32px;
    position: relative;
    z-index: 1;
  }

  .pfc-card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
  }

  .pfc-icon {
    font-size: 28px;
    line-height: 1;
    display: block;
  }

  .pfc-num {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2.5px;
    color: var(--accent, var(--primary));
    opacity: 0.8;
  }

  .pfc-card-title {
    font-family: var(--font-head);
    font-size: 21px;
    font-weight: 700;
    letter-spacing: -0.5px;
    color: var(--white);
    margin-bottom: 12px;
    line-height: 1.2;
  }

  .pfc-card-body {
    font-size: 14px;
    color: var(--text-muted);
    line-height: 1.75;
  }

  /* Inner glow that responds to the accent */
  .pfc-card-glow {
    position: absolute;
    bottom: -30px;
    left: -30px;
    width: 180px;
    height: 180px;
    border-radius: 50%;
    background: radial-gradient(ellipse, var(--accent, var(--primary)) 0%, transparent 70%);
    opacity: 0.07;
    pointer-events: none;
    transition: opacity 0.3s;
  }
  .pfc-card-3d:hover .pfc-card-glow { opacity: 0.14; }

  /* top-edge accent line */
  .pfc-card-3d::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--accent, var(--primary)), transparent);
    opacity: 0.5;
    transition: opacity 0.3s;
  }
  .pfc-card-3d:hover::before { opacity: 1; }

  @media (max-width: 900px) {
    .pfc-section { padding: 80px 24px; }
    .pfc-grid { grid-template-columns: 1fr; gap: 20px; }
    .pfc-card-3d { transform: none !important; }
  }

  @media (prefers-reduced-motion: reduce) {
    .pfc-card-3d { transition: none !important; transform: none !important; }
  }
`;
