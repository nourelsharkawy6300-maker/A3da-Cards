document.addEventListener('contextmenu', event => event.preventDefault());

const CHARACTER_SLOTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
let html5QrCode = null;
let currentPlayers = [];

// الجمل المضحكة من كودك
const funnyQuotes = [
    "يا ترى هتطلع أم خالد ولا إياد الموجي؟ 👀",
    "استرها علينا يارب من كارت الدبيس... 💸",
    "جهز نفسك لتقليد الدكتور! 👨‍🏫",
    "يا ساتر.. شكلها فيها كارت قفلنا المايك 🤐",
    "اسحب كارتك وواجه مصيرك يا معلم! ⚡"
];

// محرك اللخبطة
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

function hideAllStates() {
    document.querySelectorAll('.game-state').forEach(el => el.style.display = 'none');
}

// ---------------- نظام المعلم ----------------
function initHost() {
    const newPin = String(Math.floor(Math.random() * 100)).padStart(2, "0");
    localStorage.setItem("qaada_game_pin", newPin);
    localStorage.setItem("qaada_is_host", "true");
    currentPlayers = [];
    savePlayers();
    
    hideAllStates();
    document.getElementById("new-room-pin").innerText = newPin;
    document.getElementById("players-list").innerHTML = "";
    document.getElementById("host-setup").style.display = "block";
    if(typeof gtag === 'function') { gtag('event', 'new_game_created'); }
}

function addPlayer() {
    const input = document.getElementById("player-name-input");
    const name = input.value.trim();
    if(name.length > 0) {
        currentPlayers.push({ name: name, score: 0 });
        savePlayers();
        input.value = "";
        const li = document.createElement("li");
        li.innerText = name;
        document.getElementById("players-list").appendChild(li);
    }
}

function startScoreboard() {
    if(currentPlayers.length === 0) { alert("يا معلم ضيف لاعب واحد على الأقل!"); return; }
    hideAllStates();
    document.getElementById("active-pin-display").innerText = localStorage.getItem("qaada_game_pin");
    renderScoreboard();
    document.getElementById("scoreboard-state").style.display = "block";
}

function renderScoreboard() {
    const container = document.getElementById("scoreboard-container");
    container.innerHTML = "";
    currentPlayers.forEach((player, index) => {
        container.innerHTML += `
            <div class="score-row">
                <div class="score-name">${player.name}</div>
                <div class="score-btns">
                    <button class="score-btn plus" onclick="updateScore(${index}, 1)">✅</button>
                    <button class="score-btn minus" onclick="updateScore(${index}, -1)">❌</button>
                </div>
                <div class="score-num">${player.score}</div>
            </div>
        `;
    });
}

function updateScore(index, value) {
    currentPlayers[index].score += value;
    savePlayers();
    renderScoreboard();
}

function savePlayers() { localStorage.setItem("qaada_players", JSON.stringify(currentPlayers)); }
function loadPlayers() { currentPlayers = JSON.parse(localStorage.getItem("qaada_players")) || []; }

// ---------------- نظام اللاعبين ----------------
function showJoin() { hideAllStates(); document.getElementById('lobby-join').style.display = 'block'; }

function joinGame() {
    const pinRaw = document.getElementById('pin-input-field').value;
    const errorEl = document.getElementById('join-error');
    if(!/^\d{1,2}$/.test(pinRaw.trim())) { errorEl.textContent = 'دخل بين مكون من رقمين صحيح.'; return; }
    
    errorEl.textContent = '';
    const pin = pinRaw.trim().padStart(2, "0");
    localStorage.setItem("qaada_game_pin", pin);
    localStorage.setItem("qaada_is_host", "false"); 
    if(typeof gtag === 'function') { gtag('event', 'game_joined'); }
    openScanner();
}

function openScanner() {
    hideAllStates();
    document.getElementById('scanner-state').style.display = 'block';
    if(!html5QrCode) { html5QrCode = new Html5Qrcode("reader"); }
    html5QrCode.start(
        { facingMode: "environment" }, { fps: 15, qrbox: { width: 250, height: 250 } },
        onScanSuccess, (error) => { /* صامت */ }
    ).catch(err => {
        html5QrCode.start({ facingMode: "user" }, { fps: 15, qrbox: { width: 250, height: 250 } }, onScanSuccess, (e)=>{});
    });
}

// كمين الـ me-qr (من كودك)
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
    
    // الجملة المضحكة
    document.getElementById('random-quote').innerText = funnyQuotes[Math.floor(Math.random() * funnyQuotes.length)];
    
    const cardId = parseInt(rawCardId, 10);
    if (!cardId || cardId < 1 || cardId > 18) { showError(); return; }

    const imageNumber = getImageNumberForCard(pin, cardId);
    const mainImg = document.getElementById('game-card-img');

    mainImg.onerror = function() { showError(); };
    mainImg.onload = function() {
        setTimeout(() => {
            document.getElementById('loading-state').style.display = 'none';
            document.getElementById('card-display-state').style.display = 'block';
            if(typeof gtag === 'function') { gtag('event', 'card_opened', { 'card_id': cardId }); }
        }, 2000); 
    };

    mainImg.src = `cards/${imageNumber}.jpg`;
}

function closeCard() {
    const url = new URL(window.location);
    url.searchParams.delete('id');
    window.history.replaceState({}, "", url);
    openScanner(); // نرجعه للكاميرا فوراً عشان يكمل لعب
}

function showError() {
    hideAllStates();
    document.getElementById('content-box').innerHTML += `
        <div style="font-size: 50px; margin-bottom: 15px;">⚠️</div>
        <h2>الكارت غير موجود</h2>
        <div class="reset-link" onclick="resetGame()">ابدأ من جديد</div>
    `;
}

function resetGame() {
    localStorage.removeItem("qaada_game_pin");
    localStorage.removeItem("qaada_is_host");
    localStorage.removeItem("qaada_players");
    if(html5QrCode) { html5QrCode.stop().catch(()=>{}); }
    
    const url = new URL(window.location);
    url.searchParams.delete('id');
    window.history.replaceState({}, "", url);
    
    hideAllStates();
    document.getElementById('lobby-home').style.display = 'block';
}

// ---------------- التشغيل ----------------
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const cardIdRaw = urlParams.get('id');
    const pin = localStorage.getItem("qaada_game_pin");
    const isHost = localStorage.getItem("qaada_is_host");

    hideAllStates();

    if (cardIdRaw && pin) {
        loadCardForId(cardIdRaw, pin);
        return;
    } 
    
    if (pin) {
        if (isHost === "true") {
            loadPlayers();
            document.getElementById("active-pin-display").innerText = pin;
            renderScoreboard();
            document.getElementById('scoreboard-state').style.display = 'block';
        } else {
            openScanner();
        }
    } else {
        document.getElementById('lobby-home').style.display = 'block';
    }
};
