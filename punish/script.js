document.addEventListener('DOMContentLoaded', () => {
    
    // 1. لستة الأحكام العشوائية (تقدر تعدل فيها براحتك)
    const punishments = [
        "الويتر: هتبقى المساعد بتاع القعدة لمده نص ساعة (تجيب مياه، تلم الورق، وتخدم عليهم).",
        "الدبيسة: هتدفع حق المشاريب أو السناكس اللي جاية للقعدة كلها.",
        "الفصحى: تتكلم باللغة العربية الفصحى لمدة 5 دقايق، وأي كلمة عامية بحكم جديد.",
        "الستوري: تنزل ستوري واتساب مكتوب فيها 'أنا قررت اعتزل الناس' وتسيبها لمدة ساعة.",
        "الصمت العقابي: ممنوع تتكلم أو تعترض نهائي لمدة 3 جولات، واللي يضحكك تتنفذ حكم تاني.",
        "اللياقة: انزل اعمل 15 ضغط أو بلانك لمدة دقيقة دلوقتي حالا قدام الشلة.",
        "الجاليري: افتح الجاليري في موبايلك، ووري الشلة أحدث 3 صور عندك بدون ما تمسح حاجة."
    ];

    // 2. تشغيل الساسبينس (الانتظار) واختيار الحكم
    setTimeout(() => {
        // اختيار حكم عشوائي من اللستة
        const randomP = punishments[Math.floor(Math.random() * punishments.length)];
        
        // إخفاء شاشة التحميل وإظهار النتيجة
        document.getElementById('loading').style.display = 'none';
        document.getElementById('result').style.display = 'block';
        document.getElementById('punish-text').innerText = randomP;
    }, 2800); // 2.8 ثانية ساسبينس عشان يعيشوا اللحظة


    // ----------------------------------------------------
    // 3. نظام السكيورتي (قفل التفتيش والسرقة)
    // ----------------------------------------------------
    
    // منع كليك يمين
    document.addEventListener('contextmenu', event => {
        event.preventDefault();
    });

    // منع زراير المطورين (F12, Ctrl+Shift+I, Ctrl+U)
    document.addEventListener('keydown', function(e) {
        if(e.key === "F12") e.preventDefault();
        
        if(e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "i" || e.key === "j")) {
            e.preventDefault();
        }
        if(e.ctrlKey && (e.key === "U" || e.key === "u")) {
            e.preventDefault();
        }
        if(e.ctrlKey && (e.key === "S" || e.key === "s")) {
            e.preventDefault();
        }
    });
});
