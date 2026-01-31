document.documentElement.classList.add("reveal-ready");

const revealItems = Array.from(
  document.querySelectorAll<HTMLElement>("[data-reveal]")
);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      } else {
        entry.target.classList.remove("is-visible");
      }
    });
  },
  {
    threshold: 0.25,
  }
);

revealItems.forEach((item) => revealObserver.observe(item));

export {};
