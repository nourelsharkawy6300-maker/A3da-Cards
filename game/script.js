// سكيورتي منع التفتيش
document.addEventListener('contextmenu', event => event.preventDefault());
document.onkeydown = function(e) {
    if(e.keyCode == 123 || (e.ctrlKey && e.shiftKey && (e.keyCode == 'I'.charCodeAt(0) || e.keyCode == 'C'.charCodeAt(0) || e.keyCode == 'J'.charCodeAt(0))) || (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0))) { return false; }
};

// ====== 🚨 إعدادات الكروت 🚨 ======
const TOTAL_CARDS = 18;
// ======================================================================

window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const cardId = urlParams.get('id');

    // -------- 🚨 حماية من الغش وتثبيت الشخصية 🚨 --------
    // ✅ PHASE 3 FIX: إضافة try/catch لحماية المتصفحات (زي وضع التخفي في سفاري)
    if (cardId) {
        try {
            let savedId = localStorage.getItem('qaada_character_id');
            let savedTime = localStorage.getItem('qaada_scan_time');
            let now = new Date().getTime();

            if (savedId && savedTime && (now - savedTime < 6 * 60 * 60 * 1000)) {
                if (cardId !== savedId) {
                    alert('قفشناك يا غشاش! 🚨 فاكر إنك هتبدل شخصيتك؟ هترجع لشخصيتك الأصلية غصب عنك!');
                    window.location.replace(`?id=${savedId}`);
                    return;
                }
            } else {
                localStorage.setItem('qaada_character_id', cardId);
                localStorage.setItem('qaada_scan_time', now);
            }
        } catch (e) {
            // لو المتصفح قافل التخزين، اللعبة هتكمل عادي بدل ما تضرب شاشة بيضا
        }
    }
    // --------------------------------------------------------------

    const cardNum = parseInt(cardId, 10);
    const isValidCard = cardId && Number.isInteger(cardNum) && cardNum >= 1 && cardNum <= TOTAL_CARDS;

    if (isValidCard) {
        const mainImg = document.getElementById('game-card-img');
        const progressBar = document.querySelector('.progress-bar');

        mainImg.onerror = function() {
            document.getElementById('loading-state').style.display = 'none';
            showError();
        };

        mainImg.onload = function() {
            if (progressBar) progressBar.classList.add('loaded');
            setTimeout(() => {
                document.getElementById('loading-state').style.display = 'none';
                document.getElementById('card-display-state').style.display = 'block';
                if (typeof gtag === 'function') { gtag('event', 'card_opened', { 'card_id': cardId }); }
            }, 200);
        };

        mainImg.src = `cards/${cardNum}.jpg`;

    } else {
        showError();
    }
};

function showError() {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('card-display-state').style.display = 'none';
    document.getElementById('content-box').innerHTML += `
        <div class="error-icon">⚠️</div>
        <h2>الكارت غير موجود</h2>
        <p style="color: rgba(240, 240, 240, 0.7); font-size: 14px;">شكلك ضربت باركود غلط يا معلم.</p>
    `;
}

let html5QrCode;
function scanAgain() {
    document.getElementById('card-display-state').style.display = 'none';
    document.getElementById('scanner-state').style.display = 'block';

    if (typeof gtag === 'function') { gtag('event', 'scan_again_clicked'); }

    if (!html5QrCode) {
        html5QrCode = new Html5Qrcode("reader");
        html5QrCode.start(
            { facingMode: "environment" },
            { fps: 15, qrbox: { width: 250, height: 250 } },
            onScanSuccess,
            onScanFailure
        ).catch(err => {
            html5QrCode.start({ facingMode: "user" }, { fps: 15, qrbox: { width: 250, height: 250 } }, onScanSuccess, onScanFailure);
        });
    }
}

function onScanSuccess(decodedText, decodedResult) {
    // تصفير الذاكرة عشان الاسكان المتكرر بالكاميرا (مع حماية ضد أعطال المتصفح)
    try {
        localStorage.removeItem('qaada_character_id');
        localStorage.removeItem('qaada_scan_time');
    } catch (e) {}

    html5QrCode.stop().then(() => { window.location.replace(decodedText); })
        .catch(err => { window.location.replace(decodedText); });
}

function onScanFailure(error) { /* صامت */ }

function closeCard() {
    if (typeof gtag === 'function') { gtag('event', 'card_closed'); }

    const contentBox = document.getElementById('content-box');
    contentBox.innerHTML = `
        <div class="closing-screen">
            <div class="closing-icon">🏁</div>
            <h2 class="closing-heading">عاش يا بطل!</h2>
            <div class="closing-text">
                دورك خلص في الكارت ده<br>تقدر تقفل الصفحة دلوقتي
            </div>
            <button class="action-btn btn-primary closing-btn" onclick="scanAgain()">سكان لكارت جديد</button>
        </div>
    `;
}
