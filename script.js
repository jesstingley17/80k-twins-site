// Simple scroll reveal + subtle parallax

function setupReveal() {
  const revealEls = document.querySelectorAll("[data-reveal]");

  if (!("IntersectionObserver" in window) || revealEls.length === 0) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
    }
  );

  revealEls.forEach((el) => observer.observe(el));
}

function setupParallax() {
  const orbits = document.querySelectorAll(".bg-orbit");

  if (!orbits.length) return;

  window.addEventListener("pointermove", (event) => {
    const { innerWidth, innerHeight } = window;
    const xNorm = (event.clientX / innerWidth - 0.5) * 2;
    const yNorm = (event.clientY / innerHeight - 0.5) * 2;

    orbits.forEach((orbit, index) => {
      const intensity = (index + 1) * 4;
      const xOffset = -xNorm * intensity;
      const yOffset = -yNorm * intensity;
      orbit.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupReveal();
  setupParallax();
});


