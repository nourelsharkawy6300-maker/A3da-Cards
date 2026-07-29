// سكيورتي منع التفتيش
document.addEventListener('contextmenu', event => event.preventDefault());
document.onkeydown = function(e) {
    if(e.keyCode == 123 || (e.ctrlKey && e.shiftKey && (e.keyCode == 'I'.charCodeAt(0) || e.keyCode == 'C'.charCodeAt(0) || e.keyCode == 'J'.charCodeAt(0))) || (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0))) { return false; }
};

// ====== 🚨 قاعدة البيانات المباشرة 🚨 ======
const secureDB = {
    "1": "1FIT9DQMzTSDYY1c80_V5R9TQ6rgjspFE", // 1 الريتش
    "2": "1f48JxTbpjPk9kQEYBF9yDy-urDFuuG_p", // 2 المؤامره
    "3": "1GFBXZi6B5EMuhtYI2JG3TMiipWord_J6", // 3 العاجله
    "4": "1n2GyRH3ylV90W-rrltVPDVsUuRJa9IRd", // 4 يوتيوبر
    "5": "1uRJr_faktNsWVhhdyvCE-SYYvQFfhaUG", // 5 كول سينتر
    "6": "12JojP3lyglDLo5f0MfQ5F6TPTrYtx5oU", // 6 شات جيبتي
    "7": "1iPqd3RsKZ_58npfNHjkNhNpxoloR707U", // 7 امهات التيك توك
    "8": "1mFvK1g0SEwvRXjGavI8CQUlncbd3XQnb", // 8 ثانويه
    "9": "1CwqeXmn4Y62aM6wrgJU26P0hEjZrxrK9",  // 9 السريجي
    "10": "1Z6XzeKU19LmDig_t1MjBgJr8co-pBTXO",// 10 المتنمره
    "11": "1ymU5DbIyjX42UiG79eElyFjdl-oFSmFQ",// 11 استرونج
    "12": "1NRiDZ8_n9EkizYzMSNMM7WQuI3SGFJav",// 12 صيوحه
    "13": "1eXuTA7bCgvgDuAE4TEHvNSwlS4OUtYk6",// 13 محنك
    "14": "1FXFDnu0WW3uTizC_kH9wJyrB-j1M1alm",// 14 فوود بلوجر
    "15": "1IbSi94OVcuI2f5IrjWYMHl_puhd7van2",// 15 لينكد ان
    "16": "1xDzfiEBEy-bTQfmF_r-8k2QFziBLDf3c", // 16 تويتر
    "17": "1maWFoNb4lLuWZxa6_bJ6YBhRPz-Ov4NI",// 17 خدمه العملاء
    "18": "1f7OCeOlIjK-VP6zXsB3NJHoOtjj3Xoh1" // 18 الشاي بلبن
};
// ======================================================================

window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const cardId = urlParams.get('id');

    // -------- 🚨 كود قعدة السري: حماية من الغش وتثبيت الشخصية 🚨 --------
    if (cardId) {
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
    }
    // --------------------------------------------------------------

    if (cardId && secureDB[cardId]) {
        const driveId = secureDB[cardId];
        const mainImg = document.getElementById('game-card-img');
        
        const urls = [
            `https://drive.google.com/thumbnail?id=${driveId}&sz=w1000`, 
            `https://lh3.googleusercontent.com/d/${driveId}`, 
            `https://drive.google.com/uc?export=view&id=${driveId}`
        ];
        
        let currentUrlIndex = 0;

        mainImg.onerror = function() {
            currentUrlIndex++;
            if (currentUrlIndex < urls.length) {
                mainImg.src = urls[currentUrlIndex];
            } else {
                document.getElementById('loading-state').style.display = 'none';
                showError();
            }
        };

        mainImg.onload = function() {
            document.getElementById('loading-state').style.display = 'none';
            document.getElementById('card-display-state').style.display = 'block';
            if(typeof gtag === 'function') { gtag('event', 'card_opened', { 'card_id': cardId }); }
        };

        mainImg.src = urls[0];

    } else {
        showError();
    }
}

function showError() {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('card-display-state').style.display = 'none';
    document.getElementById('content-box').innerHTML += `
        <div style="font-size: 50px; margin-bottom: 15px;">⚠️</div>
        <h2>الكارت غير موجود</h2>
    `;
}

let html5QrCode;
function scanAgain() {
    document.getElementById('card-display-state').style.display = 'none';
    document.getElementById('scanner-state').style.display = 'block';
    
    if(typeof gtag === 'function') { gtag('event', 'scan_again_clicked'); }

    if(!html5QrCode) {
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
    html5QrCode.stop().then(() => { window.location.replace(decodedText); })
    .catch(err => { window.location.replace(decodedText); });
}

function onScanFailure(error) { /* صامت */ }

function closeCard() {
    if(typeof gtag === 'function') { gtag('event', 'card_closed'); }

    const contentBox = document.getElementById('content-box');
    contentBox.innerHTML = `
        <div style="animation: popUpBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;">
            <div style="font-size: 65px; margin-bottom: 10px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">🏁</div>
            <h2 style="font-size: 30px; font-weight: 900; color: #f0f0f0; margin-bottom: 5px;">عاش يا بطل!</h2>
            <div style="color: rgba(240, 240, 240, 0.8); font-size: 16px; font-weight: 500; margin-bottom: 25px; line-height: 1.6;">
                دورك خلص في الكارت ده<br>تقدر تقفل الصفحة دلوقتي
            </div>
            <button class="action-btn btn-primary" onclick="scanAgain()" style="width: 80%; max-width: 200px; padding: 12px; margin: 0 auto; display: block;">سكان لكارت جديد</button>
        </div>
    `;
}
