/**
 * RevealText
 * Usage: <RevealText text="Every word lights up as you scroll" />
 * Wrap the parent section in a ref from useScrollReveal()
 */
export default function RevealText({ text, className = "" }) {
  return (
    <span className={`reveal-text ${className}`}>
      {text.split(" ").map((word, i) => (
        <span key={i} className="reveal-word">
          {word}
        </span>
      ))}
    </span>
  );
}
