(() => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const getScrollOffset = () => {
    const offsetTargets = Array.from(
      document.querySelectorAll("[data-scroll-offset]")
    );
    return offsetTargets.reduce((height, el) => {
      const styles = window.getComputedStyle(el);
      if (styles.display === "none") {
        return height;
      }
      return Math.max(height, el.getBoundingClientRect().height);
    }, 0);
  };

  const smoothScrollTo = (targetY, onDone) => {
    if (prefersReducedMotion) {
      window.scrollTo(0, targetY);
      if (onDone) {
        onDone();
      }
      return;
    }

    const startY = window.scrollY;
    const distance = targetY - startY;
    const duration = clamp(Math.abs(distance) * 0.6, 420, 820);
    let startTime = 0;

    const step = (timestamp) => {
      if (!startTime) {
        startTime = timestamp;
      }
      const elapsed = timestamp - startTime;
      const progress = clamp(elapsed / duration, 0, 1);
      const eased = easeOutCubic(progress);
      window.scrollTo(0, startY + distance * eased);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else if (onDone) {
        onDone();
      }
    };

    window.requestAnimationFrame(step);
  };

  const setupSmoothScroll = () => {
    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      const link = target.closest('a[href^="#"]');
      if (!link) {
        return;
      }

      const href = link.getAttribute("href");
      if (!href || href === "#") {
        return;
      }

      const destination = document.querySelector(href);
      if (!destination) {
        return;
      }

      event.preventDefault();

      const scrollOffset = getScrollOffset();
      const targetY =
        destination.getBoundingClientRect().top + window.scrollY - scrollOffset;

      const overlay = document.querySelector("[data-motion-overlay]");
      if (overlay && !prefersReducedMotion) {
        overlay.classList.add("is-active");
        window.setTimeout(() => overlay.classList.remove("is-active"), 220);
      }

      const details = link.closest("details");
      if (details) {
        details.open = false;
      }

      smoothScrollTo(targetY, () => {
        history.pushState(null, "", href);
        destination.focus({ preventScroll: true });
      });
    });
  };

  const setupReveal = () => {
    console.log("MOTION LOADED");
    const items = Array.from(document.querySelectorAll(".reveal"));
    console.log("FOUND REVEALS:", items.length);
    if (!items.length) {
      return;
    }

    document.documentElement.classList.add("motion-ready");

    if (prefersReducedMotion) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -10% 0px" }
    );

    items.forEach((item) => observer.observe(item));
  };

  const setupScrollEffects = () => {
    const progress = document.querySelector("[data-scroll-progress]");
    const navShells = Array.from(
      document.querySelectorAll("[data-nav-shell]")
    );
    const navGroups = Array.from(
      document.querySelectorAll("[data-nav-group]")
    );
    const sections = Array.from(document.querySelectorAll("[data-section]"));
    const parallaxItems = Array.from(
      document.querySelectorAll("[data-parallax]")
    );

    let ticking = false;

    const updateNavActive = () => {
      if (!sections.length) {
        return;
      }
      const scrollOffset = getScrollOffset();
      const scrollPosition = window.scrollY + scrollOffset + 120;
      let activeSection = sections[0];

      sections.forEach((section) => {
        const top = section.offsetTop;
        if (scrollPosition >= top) {
          activeSection = section;
        }
      });

      const activeId = activeSection.id;
      const links = Array.from(document.querySelectorAll("[data-nav]"));
      links.forEach((link) => {
        const href = link.getAttribute("href");
        link.setAttribute("data-active", href === `#${activeId}` ? "true" : "false");
      });

      navGroups.forEach((group) => {
        const indicator = group.querySelector("[data-nav-indicator]");
        const activeLink = group.querySelector(`[data-nav][href="#${activeId}"]`);
        if (!indicator) {
          return;
        }
        if (!activeLink) {
          indicator.classList.remove("is-visible");
          return;
        }

        const navRect = group.getBoundingClientRect();
        const linkRect = activeLink.getBoundingClientRect();
        const left = linkRect.left - navRect.left;
        const top = linkRect.bottom - navRect.top + 4;
        indicator.style.width = `${linkRect.width}px`;
        indicator.style.transform = `translate3d(${left}px, ${top}px, 0)`;
        indicator.classList.add("is-visible");
      });
    };

    const updateScrollState = () => {
      const scrollTop = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progressValue = maxScroll > 0 ? scrollTop / maxScroll : 0;
      if (progress) {
        progress.style.transform = `scaleX(${progressValue})`;
      }

      navShells.forEach((shell) => {
        shell.classList.toggle("is-scrolled", scrollTop > 12);
      });

      if (!prefersReducedMotion && parallaxItems.length) {
        parallaxItems.forEach((item) => {
          const depth = parseFloat(item.dataset.parallax || "10");
          const elementTop = item.getBoundingClientRect().top + window.scrollY;
          const delta = (scrollTop - elementTop) * 0.04;
          const offset = clamp(delta, -depth, depth);
          item.style.transform = `translate3d(0, ${offset}px, 0)`;
        });
      }

      updateNavActive();
      ticking = false;
    };

    const requestUpdate = () => {
      if (ticking) {
        return;
      }
      ticking = true;
      window.requestAnimationFrame(updateScrollState);
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    document.querySelectorAll("details").forEach((details) => {
      details.addEventListener("toggle", requestUpdate);
    });
    requestUpdate();
  };

  setupSmoothScroll();
  setupReveal();
  setupScrollEffects();
})();
