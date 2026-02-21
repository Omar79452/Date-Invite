/* ============================================
   DATE INVITE — script.js
   ============================================ */

const yesBtn         = document.getElementById('yesBtn');
const noBtn          = document.getElementById('noBtn');
const videoOverlay   = document.getElementById('videoOverlay');
const popupVideo     = document.getElementById('popupVideo');
const successOverlay = document.getElementById('successOverlay');
const subtext        = document.getElementById('subtext');
const hintText       = document.getElementById('hintText');
const videoFallback  = document.getElementById('videoFallback');

// ── State ──────────────────────────────────────
let noCount = 0;
const MAX_ATTEMPTS = 3;

// Messages that update subtext after each dodge
const subtextMessages = [
    "Think carefully. This is a big moment.",
    "Interesting choice. Wanna try that again? 🤔",
    "Bold strategy. One more chance though. 👀",
];

// No button taunts (updates button label)
const noBtnLabels = [
    "No 🙄",
    "Still no 😤",
    "FINE. No. 😠",
];


// ── Helpers ────────────────────────────────────

/**
 * Returns a random number between min and max.
 */
function randBetween(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Get safe random position for the No button so it
 * never goes off screen. Uses the button's live size.
 */
function getSafePosition(el) {
    const rect    = el.getBoundingClientRect();
    const margin  = 16;
    const maxX    = window.innerWidth  - rect.width  - margin;
    const maxY    = window.innerHeight - rect.height - margin;

    // Avoid placing the button too close to where it currently is
    let x, y, attempts = 0;
    do {
        x = randBetween(margin, maxX);
        y = randBetween(margin, maxY);
        attempts++;
    } while (
        attempts < 10 &&
        Math.abs(x - rect.left) < 80 &&
        Math.abs(y - rect.top)  < 80
    );

    return { x, y };
}

/**
 * Launch confetti burst.
 */
function launchConfetti() {
    const container = document.getElementById('confettiContainer');
    const colors    = ['#f9c846', '#ff5e5e', '#7e6ff7', '#4dd9ac', '#fff', '#ff9de2'];
    const count     = 120;

    for (let i = 0; i < count; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';

        const color = colors[Math.floor(Math.random() * colors.length)];
        const left  = randBetween(0, 100);
        const delay = randBetween(0, 0.8);
        const dur   = randBetween(2.2, 4.0);
        const size  = randBetween(6, 14);
        const skew  = randBetween(-30, 30);

        piece.style.cssText = `
            left: ${left}%;
            background: ${color};
            width: ${size}px;
            height: ${size}px;
            animation-duration: ${dur}s;
            animation-delay: ${delay}s;
            transform: skew(${skew}deg);
        `;

        container.appendChild(piece);
    }

    // Clean up after animations finish
    setTimeout(() => container.innerHTML = '', 5500);
}


// ── Core Logic ─────────────────────────────────

/**
 * Called every time the user interacts with No.
 * Runs on mouseenter (desktop) and touchstart (mobile).
 */
function handleNoInteraction() {
    noCount++;

    // ── Third strike: show overlay ──────────────
    if (noCount >= MAX_ATTEMPTS) {
        triggerVideoOverlay();
        return;
    }

    // ── Move the button ─────────────────────────

    // Make it fixed-position so it can roam the full viewport
    if (!noBtn.classList.contains('floating')) {
        noBtn.classList.add('floating');
        hintText.style.opacity = '0'; // hide hint once button moves
    }

    const { x, y } = getSafePosition(noBtn);
    noBtn.style.left = x + 'px';
    noBtn.style.top  = y + 'px';

    // Play escape animation
    noBtn.classList.remove('escaped');
    void noBtn.offsetWidth; // force reflow to restart animation
    noBtn.classList.add('escaped');

    // Update labels
    const label = noBtn.querySelector('.btn-label');
    label.textContent = noBtnLabels[noCount] ?? noBtnLabels.at(-1);
    subtext.textContent = subtextMessages[noCount] ?? subtextMessages.at(-1);
}

/**
 * Show the video overlay after 3 attempts.
 */
function triggerVideoOverlay() {
    videoOverlay.classList.add('active');

    // If video has no src or fails, show the text fallback instead
    if (!popupVideo.currentSrc || popupVideo.error) {
        showVideoFallback();
    } else {
        popupVideo.play().catch(() => showVideoFallback());
    }
}

function showVideoFallback() {
    popupVideo.style.display = 'none';
    videoFallback.style.display = 'block';
}

/**
 * Called by the fallback "Fine, YES" button inside the video box.
 */
function closeVideo() {
    videoOverlay.classList.remove('active');
    triggerSuccess();
}

/**
 * Show the success state.
 */
function triggerSuccess() {
    successOverlay.classList.add('active');
    launchConfetti();
}


// ── Event Listeners ────────────────────────────

// Yes button
yesBtn.addEventListener('click', triggerSuccess);

// No button — desktop (mouseenter so they can't click it)
noBtn.addEventListener('mouseenter', handleNoInteraction);

// No button — mobile (touchstart, since hover doesn't exist)
noBtn.addEventListener('touchstart', function (e) {
    e.preventDefault(); // prevent ghost click
    handleNoInteraction();
}, { passive: false });

// Close video overlay if user clicks outside the box
videoOverlay.addEventListener('click', function (e) {
    if (e.target === videoOverlay) {
        closeVideo();
    }
});

// Make closeVideo accessible globally (used by inline onclick in HTML)
window.closeVideo = closeVideo;
