import { useEffect, useRef } from "react";

export default function AuroraBackdrop({ scrollY = 0 }) {
  const scale = 1 + scrollY * 0.0003;

  return (
    <div className="cb-root" aria-hidden="true">

      {/* ── 1. YOUR CONCERT IMAGE ── */}
      <div
        className="cb-image"
        style={{ transform: `scale(${scale})` }}
      />

      {/* ── 2. DARK SCRIM ── */}
      <div className="cb-scrim" />

      {/* ── 3. SPOTLIGHT BEAM ── */}
      <div className="cb-spotlight-wrap">
        <div className="cb-spotlight" />
        <div className="cb-spotlight-core" />
      </div>

      {/* ── 4. FOG BAND ── */}
      <div className="cb-fog">
        <div className="cb-fog-layer cb-fog-1" />
        <div className="cb-fog-layer cb-fog-2" />
        <div className="cb-fog-layer cb-fog-3" />
      </div>

      {/* ── 5. VIGNETTE ── */}
      <div className="cb-vignette" />

      <style>{CSS}</style>
    </div>
  );
}

const CSS = `
  .cb-root {
    position: fixed;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    pointer-events: none;
  }

  /* IMAGE BACKGROUND */
  .cb-image {
    position: absolute;
    inset: -5%;
    background-image: url('/concert.jpg');
    background-size: cover;
    background-position: center top;
    will-change: transform;
    transition: transform 0.1s linear;
    filter: brightness(0.7);
  }

  /* DARK SCRIM */
  .cb-scrim {
    position: absolute;
    inset: 0;
    background: rgba(1, 10, 25, 0.72);
  }

  /* SPOTLIGHT */
  .cb-spotlight-wrap {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
  }
  .cb-spotlight {
    position: absolute;
    top: -60px;
    width: 0;
    height: 0;
    border-left:  260px solid transparent;
    border-right: 260px solid transparent;
    border-top:   900px solid rgba(255,252,230,0.04);
    filter: blur(40px);
    animation: spotPulse 5s ease-in-out infinite;
  }
  .cb-spotlight-core {
    position: absolute;
    top: -20px;
    width: 0;
    height: 0;
    border-left:  60px solid transparent;
    border-right: 60px solid transparent;
    border-top:   700px solid rgba(255,252,230,0.10);
    filter: blur(12px);
    animation: spotPulse 5s ease-in-out infinite;
  }
  @keyframes spotPulse {
    0%,100% { opacity: 0.7; }
    50%      { opacity: 1;   }
  }

  /* FOG */
  .cb-fog {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 38%;
    overflow: hidden;
  }
  .cb-fog-layer {
    position: absolute;
    bottom: 0;
    left: -20%;
    width: 140%;
    border-radius: 50%;
    background: radial-gradient(ellipse at center bottom,
      rgba(255,255,255,0.07) 0%, transparent 65%);
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
  }
  .cb-fog-1 { height: 220px; animation: fogDrift1 18s infinite; opacity: 0.8; }
  .cb-fog-2 { height: 160px; left: -30%; animation: fogDrift2 24s infinite; opacity: 0.6; }
  .cb-fog-3 { height: 100px; left: 10%; width: 100%; animation: fogDrift3 14s infinite; opacity: 0.5; }
  @keyframes fogDrift1 { 0%,100%{transform:translateX(0) scaleX(1)} 50%{transform:translateX(40px) scaleX(1.08)} }
  @keyframes fogDrift2 { 0%,100%{transform:translateX(0) scaleX(1)} 40%{transform:translateX(-50px) scaleX(1.12)} }
  @keyframes fogDrift3 { 0%,100%{transform:translateX(0) scaleX(1)} 60%{transform:translateX(30px) scaleX(0.95)} }

  /* VIGNETTE */
  .cb-vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center, transparent 25%, rgba(1,10,25,0.92) 100%);
  }

  @media (prefers-reduced-motion: reduce) {
    .cb-spotlight, .cb-spotlight-core { animation: none !important; }
    .cb-fog-layer { animation: none !important; }
  }
`;