const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function initNavMenu() {
  const navInner = document.querySelector(".nav__inner");
  const toggle = document.querySelector(".nav__toggle");
  const links = document.querySelectorAll(".nav__links .nav__link");

  if (!navInner || !toggle || !links.length) {
    return;
  }

  const responsiveNav = window.matchMedia("(max-width: 1260px)");

  const closeMenu = () => {
    navInner.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Открыть меню");
  };

  const openMenu = () => {
    navInner.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Закрыть меню");
  };

  toggle.addEventListener("click", () => {
    if (navInner.classList.contains("is-open")) {
      closeMenu();
      return;
    }

    openMenu();
  });

  links.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    if (!responsiveNav.matches) {
      return;
    }

    if (!navInner.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  const handleViewportChange = (event) => {
    if (!event.matches) {
      closeMenu();
    }
  };

  if (typeof responsiveNav.addEventListener === "function") {
    responsiveNav.addEventListener("change", handleViewportChange);
  } else {
    responsiveNav.addListener(handleViewportChange);
  }
}

function initFloatingDeck() {
  const deck = document.querySelector(".js-float-deck");
  if (!deck || !window.gsap) {
    return;
  }

  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!canHover || prefersReducedMotion) {
    return;
  }

  const cards = Array.from(deck.querySelectorAll("[data-float-card]"));
  const baseStates = cards.map((card) => ({
    rotation: Number(card.dataset.baseRotation || 0),
    y: Number(card.dataset.baseY || 0),
  }));

  let activeIndex = -1;

  cards.forEach((card, index) => {
    gsap.set(card, {
      rotation: baseStates[index].rotation,
      y: baseStates[index].y,
      xPercent: 0,
      scale: 1,
    });
  });

  const resetCard = (index) => {
    const state = baseStates[index];
    gsap.to(cards[index], {
      xPercent: 0,
      y: state.y,
      rotation: state.rotation,
      scale: 1,
      duration: 0.82,
      ease: "elastic.out(1, 0.75)",
    });
  };

  const activateCard = (index) => {
    cards.forEach((card, cardIndex) => {
      if (cardIndex === index) {
        gsap.to(card, {
          xPercent: 0,
          y: 0,
          rotation: 0,
          scale: 1.08,
          duration: 0.82,
          ease: "elastic.out(1, 0.75)",
        });
        return;
      }

      const distance = cardIndex - index;
      gsap.to(card, {
        xPercent: 22 / distance,
        y: baseStates[cardIndex].y,
        rotation: baseStates[cardIndex].rotation,
        scale: 1,
        duration: 0.82,
        ease: "elastic.out(1, 0.75)",
      });
    });
  };

  deck.addEventListener("mousemove", (event) => {
    const rect = deck.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const portion = Math.min(
      cards.length - 1,
      Math.max(0, Math.ceil((mouseX / rect.width) * cards.length) - 1),
    );

    if (portion !== activeIndex) {
      activeIndex = portion;
      activateCard(portion);
    }
  });

  deck.addEventListener("mouseleave", () => {
    cards.forEach((_, index) => resetCard(index));
    activeIndex = -1;
  });
}

function initFeatureScroll() {
  if (!window.gsap || !window.ScrollTrigger || prefersReducedMotion) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const media = gsap.matchMedia();
  media.add("(min-width: 961px)", () => {
    const slides = gsap.utils.toArray("[data-feature-slide]");
    if (!slides.length) {
      return;
    }

    document.body.classList.add("has-feature-scroll");

    slides.forEach((slide, index) => {
      const sticky = slide.querySelector(".feature-slide__sticky");
      const card = slide.querySelector(".feature");
      const visualCards = card ? card.querySelectorAll(".feature__card") : [];
      const isLast = index === slides.length - 1;
      const tilt = index % 2 === 0 ? -6 : 6;

      if (!sticky || !card) {
        return;
      }

      if (!isLast) {
        gsap.to(card, {
          rotateZ: tilt,
          rotationX: 26,
          yPercent: -8,
          scale: 0.74,
          ease: "power1.in",
          scrollTrigger: {
            trigger: slide,
            pin: sticky,
            start: "top top+=96",
            end: () => `+=${window.innerHeight * 0.96}`,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        gsap.to(card, {
          autoAlpha: 0,
          ease: "power1.inOut",
          scrollTrigger: {
            trigger: slide,
            start: () => `top+=${window.innerHeight * 0.72} top+=96`,
            end: () => `top+=${window.innerHeight * 0.98} top+=96`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      } else {
        gsap.fromTo(card, {
          yPercent: 6,
          scale: 0.96,
        }, {
          yPercent: 0,
          scale: 1,
          ease: "power1.out",
          scrollTrigger: {
            trigger: slide,
            start: "top top+=96",
            end: () => `+=${window.innerHeight * 0.5}`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        ScrollTrigger.create({
          trigger: slide,
          pin: sticky,
          start: "top top+=96",
          end: () => `+=${window.innerHeight * 0.7}`,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        });
      }

      visualCards.forEach((visualCard, visualIndex) => {
        gsap.fromTo(
          visualCard,
          {
            yPercent: visualIndex * 4,
          },
          {
            yPercent: visualIndex * -7,
            ease: "none",
            scrollTrigger: {
              trigger: slide,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });
    });

    ScrollTrigger.refresh();

    return () => {
      document.body.classList.remove("has-feature-scroll");
    };
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initNavMenu();
  initFloatingDeck();
  initFeatureScroll();
});
