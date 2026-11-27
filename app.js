const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".main-nav");

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Abrir menu" : "Fechar menu");
  navigation?.classList.toggle("is-open", !isOpen);
});

navigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuButton?.setAttribute("aria-expanded", "false");
    menuButton?.setAttribute("aria-label", "Abrir menu");
    navigation.classList.remove("is-open");
  });
});

const revealElements = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });
  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const photoCarousel = document.querySelector(".carousel");
const carouselDots = document.querySelector(".carousel-dots");
const previousPhoto = document.querySelector(".carousel-prev");
const nextPhoto = document.querySelector(".carousel-next");

if (photoCarousel && carouselDots) {
  const photos = [...photoCarousel.querySelectorAll(":scope > .card")];
  const dots = photos.map((photo, index) => {
    const dot = document.createElement("span");
    dot.setAttribute("aria-hidden", "true");
    dot.setAttribute("aria-current", index === 0 ? "true" : "false");
    carouselDots.append(dot);
    return dot;
  });

  const getCurrentPhotoIndex = () => {
    const carouselCenter = photoCarousel.getBoundingClientRect().left + photoCarousel.clientWidth / 2;
    return photos.reduce((nearestIndex, photo, index) => {
      const rect = photo.getBoundingClientRect();
      const nearestRect = photos[nearestIndex].getBoundingClientRect();
      return Math.abs(rect.left + rect.width / 2 - carouselCenter) <
        Math.abs(nearestRect.left + nearestRect.width / 2 - carouselCenter)
        ? index
        : nearestIndex;
    }, 0);
  };

  const moveCarousel = (direction) => {
    const maxScroll = photoCarousel.scrollWidth - photoCarousel.clientWidth;
    const atStart = photoCarousel.scrollLeft <= 2;
    const atEnd = photoCarousel.scrollLeft >= maxScroll - 2;

    if (direction < 0 && atStart) {
      photoCarousel.scrollTo({ left: maxScroll, behavior: "smooth" });
      return;
    }
    if (direction > 0 && atEnd) {
      photoCarousel.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }

    const firstCard = photos[0];
    const gap = Number.parseFloat(getComputedStyle(photoCarousel).columnGap) || 0;
    photoCarousel.scrollBy({
      left: direction * (firstCard.getBoundingClientRect().width + gap),
      behavior: "smooth",
    });
  };

  previousPhoto?.addEventListener("click", () => moveCarousel(-1));
  nextPhoto?.addEventListener("click", () => moveCarousel(1));

  const updateEdgeButtons = () => {
    const maxScroll = Math.max(0, photoCarousel.scrollWidth - photoCarousel.clientWidth);
    const atStart = photoCarousel.scrollLeft <= 2;
    const atEnd = photoCarousel.scrollLeft >= maxScroll - 2;
    previousPhoto?.classList.toggle("is-edge", atStart);
    nextPhoto?.classList.toggle("is-edge", atEnd);
  };

  const updateCurrentDot = () => {
    const nearestIndex = getCurrentPhotoIndex();
    dots.forEach((dot, index) => dot.setAttribute("aria-current", String(index === nearestIndex)));
  };

  photoCarousel.addEventListener("scroll", () => {
    updateCurrentDot();
    updateEdgeButtons();
  }, { passive: true });
  photoCarousel.addEventListener("wheel", (event) => {
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.preventDefault();
      photoCarousel.scrollLeft += event.deltaY;
    }
  }, { passive: false });
  updateCurrentDot();
  updateEdgeButtons();
}
