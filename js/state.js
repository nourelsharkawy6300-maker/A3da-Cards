'use strict';

/**
 * state.js
 * ------------------------------------------------------------------
 * The single source of truth for the lobby flow. Nothing in ui.js,
 * scanner.js, or main.js mutates this object directly — they all go
 * through the exported functions below, and get notified of changes
 * via subscribe(). This keeps the "3-player lock" and "must scan to
 * unlock" rules enforced in exactly one place, no matter how many
 * screens later read from them.
 * ------------------------------------------------------------------
 */

export const MIN_PLAYERS_TO_START = 3;

/** @typedef {{ id: string, name: string, isHost: boolean }} Player */

/** @type {{ hostName: string, pin: string|null, players: Player[], isUnlocked: boolean }} */
const state = {
  hostName: '',
  pin: null,
  players: [],
  isUnlocked: false,
};

const listeners = new Set();

/**
 * @param {(state: typeof state) => void} fn
 * @returns {() => void} unsubscribe function
 */
function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  listeners.forEach((fn) => fn(state));
}

function generateId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Generates the 2-digit room PIN (10–99). Kept as a plain string so it
 * renders with no risk of losing a leading value and is easy to compare
 * against user input later.
 */
function generatePin() {
  return String(Math.floor(Math.random() * 90) + 10);
}

/** @param {string} name */
function setHostName(name) {
  state.hostName = name.trim();
  notify();
}

/**
 * Creates the room: generates the PIN and seeds the player list with
 * the host as player #1.
 */
function createRoom() {
  state.pin = generatePin();
  state.players = [{ id: 'host', name: state.hostName, isHost: true }];
  notify();
}

/** @param {string} name */
function addPlayer(name) {
  const trimmed = name.trim();
  if (!trimmed) return;

  state.players.push({
    id: generateId('p'),
    name: trimmed,
    isHost: false,
  });
  notify();
}

/** @param {string} playerId */
function removePlayer(playerId) {
  state.players = state.players.filter((p) => p.id !== playerId || p.isHost);
  notify();
}

/**
 * THE LOCK (requirement #3): the host cannot proceed past the lobby
 * until at least MIN_PLAYERS_TO_START players (host included) are in
 * the list. This is the single check every caller must use — the
 * "start" button's disabled state and the click handler both defer
 * to this function rather than duplicating the threshold.
 */
function canStartGame() {
  return state.players.length >= MIN_PLAYERS_TO_START;
}

/**
 * THE UNLOCK (requirement #4): flips only after scanner.js reports a
 * successful QR read. Nothing else in the app should set this flag.
 */
function markUnlocked() {
  state.isUnlocked = true;
  notify();
}

function resetRoom() {
  state.hostName = '';
  state.pin = null;
  state.players = [];
  state.isUnlocked = false;
  notify();
}

export {
  state,
  subscribe,
  setHostName,
  createRoom,
  addPlayer,
  removePlayer,
  canStartGame,
  markUnlocked,
  resetRoom,
};
