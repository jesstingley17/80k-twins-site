// Scroll reveal, parallax, and interactive behavior for 80k Twins site

// Mark JS as enabled for progressive enhancement
document.documentElement.classList.add('js-enabled');

function setupReveal() {
  const revealEls = document.querySelectorAll("[data-reveal]");

  if (!("IntersectionObserver" in window) || revealEls.length === 0) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  // Show elements immediately if they're already in view
  revealEls.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (isVisible) {
      el.classList.add("is-visible");
    }
  });

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
      threshold: 0.1,
      rootMargin: "50px",
    }
  );

  revealEls.forEach((el) => {
    if (!el.classList.contains("is-visible")) {
      observer.observe(el);
    }
  });
}

function setupParallax() {
  // Disabled - parallax can cause motion sickness
  // Keeping orbits static for better accessibility
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

  let rafId = null;
  let lastUpdate = 0;

  hero.addEventListener("pointermove", (event) => {
    const now = performance.now();
    // Throttle to 60fps max
    if (now - lastUpdate < 16) return;
    lastUpdate = now;

    if (rafId) cancelAnimationFrame(rafId);
    
    rafId = requestAnimationFrame(() => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      // Reduced from 8deg to 3deg for less motion
      const rotateX = y * -3;
      const rotateY = x * 3;
      avatarWrap.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
    });
  });

  hero.addEventListener("pointerleave", () => {
    if (rafId) cancelAnimationFrame(rafId);
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

// Cursor trail effect - disabled to prevent dizziness
function setupCursorTrail() {
  // Disabled - can cause motion sickness
}

// Floating particles - reduced and slowed for accessibility
function setupFloatingParticles() {
  const container = document.querySelector(".page-bg");
  if (!container) return;

  const particleCount = 6; // Reduced for performance
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "floating-particle";
    const size = Math.random() * 3 + 2;
    particle.style.width = size + "px";
    particle.style.height = size + "px";
    particle.style.left = Math.random() * 100 + "%";
    particle.style.top = Math.random() * 100 + "%";
    particle.style.animationDelay = Math.random() * 20 + "s";
    particle.style.opacity = Math.random() * 0.3 + 0.1; // More subtle
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

// Interactive card tilt - disabled to prevent glitches
function setupCardTilts() {
  // Disabled - was causing conflicts with other animations
}

// Animated gradient background - disabled to prevent dizziness
function setupAnimatedGradient() {
  // Disabled - static gradient is less disorienting
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

// Removed glitch effect - was causing visual issues

// Magnetic buttons - disabled to prevent glitches
function setupMagneticButtons() {
  // Disabled - was causing transform conflicts
}

// Confetti effect
function createConfetti() {
  const colors = ['#38bdf8', '#a855f7', '#ec4899', '#22c55e', '#f59e0b', '#ef4444'];
  const confettiCount = 50;
  const duration = 3000;
  
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 8 + 4;
    const startX = Math.random() * window.innerWidth;
    const startY = -10;
    const endY = window.innerHeight + 10;
    const rotation = Math.random() * 360;
    const rotationSpeed = (Math.random() - 0.5) * 720;
    const horizontalSpeed = (Math.random() - 0.5) * 200;
    
    confetti.style.cssText = `
      position: fixed;
      left: ${startX}px;
      top: ${startY}px;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      pointer-events: none;
      z-index: 10000;
      opacity: 0.9;
      box-shadow: 0 0 6px ${color};
    `;
    
    document.body.appendChild(confetti);
    
    const animation = confetti.animate([
      {
        transform: `translate(0, 0) rotate(0deg)`,
        opacity: 0.9
      },
      {
        transform: `translate(${horizontalSpeed}px, ${endY}px) rotate(${rotation + rotationSpeed}deg)`,
        opacity: 0
      }
    ], {
      duration: duration + Math.random() * 1000,
      easing: 'cubic-bezier(0.5, 0, 0.5, 1)'
    });
    
    animation.onfinish = () => {
      confetti.remove();
    };
  }
}

// Add confetti to social media buttons
function setupConfettiButtons() {
  // Find all social media follow buttons
  const socialButtons = document.querySelectorAll('a[href*="tiktok"], a[href*="instagram"], a[href*="youtube"], a[href*="facebook"], a[href*="twitter"], a[href*="snapchat"]');
  
  socialButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      // Small delay to ensure navigation happens
      setTimeout(() => {
        createConfetti();
      }, 100);
    });
  });
  
  // Also add to primary CTA buttons
  const primaryButtons = document.querySelectorAll('.btn--primary, .link-card--primary');
  primaryButtons.forEach((button) => {
    button.addEventListener('click', () => {
      createConfetti();
    });
  });
}

// Prioritize critical functionality
document.addEventListener("DOMContentLoaded", () => {
  // Critical - load immediately
  setupReveal();
  setupSmoothScroll();
  setupNavHighlight();
  setupLinkFilters();
  setupContactForm();
  setupIntroVideo();
  setupButtonRipples();
  setupConfettiButtons();
  
  // Load other features after a short delay
  setTimeout(() => {
    setupParallax();
    setupHeroTilt();
    setupCardTilts();
    setupAnimatedGradient();
    setupEasterEgg();
    setupMagneticButtons();
    setupCursorTrail();
    setupFloatingParticles();
  }, 100);
});


