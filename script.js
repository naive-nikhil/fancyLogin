const eyesGroup = document.querySelector("#eyes");
const bodyPath = document.querySelector("#body");
const pupils = [
  { eye: document.querySelector(".eye1"), pupil: document.querySelector(".pupil1") },
  { eye: document.querySelector(".eye2"), pupil: document.querySelector(".pupil2") }
];

const state = { bend: 0, headRotate: 0 }; 

// --- 1. Blinking Logic ---
function blink() {
  const blinkDuration = 0.1; // speed of closing/opening

  // Create a timeline for the blink so it goes Close -> Open
  const tl = gsap.timeline({
    onComplete: () => {
      // Schedule the next blink randomly between 2 to 6 seconds
      const nextBlinkTime = Math.random() * 4000 + 2000;
      setTimeout(blink, nextBlinkTime);
    }
  });

  tl.to(".eye1, .eye2", { 
    scaleY: 0, 
    transformOrigin: "center", 
    duration: blinkDuration,
    yoyo: true, 
    repeat: 1 
  }, 0)
  .to(".pupil1, .pupil2", {
    opacity: 0,
    duration: blinkDuration, 
    yoyo: true, 
    repeat: 1
  }, 0);
}

// Start the blinking loop
setTimeout(blink, 3000);


// --- 2. Render Loop (Body & Head Movement) ---
function render() {
  const { bend, headRotate } = state;
  const w = 80, h = 200;

  // Draw Body (Banana Curve)
  const path = `
    M 0 ${h}
    Q 0 ${h / 2} ${bend} 0
    L ${w + bend} 0
    Q ${w} ${h / 2} ${w} ${h}
    Z
  `;
  bodyPath.setAttribute("d", path);

  // Move Eyes Group (Body bend + Head rotation)
  eyesGroup.style.transform = `translate(${bend + headRotate}px, 0)`;
}


// --- 3. Pupil Movement ---
function updatePupil({ eye, pupil }, e) {
  const rect = eye.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = e.clientX - cx;
  const dy = e.clientY - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const max = 3; 
  if (dist === 0) return;
  const move = Math.min(dist, max);
  pupil.style.transform = `translate(${(dx / dist) * move}px, ${(dy / dist) * move}px)`;
}

document.addEventListener("mousemove", (e) => {
  pupils.forEach(p => updatePupil(p, e));

  const mouseX = e.clientX - window.innerWidth / 2;

  gsap.to(state, {
    duration: 0.6,
    bend: mouseX / 40,      // Main spine curve
    headRotate: mouseX / 60, // Extra face turn
    ease: "power2.out",
    overwrite: "auto",
    onUpdate: render
  });
});