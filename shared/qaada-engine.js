// /shared/qaada-engine.js
// Qaada — deterministic PIN-seeded card/character assignment engine.
// Pure math + storage only. No DOM access lives here.

export const TOTAL_CARDS = 18;

// Fixed roster — same order must never change. Must total exactly 18.
export const CHARACTERS = [
  "اليوتيوبر", "الدكتور", "المهندس", "الممثل",
  "المطرب", "لاعب الكرة", "المدرس", "رجل الأعمال",
  "الشيف", "الضابط", "سائق التاكسي", "المؤثر",
  "الكوميديان", "الفنان", "السياسي", "الرياضي",
  "الطيار", "الطالب"
]; // swap in your real 18 names — order is arbitrary but must be stable

// ---------- Seeded PRNG (mulberry32) ----------
export function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- Seeded Fisher-Yates shuffle — true permutation, no dupes ----------
export function seededShuffle(array, seed) {
  const rand = mulberry32(seed);
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getShuffledCharacters(pin) {
  const pinNum = Number(pin);
  const seed = (pinNum * 2654435761) ^ 0x9E3779B9; // scrambles adjacent PINs
  return seededShuffle(CHARACTERS, seed);
}

export function getCharacterForCard(pin, cardId) {
  return getShuffledCharacters(pin)[cardId - 1]; // cardId is 1-indexed
}

// ---------- Validation ----------
export function parseCardId(raw) {
  if (raw === null || raw === undefined) return null;
  const str = String(raw).trim();
  if (!/^\d+$/.test(str)) return null;
  const n = parseInt(str, 10);
  return (n >= 1 && n <= TOTAL_CARDS) ? n : null;
}

export function isValidPin(raw) {
  return /^\d{1,2}$/.test(String(raw).trim());
}

export function normalizePin(raw) {
  return String(raw).trim().padStart(2, "0");
}

export function generateNewPin() {
  return String(Math.floor(Math.random() * 100)).padStart(2, "0");
}

// ---------- PIN persistence (the ONLY shared game state) ----------
const PIN_KEY = "qaada_game_pin";

export function savePin(pin) { localStorage.setItem(PIN_KEY, pin); }
export function loadPin() { return localStorage.getItem(PIN_KEY); }
export function clearPin() { localStorage.removeItem(PIN_KEY); }

// ---------- Cleanup of legacy anti-cheat keys ----------
// The old system used to lock cards after one scan. This scrubs any of
// that leftover state WITHOUT touching qaada_game_pin, so a fresh scan
// is never blocked — while the shuffle stays stable for the whole game.
const LEGACY_KEYS = ["qaada_scanned_cards", "qaada_used_cards", "qaada_cheat_flag"];
export function clearLegacyAntiCheatState() {
  LEGACY_KEYS.forEach(k => localStorage.removeItem(k));
}
