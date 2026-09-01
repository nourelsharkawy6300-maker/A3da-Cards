'use strict';

/**
 * main.js
 * ------------------------------------------------------------------
 * The only file that touches DOM event listeners. It calls into
 * state.js to change data and ui.js to reflect it — it holds no
 * business rules of its own (see state.js for the 3-player lock and
 * scan-to-unlock logic).
 * ------------------------------------------------------------------
 */

import {
  state,
  subscribe,
  setHostName,
  createRoom,
  addPlayer,
  removePlayer,
  canStartGame,
  markUnlocked,
} from './state.js';

import { showScreen, renderLobby } from './ui.js';
import { startScan, stopScan } from './scanner.js';

// Re-render the lobby screen's contents any time state changes,
// regardless of whether it's currently visible.
subscribe(renderLobby);

/* ===== Home -> Host Name ===== */

document.getElementById('btnCreateRoom').addEventListener('click', () => {
  showScreen('screen-host-name');
});

/* ===== Host Name screen ===== */

const hostNameInput = document.getElementById('hostNameInput');
const btnConfirmHostName = document.getElementById('btnConfirmHostName');

hostNameInput.addEventListener('input', () => {
  btnConfirmHostName.disabled = hostNameInput.value.trim().length === 0;
});

hostNameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !btnConfirmHostName.disabled) btnConfirmHostName.click();
});

btnConfirmHostName.addEventListener('click', () => {
  setHostName(hostNameInput.value);
  createRoom();
  showScreen('screen-lobby');
});

/* ===== Lobby screen: add / remove players ===== */

const playerNameInput = document.getElementById('playerNameInput');
const btnAddPlayer = document.getElementById('btnAddPlayer');

function handleAddPlayer() {
  addPlayer(playerNameInput.value);
  playerNameInput.value = '';
  playerNameInput.focus();
}

btnAddPlayer.addEventListener('click', handleAddPlayer);

playerNameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleAddPlayer();
});

// Event delegation for remove buttons, since rows are re-rendered often.
document.getElementById('playersList').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-remove-id]');
  if (btn) removePlayer(btn.dataset.removeId);
});

/* ===== Back navigation ===== */

document.querySelectorAll('[data-action="back-to-home"]').forEach((btn) => {
  btn.addEventListener('click', () => showScreen('screen-home'));
});

document.querySelectorAll('[data-action="back-to-lobby"]').forEach((btn) => {
  btn.addEventListener('click', () => {
    // NAVIGATION SAFETY: stop the camera stream before leaving the scan
    // screen, and detach it from the <video> element too — otherwise the
    // element can briefly show a frozen last frame if the host re-opens
    // the scan screen later.
    stopScan();
    const videoEl = document.getElementById('scanVideo');
    videoEl.srcObject = null;
    showScreen('screen-lobby');
  });
});

// NAVIGATION SAFETY (defense in depth): if the host backgrounds the tab,
// switches apps, or closes/reloads the page while the scan screen is
// active, make sure the camera stream is released rather than left
// running invisibly. pagehide covers tab close/reload; visibilitychange
// covers switching away without closing.
window.addEventListener('pagehide', stopScan);
document.addEventListener('visibilitychange', () => {
  if (document.hidden && !document.getElementById('screen-scan').hidden) {
    stopScan();
  }
});

/* ===== Lobby -> Scan -> Game ===== */

document.getElementById('btnStartGame').addEventListener('click', () => {
  // Defensive check — the button is already disabled by renderLockState(),
  // but the guard lives here too since this is the action that matters.
  if (!canStartGame()) return;

  showScreen('screen-scan');

  const videoEl = document.getElementById('scanVideo');
  const statusEl = document.getElementById('scanStatus');
  statusEl.textContent = 'جاري تشغيل الكاميرا...';

  startScan({
    videoEl,
    onSuccess: () => {
      // THE UNLOCK: the scoreboard/game screen only becomes reachable
      // after this callback fires from a successful QR read.
      markUnlocked();
      showScreen('screen-game');
    },
    onError: (reason) => {
      const messages = {
        'camera-unsupported': 'الكاميرا مش متاحة على الجهاز ده.',
        'detector-unsupported': 'المتصفح ده مش بيدعم قراءة QR. جرّب كروم أو حدّث المتصفح.',
        'camera-denied': 'محتاجين إذن الكاميرا عشان نكمل. اسمح بالوصول من إعدادات المتصفح.',
      };
      statusEl.textContent = messages[reason] || 'حصلت مشكلة في تشغيل الكاميرا.';
    },
  });
});

/* ===== Initial paint ===== */

renderLobby(state);
