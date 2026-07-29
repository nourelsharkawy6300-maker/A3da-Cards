document.addEventListener('DOMContentLoaded', () => {
    const accordions = document.querySelectorAll('.accordion-header');

    accordions.forEach(acc => {
        acc.addEventListener('click', function() {
            // نقفل أي راوند تاني مفتوح (عشان الشاشة تفضل منظمة)
            accordions.forEach(otherAcc => {
                if (otherAcc !== this) {
                    otherAcc.classList.remove('active');
                    otherAcc.nextElementSibling.style.maxHeight = null;
                }
            });

            // نفتح أو نقفل الراوند اللي دوسنا عليه
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            
            if (content.style.maxHeight) {
                content.style.maxHeight = null; // القفل
            } else {
                content.style.maxHeight = content.scrollHeight + "px"; // الفتح
            }
        });
    });

    // نفتح أول خطوة أوتوماتيك كنوع من التوجيه للاعب
    if(accordions.length > 0) {
        accordions[0].click();
    }
});
