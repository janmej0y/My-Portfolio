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
/* PROJECT FILTERS */
const filterBtns = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");

filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(".filter-btn.active").classList.remove("active");
    btn.classList.add("active");

    let filter = btn.dataset.filter;

    projectCards.forEach(card => {
      card.style.display = (filter === "all" || card.dataset.category === filter) 
        ? "block" 
        : "none";
    });
  });
});

/* ===============================
   PROJECT MODAL (No Variable Conflict)
=============================== */

// Project Modal Elements
const projectModal = document.getElementById("project-modal");
const projectModalTitle = document.getElementById("modal-title");
const projectModalImg = document.getElementById("modal-img");
const projectModalDesc = document.getElementById("modal-desc");
const projectModalClose = document.querySelector(".modal-close");

// Project Data Object
const projectData = {
  voting: {
    title: "Online Voting System",
    img: "assets/projects/voting.png",
    desc: "A secure online voting system built with Node.js, Express, MongoDB, and JWT authentication."
  },

  voice: {
    title: "Voice Assistant",
    img: "assets/projects/voice.png",
    desc: "A personalized offline voice assistant built with Python, using speech recognition and automation."
  },

  coins: {
    title: "Campus Coins",
    img: "assets/projects/coins.png",
    desc: "A simple income and expense tracker, built with HTML, CSS and JavaScript."
  },

  music: {
    title: "Music Player",
    img: "assets/projects/music.png",
    desc: "A modern web-based music player with a clean UI and playlist support."
  },

  hax: {
    title: "FutureHax",
    img: "assets/projects/hax.png",
    desc: "A fun web project predicting the imaginary 'end of the world' using random algorithms."
  },

  weather: {
    title: "Weather App",
    img: "assets/projects/weather.png",
    desc: "A clean UI weather app that fetches real-time data from an open weather API."
  }
};

// Attach click event to all *View* buttons
document.querySelectorAll(".view-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const projectKey = button.dataset.project;
    const project = projectData[projectKey];

    // Fill modal content
    projectModalTitle.textContent = project.title;
    projectModalImg.src = project.img;
    projectModalDesc.textContent = project.desc;

    // Show modal
    projectModal.style.display = "flex";
  });
});

// Close modal on X click
projectModalClose.addEventListener("click", () => {
  projectModal.style.display = "none";
});

// Close modal when clicking outside content
window.addEventListener("click", (e) => {
  if (e.target === projectModal) {
    projectModal.style.display = "none";
  }
});

/* ==========================
   COUNT-UP ANIMATION
========================== */
const counters = document.querySelectorAll(".count");

const startCounter = (entry) => {
  if (!entry.isIntersecting) return;

  counters.forEach(counter => {
    let target = +counter.dataset.target;
    let count = 0;

    let speed = target / 60; // animation speed

    let update = () => {
      count += speed;
      if (count < target) {
        counter.textContent = Math.floor(count);
        requestAnimationFrame(update);
      } else {
        counter.textContent = target + "+";
      }
    };
    update();
  });

  counterObserver.unobserve(entry.target);
};

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(startCounter);
}, { threshold: 0.4 });

counters.forEach(counter => counterObserver.observe(counter));
/* ============================
   🎮 NEON SNAKE GAME
============================ */

// Modal elements
const snakeModal = document.getElementById("snake-modal");
const snakeBtn = document.getElementById("snake-game-btn");
const snakeClose = document.getElementById("snake-close");
const snakeStart = document.getElementById("snake-start");
const snakeRestart = document.getElementById("snake-restart");

// Open modal
snakeBtn.onclick = () => {
  snakeModal.style.display = "flex";
};

// Close modal
snakeClose.onclick = () => snakeModal.style.display = "none";
window.onclick = (e) => { if (e.target === snakeModal) snakeModal.style.display = "none"; };

// Canvas setup
const canvas = document.getElementById("snake-canvas");
const ctx = canvas.getContext("2d");

let box = 20;
let snake;
let direction;
let food;
let score;

// Initialize game
function initSnake() {
  snake = [{ x: 9 * box, y: 9 * box }];
  direction = null;
  food = generateFood();
  score = 0;
  document.getElementById("snake-score").textContent = score;
}

// Food generator
function generateFood() {
  return {
    x: Math.floor(Math.random() * 19) * box,
    y: Math.floor(Math.random() * 19) * box
  };
}

// Draw game
function drawSnakeGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw snake
  snake.forEach((segment, i) => {
    ctx.fillStyle = i === 0 ? "#00ffff" : "#0099ff";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#00ffff";
    ctx.fillRect(segment.x, segment.y, box, box);
  });

  // Draw food
  ctx.fillStyle = "#ff0080";
  ctx.shadowBlur = 20;
  ctx.shadowColor = "#ff0080";
  ctx.fillRect(food.x, food.y, box, box);

  // Old head position
  let snakeX = snake[0].x;
  let snakeY = snake[0].y;

  // Movement
  if (direction === "LEFT") snakeX -= box;
  if (direction === "RIGHT") snakeX += box;
  if (direction === "UP") snakeY -= box;
  if (direction === "DOWN") snakeY += box;

  // If snake eats food
  if (snakeX === food.x && snakeY === food.y) {
    // Play sound
    document.getElementById("eat-sound").play();

    // Explosion effect at food location
    neonExplosion(canvas.getBoundingClientRect().left + food.x,
                  canvas.getBoundingClientRect().top + food.y);

    // Generate new food
    food = generateFood();

    score++;

    document.getElementById("snake-score").textContent = score;
  } else {
    snake.pop();
  }

  let newHead = { x: snakeX, y: snakeY };

  // Game over
  if (
    snakeX < 0 || snakeY < 0 ||
    snakeX >= canvas.width ||
    snakeY >= canvas.height ||
    collision(newHead, snake)
  ) {
    clearInterval(game);
    document.getElementById("gameover-sound").play();
    setTimeout(() => alert("Game Over! Score: " + score), 300);
    return;    
  }

  snake.unshift(newHead);
}

// Collision checker
function collision(head, arr) {
  return arr.some(seg => seg.x === head.x && seg.y === head.y);
}

// Listen for keys
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  else if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  else if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  else if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
  document.getElementById("move-sound").play();

});
/* =======================
   Mobile Swipe Control
======================= */

let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});

canvas.addEventListener("touchmove", (e) => {
  if (!direction) return;

  let dx = e.touches[0].clientX - touchStartX;
  let dy = e.touches[0].clientY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 20 && direction !== "LEFT") direction = "RIGHT";
    if (dx < -20 && direction !== "RIGHT") direction = "LEFT";
  } else {
    if (dy > 20 && direction !== "UP") direction = "DOWN";
    if (dy < -20 && direction !== "DOWN") direction = "UP";
  }
});


// Start game
let game;

snakeStart.onclick = () => {
  initSnake();
  clearInterval(game);
  game = setInterval(drawSnakeGame, 120);
};

snakeRestart.onclick = () => {
  initSnake();
};
// Neon Explosion Effect
function neonExplosion(x, y) {
  const boom = document.createElement("div");
  boom.classList.add("explosion");
  boom.style.left = x + "px";
  boom.style.top = y + "px";
  document.body.appendChild(boom);

  setTimeout(() => boom.remove(), 400);
}
/* ============================
   EASTER EGG HUNT SYSTEM (Feature 2)
   - 5 eggs, progress HUD, localStorage, unlock modal
============================*/

(function(){
  const TOTAL_EGGS = 5;
  const foundKey = "egghunt_found"; // localStorage key

  // Elements
  const eggs = Array.from(document.querySelectorAll(".egg"));
  const eggCountEl = document.getElementById("egg-count");
  const progressBar = document.getElementById("egg-progress-bar");
  const unlockModal = document.getElementById("egg-unlock-modal");
  const unlockClose = document.getElementById("egg-unlock-close");
  const openSecretBtn = document.getElementById("egg-open-secret");
  const resetBtn = document.getElementById("egg-reset");
  const hintBtn = document.getElementById("egg-hint-btn");
  const foundSound = document.getElementById("egg-found-sound");
  const hintSound = document.getElementById("egg-hint-sound");

  // load found eggs from localStorage (array of ids)
  let found = JSON.parse(localStorage.getItem(foundKey) || "[]");

  // initialize UI
  function refreshUI(){
    eggCountEl.textContent = found.length;
    progressBar.style.width = Math.round((found.length / TOTAL_EGGS) * 100) + "%";

    // mark eggs collected
    eggs.forEach(el => {
      const id = el.dataset.egg;
      if (found.includes(id)) {
        el.classList.add("collected");
        el.setAttribute("aria-hidden", "true");
      } else {
        el.classList.remove("collected");
        el.removeAttribute("aria-hidden");
      }
    });

    // Unlock if all found
    if (found.length >= TOTAL_EGGS) {
      setTimeout(() => showUnlockModal(), 450);
    }
  }

  // mark egg found
  function collectEgg(el) {
    const id = el.dataset.egg;
    if (found.includes(id)) return;

    found.push(id);
    localStorage.setItem(foundKey, JSON.stringify(found));

    // tiny burst visual
    for (let i=0;i<6;i++){
      const dot = document.createElement("div");
      dot.className = "egg-burst";
      const r = Math.random()*30;
      dot.style.left = (el.getBoundingClientRect().left + el.offsetWidth/2 + (Math.random()*r - r/2)) + "px";
      dot.style.top  = (el.getBoundingClientRect().top + el.offsetHeight/2 + (Math.random()*r - r/2)) + "px";
      document.body.appendChild(dot);
      setTimeout(()=> dot.remove(), 700);
    }

    // play sound
    if (foundSound) { try { foundSound.currentTime = 0; foundSound.play(); } catch(e){} }

    // fade out egg
    el.classList.add("collected");
    el.setAttribute("aria-hidden", "true");

    refreshUI();
  }

// small helper to safely play audio
function tryPlay(audioEl) {
  try { audioEl.currentTime = 0; audioEl.play(); } catch (err) { /* autoplay blocked or other */ }
}

/**
 * showHintArrow(el)
 * Creates a subtle glowing arrow that points to element `el` for a few seconds.
 * The arrow is removed automatically.
 */
function showHintArrow(el) {
  if (!el) return;

  // compute center of target element
  const rect = el.getBoundingClientRect();
  const targetX = rect.left + rect.width / 2;
  const targetY = rect.top + rect.height / 2;

  // create arrow wrapper
  const arrow = document.createElement("div");
  arrow.className = "egg-hint-arrow";
  document.body.appendChild(arrow);

  // position arrow above target (adjust offsets so arrow points nicely)
  // we'll position arrow slightly above the target center
  const arrowX = targetX - 28; // arrow width/2
  const arrowY = targetY - rect.height / 2 - 50; // 50px above target center

  arrow.style.left = `${Math.max(8, arrowX)}px`;
  arrow.style.top = `${Math.max(8, arrowY)}px`;

  // animate arrow (CSS handles pulsing). We'll also make it follow window scroll a bit
  let elapsed = 0;
  const duration = 3800; // ms
  const interval = 60;
  const followId = setInterval(() => {
    elapsed += interval;
    // update position in case user scrolled
    const rr = el.getBoundingClientRect();
    const tx = rr.left + rr.width / 2 - 28;
    const ty = rr.top + rr.height / 2 - rr.height / 2 - 50;
    arrow.style.left = `${Math.max(8, tx)}px`;
    arrow.style.top = `${Math.max(8, ty)}px`;

    if (elapsed >= duration) {
      clearInterval(followId);
      // fade out then remove
      arrow.classList.add("egg-hint-arrow--hide");
      setTimeout(() => arrow.remove(), 420);
    }
  }, interval);
}

 // NEW showHint with animated hint arrow
function showHint() {
  // play hint sound
  hintSound && tryPlay(hintSound);

  const notFound = eggs.filter(e => !found.includes(e.dataset.egg));
  if (!notFound.length) {
    alert("You already found all eggs!");
    return;
  }

  const pick = notFound[Math.floor(Math.random() * notFound.length)];

  // Flash it a few times (existing behavior)
  let flashes = 0;
  const id = setInterval(() => {
    pick.style.opacity = pick.style.opacity === "1" ? "0.12" : "1";
    flashes++;
    if (flashes > 6) { clearInterval(id); pick.style.opacity = ""; }
  }, 280);

  // Show animated hint arrow pointing to the picked egg
  showHintArrow(pick);
}


  // show unlock modal
  function showUnlockModal(){
    unlockModal.style.display = "flex";
    unlockModal.setAttribute("aria-hidden", "false");
  }

  // hide unlock modal
  function hideUnlockModal(){
    unlockModal.style.display = "none";
    unlockModal.setAttribute("aria-hidden", "true");
  }

  // Reset hunt
  function resetHunt(){
    found = [];
    localStorage.removeItem(foundKey);
    refreshUI();
    hideUnlockModal();
  }

  // attach click handlers
  eggs.forEach(el => {
    // accessible click + keyboard
    el.addEventListener("click", () => collectEgg(el));
    el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") collectEgg(el); });
  });

  hintBtn && hintBtn.addEventListener("click", showHint);
  unlockClose && unlockClose.addEventListener("click", hideUnlockModal);
  resetBtn && resetBtn.addEventListener("click", resetHunt);

  // open secret room (this event triggers your Secret Room logic; we dispatch a custom event)
  openSecretBtn && openSecretBtn.addEventListener("click", () => {
    hideUnlockModal();
    // dispatch a custom event 'secret-room-unlocked' that other code can listen for
    window.dispatchEvent(new CustomEvent("secret-room-unlocked", { detail: { source: "egg-hunt" } }));
  });

  // initialize UI on load
  refreshUI();

  // Expose a small API to move eggs programmatically if needed
  window.eggHunt = {
    reset: resetHunt,
    foundList: () => JSON.parse(JSON.stringify(found)),
    collectById: (id) => {
      const el = document.querySelector(`.egg[data-egg="${id}"]`);
      if (el) collectEgg(el);
    }
  };

})();
// ... END of the egg-hunt IIFE earlier in script.js


// Add this listener AFTER the IIFE (below)
window.addEventListener("secret-room-unlocked", (e) => {
  console.log("Secret room unlocked!", e.detail);
  // Example actions:
  // 1) open secret page
  window.location.href = "/secret.html";

  // 2) OR open a modal on the same page:
  const secretModal = document.getElementById("secret-room-modal");
  if (secretModal) secretModal.style.display = "flex";
});
