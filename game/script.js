// /game/script.js
import {
  getCharacterForCard,
  parseCardId,
  isValidPin,
  normalizePin,
  generateNewPin,
  savePin,
  loadPin,
  clearPin,
  clearLegacyAntiCheatState
} from "../shared/qaada-engine.js";

// ---------- Screen management ----------
const screens = {
  home: document.getElementById("screen-home"),
  join: document.getElementById("screen-join"),
  host: document.getElementById("screen-host"),
  scanner: document.getElementById("screen-scanner"),
  result: document.getElementById("screen-result"),
};

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[name].classList.add("active");
}

// ---------- QR Scanner (html5-qrcode, loaded globally via CDN in index.html) ----------
let scannerInstance = null;
let isScanning = false;

function startScanner() {
  showScreen("scanner");
  document.getElementById("scan-error").textContent = "";

  scannerInstance = new Html5Qrcode("qr-reader");
  isScanning = true;

  scannerInstance
    .start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 220, height: 220 } },
      onScanSuccess,
      () => { /* per-frame "no QR found" — safe to ignore */ }
    )
    .catch((err) => {
      document.getElementById("scan-error").textContent =
        "Couldn't access the camera. Check permissions and try again.";
      console.error("Camera start failed:", err);
    });
}

function stopScanner() {
  if (scannerInstance && isScanning) {
    isScanning = false;
    scannerInstance
      .stop()
      .then(() => scannerInstance.clear())
      .catch(() => { /* already stopped */ });
  }
  scannerInstance = null;
}

function onScanSuccess(decodedText) {
  if (!isScanning) return; // guard against duplicate fires from one frame
  isScanning = false;

  const cardId = extractCardId(decodedText);
  stopScanner();

  // Wipe leftover anti-cheat/scan-lock keys from the old system.
  // Deliberately does NOT touch qaada_game_pin — the PIN must persist
  // across every scan, or later cards would remap mid-game.
  clearLegacyAntiCheatState();

  if (!cardId) {
    document.getElementById("scan-error").textContent =
      "That QR code isn't a valid Qaada card.";
    showScreen("scanner");
    return;
  }

  revealCard(cardId);
}

// نسخة أقوى: بتدور على "id=" جوه أي صيغة نص — رقم، رابط كامل، أو query ناقصة
function extractCardId(decodedText) {
  const trimmed = decodedText.trim();

  // الحالة 1: النص رقم بس، مثلاً "5"
  if (/^\d+$/.test(trimmed)) {
    return parseCardId(trimmed);
  }

  // الحالة 2: النص فيه "id=" في أي مكان — سواء رابط كامل أو query ناقصة
  // بيمسك id=5 من: "https://site.com/?id=5" أو "?id=5" أو "id=5" أو حتى "game/index.html?id=5"
  const match = trimmed.match(/[?&]?id=(\d+)/i);
  if (match) {
    return parseCardId(match[1]);
  }

  return null;
}

// ---------- Card reveal ----------
function revealCard(cardId) {
  const pin = loadPin();
  const character = getCharacterForCard(pin, cardId);

  document.getElementById("result-card-id").textContent = cardId;
  document.getElementById("result-character").textContent = character;
  const img = document.getElementById("result-card-image");
  img.src = `../cards/${cardId}.jpg`;
  img.alt = `Card ${cardId}`;

  showScreen("result");
}

// ---------- Button wiring ----------
document.getElementById("btn-new-game").addEventListener("click", () => {
  const pin = generateNewPin();
  savePin(pin);
  document.getElementById("host-pin-num").textContent = pin;
  showScreen("host");
});

document.getElementById("btn-show-join").addEventListener("click", () => showScreen("join"));
document.getElementById("btn-back-from-join").addEventListener("click", () => showScreen("home"));

document.getElementById("btn-join").addEventListener("click", () => {
  const raw = document.getElementById("pin-input").value.trim();
  const errorEl = document.getElementById("join-error");

  if (!isValidPin(raw)) {
    errorEl.textContent = "Enter a valid 2-digit PIN.";
    return;
  }
  errorEl.textContent = "";
  savePin(normalizePin(raw));
  startScanner();
});

document.getElementById("btn-host-continue").addEventListener("click", startScanner);

document.getElementById("btn-host-new").addEventListener("click", () => {
  clearPin();
  showScreen("home");
});

document.getElementById("btn-cancel-scan").addEventListener("click", () => {
  stopScanner();
  showScreen(loadPin() ? "host" : "home");
});

// Legitimate-rescan path: the scanner is fully torn down and recreated
// each time, so there's no residual state that could block the next scan.
document.getElementById("btn-scan-again").addEventListener("click", startScanner);

document.getElementById("btn-leave-game").addEventListener("click", () => {
  clearPin();
  clearLegacyAntiCheatState();
  showScreen("home");
});

// ---------- Boot ----------
(function boot() {
  const pin = loadPin();
  showScreen(pin ? "host" : "home");
  if (pin) document.getElementById("host-pin-num").textContent = pin;
})();
