// =======================
// بداية كود صفحة ملخص الميزانية (تقرير مالي مجمع)
// =======================

// تخزين البيانات المحملة من الملفات المختلفة
// نتجنب إعادة تعريف المتغيرات التي قد تكون معرفة في مكان آخر
// ونستخدم متغيرات بأسماء فريدة لتجنب التعارض
let financialSummary_seyanahData = [];
let financialSummary_otherData = [];
let financialSummary_almokhalafatData = [];
let financialSummary_masrufatData = [];
let financialSummary_previousYearBalance = 0; // المبلغ المرحل من صندوق 2024

/**
 * دالة تحميل جميع البيانات المطلوبة من ملفات JSON المختلفة
 * @param {function} callback - دالة يتم تنفيذها بعد تحميل كل البيانات بنجاح
 */
function loadAllFinancialData(callback) {
    let loadedFiles = 0;
    const totalFiles = 5; // أضفنا ملف خامس

    // دالة للتحقق من اكتمال تحميل جميع الملفات
    function checkAllLoaded() {
        loadedFiles++;
        if (loadedFiles === totalFiles && callback) {
            callback();
        }
    }

    // تحميل بيانات الصيانة
    fetch(`seyanah.json?v=${new Date().getTime()}`)
        .then(res => res.json())
        .then(data => {
            financialSummary_seyanahData = data;
            checkAllLoaded();
        })
        .catch(err => {
            console.error('فشل تحميل بيانات الصيانة:', err);
            financialSummary_seyanahData = [];
            checkAllLoaded();
        });

    // تحميل بيانات المساهمات الأخرى
    fetch(`other.json?v=${new Date().getTime()}`)
        .then(res => res.json())
        .then(data => {
            financialSummary_otherData = data;
            checkAllLoaded();
        })
        .catch(err => {
            console.error('فشل تحميل بيانات المساهمات الأخرى:', err);
            financialSummary_otherData = [];
            checkAllLoaded();
        });

    // تحميل بيانات المخالفات
    fetch(`almokhalafat.json?v=${new Date().getTime()}`)
        .then(res => res.json())
        .then(data => {
            financialSummary_almokhalafatData = data;
            checkAllLoaded();
        })
        .catch(err => {
            console.error('فشل تحميل بيانات المخالفات:', err);
            financialSummary_almokhalafatData = [];
            checkAllLoaded();
        });

    // تحميل بيانات المصروفات
    fetch(`masrufat.json?v=${new Date().getTime()}`)
        .then(res => res.json())
        .then(data => {
            financialSummary_masrufatData = data;
            checkAllLoaded();
        })
        .catch(err => {
            console.error('فشل تحميل بيانات المصروفات:', err);
            financialSummary_masrufatData = [];
            checkAllLoaded();
        });

    // تحميل المبلغ المرحل من 2024
    fetch(`seyanah2024.json?v=${new Date().getTime()}`)
        .then(res => res.json())
        .then(data => {
            const carryOver = data.find(item => "المبلغ المرحل من صندوق عام 2024" in item);
            financialSummary_previousYearBalance = carryOver ? Number(carryOver["المبلغ المرحل من صندوق عام 2024"]) || 0 : 0;
            checkAllLoaded();
        })
        .catch(err => {
            console.error('فشل تحميل المبلغ المرحل من 2024:', err);
            financialSummary_previousYearBalance = 0;
            checkAllLoaded();
        });
}

/**
 * دالة حساب إجمالي مدفوعات الصيانة
 * @returns {number} إجمالي مدفوعات الصيانة
 */
function calculateTotalSeyanahPayments() {
    let totalPaid = 0;

    // الأشهر التي سنجمعها
    const months = [
        "شهر يناير (1)", "شهر فبراير (2)", "شهر مارس (3)", "شهر إبريل (4)",
        "شهر مايو (5)", "شهر يونيو (6)", "شهر يوليو (7)", "شهر أغسطس (8)",
        "شهر سبتمبر (9)", "شهر أكتوبر (10)", "شهر نوفمبر (11)", "شهر ديسمبر (12)"
    ];

    (financialSummary_seyanahData || []).forEach(rec => {
        // جمع قيم الشهور المدفوعة لكل وحدة
        months.forEach(month => {
            // إذا كان الشهر موجود وقيمته أكبر من صفر، نضيفه للمجموع
            if (rec[month] !== undefined && rec[month] > 0) {
                totalPaid += Number(rec[month]);
            }
        });
    });

    console.log("إجمالي مدفوعات الصيانة المحسوبة:", totalPaid);
    return totalPaid;
}

/**
 * دالة حساب إجمالي المساهمات المالية الأخرى
 * @returns {number} إجمالي المساهمات المالية الأخرى
 */
function calculateTotalOtherPayments() {
    let totalPaid = 0;

    (financialSummary_otherData || []).forEach(rec => {
        totalPaid += Number(rec["المدفوع"] || 0);
    });

    return totalPaid;
}

/**
 * دالة حساب إجمالي المخالفات والغرامات
 * @returns {number} إجمالي المخالفات والغرامات
 */
function calculateTotalPenaltyPayments() {
    let totalPaid = 0;

    (financialSummary_almokhalafatData || []).forEach(rec => {
        totalPaid += Number(rec["المدفوع"] || 0);
    });

    return totalPaid;
}

/**
 * دالة حساب إجمالي المصروفات
 * @returns {number} إجمالي المصروفات
 */
function calculateTotalExpenses() {
    let totalExpenses = 0;

    (financialSummary_masrufatData || []).forEach(rec => {
        totalExpenses += Number(rec["المبلغ"] || 0);
    });

    return totalExpenses;
}

/**
 * دالة توليد HTML صفحة ملخص الميزانية
 */
function getFinancialSummaryHtml() {
    // حساب جميع الإجماليات
    const totalSeyanah = calculateTotalSeyanahPayments();
    const totalOther = calculateTotalOtherPayments();
    const totalPenalties = calculateTotalPenaltyPayments();
    const totalIncome = totalSeyanah + totalOther + totalPenalties;

    const totalExpenses = calculateTotalExpenses();

    // حساب رصيد الصندوق (الفرق بين الإيرادات والمصروفات) + المبلغ المرحل
    const balance = totalIncome - totalExpenses + financialSummary_previousYearBalance;

    return `
        <div class="p-3 d-flex justify-content-between align-items-center">
            <div><button id="printFinancialSummary" class="btn btn-primary"><i class="fas fa-file-pdf me-2"></i> حفظ التقرير كـ PDF</button></div>		
            <div><button onclick="navigate('home',event)" class="btn btn-outline-primary">عودة <i class="fas fa-arrow-left me-2"></i></button></div>
        </div>
        
<div class="mt-4 mb-4 p-3 bg-white rounded shadow-sm">
    <h4 class="text-center text-primary fw-bold mb-4 border-bottom pb-4">التقرير المالي الشامل - صندوق عام 2025</h4>

<div id="financialSummaryDiv" class="mb-4">
    <div class="row g-4">

        <!-- الإيرادات -->
        <div class="col-md-12">
            <div class="card border-success h-100">
                <div class="card-header bg-success text-white text-center fw-bold">
                    الإيرادات الفرعية
                </div>
                <div class="card-body bg-white">
                    <p class="mb-2 d-flex justify-content-between">
                        <span>مدفوعات الصيانة</span>
                        <span class="fw-bold">${totalSeyanah.toLocaleString("en-EG", { style: "currency", currency: "EGP", minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                    </p>
                    <p class="mb-2 d-flex justify-content-between">
                        <span>المساهمات الأخرى</span>
                        <span class="fw-bold">${totalOther.toLocaleString("en-EG", { style: "currency", currency: "EGP", minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                    </p>
                    <p class="mb-3 d-flex justify-content-between">
                        <span>الغرامات والمخالفات</span>
                        <span class="fw-bold">${totalPenalties.toLocaleString("en-EG", { style: "currency", currency: "EGP", minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                    </p>
                    <hr>
                    <p class="d-flex justify-content-between text-success fw-bold fs-5">
                        <span>إجمالي الإيرادات</span>
                        <span>${totalIncome.toLocaleString("en-EG", { style: "currency", currency: "EGP", minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                    </p>
                </div>
            </div>
        </div>

        <!-- المصروفات -->
        <div class="col-md-4">
            <div class="card border-danger h-100">
                <div class="card-header bg-danger text-white text-center fw-bold">
                    المصروفات
                </div>
                <div class="card-body bg-white">
                    <p class="d-flex justify-content-between fs-5 fw-bold text-danger">
                        <span>إجمالي المصروفات</span>
                        <span>${totalExpenses.toLocaleString("en-EG", { style: "currency", currency: "EGP", minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                    </p>
                </div>
            </div>
        </div>

        <!-- المبلغ المرحل -->
        <div class="col-md-4">
            <div class="card border-warning">
                <div class="card-header bg-warning text-dark text-center fw-bold">
                    المبلغ المرحل من صندوق 2024
                </div>
                <div class="card-body bg-white">
                    <p class="d-flex justify-content-between fs-5 fw-bold text-dark">
                        <span>المبلغ المرحل</span>
                        <span>${financialSummary_previousYearBalance.toLocaleString("en-EG", { style: "currency", currency: "EGP", minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                    </p>
                </div>
            </div>
        </div>

        <!-- رصيد الصندوق -->
        <div class="col-md-4">
            <div class="card border-dark">
                <div class="card-header bg-dark text-white text-center fw-bold">
                    رصيد الصندوق الحالي
                </div>
                <div class="card-body bg-white">
                    <p class="d-flex justify-content-between fs-4 fw-bold text-dark">
                        <span>الإجمالي بعد الترحيل</span>
                        <span>${balance.toLocaleString("en-EG", { style: "currency", currency: "EGP", minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                    </p>
                </div>
            </div>
        </div>

    </div>
</div>


    `;
}

/**
 * دالة تفعيل زر الطباعة الخاص بصفحة ملخص الميزانية
 */
function activateFinancialSummaryPrintButton() {
    const printBtn = document.getElementById('printFinancialSummary');
    if (printBtn) {
        printBtn.onclick = function () {
            let element = document.getElementById('financialSummaryDiv');
            let originalBg = element.style.backgroundColor;
            let originalClass = element.className;

            element.style.backgroundColor = "#fff";
            element.className += " mt-4 mb-4 p-3 bg-white rounded shadow-sm";

            html2canvas(element, { scale: 2 }).then(function (canvas) {
                var imgData = canvas.toDataURL('image/png');
                var imgWidth = canvas.width * 0.75;
                var imgHeight = canvas.height * 0.75;

                var pdf = new jspdf.jsPDF({
                    orientation: imgWidth > imgHeight ? "landscape" : "portrait",
                    unit: "pt",
                    format: [imgWidth, imgHeight]
                });

                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                pdf.save("التقرير_المالي_الشامل.pdf");

                element.style.backgroundColor = originalBg;
                element.className = originalClass;
            });
        }
    }
}

// =======================
// نهاية كود صفحة ملخص الميزانية
// =======================

/*
طريقة الاستدعاء في صفحة العرض:

else if (page === 'summary') {
    loadAllFinancialData(function() {
        document.getElementById('pageContent').innerHTML = getFinancialSummaryHtml();
        activateFinancialSummaryPrintButton();
    });
}
*/
