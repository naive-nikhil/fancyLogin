// --- 1. Selectors ---
const char1Body = document.querySelector("#body1");
const char1Eyes = document.querySelector("#eyes1");

const char2Body = document.querySelector("#body2");
const char2Eyes = document.querySelector("#eyes2");
const char2Mouth = document.querySelector("#mouth");

// Track Pupils for Character 1 ONLY
const pupilsTracker = [
  { eye: document.querySelector("#character_one .eye1"), pupil: document.querySelector("#character_one .pupil1") },
  { eye: document.querySelector("#character_one .eye2"), pupil: document.querySelector("#character_one .pupil2") }
];

// --- State Management (Added mouseY) ---
const state = { 
  mouseX: 0, 
  mouseY: 0 
};

// --- 2. Blinking Logic ---
function blink() {
  const blinkDuration = 0.1;
  const tl = gsap.timeline({
    onComplete: () => {
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
setTimeout(blink, 2000);


// --- 3. Render Loop ---
function render() {
  const { mouseX, mouseY } = state;

  // === Character 1 Math (Left/Right only) ===
  const bend1 = mouseX / 40; 
  const rotate1 = mouseX / 60;
  const w1 = 80, h1 = 200;
  const path1 = `
    M 0 ${h1}
    Q 0 ${h1 / 2} ${bend1} 0
    L ${w1 + bend1} 0
    Q ${w1} ${h1 / 2} ${w1} ${h1}
    Z
  `;
  char1Body.setAttribute("d", path1);
  char1Eyes.style.transform = `translate(${bend1 + rotate1}px, 0)`;


  // === Character 2 Math (Full XY Movement) ===
  // 1. Calculate Body Bend (Left/Right)
  const bend2 = mouseX / 25; 
  
  // 2. Calculate Face Movement (X and Y)
  const faceMoveX = bend2 * 1.6; // Moves horizontally with body
  const faceMoveY = mouseY / 40; // Moves vertically based on mouse height
  
  // Apply Transform to Eyes and Mouth
  // We combine X and Y into one translate string
  const faceTransform = `translate(${faceMoveX}px, ${faceMoveY}px)`;
  char2Eyes.style.transform = faceTransform;
  char2Mouth.style.transform = faceTransform;

  // 3. Body Path Construction (Same Cubic Bezier Logic)
  const baseWidth2 = 200;
  const baseHeight2 = 200;
  const radius2 = baseWidth2 / 2; 
  const peakY2 = baseHeight2 - radius2;
  const midX2 = (baseWidth2 / 2) + bend2;
  const cpOffset2 = radius2 * 0.55228;

  const path2 = `
    M 0 ${baseHeight2}
    C 0 ${baseHeight2 - cpOffset2}
      ${midX2 - cpOffset2} ${peakY2}
      ${midX2} ${peakY2}
    C ${midX2 + cpOffset2} ${peakY2}
      ${baseWidth2} ${baseHeight2 - cpOffset2}
      ${baseWidth2} ${baseHeight2}
    Z
  `;
  char2Body.setAttribute("d", path2);
}


// --- 4. Pupil Tracking (Char 1) ---
function updatePupil({ eye, pupil }, e) {
  const rect = eye.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = e.clientX - cx;
  const dy = e.clientY - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  const maxMoveRadius = 3; 
  if (dist === 0) return;
  const moveAmount = Math.min(dist, maxMoveRadius);
  
  pupil.style.transform = `translate(${(dx / dist) * moveAmount}px, ${(dy / dist) * moveAmount}px)`;
}

// --- 5. Mouse Event Listener ---
document.addEventListener("mousemove", (e) => {
  // Update Char 1 pupils
  pupilsTracker.forEach(p => updatePupil(p, e));

  // Get Mouse X and Y relative to window center
  const currentMouseX = e.clientX - window.innerWidth / 2;
  const currentMouseY = e.clientY - window.innerHeight / 2;

  gsap.to(state, {
    duration: 0.6,
    mouseX: currentMouseX,
    mouseY: currentMouseY, // Store Y position
    ease: "power2.out",
    overwrite: "auto",
    onUpdate: render
  });
});