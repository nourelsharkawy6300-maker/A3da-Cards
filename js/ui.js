'use strict';

/**
 * ui.js
 * ------------------------------------------------------------------
 * Pure rendering. This file reads state and writes to the DOM — it
 * never mutates state.js directly and never talks to the camera.
 * Add a new screen by adding a <section data-screen> in index.html
 * and a showScreen('your-id') call from main.js; you don't need to
 * touch this file's internals unless that screen needs its own
 * render function.
 * ------------------------------------------------------------------
 */

import { MIN_PLAYERS_TO_START } from './state.js';

const screens = document.querySelectorAll('[data-screen]');

/** @param {string} id */
function showScreen(id) {
  screens.forEach((s) => {
    s.hidden = s.id !== id;
  });
}

/** Minimal escaping since player names are inserted via innerHTML. */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * @param {import('./state.js').Player} player
 * @returns {HTMLLIElement}
 */
function renderPlayerRow(player) {
  const li = document.createElement('li');
  li.className = 'players-list__row';

  li.innerHTML = `
    <span class="players-list__name">${escapeHtml(player.name)}</span>
    ${player.isHost ? '<span class="players-list__badge">فاتح القعدة</span>' : ''}
    ${!player.isHost ? `<button type="button" class="players-list__remove" data-remove-id="${player.id}" aria-label="حذف اللاعب">✕</button>` : ''}
  `;

  return li;
}

/** @param {typeof import('./state.js').state} state */
function renderLockState(state) {
  const remaining = MIN_PLAYERS_TO_START - state.players.length;
  const lockMessage = document.getElementById('lockMessage');
  const btnStartGame = document.getElementById('btnStartGame');

  if (remaining > 0) {
    lockMessage.textContent =
      remaining === 1
        ? 'أضف لاعب واحد على الأقل عشان تقدر تبدأ'
        : `أضف ${remaining} لاعبين على الأقل عشان تقدر تبدأ`;
    lockMessage.hidden = false;
    btnStartGame.disabled = true;
  } else {
    lockMessage.hidden = true;
    btnStartGame.disabled = false;
  }
}

/** @param {typeof import('./state.js').state} state */
function renderLobby(state) {
  document.getElementById('pinValue').textContent = state.pin ?? '--';

  const list = document.getElementById('playersList');
  list.innerHTML = '';
  state.players.forEach((player) => list.appendChild(renderPlayerRow(player)));

  document.getElementById('playersCount').textContent = String(state.players.length);

  renderLockState(state);
}

export { showScreen, renderLobby };
