// =======================
// كود صفحة الصيانة السنوية (repair) مع تعديل "اسم المالك" إلى "الحالة"
// =======================

// مصفوفة لتخزين بيانات الصيانة بعد تحميلها من ملف seyanah.json
let repairData = [];

/**
 * دالة تحميل بيانات الصيانة السنوية من ملف seyanah.json
 * @param {function} callback - دالة يتم تنفيذها بعد تحميل البيانات بنجاح أو فشل
 */
function loadRepairData(callback) {
    fetch('seyanah.json')
        .then(res => res.json())
        .then(data => {
            repairData = data;
            if (callback) callback(); // استدعاء الدالة بعد التحميل
        })
        .catch(err => {
            alert('فشل تحميل بيانات الصيانة السنوية. تأكد من وجود الملف seyanah.json');
            repairData = [];
            if (callback) callback(); // استدعاء الدالة حتى في حال الفشل
            console.error(err);
        });
}

/**
 * دالة توليد كود HTML لصفحة الصيانة السنوية.
 * تفصل الوحدات المسددة تماماً عن غير المسددة أو المسددة جزئياً وتظهر الإجماليات وعدد الشهور المدفوعة.
 * @returns {string} كود HTML للصفحة
 */
function getRepairPageHtml() {
    const monthNames = [
        "شهر يناير (1)", "شهر فبراير (2)", "شهر مارس (3)", "شهر إبريل (4)",
        "شهر مايو (5)", "شهر يونيو (6)", "شهر يوليو (7)", "شهر أغسطس (8)",
        "شهر سبتمبر (9)", "شهر أكتوبر (10)", "شهر نوفمبر (11)", "شهر ديسمبر (12)"
    ];

    let paidRows = '';      // صفوف الوحدات المسددة تماما
    let unpaidRows = '';    // صفوف الوحدات غير المسددة أو المسددة جزئيا
    let totalPaid = 0;      // إجمالي المدفوع
    let totalUnpaid = 0;    // إجمالي المتبقي غير المدفوع
    let countPaidUnits = 0;     // عدد الوحدات المسددة تماما
    let countUnpaidUnits = 0;   // عدد الوحدات غير المسددة أو المسددة جزئيا

    // المرور على كل سجل في بيانات الصيانة
    (repairData || []).forEach(rec => {
        let unit = rec["رقم الوحده"];
        let status = rec["الحالة"] || '';
        let annualValue = Number(rec["قيمة الصيانة السنوية"]) || 0;

        // حساب المدفوع (مجموع الشهور)
        let paid = monthNames.reduce((sum, m) => sum + (Number(rec[m]) || 0), 0);
        let remain = Math.max(0, annualValue - paid);

        // حساب عدد الشهور المدفوعة
        let monthsPaidCount = monthNames.filter(m => Number(rec[m]) > 0).length;

        // الوحدة دفعت كل الصيانة السنوية
        if (annualValue > 0 && paid >= annualValue) {
            paidRows += `<tr>
                <td>${unit}</td>
                <td>${status}</td>
                <td>${annualValue}</td>
                <td>${paid}</td>
                <td>${monthsPaidCount}</td>
            </tr>`;
            totalPaid += paid;
            countPaidUnits++;
        }
        // الوحدة عليها متبقي (لم تدفع أو دفعت جزئي)
        else if (annualValue > 0) {
            unpaidRows += `<tr>
                <td>${unit}</td>
                <td>${status}</td>
                <td>${annualValue}</td>
                <td>${paid}</td>
                <td>${monthsPaidCount}</td>
                <td>${remain}</td>
            </tr>`;
            totalUnpaid += remain;
            countUnpaidUnits++;
        }
    });

    // إرجاع كود HTML مع الجدولين والإجماليات
    return `
        <div class="mt-4 mb-4 p-3 bg-white rounded shadow-sm">
            <h4 class="mb-3 text-primary">تقرير الصيانة السنوية للوحدات</h4>
            <div class="alert alert-info mb-4">
                رصد كامل للمدفوعات والمتبقي من رسوم الصيانة السنوية وعدد الشهور المدفوعة لكل وحدة
            </div>
            <!-- جدول المسددين -->
            <h5 class="mt-4 mb-2 text-success">الوحدات المسددة لكامل الصيانة السنوية</h5>
            <div class="d-flex justify-content-end mb-2">
                <button id="printPaidRepair" class="btn btn-outline-success">طباعة بيانات الوحدات المسددة</button>
            </div>
            <div id="paidRepairDiv" class="table-responsive mb-4">
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>رقم الوحدة</th>
                            <th>الحالة</th>
                            <th>قيمة الصيانة السنوية</th>
                            <th>إجمالي المدفوع</th>
                            <th>عدد الشهور المدفوعة</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${paidRows || `<tr><td colspan="5" class="text-center">لا توجد وحدات قامت بالسداد الكامل بعد</td></tr>`}
                        <tr class="bg-info text-white font-weight-bold">
                            <td colspan="3">إجمالي السداد</td>
                            <td colspan="2">${totalPaid}</td>
                        </tr>
                        <tr>
                            <td colspan="5" class="text-center">عدد الوحدات المسددة: ${countPaidUnits}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <br><br>
            <!-- جدول غير المسددين -->
            <h5 class="mt-4 mb-2 text-danger">الوحدات غير المسددة أو المسددة جزئياً للصيانة السنوية</h5>
            <div class="d-flex justify-content-end mb-2">
                <button id="printUnpaidRepair" class="btn btn-outline-danger">طباعة بيانات الوحدات غير المسددة</button>
            </div>
            <div id="unpaidRepairDiv" class="table-responsive">
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>رقم الوحدة</th>
                            <th>الحالة</th>
                            <th>قيمة الصيانة السنوية</th>
                            <th>إجمالي المدفوع</th>
                            <th>عدد الشهور المدفوعة</th>
                            <th>المتبقي</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${unpaidRows || `<tr><td colspan="6" class="text-center">كل الوحدات ملتزمة بالسداد الكامل</td></tr>`}
                        <tr class="bg-danger text-white font-weight-bold">
                            <td colspan="5">إجمالي المتبقي على الوحدات</td>
                            <td>${totalUnpaid}</td>
                        </tr>
                        <tr>
                            <td colspan="6" class="text-center">عدد الوحدات غير المسددة: ${countUnpaidUnits}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

/**
 * دالة تفعيل أزرار الطباعة الخاصة بصفحة الصيانة السنوية.
 * تستخدم html2canvas و jsPDF لأخذ صورة من الجدول وتحويلها إلى PDF.
 */
function activateRepairPrintButtons() {
    // تفعيل زر طباعة جدول المسددين
    const printPaidBtn = document.getElementById('printPaidRepair');
    if (printPaidBtn) {
        printPaidBtn.onclick = function () {
            let element = document.getElementById('paidRepairDiv');
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
                pdf.save("سجل_الوحدات_المسددة_الصيانة.pdf");
                // استرجاع المظهر الأصلي بعد الطباعة
                element.style.backgroundColor = originalBg;
                element.className = originalClass;
            });
        }
    }
    // تفعيل زر طباعة جدول غير المسددين
    const printUnpaidBtn = document.getElementById('printUnpaidRepair');
    if (printUnpaidBtn) {
        printUnpaidBtn.onclick = function () {
            let element = document.getElementById('unpaidRepairDiv');
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
                pdf.save("سجل_الوحدات_غير_المسددة_الصيانة.pdf");
                // استرجاع المظهر الأصلي بعد الطباعة
                element.style.backgroundColor = originalBg;
                element.className = originalClass;
            });
        }
    }
}

// =======================
// نهاية كود صفحة الصيانة السنوية (repair) مع التوضيح
// =======================