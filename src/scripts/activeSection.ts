const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-nav]"));
const sections = Array.from(document.querySelectorAll<HTMLElement>("section[id]"));

const setActive = (id: string | null) => {
  navLinks.forEach((link) => {
    const isActive = id && link.getAttribute("href") === `#${id}`;
    if (isActive) {
      link.dataset.active = "true";
    } else {
      delete link.dataset.active;
    }
  });
};

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActive(entry.target.id);
      }
    });
  },
  {
    rootMargin: "-35% 0px -55% 0px",
    threshold: 0.1,
  }
);

sections.forEach((section) => observer.observe(section));

const initialTarget = window.location.hash.replace("#", "");
if (initialTarget) {
  setActive(initialTarget);
} else if (sections[0]) {
  setActive(sections[0].id);
}
