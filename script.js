// Scroll reveal, parallax, and interactive behavior for 80k Twins site

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

function setupSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');

  if (!links.length) return;

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;
      event.preventDefault();
      targetEl.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      if (history.replaceState) {
        history.replaceState(null, "", targetId);
      }
    });
  });
}

function setupNavHighlight() {
  const navLinks = document.querySelectorAll(".site-nav .nav-link");
  const sections = document.querySelectorAll("main section[id]");

  if (!navLinks.length || !sections.length || !("IntersectionObserver" in window)) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) => {
            const href = link.getAttribute("href");
            link.classList.toggle("nav-link--active", href === `#${id}`);
          });
        }
      });
    },
    {
      threshold: 0.4,
    }
  );

  sections.forEach((section) => observer.observe(section));
}

function setupLinkFilters() {
  const container = document.querySelector(".links");
  if (!container) return;

  const filterButtons = container.querySelectorAll("[data-filter]");
  const cards = container.querySelectorAll(".link-card");

  if (!filterButtons.length || !cards.length) return;

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter || "all";

      filterButtons.forEach((button) => {
        button.classList.toggle("is-active", button === btn);
      });

      cards.forEach((card) => {
        const groups = (card.dataset.groups || "").split(" ");
        const shouldShow = filter === "all" || groups.includes(filter);
        card.classList.toggle("is-hidden", !shouldShow);
      });
    });
  });
}

function setupHeroTilt() {
  const hero = document.querySelector(".hero-main");
  const avatarWrap = document.querySelector(".hero-avatar-wrap");

  if (!hero || !avatarWrap) return;

  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    const rotateX = y * -8;
    const rotateY = x * 8;
    avatarWrap.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
  });

  hero.addEventListener("pointerleave", () => {
    avatarWrap.style.transform = "";
  });
}

function setupContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const statusEl = document.getElementById("contact-status");
  const errorEls = {
    name: form.querySelector('[data-error-for="name"]'),
    email: form.querySelector('[data-error-for="email"]'),
    message: form.querySelector('[data-error-for="message"]'),
  };

  function setStatus(message, isError = false) {
    if (!statusEl) return;
    statusEl.textContent = message || "";
    statusEl.style.color = isError ? "#fecaca" : "";
  }

  function clearErrors() {
    Object.values(errorEls).forEach((el) => {
      if (el) el.textContent = "";
    });
    setStatus("");
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearErrors();

    const formData = new FormData(form);
    const name = (formData.get("name") || "").toString().trim();
    const email = (formData.get("email") || "").toString().trim();
    const message = (formData.get("message") || "").toString().trim();

    let hasError = false;

    if (!name && errorEls.name) {
      errorEls.name.textContent = "Please add your name.";
      hasError = true;
    }

    if (!email && errorEls.email) {
      errorEls.email.textContent = "Email is required.";
      hasError = true;
    } else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (errorEls.email) errorEls.email.textContent = "Enter a valid email.";
      hasError = true;
    }

    if (!message && errorEls.message) {
      errorEls.message.textContent = "Tell us a bit about what you need.";
      hasError = true;
    }

    if (hasError) {
      setStatus("Please fix the highlighted fields.", true);
      return;
    }

    setStatus("Sending message...");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, message }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setStatus("Message sent! We’ll be in touch soon.");
      form.reset();
    } catch (error) {
      console.error(error);
      setStatus("Something went wrong sending your message. Try again or email us directly.", true);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupReveal();
  setupParallax();
  setupSmoothScroll();
  setupNavHighlight();
  setupLinkFilters();
  setupHeroTilt();
  setupContactForm();
});


