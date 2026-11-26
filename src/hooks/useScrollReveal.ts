import { useEffect } from 'react';

/**
 * Lightweight IntersectionObserver + MutationObserver hook that only adds
 * `.aos-reveal-visible` to `.aos-reveal` elements as they enter the viewport.
 * Handles lazy-loaded and dynamically mounted sections reliably so nothing
 * can ever stay hidden at opacity: 0. Respects `prefers-reduced-motion`.
 */
export function useScrollReveal(routeKey: string): void {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const prefersReduced =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const revealImmediately = (el: Element) => {
      el.classList.add('aos-reveal-visible');
    };

    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      document.querySelectorAll('.aos-reveal').forEach(revealImmediately);
      return;
    }

    document.documentElement.classList.add('aos-reveal-ready');

    const observed = new WeakSet<Element>();

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
        rootMargin: '120px 0px 120px 0px',
        threshold: 0.01,
      }
    );

    const registerElement = (el: Element) => {
      if (el.classList.contains('aos-reveal-visible') || observed.has(el)) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 120) {
        el.classList.add('aos-reveal-visible');
      } else {
        observed.add(el);
        observer.observe(el);
      }
    };

    const scanAll = () => {
      document.querySelectorAll('.aos-reveal:not(.aos-reveal-visible)').forEach(registerElement);
    };

    scanAll();

    // Observe dynamically mounted / lazy-loaded sections (e.g., React.lazy / Suspense)
    let mutationObserver: MutationObserver | null = null;
    if (typeof MutationObserver !== 'undefined' && document.body) {
      mutationObserver = new MutationObserver(() => {
        scanAll();
      });
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    // Passive scroll check fallback for tall mobile containers
    const handleScrollCheck = () => {
      document.querySelectorAll('.aos-reveal:not(.aos-reveal-visible)').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight + 120) {
          el.classList.add('aos-reveal-visible');
          observer.unobserve(el);
        }
      });
    };

    window.addEventListener('scroll', handleScrollCheck, { passive: true });
    const safetyTimer = window.setTimeout(handleScrollCheck, 600);

    return () => {
      observer.disconnect();
      mutationObserver?.disconnect();
      window.removeEventListener('scroll', handleScrollCheck);
      window.clearTimeout(safetyTimer);
    };
  }, [routeKey]);
}
