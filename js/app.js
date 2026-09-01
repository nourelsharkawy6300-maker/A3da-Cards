document.addEventListener('contextmenu', event => event.preventDefault());

const CHARACTER_SLOTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
let html5QrCode = null;

// حالة اللعبة (State)
let currentPlayers = [];
let evaluatedThisRound = []; // المصفوفة السحرية لمنع التكرار
let currentRound = 1;

const funnyQuotes = [
    "يا ترى هتطلع أم خالد ولا إياد الموجي؟ 👀",
    "استرها علينا يارب من كارت الدبيس... 💸",
    "جهز نفسك لتقليد الدكتور! 👨‍🏫",
    "يا ساتر.. شكلها فيها كارت قفلنا المايك 🤐",
    "اسحب كارتك وواجه مصيرك يا معلم! ⚡"
];

/* --- محرك اللخبطة --- */
function mulberry32(seed) {
    return function () {
        seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
function seededShuffle(array, seed) {
    const rand = mulberry32(seed);
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
function getImageNumberForCard(pin, cardId) {
    const seed = (Number(pin) * 2654435761) ^ 0x9E3779B9;
    return seededShuffle(CHARACTER_SLOTS, seed)[cardId - 1];
}
function parseCardId(raw) {
    if (!raw) return null;
    const str = String(raw).trim();
    if (!/^\d+$/.test(str)) return null;
    const n = parseInt(str, 10);
    return (n >= 1 && n <= 18) ? n : null;
}

/* --- إدارة الذاكرة --- */
function savePin(pin) { localStorage.setItem("qaada_game_pin", pin); }
function loadPin() { return localStorage.getItem("qaada_game_pin"); }
function clearData() { 
    localStorage.removeItem("qaada_game_pin");
    localStorage.removeItem("qaada_is_host");
    localStorage.removeItem("qaada_players");
    localStorage.removeItem("qaada_round");
    localStorage.removeItem("qaada_evaluated");
}
function saveData() { 
    localStorage.setItem("qaada_players", JSON.stringify(currentPlayers)); 
    localStorage.setItem("qaada_round", currentRound.toString());
    localStorage.setItem("qaada_evaluated", JSON.stringify(evaluatedThisRound));
}
function loadData() { 
    currentPlayers = JSON.parse(localStorage.getItem("qaada_players")) || []; 
    currentRound = parseInt(localStorage.getItem("qaada_round")) || 1;
    evaluatedThisRound = JSON.parse(localStorage.getItem("qaada_evaluated")) || [];
}

function hideAllStates() {
    document.querySelectorAll('.game-state').forEach(el => el.style.display = 'none');
}

/* --- نظام المعلم --- */
function initHost() {
    clearData();
    const newPin = String(Math.floor(Math.random() * 100)).padStart(2, "0");
    savePin(newPin);
    localStorage.setItem("qaada_is_host", "true");
    currentPlayers = [];
    evaluatedThisRound = [];
    currentRound = 1;
    saveData();
    
    hideAllStates();
    document.getElementById("new-room-pin").innerText = newPin;
    document.getElementById("players-list-setup").innerHTML = "";
    document.getElementById("host-setup").style.display = "block";
}

function addPlayer() {
    const input = document.getElementById("playerNameInput");
    const name = input.value.trim();
    if(name.length > 0) {
        currentPlayers.push({ id: 'p_' + Date.now(), name: name, score: 0 });
        saveData();
        input.value = "";
        
        const ul = document.getElementById("players-list-setup");
        ul.innerHTML = "";
        currentPlayers.forEach(p => {
            ul.innerHTML += `<li class="player-row" style="padding: 10px;"><div class="player-row__name">${p.name}</div></li>`;
        });
    }
}

function startScoreboard() {
    if(currentPlayers.length === 0) { alert("أضف لاعب واحد على الأقل!"); return; }
    hideAllStates();
    renderScoreboard();
    document.getElementById("scoreboard-state").style.display = "block";
}

function getRoundDetails() {
    if(currentRound === 1) return { title: "مواقف", pts: 5 };
    if(currentRound === 2) return { title: "أكشن", pts: 10 };
    if(currentRound === 3) return { title: "حاسب", pts: 5 };
    return { title: "النهاية", pts: 0 };
}

// 🚨 الكلين كود: إخفاء الأزرار وإظهار البادج للمقفلين
function renderScoreboard() {
    const details = getRoundDetails();
    document.getElementById("round-title-display").innerText = details.title;
    document.getElementById("roundNumber").innerText = currentRound;
    
    const container = document.getElementById("scoreboard-container");
    container.innerHTML = "";
    
    currentPlayers.forEach((player, index) => {
        const isLocked = evaluatedThisRound.includes(index);
        let actionsHTML = "";

        if (isLocked) {
            const isCorrect = player.lastEvalCorrect;
            actionsHTML = `
                <div class="player-row__actions">
                    <span class="eval-badge ${isCorrect ? 'eval-badge--correct' : 'eval-badge--wrong'}">
                        ${isCorrect ? '✅' : '❌'} تم التقييم
                    </span>
                </div>
            `;
        } else {
            actionsHTML = `
                <div class="player-row__actions">
                    <button class="eval-btn eval-btn--correct" onclick="evaluatePlayer(${index}, true)">✅</button>
                    <button class="eval-btn eval-btn--wrong" onclick="evaluatePlayer(${index}, false)">❌</button>
                </div>
            `;
        }

        container.innerHTML += `
            <li class="player-row">
                <div class="player-row__info">
                    <span class="player-row__name">${player.name}</span>
                    <span class="player-row__score" style="margin-right: auto; margin-left: 10px;">${player.score}</span>
                </div>
                ${actionsHTML}
            </li>
        `;
    });
}

// 🚨 التأمين الإضافي لعدم التكرار
function evaluatePlayer(index, isSuccess) {
    if (evaluatedThisRound.includes(index)) return; // مستحيل يقيم مرتين

    const currentPts = getRoundDetails().pts;
    currentPlayers[index].score += isSuccess ? currentPts : -currentPts;
    currentPlayers[index].lastEvalCorrect = isSuccess;
    
    evaluatedThisRound.push(index); // القفل
    saveData();
    renderScoreboard();
}

function nextRound() {
    if (currentRound >= 3) {
        finishGame();
    } else {
        currentRound++;
        evaluatedThisRound = []; // فتح الأقفال للراوند الجديد
        saveData();
        renderScoreboard();
        if(currentRound === 3) document.getElementById("next-round-btn").innerText = "إنهاء اللعبة";
    }
}

function finishGame() {
    hideAllStates();
    let sortedPlayers = [...currentPlayers].sort((a, b) => b.score - a.score);
    document.getElementById("winner-display").innerText = `🥇 ${sortedPlayers[0].name} (${sortedPlayers[0].score} نقطة)`;
    document.getElementById("loser-display").innerText = `☠️ ${sortedPlayers[sortedPlayers.length - 1].name} (${sortedPlayers[sortedPlayers.length - 1].score} نقطة)`;
    document.getElementById("final-result-state").style.display = "block";
}

/* --- نظام اللاعبين --- */
function showJoinScreen() { hideAllStates(); document.getElementById('lobby-join').style.display = 'block'; }

function joinGame() {
    const pinRaw = document.getElementById('pin-input-field').value;
    if(!/^\d{1,2}$/.test(pinRaw.trim())) { document.getElementById('join-error').textContent = 'أدخل كود صحيح.'; return; }
    
    clearData(); 
    savePin(pinRaw.trim().padStart(2, "0"));
    localStorage.setItem("qaada_is_host", "false"); 
    openScanner();
}

function openScanner() {
    hideAllStates();
    document.getElementById('scanner-state').style.display = 'block';
    if(!html5QrCode) { html5QrCode = new Html5Qrcode("reader"); }
    html5QrCode.start(
        { facingMode: "environment" }, { fps: 15, qrbox: { width: 250, height: 250 } },
        onScanSuccess, (e) => {}
    ).catch(err => {
        html5QrCode.start({ facingMode: "user" }, { fps: 15, qrbox: { width: 250, height: 250 } }, onScanSuccess, (e)=>{});
    });
}

const meQrBypass = {
    "https://q.me-qr.com/a3fxd10w": "?id=1", "https://q.me-qr.com/v32kajn6": "?id=2", "https://q.me-qr.com/tnz5fn8w": "?id=3",
    "https://q.me-qr.com/75t883gh": "?id=4", "https://q.me-qr.com/vrgdgaat": "?id=5", "https://q.me-qr.com/1bt4w6k3": "?id=6",
    "https://q.me-qr.com/lzj8sobk": "?id=7", "https://q.me-qr.com/gertcxy1": "?id=8", "https://q.me-qr.com/o9h7x2to": "?id=9",
    "https://q.me-qr.com/pllxlcji": "?id=10", "https://q.me-qr.com/vsi4olis": "?id=11", "https://q.me-qr.com/39949qq8": "?id=12",
    "https://q.me-qr.com/ykmrvd8e": "?id=13", "https://q.me-qr.com/ysw5jpux": "?id=14", "https://q.me-qr.com/vr7a52pb": "?id=15",
    "https://q.me-qr.com/dgd0165e": "?id=16", "https://q.me-qr.com/j4bv25ov": "?id=17", "https://q.me-qr.com/px8s6n9q": "?id=18"
};

function onScanSuccess(decodedText, decodedResult) {
    let scannedLink = decodedText.trim();
    let cleanTarget = meQrBypass[scannedLink] ? meQrBypass[scannedLink] : scannedLink;
    html5QrCode.stop().then(() => { window.location.replace(cleanTarget); }).catch(() => { window.location.replace(cleanTarget); });
}

function loadCardForId(rawCardId, pin) {
    hideAllStates();
    document.getElementById('loading-state').style.display = 'block';
    document.getElementById('random-quote').innerText = funnyQuotes[Math.floor(Math.random() * funnyQuotes.length)];
    
    const cardId = parseCardId(rawCardId);
    if (!cardId) { leaveRoom(); return; }

    const imageNumber = getImageNumberForCard(pin, cardId);
    const mainImg = document.getElementById('game-card-img');
    mainImg.onload = function() {
        setTimeout(() => {
            document.getElementById('loading-state').style.display = 'none';
            document.getElementById('card-display-state').style.display = 'block';
        }, 1800); 
    };
    mainImg.src = `cards/${imageNumber}.jpg`;
}

function scanAgain() {
    const url = new URL(window.location);
    url.searchParams.delete('id');
    window.history.replaceState({}, "", url);
    openScanner();
}

function closeCard() {
    const isHost = localStorage.getItem("qaada_is_host");
    const url = new URL(window.location);
    url.searchParams.delete('id');
    window.history.replaceState({}, "", url);
    if(html5QrCode) { html5QrCode.stop().catch(()=>{}); }

    if (isHost === "true") {
        hideAllStates();
        document.getElementById('scoreboard-state').style.display = 'block';
    } else {
        leaveRoom();
    }
}

function cancelScan() {
    if(html5QrCode) { html5QrCode.stop().catch(()=>{}); }
    closeCard();
}

function leaveRoom() {
    clearData();
    if(html5QrCode) { html5QrCode.stop().catch(()=>{}); }
    const url = new URL(window.location);
    url.searchParams.delete('id');
    window.history.replaceState({}, "", url);
    hideAllStates();
    document.getElementById('lobby-home').style.display = 'block';
}

/* --- الفتح الصارم --- */
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const cardIdRaw = urlParams.get('id');
    const pin = loadPin();
    const isHost = localStorage.getItem("qaada_is_host");

    hideAllStates();

    if (cardIdRaw) {
        if (pin) loadCardForId(cardIdRaw, pin);
        else document.getElementById('lobby-home').style.display = 'block';
        return;
    } 
    
    if (isHost === "true" && pin) {
        loadData();
        if (currentPlayers.length > 0 && currentRound <= 3) {
            renderScoreboard();
            if(currentRound === 3) document.getElementById("next-round-btn").innerText = "إنهاء اللعبة";
            document.getElementById('scoreboard-state').style.display = 'block';
        } else if (currentRound > 3) {
            finishGame();
        } else {
            document.getElementById("new-room-pin").innerText = pin;
            document.getElementById('host-setup').style.display = 'block';
        }
    } else {
        clearData();
        document.getElementById('lobby-home').style.display = 'block';
    }
};

