import { useEffect, useState } from "react";

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState("idle");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("grow"),    120);
    const t2 = setTimeout(() => setPhase("fadeout"), 1500);
    const t3 = setTimeout(() => { setPhase("done"); onDone?.(); }, 2200);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, []);

  if (phase === "done") return null;

  return (
    <div className={`splash ${phase}`}>
      <div className="splash-icon">
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width="80" height="80">
          <path d="M40 4 L76 40 L40 76 L4 40 Z" fill="none" stroke="#54ACBF" strokeWidth="1.5" className="splash-diamond" />
          <path d="M40 18 L62 40 L40 62 L18 40 Z" fill="#023859" stroke="#54ACBF" strokeWidth="1" className="splash-inner" />
          <path d="M45 24 L33 42 L40 42 L35 56 L49 36 L42 36 Z" fill="#A7EBF2" className="splash-inner" />
        </svg>
      </div>
      <div className="splash-wordmark">EVENTSHOW</div>
    </div>
  );
}
