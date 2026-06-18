import { useEffect, useRef } from "react";

/**
 * useScrollReveal
 * Attach to a container ref. Every .reveal-word inside it
 * gets class "lit" as it enters the viewport while scrolling.
 */
export default function useScrollReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const words = ref.current?.querySelectorAll(".reveal-word");
    if (!words?.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("lit");
          } else {
            // Remove so it re-animates on scroll back up
            entry.target.classList.remove("lit");
          }
        });
      },
      { threshold: 0.5 }
    );

    words.forEach((w) => observer.observe(w));
    return () => observer.disconnect();
  }, []);

  return ref;
}
