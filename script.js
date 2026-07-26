// DOM Elements
const loginContainer = document.getElementById('login-container');
const bsodContainer = document.getElementById('bsod-container');
const desktopContainer = document.getElementById('desktop-container');
const jumpscareContainer = document.getElementById('jumpscare-container');
const warningContainer = document.getElementById('warning-container');
const fakeLoginForm = document.getElementById('fake-login-form');
const btnSubmit = document.getElementById('btn-submit');
const spinner = document.getElementById('spinner');
const btnText = btnSubmit.querySelector('.btn-text');
const bsodPercentage = document.getElementById('bsod-percentage');
const copyToast = document.getElementById('copy-toast');

// Social Login buttons
const socialTwitch = document.getElementById('social-twitch');
const socialGoggle = document.getElementById('social-goggle');
const socialXmen = document.getElementById('social-xmen');
const socialJeffcord = document.getElementById('social-jeffcord');

// Reset and Copy buttons
const btnReset = document.getElementById('btn-reset');
const btnCopyTwitch = document.getElementById('btn-copy-twitch');
const btnCopyRivals = document.getElementById('btn-copy-rivals');

let autoGlitchTimer = null;
let isGlitched = false;
let enteredUsername = "Buddy";
let spawnedParodyCount = 0;
let currentLang = "en";

// Initialize on page load
window.addEventListener('load', () => {
  setupEventListeners();
  startAutoGlitchTimer();
  renderRandomBanners();
  initLanguage();
});

// Setup event listeners
function setupEventListeners() {
  // Login Form Submission
  fakeLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    triggerPrankSequence();
  });

  // Social Login clicks
  [socialTwitch, socialGoggle, socialXmen, socialJeffcord].forEach(button => {
    button.addEventListener('click', () => {
      triggerPrankSequence();
    });
  });

  // Reset button
  btnReset.addEventListener('click', resetPrank);

  // Copy buttons
  btnCopyTwitch.addEventListener('click', () => copyToClipboard('url-twitch'));
  btnCopyRivals.addEventListener('click', () => copyToClipboard('url-rivals'));
}

// Start the 60-second automatic idle trigger (as a safety fallback)
function startAutoGlitchTimer() {
  if (autoGlitchTimer) clearTimeout(autoGlitchTimer);
  
  autoGlitchTimer = setTimeout(() => {
    triggerPrankSequence();
  }, 60000); // 60 seconds of idle time
}

// Trigger the glitch sequence
function triggerPrankSequence() {
  if (isGlitched) return;
  isGlitched = true;

  // Grab the entered username for personalized birthday easter egg
  const usernameInput = document.getElementById('username');
  enteredUsername = usernameInput && usernameInput.value ? usernameInput.value.trim() : "Buddy";

  // Clear idle timer
  if (autoGlitchTimer) clearTimeout(autoGlitchTimer);

  // Show loading indicator on login button
  btnSubmit.disabled = true;
  spinner.style.display = 'inline-block';
  btnText.textContent = 'Verifying Account...';

  // 1.2 seconds of "loading" before the freeze starts
  setTimeout(() => {
    // Phase 1.5: Freeze / Responding Error State
    // Change cursor to wait, disable interaction, fade in white overlay
    document.body.classList.add('freeze-cursor');
    loginContainer.classList.add('browser-freeze');
    
    // Play no sound (silent freeze) for 8.5 seconds
    setTimeout(() => {
      // Release freeze visual, then do sudden glitch transition to BSoD
      document.body.classList.remove('freeze-cursor');
      loginContainer.classList.remove('browser-freeze');
      
      startScreenGlitchEffect(() => {
        // Transition to Phase 2: BSoD
        transitionToPhase(loginContainer, bsodContainer);
        runBSoDSequence();
      });
    }, 8500); // 8.5 seconds freeze
  }, 1200);
}

// Global Screen Glitch Animation (Flash and sound removed as requested)
function startScreenGlitchEffect(callback) {
  // Directly execute the callback without flash overlay and sound
  if (callback) callback();
}

// Fake glitch static sound using Web Audio API
function playGlitchSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create oscillator
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, audioCtx.currentTime); // Low buzz
    
    // Add modulation for glitch feel
    osc.frequency.linearRampToValueAtTime(40, audioCtx.currentTime + 0.5);
    
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 1.2);
  } catch (e) {
    // Audio context might be blocked by browser policy, ignore silently
  }
}

// Transition from one section container to another
function transitionToPhase(fromContainer, toContainer) {
  fromContainer.classList.remove('active');
  toContainer.classList.add('active');
  // Reset scroll offsets to top to prevent black screen gaps on mobile
  toContainer.scrollTop = 0;
  window.scrollTo(0, 0);
}

// Run Phase 2: BSoD Percent Counter (Slower to allow reading)
function runBSoDSequence() {
  let progress = 0;
  bsodPercentage.textContent = progress;

  function updateProgress() {
    // Slower, smaller increments for realistic Windows BSoD look
    const increment = Math.floor(Math.random() * 4) + 1; // 1% to 4%
    progress += increment;

    if (progress >= 100) {
      progress = 100;
      bsodPercentage.textContent = progress;

      // 2 seconds wait at 100% before transition to popup flood
      setTimeout(() => {
        startScreenGlitchEffect(() => {
          // Keep BSoD visible in the background, overlay the desktop container on top
          desktopContainer.classList.add('active');
          startErrorFloodSequence();
        });
      }, 2000);
    } else {
      bsodPercentage.textContent = progress;
      // Slower intervals (250ms to 600ms)
      const nextTick = Math.floor(Math.random() * 350) + 250;
      setTimeout(updateProgress, nextTick);
    }
  }

  // Start BSoD loading after 1.5 seconds
  setTimeout(updateProgress, 1500);
}

// Phase 2.5: Classical Windows Error Flood Sequence
let activePopups = 0;
let zIndexCounter = 100;
let floodTimer = null;
let floodDurationTimeout = null;
let isFloodActive = false;

const standardMessages = [
  "Warning: System hacked. All credentials leaked.",
  "Security Alert: Unauthorized access detected.",
  "Error 0x80070005: Access is denied.",
  "Critical Error: Connection lost with authentication server.",
  "Windows Defender: Trojan horse detected.",
  "System Failure: Kernel data inpage error.",
  "Security Warning: IP address flagged for suspicious activity.",
  "Failed to load resource: net::ERR_CONNECTION_REFUSED",
  "Error: Host resolved, but connection timed out.",
  "Warning: Keylogger activity suspected on background processes."
];

const parodyMessages = [
  "Happy Birthday, [Username]! (Just kidding, it's not your birthday... or is it?)",
  "Order Confirmed: 100 Chimichangas purchased using your saved credit card. Deadpool says thanks!",
  "🔥 Hot single Mutants in your area want to chat! Mystique is just 1.5 miles away! Click OK to connect.",
  "あなたは……赤い部屋が好きですか？",
  "☠︎🕆︎💣︎👌︎☜︎☼︎ ⚐︎☠︎☜︎ 💧︎🕆︎🏓︎☜︎☼︎🕈︎☜︎☼︎⚐︎☼︎ (T-W-I-T-C-H E-R-R-O-R)",
  "AVENGERS INITIATIVE: Code Red. Report to Stark Tower immediately. (Note: DP, stop hijacking this channel - Fury)",
  "J.A.R.V.I.S.: Sir, an unauthorized entity in red spandex bypassed our firewall. Suggest contacting Mr. Stark.",
  "Rivals Matchmaking Failed: You are queued with 5 lock-in Deadpools.",
  "Alert: Deadpool is currently eating pizza near your CPU.",
  "Error: Chimichanga sauce detected on motherboard slots 1 & 2.",
  "Fatal: [Rivalry Level Critical] Please nerf Wolverine immediately."
];

function startErrorFloodSequence() {
  isFloodActive = true;
  activePopups = 0;
  zIndexCounter = 100;
  spawnedParodyCount = 0; // Reset parody counter
  desktopContainer.innerHTML = '';

  // Auto spawn popups every 180ms
  floodTimer = setInterval(() => {
    if (activePopups < 35 && isFloodActive) {
      spawnPopup();
    }
  }, 180);

  // Stop flood and glitch transition after 8 seconds
  floodDurationTimeout = setTimeout(() => {
    stopFloodAndTransition();
  }, 8000);
}

function spawnPopup(customMsg = null) {
  if (!isFloodActive) return;

  activePopups++;
  zIndexCounter++;

  let msg = customMsg;
  if (!msg) {
    // 5% chance of showing parody, max 2 parody messages total per flood
    if (spawnedParodyCount < 2 && Math.random() < 0.05) {
      msg = parodyMessages[Math.floor(Math.random() * parodyMessages.length)];
      spawnedParodyCount++;
    } else {
      msg = standardMessages[Math.floor(Math.random() * standardMessages.length)];
    }
  }

  // Replace username template with entered username
  msg = msg.replace("[Username]", enteredUsername);
  
  // Random position within desktop window (Optimized for mobile responsive bounds to prevent overflow)
  const isMobile = window.innerWidth <= 480;
  const left = isMobile 
    ? Math.floor(Math.random() * 15) + 5  // Mobile: 5% to 20%
    : Math.floor(Math.random() * 65) + 5; // PC: 5% to 70%
  const top = isMobile
    ? Math.floor(Math.random() * 65) + 10  // Mobile: 10% to 75%
    : Math.floor(Math.random() * 55) + 10; // PC: 10% to 65%

  const dialog = document.createElement('div');
  dialog.className = 'win-dialog';
  dialog.style.left = `${left}%`;
  dialog.style.top = `${top}%`;
  dialog.style.zIndex = zIndexCounter;

  dialog.innerHTML = `
    <div class="win-titlebar">
      <div class="win-title">
        <span class="win-title-text">ERROR</span>
      </div>
      <div class="win-close-btn">&times;</div>
    </div>
    <div class="win-body">
      <div class="win-icon-error"></div>
      <div class="win-msg">${msg}</div>
    </div>
    <div class="win-buttons">
      <button class="win-btn">OK</button>
    </div>
  `;

  // Audio: Try playing real critical stop sound
  playErrorSound();

  // Helper to handle popup close (and multiply!)
  const closePopup = () => {
    dialog.remove();
    activePopups--;
    
    // Spawn 2 more popups on click (Deadpool's annoyance mechanism!)
    if (isFloodActive && activePopups < 45) {
      setTimeout(() => { spawnPopup(); }, 100);
      setTimeout(() => { spawnPopup(); }, 250);
    }

    // If all popups are closed somehow, trigger transition
    if (activePopups <= 0 && isFloodActive) {
      stopFloodAndTransition();
    }
  };

  dialog.querySelector('.win-close-btn').addEventListener('click', closePopup);
  dialog.querySelector('.win-btn').addEventListener('click', closePopup);

  desktopContainer.appendChild(dialog);
}

// Retro computer warning beep sound using Web Audio API
function playBeepSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch beep
    
    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.12);
  } catch (e) {
    // Ignore audio context block
  }
}

// Windows Critical Stop Audio player with Web Audio fallback
function playErrorSound() {
  try {
    const audio = new Audio('assets/critical_stop.wav');
    audio.volume = 0.35;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        // Autoplay blocked by browser, fallback to synthesized beep
        playBeepSound();
      });
    }
  } catch (e) {
    playBeepSound();
  }
}

// Terrifying Exorcist Jumpscare sound player (Applying distortion/echo effects on HTTP, with zero-silence fallback for local file://)
function playScreamSound() {
  const audio = new Audio('assets/scream.mp3');
  audio.volume = 0.95;

  try {
    // If running on local file:// scheme, bypass Web Audio API to prevent CORS security silence
    if (window.location.protocol === 'file:') {
      throw new Error('Local file scheme detected, bypassing Web Audio API to prevent CORS silence.');
    }

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaElementSource(audio);
    
    // 1. Distortion Node (Gritty vocal crack texture)
    const distortion = audioCtx.createWaveShaper();
    distortion.curve = makeDistortionCurve(65);
    distortion.oversample = '4x';
    
    // 2. Delay Node (Reverberating echo)
    const delay = audioCtx.createDelay(1.0);
    delay.delayTime.setValueAtTime(0.18, audioCtx.currentTime); // 180ms echo
    
    // Echo decay gain node
    const feedback = audioCtx.createGain();
    feedback.gain.setValueAtTime(0.45, audioCtx.currentTime); // 45% feedback
    
    // 3. Highpass Filter (Emphasize high-pitch scream)
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(450, audioCtx.currentTime);
    
    // 4. Main Out Gain Node
    const mainGain = audioCtx.createGain();
    mainGain.gain.setValueAtTime(0.95, audioCtx.currentTime);

    // Audio Graph Routing:
    source.connect(distortion);
    distortion.connect(filter);
    filter.connect(mainGain);
    
    // Echo feedback loop routing
    filter.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(mainGain);
    
    mainGain.connect(audioCtx.destination);
    
    audio.play().catch(err => {
      // Autoplay blocked by browser policy
    });
    return audio;
  } catch (e) {
    // Fallback: Safe direct playback for local file:// mode or blocked AudioContext
    try {
      const fallbackAudio = new Audio('assets/scream.mp3');
      fallbackAudio.volume = 0.95;
      fallbackAudio.play().catch(err => {});
      return fallbackAudio;
    } catch (err) {
      return null;
    }
  }
}

// Distortion Curve Generator helper for playScreamSound
function makeDistortionCurve(amount) {
  const k = typeof amount === 'number' ? amount : 50;
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;
  for (let i = 0; i < n_samples; ++i) {
    const x = (i * 2) / n_samples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

function stopFloodAndTransition() {
  if (!isFloodActive) return;
  
  // 1. Stop spawning new popups immediately
  clearInterval(floodTimer);
  clearTimeout(floodDurationTimeout);

  // 2. Keep the filled error screen static for 3.5 seconds so the user can read/process it
  setTimeout(() => {
    // Safety check in case reset was clicked during the wait
    if (!isFloodActive) return;
    isFloodActive = false;
    
    // 3. Trigger Terrifying Jumpscare! Show container and play sound
    jumpscareContainer.classList.add('active');
    bsodContainer.classList.remove('active'); // Hide BSoD instantly so system bars revert to black
    desktopContainer.classList.remove('active');
    const screamAudio = playScreamSound();
    
    // 4. Play jumpscare for 1.8 seconds (until the voice stops peak), then force stop audio and transition to warning page
    setTimeout(() => {
      if (screamAudio) {
        try {
          screamAudio.pause();
          screamAudio.currentTime = 0;
        } catch (err) {}
      }
      jumpscareContainer.classList.remove('active');
      bsodContainer.classList.remove('active');
      desktopContainer.classList.remove('active');
      warningContainer.classList.add('active');
      // Reset scroll offsets to top to prevent black screen gaps on mobile
      warningContainer.scrollTop = 0;
      window.scrollTo(0, 0);
      desktopContainer.innerHTML = '';
    }, 1800); // Sync image hide and audio stop at 1.8s
  }, 3500); // 3.5 seconds pause (the "間")
}

// Clipboard Copy logic
function copyToClipboard(elementId) {
  const urlText = document.getElementById(elementId).textContent;
  
  navigator.clipboard.writeText(urlText)
    .then(() => {
      // Show success toast with localized message
      copyToast.textContent = translations[currentLang].copied;
      copyToast.classList.add('show');
      
      // Hide toast after 2.5 seconds
      setTimeout(() => {
        copyToast.classList.remove('show');
      }, 2500);
    })
    .catch(err => {
      console.error('Failed to copy: ', err);
    });
}

// Reset the entire prank to play again
function resetPrank() {
  isGlitched = false;
  isFloodActive = false;
  clearInterval(floodTimer);
  clearTimeout(floodDurationTimeout);
  desktopContainer.innerHTML = '';
  
  // Make sure freeze classes are removed
  document.body.classList.remove('freeze-cursor');
  loginContainer.classList.remove('browser-freeze');
  
  // Reset login button state
  btnSubmit.disabled = false;
  spinner.style.display = 'none';
  btnText.textContent = 'Log In & Watch Stream';
  
  // Clear input fields
  fakeLoginForm.reset();
  
  // Regenerate random banners
  renderRandomBanners();
  
  // Go back to phase 1
  warningContainer.classList.remove('active');
  jumpscareContainer.classList.remove('active');
  bsodContainer.classList.remove('active');
  desktopContainer.classList.remove('active');
  loginContainer.classList.add('active');
  
  // Restart auto-glitch timer
  startAutoGlitchTimer();
}

// ==========================================================================
// PARODY BANNER DATA & GENERATOR
// ==========================================================================
const bannerTemplates = [
  {
    styleClass: "jk-style-loki",
    htmlContent: `
      <img class="jk-bg-img" src="assets/p_loki.png" alt="Loki">
      <div class="jk-dark-overlay"></div>
      <div class="jk-content">
        <div class="jk-logo-header"><span class="pink">Loki</span> Games Connect</div>
        <div class="jk-loki-text-right-block">
          <div class="jk-loki-ja">私の配下になれ♡</div>
          <div class="jk-loki-en">BECOME MY<br>SUBORDINATE!</div>
        </div>
        <button class="jk-cta-btn">配下になる<br><span style="font-size:0.55rem; font-weight:normal; display:block; margin-top:1px;">Submit to Loki</span></button>
      </div>
      <div class="jk-bottom-ribbon">
        <span class="jk-disclaimer-text">※ゲーム本編では男性です / *Note: He is male in the main game.</span>
      </div>
    `
  },
  {
    styleClass: "jk-style-jeff",
    htmlContent: `
      <img class="jk-bg-img" src="assets/p_jeff.png" alt="Jeff the Land Shark">
      <div class="jk-dark-overlay"></div>
      <div class="jk-content">
        <div class="jk-logo-header"><span class="cyan">Jeff</span> Pet Connect</div>
        <div class="jk-caption-plate">WANT A CUTE<br>PET SHARK?</div>
        <button class="jk-cta-btn">FEED & ADOPT</button>
      </div>
      <div class="jk-bottom-ribbon">
        <span class="jk-disclaimer-text">*Requires 10 chimichangas daily. Adopt Jeff today!</span>
      </div>
    `
  },
  {
    styleClass: "jk-style-stark flash-red",
    htmlContent: `
      <div class="jk-content" style="justify-content: space-around;">
        <div class="jk-logo-header">STARK IND.</div>
        <div class="jk-reactor-core"></div>
        <div style="font-family: var(--font-sans); font-size: 0.8rem; font-weight: 800; color: #fff; text-shadow: 1px 1px 2px #000; text-align: center;">
          WE WANT YOU!<br>
          <span class="jk-stark-neon" style="font-size: 0.65rem;">INTERN WANTED</span>
        </div>
        <button class="jk-cta-btn" style="margin-bottom: 0;">Apply & Explode</button>
      </div>
      <div class="jk-bottom-ribbon">
        <span class="jk-disclaimer-text">※研究所の爆発生存率：45% (Lab explosion survival rate: 45%)</span>
      </div>
    `
  },
  {
    styleClass: "jk-style-bugle",
    htmlContent: `
      <img class="jk-bg-img" src="assets/p_bugle.png" alt="Spider-Man Press Conference">
      <div class="jk-dark-overlay" style="background: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 50%, rgba(0,0,0,0.6) 100%);"></div>
      
      <div class="ad-bugle-breaking-bar">BREAKING NEWS</div>
      <div class="ad-bugle-headline-plate">SPIDER-MAN RETIRES?!</div>

      <div class="jk-content" style="justify-content: space-between; padding-bottom: 25px;">
        <div class="jk-logo-header">BUGLE EXCLUSIVE</div>
        <button class="jk-cta-btn" style="margin-bottom: 0; background: #d32f2f; color: #fff; border-color: #fff; font-weight: 900; box-shadow: 3px 3px 0 #000; font-size: 0.72rem;">WATCH LIVE</button>
      </div>
      <div class="jk-bottom-ribbon" style="background-color: #111; border-top-color: #d32f2f;">
        <span class="jk-disclaimer-text">*Bugle Exclusive: Inside sources claim he is tired of swinging. J. Jonah Jameson says "Good Riddance!"</span>
      </div>
    `
  },
  {
    styleClass: "jk-style-chimichanga",
    htmlContent: `
      <div class="ad-chimi-grid">
        <img src="assets/ad_chimi_classic.png" alt="Classic">
        <img src="assets/ad_chimi_spicy.png" alt="Spicy">
        <img src="assets/ad_chimi_cheese.png" alt="Cheese">
        <img src="assets/ad_chimi_guac.png" alt="Guacamole">
      </div>
      <div class="jk-dark-overlay" style="background: rgba(0,0,0,0.15); z-index: 2;"></div>
      
      <div class="ad-chimi-center-plate">
        <div class="ad-chimi-tag">SPECIAL COLLAB</div>
        <div class="ad-chimi-main-title">SPICY & DELICIOUS CHIMICHANGAS!</div>
        <div class="ad-chimi-price">NOW $9.99 EACH!</div>
        <div class="ad-chimi-location">NEAR BROOKLYN SUBWAY</div>
      </div>

      <div class="jk-content" style="justify-content: flex-end; padding-bottom: 25px; z-index: 3; pointer-events: none;">
        <button class="jk-cta-btn" style="margin-bottom: 0; background: linear-gradient(to bottom, #ffeb3b 0%, #fbc02d 100%); color: #000; border-color: #000; font-weight: 900; box-shadow: 3px 3px 0 #000; font-size: 0.72rem; pointer-events: auto;">ORDER NOW!</button>
      </div>
      <div class="jk-bottom-ribbon" style="background-color: #e50914; border-top-color: #ffeb3b; z-index: 3;">
        <span class="jk-disclaimer-text">*Limited Time Only! Deadpool's special collab menu is now available.</span>
      </div>
    `
  },
  {
    styleClass: "jk-style-logan-new",
    htmlContent: `
      <img class="jk-bg-img" src="assets/p_logan.png" alt="Mutant Regrowth Tonic">
      <div class="jk-dark-overlay" style="background: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 60%, rgba(0,0,0,0.7) 100%);"></div>
      
      <div class="ad-logan-discount-plate">
        <div class="ad-logan-discount-title">50% OFF TODAY!</div>
        <div class="ad-logan-discount-sub">FREE SHIPPING WORLDWIDE!</div>
      </div>

      <div class="jk-content" style="justify-content: space-between; padding-bottom: 25px;">
        <div class="jk-logo-header">HEALING FACTOR AGA</div>
        <button class="jk-cta-btn" style="margin-bottom: 0; background: linear-gradient(to bottom, #ffeb3b 0%, #fbc02d 100%); color: #000; border-color: #000; font-weight: 900; box-shadow: 3px 3px 0 #000; font-size: 0.72rem;">CLAIM OFFER</button>
      </div>
      <div class="jk-bottom-ribbon" style="background-color: #111; border-top-color: #ffeb3b;">
        <span class="jk-disclaimer-text">*Warning: Healing factor formula may cause rapid hair growth. Logan certified product.</span>
      </div>
    `
  },
  {
    styleClass: "jk-style-strange",
    htmlContent: `
      <div class="jk-content" style="justify-content: space-around; background: #ffffff;">
        <div class="jk-logo-header" style="border-color: #e5c158; color: #b8912e; background: rgba(229, 193, 88, 0.08); font-size: 0.55rem; letter-spacing: 0.2px; padding: 4px 2px;">REPORT FROM DR. STRANGE</div>
        <div class="strange-logo-wrapper" style="text-align: center; margin: 3px 0;">
          <img class="jk-strange-logo-img" src="assets/p_strange.png" alt="Strange Emblem">
        </div>
        <div style="font-family: 'Fredoka', sans-serif; font-size: 0.72rem; font-weight: 800; color: #111; text-align: center; line-height: 1.35;">
          PREVENT DEMISE!<br>
          <span style="color: #c0392b; font-size: 0.52rem; display: block; margin-top: 3px; font-weight: 700; letter-spacing: 0.5px;">SANCTUM LIFE INSURANCE</span>
        </div>
        <button class="jk-cta-btn" style="margin-bottom: 0; background: #111; color: #fff; border-color: #111; box-shadow: 3px 3px 0 #000; font-size: 0.75rem; font-weight: 900;">ENLIST NOW</button>
      </div>
      <div class="jk-bottom-ribbon" style="background-color: #111; border-top-color: #e5c158;">
        <span class="jk-disclaimer-text">*Note: Demise in the Dark Dimension is not covered. Terms apply.</span>
      </div>
    `
  },
  {
    styleClass: "jk-style-widow",
    htmlContent: `
      <img class="jk-bg-img" src="assets/p_widow.png" alt="Black Widow">
      <div class="jk-dark-overlay" style="background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 60%, rgba(0,0,0,0.6) 100%);"></div>
      
      <div class="ad-widow-badge">LV.99 WIDOW</div>

      <div class="jk-content">
        <div class="jk-logo-header">LAST SURVIVAL: 3D</div>
        
        <div class="ad-widow-puzzle-box">
          <div class="ad-puzzle-fail-stamp">FAILED!</div>
          <div class="ad-puzzle-title">CHOOSE THE RIGHT WEAPON!</div>
          <div class="ad-puzzle-choices">
            <div class="ad-choice-btn fail">🔫 Lvl.1 Gun</div>
            <div class="ad-choice-btn">🪓 Lvl.99 Axe</div>
          </div>
        </div>

        <button class="jk-cta-btn" style="margin-bottom: 25px; background: linear-gradient(to bottom, #ffeb3b 0%, #fbc02d 100%); color: #000; border-color: #000; font-weight: 900; box-shadow: 3px 3px 0 #000;">PLAY FREE NOW</button>
      </div>
      <div class="jk-bottom-ribbon" style="background-color: #000; border-top-color: #4caf50;">
        <span class="jk-disclaimer-text">*Actual gameplay may vary from the advertisement. Strictly 18+.</span>
      </div>
    `
  }
];

function renderRandomBanners() {
  const bannerLeft = document.getElementById('banner-left');
  const bannerRight = document.getElementById('banner-right');
  
  if (!bannerLeft || !bannerRight) return;
  
  // Shuffle all templates
  const shuffled = [...bannerTemplates].sort(() => 0.5 - Math.random());
  
  const createBannerHTML = (data) => `
    <div class="parody-banner ${data.styleClass}">
      ${data.htmlContent}
    </div>
  `;
  
  // Detect mobile screen width
  const isMobile = window.innerWidth <= 1000;
  
  if (isMobile && shuffled.length >= 4) {
    // On mobile, show 2 banners on top (left container) and 2 banners on bottom (right container)
    // for a rich, spammy vertical scroll experience with 4 unique ads!
    bannerLeft.innerHTML = createBannerHTML(shuffled[0]) + createBannerHTML(shuffled[1]);
    bannerRight.innerHTML = createBannerHTML(shuffled[2]) + createBannerHTML(shuffled[3]);
  } else {
    // On PC, just show 1 banner on the left and 1 banner on the right
    bannerLeft.innerHTML = createBannerHTML(shuffled[0]);
    bannerRight.innerHTML = createBannerHTML(shuffled[1]);
  }
}

// ==========================================================================
// TRANSLATION DICTIONARY & LOGIC (i18n)
// ==========================================================================
const translations = {
  en: {
    badge: "FOOLED YOU!",
    title: "Did you get scared and cry to your mama?",
    speech: "「Relax. This is just a prank website. But seriously, it's not wise to log into untrusted links so easily. You wouldn't want persistent spicy ads plastered on your screen during a family gathering, would you?」",
    alertTitle: "🚨 Notice & Disclaimer",
    alertDesc: "",
    alertLi1: "This is a privately created joke fan website, and has no official connection to Marvel or NetEase.",
    alertLi2: "This site contains no malware or hacking tools. No personal information or credentials are saved or collected.",
    alertLi3: "This project is strictly a non-profit fan site with zero monetization.",
    helperTitle: "🎮 Share with Friends!",
    helperDesc: "Copy a parody link to prank your gaming group (they all redirect right here!):",
    copy: "Copy",
    copied: "Copied to clipboard! 💥",
    reset: "Try Again",
    creatorLabel: "Website Creator",
    creatorLink: "Follow on X (Twitter)"
  },
  ja: {
    badge: "騙されたな！",
    title: "びっくりしてママに泣きついちゃった？",
    speech: "「安心しな。これはジョークサイトだ。ただ、知らないサイトに簡単にアクセスするのはよくないぜ。ほら、エッチなバナー広告が画面から消えなくなって親と家族会議なんてしたくないだろ？」",
    alertTitle: "🚨 注意事項",
    alertDesc: "",
    alertLi1: "このサイトは個人で作成されたジョークサイトであり、マーベル公式には一切関係ありません。",
    alertLi2: "本サイトにはウイルスやハッキングに関するものはありません。個人情報などのデータの保存等されていませんのでご安心ください。",
    alertLi3: "本サイトはあくまでもファンサイトであり収益化等を一切行ってません。",
    helperTitle: "🎮 友達にシェアしよう！",
    helperDesc: "ゲーム仲間に送るためのパロディURLをコピーしよう（どれもここに転送されるぞ！）：",
    copy: "コピー",
    copied: "クリップボードにコピーしたぞ！💥",
    reset: "もう一度遊ぶ / リセット",
    creatorLabel: "サイト制作者",
    creatorLink: "ツイッターアカウントはこちら"
  },
  ko: {
    badge: "속았지!",
    title: "깜짝 놀라서 엄마 찾으며 울어버렸어?",
    speech: "「안심해, 이건 장난 사이트야. 하지만 출처를 모르는 링크에 그렇게 쉽게 로그인하는 건 좋지 않다고. 숭한 광고들이 화면에서 안 사라져서 온 가족 회의가 열리는 건 원치 않겠지?」",
    alertTitle: "🚨 주의사항",
    alertDesc: "",
    alertLi1: "이 사이트는 개인이 제작한 장난용 팬 사이트이며, 마블 공식과는 아무런 관계가 없습니다.",
    alertLi2: "본 사이트에는 바이러스나 해킹 도구가 포함되어 있지 않습니다. 개인정보 등은 전혀 저장되거나 전송되지 않으니 안심하세요.",
    alertLi3: "본 사이트는 순수 팬 사이트이며, 어떠한 수익화 활동도 하지 않습니다.",
    helperTitle: "🎮 친구들에게 공유하기!",
    helperDesc: "친구들을 낚을 수 있는 패러디 URL을 복사해 보세요 (모두 여기로 연결됩니다!):",
    copy: "복사",
    copied: "클립보드에 복사 완료! 💥",
    reset: "다시 하기 / 리셋",
    creatorLabel: "사이트 제작자",
    creatorLink: "트위터 계정은 여기"
  }
};

function initLanguage() {
  const langButtons = document.querySelectorAll('.btn-lang');
  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      switchLanguage(lang);
    });
  });
  
  // Detect browser language
  const browserLang = navigator.language || navigator.userLanguage || "en";
  let defaultLang = "en";
  if (browserLang.startsWith("ja")) {
    defaultLang = "ja";
  } else if (browserLang.startsWith("ko")) {
    defaultLang = "ko";
  }
  
  switchLanguage(defaultLang);
}

function switchLanguage(lang) {
  currentLang = lang;
  
  // Update button active state
  const langButtons = document.querySelectorAll('.btn-lang');
  langButtons.forEach(btn => {
    if (btn.getAttribute('data-lang') === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  const t = translations[lang];
  if (!t) return;
  
  document.getElementById('badge-text').textContent = t.badge;
  document.getElementById('header-title').textContent = t.title;
  document.getElementById('speech-text').innerHTML = t.speech;
  document.getElementById('alert-title').innerHTML = t.alertTitle;
  
  const alertDescElem = document.getElementById('alert-desc');
  alertDescElem.innerHTML = t.alertDesc;
  alertDescElem.style.display = t.alertDesc ? 'block' : 'none';

  document.getElementById('alert-li-1').innerHTML = t.alertLi1;
  document.getElementById('alert-li-2').innerHTML = t.alertLi2;
  document.getElementById('alert-li-3').innerHTML = t.alertLi3;
  document.getElementById('helper-title').innerHTML = t.helperTitle;
  document.getElementById('helper-desc').innerHTML = t.helperDesc;
  document.getElementById('creator-label-text').textContent = t.creatorLabel;
  document.getElementById('creator-follow-text').textContent = t.creatorLink;
  
  // Update copy buttons text
  btnCopyTwitch.textContent = t.copy;
  btnCopyRivals.textContent = t.copy;
  
  // Update reset button text
  btnReset.textContent = t.reset;
}
