const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const sections = Array.from(
  document.querySelectorAll<HTMLElement>(".section-reveal")
);

if (prefersReducedMotion) {
  sections.forEach((section) => section.classList.add("is-visible"));
} else {
  const sectionObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));
}
