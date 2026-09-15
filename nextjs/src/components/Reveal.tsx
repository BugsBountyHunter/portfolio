"use client";

import { useEffect } from "react";

export function Reveal() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | undefined;
    const showAll = () => elements.forEach((element) => element.classList.add("visible"));
    const configure = () => {
      observer?.disconnect();
      showAll();
      if (motion.matches || !("IntersectionObserver" in window)) return;

      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer?.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });

      elements.forEach((element) => {
        // Server HTML is visible. Only enhance content below the viewport after hydration.
        if (element.getBoundingClientRect().top >= window.innerHeight) {
          element.classList.remove("visible");
          observer?.observe(element);
        }
      });
    };

    configure();
    motion.addEventListener("change", configure);
    return () => {
      observer?.disconnect();
      motion.removeEventListener("change", configure);
      showAll();
    };
  }, []);

  return null;
}
