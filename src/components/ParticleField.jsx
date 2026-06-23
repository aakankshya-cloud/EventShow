import { useEffect, useRef } from "react";

/**
 * ConfettiField
 * (Still exported as ParticleField for drop-in compatibility.)
 *
 * Concert confetti: gold, white, and silver pieces falling and rotating,
 * with a subtle sparkle effect. Blends naturally over the dark video background.
 */
export default function ParticleField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W, H, pieces, raf;

    // Confetti color palette — warm gold/white/silver for concert stage feel
    const COLORS = [
      "#D4A96A",   // warm gold
      "#F5E6C8",   // pale gold
      "#FFFFFF",   // white
      "#C8C8D0",   // silver
      "#E8D090",   // champagne
      "#54ACBF",   // teal brand accent (occasional)
    ];

    // Shapes: rectangle strips, circles, triangles
    const SHAPES = ["rect", "rect", "rect", "circle", "triangle"];

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function makePiece() {
      return {
        x:       Math.random() * W,
        y:       Math.random() * H - H,        // start above viewport
        vx:      (Math.random() - 0.5) * 1.2,
        vy:      Math.random() * 2.5 + 0.6,    // fall speed
        size:    Math.random() * 7 + 3,
        rotation: Math.random() * Math.PI * 2,
        rotV:    (Math.random() - 0.5) * 0.12,
        color:   COLORS[Math.floor(Math.random() * COLORS.length)],
        shape:   SHAPES[Math.floor(Math.random() * SHAPES.length)],
        alpha:   Math.random() * 0.6 + 0.3,
        alphaV:  (Math.random() - 0.5) * 0.005,
        wobble:  Math.random() * Math.PI * 2,
        wobbleV: Math.random() * 0.05 + 0.02,
        // sparkle
        sparkle: Math.random() < 0.3,
        sparkT:  0,
      };
    }

    function drawRect(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size * 0.2, p.size, p.size * 0.4);
      ctx.restore();
    }

    function drawCircle(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.restore();
    }

    function drawTriangle(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.moveTo(0, -p.size * 0.5);
      ctx.lineTo( p.size * 0.5,  p.size * 0.4);
      ctx.lineTo(-p.size * 0.5,  p.size * 0.4);
      ctx.closePath();
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.restore();
    }

    function drawSparkle(p) {
      // 4-point star sparkle
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.alpha * Math.abs(Math.sin(p.sparkT));
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1;
      const r = p.size * 0.8;
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        ctx.stroke();
      }
      ctx.restore();
    }

    function init() {
      const count = Math.floor((W * H) / 12000);
      pieces = Array.from({ length: Math.min(count, 120) }, makePiece);
      // Stagger initial y positions across the screen
      pieces.forEach((p, i) => { p.y = (H / pieces.length) * i - H * 0.2; });
    }

    function step() {
      ctx.clearRect(0, 0, W, H);

      for (const p of pieces) {
        // Physics
        p.wobble += p.wobbleV;
        p.x   += p.vx + Math.sin(p.wobble) * 0.4;
        p.y   += p.vy;
        p.rotation += p.rotV;
        p.alpha    += p.alphaV;
        if (p.sparkle) p.sparkT += 0.08;

        // Clamp alpha
        if (p.alpha < 0.15) p.alphaV =  Math.abs(p.alphaV);
        if (p.alpha > 0.85) p.alphaV = -Math.abs(p.alphaV);

        // Reset when it falls off screen
        if (p.y > H + 20) {
          Object.assign(p, makePiece());
          p.y = -20;
          p.x = Math.random() * W;
        }

        // Draw
        if (p.sparkle && Math.abs(Math.sin(p.sparkT)) > 0.6) {
          drawSparkle(p);
        } else {
          if (p.shape === "rect")     drawRect(p);
          else if (p.shape === "circle")   drawCircle(p);
          else if (p.shape === "triangle") drawTriangle(p);
        }
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(step);
    }

    resize();
    init();
    step();

    const onResize = () => { resize(); init(); };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
      }}
    />
  );
}