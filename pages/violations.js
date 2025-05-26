// =======================
// كود صفحة المخالفات (violations) مع التعليقات والتوضيحات
// =======================

// مصفوفة لتخزين بيانات المخالفات بعد تحميلها من ملف JSON
let violationsData = [];

/**
 * دالة تحميل بيانات المخالفات من ملف almokhalafat.json
 * @param {function} callback - دالة يتم تنفيذها بعد تحميل البيانات بنجاح أو فشل
 */
function loadViolationsData(callback) {
    fetch(`almokhalafat.json?v=${new Date().getTime()}`)
        .then(res => res.json())
        .then(data => {
            violationsData = data;
            if (callback) callback(); // استدعاء الدالة بعد التحميل
        })
        .catch(err => {
            alert('فشل تحميل بيانات المخالفات. تأكد من وجود الملف almokhalafat.json');
            violationsData = [];
            if (callback) callback(); // استدعاء الدالة حتى في حال الفشل
            console.error(err);
        });
}

/**
 * دالة توليد كود HTML لصفحة المخالفات.
 * تفصل الوحدات المسددة عن غير المسددة وتظهر الإجماليات.
 * @returns {string} كود HTML للصفحة
 */
function getViolationsPageHtml() {
    let paidRows = '';      // صفوف الوحدات المسددة
    let unpaidRows = '';    // صفوف الوحدات غير المسددة
    let totalPaid = 0;      // إجمالي المدفوع
    let totalUnpaid = 0;    // إجمالي المتبقي غير المدفوع

    // المرور على كل سجل في بيانات المخالفات
    (violationsData || []).forEach(rec => {
        let unit = rec["رقم الوحده"];
        let type = rec["نوع المخالفة"];
        let fine = Number(rec["قيمة الغرامة"]) || 0;
        let paid = Number(rec["المدفوع"]) || 0;
        // إذا كان المدفوع أكبر أو يساوي الغرامة والوحدة فعلاً عليها غرامة
        if (paid >= fine && fine > 0) {
            totalPaid += paid;
            paidRows += `<tr>
                <td>${unit}</td>
                <td>${type}</td>
                <td>${formatCurrency(fine)}</td>
                <td>${formatCurrency(paid)}</td>
            </tr>`;
        } else if (fine > 0) {
            unpaidRows += `<tr>
                <td>${unit}</td>
                <td>${type}</td>
                <td>${formatCurrency(fine)}</td>
                <td>${formatCurrency(paid)}</td>
                <td>${formatCurrency(fine - paid)}</td>
            </tr>`;
            totalUnpaid += (fine - paid);
        }
    });

    // إرجاع كود HTML مع الجدولين والإجماليات
    return `
        
        <div class="p-3 d-flex justify-content-between align-items-center">
            <div><h4 class="mb-0 text-primary">تقرير المخالفات والغرامات</h4></div>        
            <div><button onclick="navigate('home',event)" class="btn btn-outline-primary">عودة <i class="fas fa-arrow-left me-2"></i></button></div>
        </div>
        
        
<div class="p-3 bg-white rounded shadow-sm">
    <!-- جدول المسددين -->
    <div class="d-flex justify-content-end mb-2">
        <button id="printPaidViolations" class="btn bg-success text-white"><i class="fas fa-file-pdf me-2"></i> حفظ كـ PDF</button>
    </div>
    <div id="paidViolationsDiv" class="table-responsive mb-4">
        <table class="table table-bordered">
            <thead>
                <tr>
                    <th colspan="4" class="text-center bg-success text-white">الوحدات المسددة لغرامة المخالفات</th>
                </tr>
                <tr>
                    <th>رقم الوحدة</th>
                    <th>نوع المخالفة</th>
                    <th>قيمة الغرامة</th>
                    <th>المدفوع</th>
                </tr>
            </thead>
            <tbody>
                ${paidRows || `<tr><td colspan="4" class="text-center">لا توجد وحدات قامت بالسداد بعد</td></tr>`}
                <tr class="bg-info text-white font-weight-bold">
                    <td colspan="3">إجمالي السداد</td>
                    <td>${formatCurrency(totalPaid)}</td>
                </tr>
            </tbody>
        </table>
    </div>
    <br><br>
    <!-- جدول غير المسددين -->
    <div class="d-flex justify-content-end mb-2">
        <button id="printUnpaidViolations" class="btn bg-danger text-white"><i class="fas fa-file-pdf me-2"></i> حفظ كـ PDF</button>
    </div>
    <div id="unpaidViolationsDiv" class="table-responsive">
        <table class="table table-bordered">
            <thead>
                <tr>
                    <th colspan="5" class="text-center bg-danger text-white">الوحدات غير المسددة لغرامة المخالفات</th>
                </tr>
                <tr>
                    <th>رقم الوحدة</th>
                    <th>نوع المخالفة</th>
                    <th>قيمة الغرامة</th>
                    <th>المدفوع</th>
                    <th>المتبقي</th>
                </tr>
            </thead>
            <tbody>
                ${unpaidRows || `<tr><td colspan="5" class="text-center">كل الوحدات ملتزمة بالسداد</td></tr>`}
                <tr class="bg-danger text-white font-weight-bold">
                    <td colspan="4">إجمالي المتبقي</td>
                    <td>${formatCurrency(totalUnpaid)}</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

    `;
}

/**
 * دالة تنسيق الأرقام كعملة مصرية مع عرض الرمز EGP والمسافات كالفاصلة
 * @param {number} amount المبلغ المراد تنسيقه
 * @returns {string} المبلغ بالتنسيق المطلوب مثل "EGP 2,600"
 */
function formatCurrency(amount) {
    return "EGP " + amount.toLocaleString("en-EG", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

/**
 * دالة تفعيل أزرار الطباعة الخاصة بصفحة المخالفات.
 * تستخدم html2canvas و jsPDF لأخذ صورة من الجدول وتحويلها إلى PDF.
 */
function activateViolationsPrintButtons() {
    // تفعيل زر طباعة جدول المسددين
    const printPaidBtn = document.getElementById('printPaidViolations');
    if (printPaidBtn) {
        printPaidBtn.onclick = function () {
            let element = document.getElementById('paidViolationsDiv');
            let originalBg = element.style.backgroundColor;
            let originalClass = element.className;
            // تغيير الخلفية مؤقتًا للطباعة بشكل أفضل
            element.style.backgroundColor = "#fff";
            element.className += " mt-4 mb-4 p-3 bg-white rounded shadow-sm";
            // تحويل الجدول إلى صورة ثم PDF
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
                pdf.save("سجل_الوحدات_المسددة_المخالفات.pdf");
                // استرجاع المظهر الأصلي بعد الطباعة
                element.style.backgroundColor = originalBg;
                element.className = originalClass;
            });
        }
    }
    // تفعيل زر طباعة جدول غير المسددين
    const printUnpaidBtn = document.getElementById('printUnpaidViolations');
    if (printUnpaidBtn) {
        printUnpaidBtn.onclick = function () {
            let element = document.getElementById('unpaidViolationsDiv');
            let originalBg = element.style.backgroundColor;
            let originalClass = element.className;
            // تغيير الخلفية مؤقتًا للطباعة بشكل أفضل
            element.style.backgroundColor = "#fff";
            element.className += " mt-4 mb-4 p-3 bg-white rounded shadow-sm";
            // تحويل الجدول إلى صورة ثم PDF
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
                pdf.save("سجل_الوحدات_غير_المسددة_المخالفات.pdf");
                // استرجاع المظهر الأصلي بعد الطباعة
                element.style.backgroundColor = originalBg;
                element.className = originalClass;
            });
        }
    }
}
// =======================
// نهاية كود صفحة المخالفات مع التوضيح
// =======================
