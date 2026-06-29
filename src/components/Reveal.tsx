import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Scroll-reveal (fade + slide up, once). Implemented with IntersectionObserver
 * + CSS so it doesn't pull a heavy animation library into the initial bundle.
 */
export default function Reveal({
  children,
  delay = 0,
  y = 22,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "0px 0px -60px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : `translateY(${y}px)`,
        transition: `opacity 0.6s ${delay}s cubic-bezier(0.22,1,0.36,1), transform 0.6s ${delay}s cubic-bezier(0.22,1,0.36,1)`,
      }}
    >
      {children}
    </div>
  );
}
