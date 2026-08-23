import { getMappingForPin, generatePin, saveActivePin, getActivePin } from '../shared/qaada-engine.js';

// حماية ضد التفتيش
document.addEventListener('contextmenu', event => event.preventDefault());
document.onkeydown = function(e) {
    if(e.keyCode == 123 || (e.ctrlKey && e.shiftKey && (e.keyCode == 'I'.charCodeAt(0) || e.keyCode == 'C'.charCodeAt(0) || e.keyCode == 'J'.charCodeAt(0))) || (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0))) { return false; }
};

let html5QrCode;

window.onload = function() {
    const savedPin = getActivePin();
    const urlParams = new URLSearchParams(window.location.search);
    const cardId = urlParams.get('id');

    // تفعيل الزراير
    document.getElementById('new-game-btn').addEventListener('click', startNewGame);
    document.getElementById('join-game-btn').addEventListener('click', joinGame);
    document.getElementById('scan-again-btn').addEventListener('click', openScanner);
    document.getElementById('close-card-btn').addEventListener('click', closeCard);

    if (cardId) {
        if (!savedPin) {
            alert("لازم تكتب كود الروم الأول يا معلم قبل ما تعمل سكان!");
            window.location.replace("index.html"); 
            return;
        }
        loadCard(savedPin, cardId);
    } else {
        showState('lobby-state');
        if(savedPin) {
            document.getElementById('pin-input').value = savedPin;
        }
    }
};

function showState(stateId) {
    const states = ['lobby-state', 'scanner-state', 'loading-state', 'card-display-state'];
    states.forEach(s => document.getElementById(s).style.display = (s === stateId) ? 'flex' : 'none');
    if(stateId === 'scanner-state' || stateId === 'loading-state' || stateId === 'card-display-state') {
        document.getElementById(stateId).style.display = 'block';
    }
}

function startNewGame() {
    const newPin = generatePin();
    saveActivePin(newPin);
    alert(`كود الروم بتاعكم هو: ${newPin}\nقوله للشلة يكتبوه عشان تلعبوا على نفس التوزيعة!`);
    openScanner();
}

function joinGame() {
    const pin = document.getElementById('pin-input').value;
    if (pin && pin.length >= 2) {
        saveActivePin(pin);
        alert(`تم الدخول لكود: ${pin} بنجاح!`);
        openScanner();
    } else {
        alert("اكتب كود الروم المكون من رقمين صح!");
    }
}

function openScanner() {
    showState('scanner-state');
    if (!html5QrCode) {
        html5QrCode = new Html5Qrcode("reader");
    }
    html5QrCode.start(
        { facingMode: "environment" },
        { fps: 15, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        onScanFailure
    ).catch(err => {
        html5QrCode.start({ facingMode: "user" }, { fps: 15, qrbox: { width: 250, height: 250 } }, onScanSuccess, onScanFailure);
    });
}

function onScanSuccess(decodedText, decodedResult) {
    html5QrCode.stop().then(() => {
        window.location.replace(decodedText);
    }).catch(err => {
        window.location.replace(decodedText);
    });
}

function onScanFailure(error) { /* صامت */ }

function loadCard(pin, cardId) {
    showState('loading-state');
    const mapping = getMappingForPin(pin);
    const cardIndex = parseInt(cardId, 10) - 1;

    if (cardIndex >= 0 && cardIndex < 18) {
        const finalImageName = mapping[cardIndex];
        const mainImg = document.getElementById('game-card-img');

        mainImg.onerror = function() { showError(); };
        mainImg.onload = function() {
            const progressBar = document.querySelector('.progress-bar');
            if(progressBar) progressBar.classList.add('loaded');
            setTimeout(() => {
                showState('card-display-state');
            }, 200);
        };

        // الربط المباشر بملفات الـ JPG اللي في فولدر الكروت
        mainImg.src = `../cards/${finalImageName}`;
    } else {
        showError();
    }
}

function closeCard() {
    const contentBox = document.getElementById('content-box');
    contentBox.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <div style="font-size: 65px; margin-bottom: 10px;">🏁</div>
            <h2 style="color: #f0f0f0;">عاش يا بطل!</h2>
            <div style="color: rgba(240,240,240,0.8); margin-bottom: 25px;">دورك خلص في الكارت ده</div>
            <button class="action-btn btn-primary" onclick="location.href='index.html'" style="padding: 10px 20px;">سكان لكارت جديد</button>
        </div>
    `;
}

function showError() {
    const contentBox = document.getElementById('content-box');
    contentBox.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <div style="font-size: 50px; margin-bottom: 15px;">⚠️</div>
            <h2 style="color: #f0f0f0;">الكارت غير موجود</h2>
            <button class="action-btn btn-primary" onclick="location.href='index.html'" style="margin-top: 20px; padding: 10px 20px;">ارجع للوبي</button>
        </div>
    `;
}
