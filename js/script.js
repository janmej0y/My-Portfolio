// Page Loading
window.addEventListener("load", () => { document.getElementById("loading").style.display = "none"; });

const faders = document.querySelectorAll(".fade-in");
const appearOptions = { threshold: 0.1 };
const appearOnScroll = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("show");
    observer.unobserve(entry.target);
  });
}, appearOptions);

faders.forEach(fader => { appearOnScroll.observe(fader); });

particlesJS("particles-js", {
  particles: { number: { value: 80 }, size: { value: 3 }, move: { speed: 2 }, line_linked: { enable: true } }
});

// Resume Modal
const resumeBtn = document.querySelector(".btn[href='assets/resume.pdf']");
const modal = document.getElementById("resumeModal");
const closeModal = document.querySelector(".close");

if (resumeBtn) {
  resumeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    modal.style.display = "flex";
  });
}
if (closeModal) {
  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });
}
window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});


// Dark/Light Mode Toggle
const toggleBtn = document.getElementById("toggle-btn");
const body = document.body;

// Load saved mode
if (localStorage.getItem("theme") === "light") {
  body.classList.add("light-mode");
  toggleBtn.textContent = "☀️";
} else {
  body.classList.add("dark-mode");
  toggleBtn.textContent = "🌙";
}

toggleBtn.addEventListener("click", () => {
  if (body.classList.contains("dark-mode")) {
    body.classList.replace("dark-mode", "light-mode");
    toggleBtn.textContent = "☀️";
    localStorage.setItem("theme", "light");
  } else {
    body.classList.replace("light-mode", "dark-mode");
    toggleBtn.textContent = "🌙";
    localStorage.setItem("theme", "dark");
  }
});
// Scroll Progress Bar
window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = (scrollTop / docHeight) * 100;
  document.getElementById("progress-bar").style.width = scrollPercent + "%";
});
// Reveal sections on scroll
const sections = document.querySelectorAll("section");
const revealOnScroll = () => {
  sections.forEach(sec => {
    const rect = sec.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      sec.classList.add("show");
    }
  });
};
window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);
// EmailJS Contact Form
const form = document.getElementById("contact-form");
const status = document.getElementById("form-status");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  status.textContent = "Sending message... ⏳";

  emailjs.sendForm("service_l8nf8bg", "template_p4a3691", form)
    .then(() => {
      status.textContent = "✅ Message sent successfully!";
      status.style.color = "#4ade80";
      form.reset();
    })
    .catch((err) => {
      console.error("EmailJS Error:", err);
      status.textContent = "❌ Failed to send message. Try again.";
      status.style.color = "#f87171";
    });
});

// Visitor Counter using countapi
fetch("https://api.countapi.xyz/hit/janmejoy-portfolio/visits")
  .then(res => res.json())
  .then(data => {
    document.getElementById("visitor-count").textContent = "Visitors: " + data.value;
  });
  
  /* =========================
   SCROLL REVEAL ANIMATION
=========================== */
const fadeEls = document.querySelectorAll('.fade-in, .fade-left, .fade-right');

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Animate once
      }
    });
  },
  {
    threshold: 0.2, // Trigger when 20% visible
  }
);

fadeEls.forEach(el => observer.observe(el));

const menuBtn = document.getElementById("menu-btn");
const mobileMenu = document.getElementById("mobile-menu");

menuBtn.addEventListener("click", () => {
  mobileMenu.classList.toggle("hidden");
});

const navLinks = document.querySelectorAll(".nav-link");

window.addEventListener("scroll", () => {
  let fromTop = window.scrollY + 150;

  navLinks.forEach(link => {
    const section = document.querySelector(link.getAttribute("href"));

    if (
      section.offsetTop <= fromTop &&
      section.offsetTop + section.offsetHeight > fromTop
    ) {
      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
    }
  });
});

navLinks.forEach(link => {
  link.addEventListener("click", () => {
    mobileMenu.classList.add("hidden");
  });
});
// navbar background change on scroll
/* Floating nav indicator */
const indicator = document.getElementById("indicator");
const navContainer = document.getElementById("nav-links");

function moveIndicator(activeLink) {
  const rect = activeLink.getBoundingClientRect();
  const parentRect = navContainer.getBoundingClientRect();

  indicator.style.width = rect.width + "px";
  indicator.style.left = rect.left - parentRect.left + "px";
}

navLinks.forEach(link => {
  link.addEventListener("mouseenter", () => moveIndicator(link));
});

navContainer.addEventListener("mouseleave", () => {
  const activeLink = document.querySelector(".nav-link.active");
  if (activeLink) moveIndicator(activeLink);
});
/* Scroll spy + indicator update */
window.addEventListener("scroll", () => {
  let fromTop = window.scrollY + 200;

  navLinks.forEach(link => {
    const section = document.querySelector(link.getAttribute("href"));

    if (
      section.offsetTop <= fromTop &&
      section.offsetTop + section.offsetHeight > fromTop
    ) {
      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
      moveIndicator(link);
    }
  });
});
/* Navbar auto hide/show */
let lastScroll = 0;

window.addEventListener("scroll", () => {
  const currentScroll = window.scrollY;
  const navbar = document.getElementById("navbar");

  if (currentScroll > lastScroll && currentScroll > 200) {
    navbar.classList.add("hide");
    navbar.classList.remove("show");
  } else {
    navbar.classList.add("show");
    navbar.classList.remove("hide");
  }

  lastScroll = currentScroll;
});

/* EDUCATION TIMELINE ANIMATION */
const eduItems = document.querySelectorAll(".edu-item");

const eduObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      eduObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

eduItems.forEach(item => eduObserver.observe(item));

/* Optional: ensure mailto opens in new tab/window for some browsers */
document.querySelectorAll('.contact-3-social .orb').forEach(orb => {
  orb.addEventListener('click', (e) => {
    const href = orb.getAttribute('href');
    if (!href) return;
    // mailto handled by default; for analytics you could send event here.
    // Example: open mailto in new window (some browsers block this, so keep as fallback)
    if (href.startsWith('mailto:')) {
      window.open(href, '_blank');
    }
  });
});
