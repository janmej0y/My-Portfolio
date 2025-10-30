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
form.addEventListener("submit", function(e) {
  e.preventDefault();
  emailjs.sendForm("service_l8nf8bg", "template_p4a3691", this)
    .then(() => {
      document.getElementById("form-status").textContent = "Message sent successfully ✅";
      form.reset();
    }, (err) => {
      document.getElementById("form-status").textContent = "Error sending message ❌";
      console.error(err);
    });
});
// Visitor Counter using countapi
fetch("https://api.countapi.xyz/hit/janmejoy-portfolio/visits")
  .then(res => res.json())
  .then(data => {
    document.getElementById("visitor-count").textContent = "Visitors: " + data.value;
  });
  document.getElementById("contact-form").addEventListener("submit", function(e) {
    e.preventDefault();
    alert("Message sent successfully! 🚀 (EmailJS integration coming soon)");
  });
  