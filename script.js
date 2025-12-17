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

function setupIntroVideo() {
  const overlay = document.getElementById("intro-overlay");
  const video = document.getElementById("intro-video");

  if (!overlay || !video) return;

  // Hide overlay when video ends
  video.addEventListener("ended", () => {
    overlay.classList.add("is-hidden");
    // Allow page interactions after intro
    setTimeout(() => {
      overlay.style.display = "none";
    }, 600);
  });

  // Skip intro on click/tap
  overlay.addEventListener("click", () => {
    video.pause();
    overlay.classList.add("is-hidden");
    setTimeout(() => {
      overlay.style.display = "none";
    }, 600);
  });

  // Fallback: hide after 5 seconds if video doesn't load/play
  setTimeout(() => {
    if (!overlay.classList.contains("is-hidden")) {
      overlay.classList.add("is-hidden");
      setTimeout(() => {
        overlay.style.display = "none";
      }, 600);
    }
  }, 5000);
}

// Cursor trail effect
function setupCursorTrail() {
  const trail = [];
  const trailLength = 20;
  let mouseX = 0;
  let mouseY = 0;

  // Create trail elements
  for (let i = 0; i < trailLength; i++) {
    const dot = document.createElement("div");
    dot.className = "cursor-trail-dot";
    dot.style.opacity = (trailLength - i) / trailLength * 0.4;
    dot.style.transform = `scale(${(trailLength - i) / trailLength * 0.3})`;
    document.body.appendChild(dot);
    trail.push({ element: dot, x: 0, y: 0 });
  }

  let animationFrame = null;

  function animate() {
    let x = mouseX;
    let y = mouseY;

    trail.forEach((point, index) => {
      const nextPoint = trail[index + 1] || { x, y };
      point.x += (nextPoint.x - point.x) * 0.3;
      point.y += (nextPoint.y - point.y) * 0.3;
      point.element.style.left = point.x + "px";
      point.element.style.top = point.y + "px";
    });

    animationFrame = requestAnimationFrame(animate);
  }

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!animationFrame) animate();
  });
}

// Floating particles
function setupFloatingParticles() {
  const container = document.querySelector(".page-bg");
  if (!container) return;

  const particleCount = 30;
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "floating-particle";
    const size = Math.random() * 4 + 2;
    particle.style.width = size + "px";
    particle.style.height = size + "px";
    particle.style.left = Math.random() * 100 + "%";
    particle.style.top = Math.random() * 100 + "%";
    particle.style.animationDelay = Math.random() * 20 + "s";
    particle.style.opacity = Math.random() * 0.5 + 0.2;
    container.appendChild(particle);
    particles.push(particle);
  }
}

// Button ripple effect
function setupButtonRipples() {
  const buttons = document.querySelectorAll(".btn, .link-card, .filter-pill");
  
  buttons.forEach((button) => {
    button.addEventListener("click", function(e) {
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = x + "px";
      ripple.style.top = y + "px";
      
      this.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
}

// Interactive card tilt on all cards
function setupCardTilts() {
  const cards = document.querySelectorAll(".link-card, .watch-card, .about-inner, .contact-inner, .feature-inner");
  
  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      
      const rotateX = y * -3;
      const rotateY = x * 3;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });
    
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

// Animated gradient background
function setupAnimatedGradient() {
  const gradient = document.querySelector(".bg-gradient");
  if (!gradient) return;
  
  let hue = 0;
  
  function animate() {
    hue = (hue + 0.5) % 360;
    const hue1 = hue;
    const hue2 = (hue + 60) % 360;
    const hue3 = (hue + 120) % 360;
    
    gradient.style.background = `
      radial-gradient(circle at top left, hsla(${hue1}, 70%, 60%, 0.3), transparent 55%),
      radial-gradient(circle at bottom right, hsla(${hue2}, 70%, 60%, 0.25), transparent 55%),
      radial-gradient(circle at top right, hsla(${hue3}, 70%, 60%, 0.18), transparent 50%)
    `;
    
    requestAnimationFrame(animate);
  }
  
  animate();
}

// Easter egg: Konami code
function setupEasterEgg() {
  const konamiCode = [
    "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
    "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
    "KeyB", "KeyA"
  ];
  let konamiIndex = 0;
  
  document.addEventListener("keydown", (e) => {
    if (e.code === konamiCode[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiCode.length) {
        // Trigger fun effect
        document.body.classList.add("easter-egg-active");
        setTimeout(() => {
          document.body.classList.remove("easter-egg-active");
        }, 3000);
        konamiIndex = 0;
      }
    } else {
      konamiIndex = 0;
    }
  });
}

// Glitch effect on hover for hero
function setupGlitchEffect() {
  const heroTitle = document.querySelector(".hero-title");
  if (!heroTitle) return;
  
  heroTitle.addEventListener("mouseenter", () => {
    heroTitle.classList.add("glitch");
    setTimeout(() => {
      heroTitle.classList.remove("glitch");
    }, 600);
  });
}

// Magnetic buttons (only for buttons, not cards)
function setupMagneticButtons() {
  const magneticElements = document.querySelectorAll(".btn, .filter-pill");
  
  magneticElements.forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      
      const moveX = x * 0.15;
      const moveY = y * 0.15;
      
      el.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
    
    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupIntroVideo();
  setupReveal();
  setupParallax();
  setupSmoothScroll();
  setupNavHighlight();
  setupLinkFilters();
  setupHeroTilt();
  setupContactForm();
  setupCursorTrail();
  setupFloatingParticles();
  setupButtonRipples();
  setupCardTilts();
  setupAnimatedGradient();
  setupEasterEgg();
  setupGlitchEffect();
  setupMagneticButtons();
});


