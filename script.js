/* ============================================
   DATE INVITE — script.js  (romantic edition)
   ============================================ */

// ── Elements ──────────────────────────────────
const yesBtn         = document.getElementById('yesBtn');
const noBtn          = document.getElementById('noBtn');
const finalYesBtn    = document.getElementById('finalYesBtn');   // ← fixed clickable button
const videoOverlay   = document.getElementById('videoOverlay');
const successOverlay = document.getElementById('successOverlay');
const popupVideo     = document.getElementById('popupVideo');
const subtext        = document.getElementById('subtext');
const hintText       = document.getElementById('hintText');

// ── Config ─────────────────────────────────────
let noCount = 0;
const MAX_NO = 3;

const subtextLines = [
    "I promise good vibes, great company,<br>and at least one laugh. 🌸",
    "Still here waiting… and I'm very patient. 🥺",
    "Last chance. I already picked the restaurant. 😌",
];

const noBtnLabels = [
    "Hmm… no 🙄",
    "Still no? 😮",
    "...Really? 😤",
];

// Romantic floating particles
const PARTICLES = ["🌸", "💕", "✨", "🌷", "💌", "🌟", "🫶", "🍀", "🌺", "💗"];

// ── Floating Particles ─────────────────────────
function spawnParticle() {
    const container = document.getElementById('particleContainer');
    const el        = document.createElement('div');
    el.className    = 'particle';
    el.textContent  = PARTICLES[Math.floor(Math.random() * PARTICLES.length)];

    const startX  = Math.random() * 100;          // % across screen
    const dur     = 8 + Math.random() * 10;       // seconds
    const delay   = Math.random() * 6;            // stagger
    const size    = 14 + Math.random() * 14;      // px

    el.style.cssText = `
        left: ${startX}%;
        font-size: ${size}px;
        animation-duration: ${dur}s;
        animation-delay: ${delay}s;
    `;

    container.appendChild(el);
    // Remove after animation to keep DOM clean
    setTimeout(() => el.remove(), (dur + delay) * 1000);
}

// Spawn a wave of particles, then keep trickling them in
function initParticles() {
    for (let i = 0; i < 18; i++) spawnParticle();          // initial burst
    setInterval(() => spawnParticle(), 1800);               // trickle
}

initParticles();

// ── Helpers ────────────────────────────────────
function randBetween(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Returns x/y coords guaranteed to keep the No button
 * fully visible inside the viewport, with a buffer so
 * it never clips the edge on any screen size.
 */
function getSafePos(el) {
    const { width, height } = el.getBoundingClientRect();
    const margin = 20;
    const maxX   = window.innerWidth  - width  - margin;
    const maxY   = window.innerHeight - height - margin;

    // Try to land far from current position
    let x, y, tries = 0;
    do {
        x = randBetween(margin, maxX);
        y = randBetween(margin, maxY);
        tries++;
    } while (
        tries < 12 &&
        Math.abs(x - el.getBoundingClientRect().left) < 100 &&
        Math.abs(y - el.getBoundingClientRect().top)  < 100
    );

    return { x, y };
}

// ── Confetti ───────────────────────────────────
function launchConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    const colors = ['#e0607e', '#f7c5d0', '#ffd6e4', '#c44d70', '#fff', '#ffb3c6', '#ff8fab'];
    const count  = 130;

    for (let i = 0; i < count; i++) {
        const p      = document.createElement('div');
        p.className  = 'cp';
        const size   = randBetween(7, 15);
        const left   = randBetween(0, 100);
        const delay  = randBetween(0, 0.9);
        const dur    = randBetween(2.4, 4.2);
        const color  = colors[Math.floor(Math.random() * colors.length)];
        const skewX  = randBetween(-20, 20);
        const skewY  = randBetween(-20, 20);

        p.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${left}%;
            background: ${color};
            border-radius: ${Math.random() > 0.5 ? '50%' : '3px'};
            animation-duration: ${dur}s;
            animation-delay: ${delay}s;
            transform: skew(${skewX}deg, ${skewY}deg);
        `;
        canvas.appendChild(p);
    }

    setTimeout(() => (canvas.innerHTML = ''), 5500);
}

// ── No Button Logic ────────────────────────────
function handleNo() {
    noCount++;

    // Third strike → show video/caught overlay
    if (noCount >= MAX_NO) {
        showCaughtOverlay();
        return;
    }

    // Make button free-floating across the whole screen
    if (!noBtn.classList.contains('floating')) {
        noBtn.classList.add('floating');
        hintText.style.opacity = '0';
    }

    const { x, y } = getSafePos(noBtn);
    noBtn.style.left = x + 'px';
    noBtn.style.top  = y + 'px';

    // Pop animation
    noBtn.classList.remove('popped');
    void noBtn.offsetWidth;                     // force reflow
    noBtn.classList.add('popped');

    // Update labels
    noBtn.textContent       = noBtnLabels[noCount] ?? noBtnLabels.at(-1);
    subtext.innerHTML       = subtextLines[noCount] ?? subtextLines.at(-1);
}

// ── Caught Overlay ─────────────────────────────
function showCaughtOverlay() {
    videoOverlay.classList.add('active');

    // Try to play video; if it fails or has no src, show fallback only
    const hasVideo = popupVideo.querySelector('source')?.src;
    if (!hasVideo) {
        popupVideo.style.display = 'none';
    } else {
        popupVideo.play().catch(() => {
            popupVideo.style.display = 'none';
        });
    }
}

// ── Success ────────────────────────────────────
function triggerSuccess() {
    // Hide video overlay if open
    videoOverlay.classList.remove('active');

    // Show success
    successOverlay.classList.add('active');
    launchConfetti();
}

// ── Event Listeners ────────────────────────────

// Yes button (main card)
yesBtn.addEventListener('click', triggerSuccess);

// "Fine… YES" button inside the caught overlay — fully clickable
finalYesBtn.addEventListener('click', triggerSuccess);

// No button — desktop: mouseenter (they can't catch it)
noBtn.addEventListener('mouseenter', handleNo);

// No button — mobile: touchstart
noBtn.addEventListener('touchstart', function (e) {
    e.preventDefault();
    handleNo();
}, { passive: false });

// Close overlay when clicking dark backdrop
videoOverlay.addEventListener('click', function (e) {
    if (e.target === videoOverlay) {
        videoOverlay.classList.remove('active');
    }
});
