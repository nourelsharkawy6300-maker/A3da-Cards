// سكيورتي منع التفتيش
document.addEventListener('contextmenu', event => event.preventDefault());
document.onkeydown = function(e) {
    if(e.keyCode == 123 || (e.ctrlKey && e.shiftKey && (e.keyCode == 'I'.charCodeAt(0) || e.keyCode == 'C'.charCodeAt(0) || e.keyCode == 'J'.charCodeAt(0))) || (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0))) { return false; }
};

// ==========================================
// 1. محرك اللخبطة (Seeded Shuffle Engine)
// ==========================================
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle(array, seed) {
  const rng = mulberry32(seed);
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// أرقام الـ 18 كارت اللي في فولدر cards بره
const CHARACTERS_IMAGES = [
  "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg",
  "7.jpg", "8.jpg", "9.jpg", "10.jpg", "11.jpg", "12.jpg",
  "13.jpg", "14.jpg", "15.jpg", "16.jpg", "17.jpg", "18.jpg"
];

function getMappingForPin(pin) {
  return seededShuffle(CHARACTERS_IMAGES, Number(pin));
}

// ==========================================
// 2. إدارة الروم واللوبي
// ==========================================
window.onload = function() {
    const savedPin = localStorage.getItem('qaada_pin');
    const urlParams = new URLSearchParams(window.location.search);
    const cardId = urlParams.get('id');

    // لو اللينك فيه id كارت (يعني عمل سكان)
    if (cardId) {
        if (!savedPin) {
            alert("لازم تكتب كود الروم الأول يا معلم قبل ما تعمل سكان!");
            window.location.replace("index.html"); // يرجعه للوبي
            return;
        }
        // لو معاه كود، نحمل الكارت المخفي بتاعه
        loadCard(savedPin, cardId);
    } else {
        // لو فاتح اللعبة من غير سكان، نعرض اللوبي
        document.getElementById('lobby-state').style.display = 'flex';
        document.getElementById('loading-state').style.display = 'none';
        document.getElementById('card-display-state').style.display = 'none';
        document.getElementById('scanner-state').style.display = 'none';
        
        if(savedPin) {
            document.getElementById('pin-input').value = savedPin; 
        }
    }
};

function startNewGame() {
    // بيعمل رقم عشوائي من 10 لـ 99
    const newPin = Math.floor(Math.random() * 90) + 10;
    localStorage.setItem('qaada_pin', newPin);
    alert(`كود الروم بتاعكم هو: ${newPin}\nقوله للشلة يكتبوه عشان تلعبوا على نفس التوزيعة!`);
    openScanner();
}

function joinGame() {
    const pin = document.getElementById('pin-input').value;
    if (pin && pin.length >= 2) {
        localStorage.setItem('qaada_pin', pin);
        alert(`تم الدخول لكود: ${pin} بنجاح!`);
        openScanner();
    } else {
        alert("اكتب كود الروم المكون من رقمين صح!");
    }
}

function openScanner() {
    document.getElementById('lobby-state').style.display = 'none';
    scanAgain(); 
}

// ==========================================
// 3. تحميل الكارت باللخبطة المتزامنة
// ==========================================
function loadCard(pin, cardId) {
    document.getElementById('lobby-state').style.display = 'none';
    document.getElementById('loading-state').style.display = 'block';

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
                document.getElementById('loading-state').style.display = 'none';
                document.getElementById('card-display-state').style.display = 'block';
            }, 200);
        };

        // المشرط هنا: بيسحب الصور من فولدر cards اللي بره فولدر game
        mainImg.src = `../cards/${finalImageName}`;
    } else {
        showError();
    }
}

// ==========================================
// 4. الكاميرا والاسكان
// ==========================================
let html5QrCode;
function scanAgain() {
    document.getElementById('card-display-state').style.display = 'none';
    document.getElementById('scanner-state').style.display = 'block';
    
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

function closeCard() {
    const contentBox = document.getElementById('content-box');
    contentBox.innerHTML = `
        <div class="closing-screen">
            <div style="font-size: 65px; margin-bottom: 10px;">🏁</div>
            <h2>عاش يا بطل!</h2>
            <div style="margin-bottom: 25px;">دورك خلص في الكارت ده</div>
            <button class="action-btn btn-primary" onclick="scanAgain()">سكان لكارت جديد</button>
        </div>
    `;
}

function showError() {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('content-box').innerHTML = `
        <div style="font-size: 50px; margin-bottom: 15px;">⚠️</div>
        <h2>الكارت غير موجود</h2>
    `;
}
