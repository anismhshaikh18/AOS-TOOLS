import { useEffect } from 'react';

/**
 * Lightweight IntersectionObserver hook that only adds `.aos-reveal-visible`
 * to `.aos-reveal` elements as they enter the viewport.
 * Respects `prefers-reduced-motion` and never alters DOM structure or state.
 */
export function useScrollReveal(routeKey: string): void {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const elements = Array.from(document.querySelectorAll<HTMLElement>('.aos-reveal'));
    if (elements.length === 0) return;

    const prefersReduced =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      elements.forEach((el) => el.classList.add('aos-reveal-visible'));
      return;
    }

    document.documentElement.classList.add('aos-reveal-ready');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('aos-reveal-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '0px 0px -36px 0px',
        threshold: 0.04,
      }
    );

    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.96) {
        el.classList.add('aos-reveal-visible');
      } else {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [routeKey]);
}
