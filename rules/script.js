document.addEventListener('DOMContentLoaded', () => {
    
    // ----------------------------------------------------
    // 1. نظام الأكورديون (الراوندات)
    // ----------------------------------------------------
    const accordions = document.querySelectorAll('.accordion-header');

    accordions.forEach(acc => {
        acc.addEventListener('click', function() {
            // نقفل المفتوح
            accordions.forEach(otherAcc => {
                if (otherAcc !== this) {
                    otherAcc.classList.remove('active');
                    otherAcc.nextElementSibling.style.maxHeight = null;
                }
            });

            // نفتح اللي انداس عليه
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    // نفتح أول خطوة عشان يفهم بتشتغل إزاي
    if(accordions.length > 0) {
        accordions[0].click();
    }

    // ----------------------------------------------------
    // 2. نظام السكيورتي (قفل التفتيش والسرقة)
    // ----------------------------------------------------
    
    // منع كليك يمين (عشان محدش يسيف الصور أو يسرق الديزاين)
    document.addEventListener('contextmenu', event => {
        event.preventDefault();
    });

    // منع زراير المطورين (F12, Ctrl+Shift+I, Ctrl+U)
    document.addEventListener('keydown', function(e) {
        // منع F12
        if(e.key === "F12") {
            e.preventDefault();
        }
        // منع Ctrl+Shift+I أو J (فتح الكونسول)
        if(e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "i" || e.key === "j")) {
            e.preventDefault();
        }
        // منع Ctrl+U (عرض كود الصفحة)
        if(e.ctrlKey && (e.key === "U" || e.key === "u")) {
            e.preventDefault();
        }
        // منع Ctrl+S (حفظ الصفحة)
        if(e.ctrlKey && (e.key === "S" || e.key === "s")) {
            e.preventDefault();
        }
    });
});
