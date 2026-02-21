const noBtn = document.getElementById("noBtn");
const yesBtn = document.getElementById("yesBtn");
const videoOverlay = document.getElementById("videoOverlay");
const popupVideo = document.getElementById("popupVideo");

let noCount = 0;

function moveNoButton() {
    noCount++;

    // After 3 tries → show video
    if (noCount >= 3) {
        videoOverlay.classList.add("active");
        popupVideo.play();
        return;
    }

    noBtn.style.position = "fixed";

    const rect = noBtn.getBoundingClientRect();
    const padding = 20;

    const maxX = window.innerWidth - rect.width - padding;
    const maxY = window.innerHeight - rect.height - padding;

    const randomX = Math.random() * maxX;
    const randomY = Math.random() * maxY;

    noBtn.style.left = randomX + "px";
    noBtn.style.top = randomY + "px";

    if (noCount === 1) noBtn.innerText = "Are you sure? 😏";
    if (noCount === 2) noBtn.innerText = "Last chance 😅";
}

noBtn.addEventListener("mouseenter", moveNoButton);

noBtn.addEventListener("touchstart", function(e){
    e.preventDefault();
    moveNoButton();
}, { passive:false });

// Optional: Yes button action
yesBtn.addEventListener("click", () => {
    alert("Nice 😎 I'll plan it.");
});