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
	fetch(`seyanah.json?v=${new Date().getTime()}`)
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
                <td>${Number(annualValue).toLocaleString("en-EG", { style: "currency", currency: "EGP", minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                <td>${Number(paid).toLocaleString("en-EG", { style: "currency", currency: "EGP", minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
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
                <td>${Number(annualValue).toLocaleString("en-EG", { style: "currency", currency: "EGP", minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                <td>${Number(paid).toLocaleString("en-EG", { style: "currency", currency: "EGP", minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                <td>${monthsPaidCount}</td>
                <td>${Number(remain).toLocaleString("en-EG", { style: "currency", currency: "EGP", minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
            </tr>`;
            totalUnpaid += remain;
            countUnpaidUnits++;
        }
    });

    // إرجاع كود HTML مع الجدولين والإجماليات
    return `
        
		<div class="p-3 d-flex justify-content-between align-items-center">
		<div><h4 class="text-primary">تقرير الصيانة السنوية للوحدات</h4></div>		
		<div><button onclick="navigate('home',event)" class="btn btn-outline-primary">عودة <i class="fas fa-arrow-left me-2"></i></button></div>
		</div>
		
		
		<div class="mt-4 mb-4 p-3 bg-white rounded shadow-sm">
            <!-- جدول المسددين -->
            <div class="d-flex justify-content-end mb-2">
                <button id="printPaidRepair" class="btn bg-success text-white"><i class="fas fa-file-pdf me-2"></i> حفظ التقرير كـ PDF</button>
            </div>
            <div id="paidRepairDiv" class="table-responsive mb-4">
                <table class="table table-bordered">
                    <thead>
					<tr><th class="text-center bg-success text-white" colspan="5">الوحدات المسددة لكامل الصيانة السنوية</th></tr>
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
                            <td colspan="3">إجمالي الوحدات المسددة بالكامل</td>
                            <td colspan="2">${Number(totalPaid).toLocaleString("en-EG", { style: "currency", currency: "EGP", minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                        </tr>
                        <tr>
                            <td colspan="5" class="text-center">عدد الوحدات المسددة بالكامل: ${countPaidUnits}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <br><br>
            <!-- جدول غير المسددين -->
            <div class="d-flex justify-content-end mb-2">
                <button id="printUnpaidRepair" class="btn bg-danger text-white"><i class="fas fa-file-pdf me-2"></i> حفظ التقرير كـ PDF</button>
            </div>
            <div id="unpaidRepairDiv" class="table-responsive">
                <table class="table table-bordered">
                    <thead>
					<tr><th class="text-center bg-danger text-white" colspan="6">الوحدات غير المسددة أو المسددة جزئياً للصيانة السنوية</th></tr>
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
                            <td>${Number(totalUnpaid).toLocaleString("en-EG", { style: "currency", currency: "EGP", minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
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

/**
 * دالة عرض صفحة الصيانة السنوية في عنصر div#pageContent
 */
function showRepairPage() {
    loadRepairData(() => {
        document.getElementById('pageContent').innerHTML = getRepairPageHtml();
        activateRepairPrintButtons();
    });
}
