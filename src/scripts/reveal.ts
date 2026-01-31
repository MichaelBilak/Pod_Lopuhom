const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const revealItems = Array.from(
  document.querySelectorAll<HTMLElement>(".reveal")
);

if (revealItems.length === 0) {
  console.warn("[reveal] No elements found with .reveal");
}

if (prefersReducedMotion) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
    }
  );

  revealItems.forEach((item) => observer.observe(item));
}

export {};
