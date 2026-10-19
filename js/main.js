(function () {
  let lenis = null;
  const reduceMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.classList.contains("no-motion");

  if (window.Lenis && !reduceMotion) {
    lenis = new Lenis({ duration: 1.2, smoothWheel: true });

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  const menu = document.getElementById("site-menu");
  const openButtons = document.querySelectorAll(".js-menu-open");
  const closeButtons = menu.querySelectorAll(".js-menu-close");
  const menuSheet = menu.querySelector(".menu__sheet");

  menuSheet.addEventListener("transitionend", (event) => {
    if (event.target === menuSheet && event.propertyName === "clip-path") {
      menu.classList.remove("is-closing");
    }
  });

  const setOpen = (isOpen) => {
    if (isOpen === menu.classList.contains("is-open")) return;

    menu.classList.toggle("is-open", isOpen);
    menu.classList.toggle("is-closing", !isOpen);
    menu.setAttribute("aria-hidden", String(!isOpen));
    document.body.classList.toggle("is-menu-open", isOpen);
    openButtons.forEach((button) => button.setAttribute("aria-expanded", String(isOpen)));

    if (lenis) {
      isOpen ? lenis.stop() : lenis.start();
    }

    if (isOpen) {
      menu.querySelector(".menu__close").focus({ preventScroll: true });
    } else {
      openButtons[0].focus({ preventScroll: true });
    }
  };

  openButtons.forEach((button) => button.addEventListener("click", () => setOpen(true)));
  closeButtons.forEach((button) => button.addEventListener("click", () => setOpen(false)));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("is-open")) {
      setOpen(false);
    }
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

  document.addEventListener("animationend", (event) => {
    if (event.animationName === "fade-in-up") {
      event.target.classList.add("is-shown");
    }
  });

  document.querySelectorAll(".skin-card").forEach((card) => {
    const toggle = card.querySelector(".skin-card__toggle");

    card.addEventListener("click", () => {
      const isOpen = card.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  });

  const leaves = [...document.querySelectorAll(".leaf")].map((element) => ({
    element,
    section: element.closest("section"),
    depth: parseFloat(element.style.getPropertyValue("--depth")) || 1,
    scroll: 0,
  }));

  if (leaves.length && !reduceMotion) {
    const pointer = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };

    window.addEventListener("mousemove", (event) => {
      pointer.x = event.clientX / window.innerWidth - 0.5;
      pointer.y = event.clientY / window.innerHeight - 0.5;
    });

    const animateLeaves = () => {
      current.x += (pointer.x - current.x) * 0.06;
      current.y += (pointer.y - current.y) * 0.06;

      leaves.forEach((leaf) => {
        const rect = leaf.section.getBoundingClientRect();
        const scroll = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
        leaf.scroll += (scroll - leaf.scroll) * 0.1;

        const { depth } = leaf;
        const x = current.x * 60 * depth;
        const y = current.y * 60 * depth + leaf.scroll * 120 * depth;
        leaf.element.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${current.x * 10 * depth}deg)`;
      });

      requestAnimationFrame(animateLeaves);
    };
    requestAnimationFrame(animateLeaves);
  }
})();
