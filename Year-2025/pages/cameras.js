// =======================
// بداية كود صفحة الكاميرات منفصلة (يقرأ من cameras.json مباشر)
// =======================

// مصفوفة لتخزين بيانات الكاميرات بعد تحميلها من ملف cameras.json
let camerasData = [];

/**
 * دالة تحميل بيانات نظام الكاميرات من ملف cameras.json
 * @param {function} callback - دالة يتم تنفيذها بعد تحميل البيانات بنجاح أو فشل
 */
function loadCamerasData(callback) {
    fetch('cameras.json')
        .then(res => res.json())
        .then(data => {
            camerasData = data;
            if (callback) callback(); // استدعاء الدالة بعد التحميل
        })
        .catch(err => {
            alert('فشل تحميل بيانات نظام الكاميرات. تأكد من وجود الملف cameras.json');
            camerasData = [];
            if (callback) callback(); // استدعاء الدالة حتى في حال الفشل
            console.error(err);
        });
}

/**
 * دالة توليد HTML صفحة الكاميرات
 * تعتمد مباشرة على مصفوفة camerasData
 */
function getCamerasPageHtml() {
    let paidRows = '';
    let unpaidRows = '';
    let totalPaid = 0;
    let totalRemain = 0;

    (camerasData || []).forEach(rec => {
        let unit = rec["رقم الوحده"];
        let value = Number(rec["قيمة مساهمة نظام الكاميرات"]) || 0;
        let paid = Number(rec["المدفوع لنظام الكاميرات"]) || 0;
        let remain = Math.max(0, value - paid);

        if (paid >= value && value > 0) {
            totalPaid += paid;
            paidRows += `<tr>
                <td>${unit}</td>
                <td>${value}</td>
                <td>${paid}</td>
            </tr>`;
        } else if (value > 0) {
            unpaidRows += `<tr>
                <td>${unit}</td>
                <td>${value}</td>
                <td>${paid}</td>
                <td>${remain}</td>
            </tr>`;
            totalRemain += remain;
        }
    });

    return `
        <div class="mt-4 mb-4 p-3 bg-white rounded shadow-sm">

            <h4 class="mb-3 text-primary">تقرير منظومة الكاميرات الأمنية</h4>
            <div class="alert alert-info mb-4">رصد كامل للمدفوعات والمستحقات المتعلقة بنظام الكاميرات لكل وحدة</div>

            <!--
            =======================
            بداية جدول الوحدات المسددة لنظام الكاميرات
            =======================
            -->
            <h5 class="mt-4 mb-2 text-success">الوحدات المسددة لكامل مستحقات الكاميرات</h5>
            <div class="d-flex justify-content-end mb-2">
                <button id="printPaidCameras" class="btn btn-outline-success">طباعة بيانات الوحدات المسددة</button>
            </div>
            <div id="paidCamerasDiv" class="table-responsive mb-4">
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th colspan="3" class="text-center bg-success text-white">سجل الوحدات المسددة للكاميرات</th>
                        </tr>
                        <tr>
                            <th>رقم الوحدة</th>
                            <th>قيمة المساهمة المطلوبة</th>
                            <th>إجمالي المدفوع</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${paidRows || `<tr><td colspan="3" class="text-center">لا توجد وحدات قامت بالسداد الكامل بعد</td></tr>`}
                        <tr class="bg-info text-white font-weight-bold">
                            <td colspan="2">إجمالي السداد</td>
                            <td>${totalPaid}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <!--
            =======================
            نهاية جدول الوحدات المسددة لنظام الكاميرات
            =======================
            -->

            <br><br><br><br>

            <!--
            =======================
            بداية جدول الوحدات غير المسددة لنظام الكاميرات
            =======================
            -->
            <h5 class="mt-4 mb-2 text-danger">الوحدات غير المسددة أو المسددة جزئياً لمستحقات الكاميرات</h5>
            <div class="d-flex justify-content-end mb-2">
                <button id="printUnpaidCameras" class="btn btn-outline-danger">طباعة بيانات الوحدات غير المسددة</button>
            </div>
            <div id="unpaidCamerasDiv" class="table-responsive">
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th colspan="4" class="text-center bg-danger text-white">سجل الوحدات غير المسددة للكاميرات</th>
                        </tr>
                        <tr>
                            <th>رقم الوحدة</th>
                            <th>قيمة المساهمة المطلوبة</th>
                            <th>إجمالي المدفوع</th>
                            <th>المتبقي</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${unpaidRows || `<tr><td colspan="4" class="text-center">كل الوحدات ملتزمة بالسداد الكامل</td></tr>`}
                        <tr class="bg-danger text-white font-weight-bold">
                            <td colspan="3">إجمالي المتبقي على الوحدات</td>
                            <td>${totalRemain}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <!--
            =======================
            نهاية جدول الوحدات غير المسددة لنظام الكاميرات
            =======================
            -->

        </div>
    `;
}

/**
 * دالة تفعيل أزرار الطباعة الخاصة بصفحة الكاميرات
 * تستخدم html2canvas و jsPDF لأخذ صورة من الجدول وتحويلها إلى PDF.
 */
function activateCamerasPrintButtons() {
    // طباعة جدول المدفوع
    const printPaidBtn = document.getElementById('printPaidCameras');
    if (printPaidBtn) {
        printPaidBtn.onclick = function () {
            let element = document.getElementById('paidCamerasDiv');
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
                pdf.save("سجل_الوحدات_المسددة_الكاميرات.pdf");
                element.style.backgroundColor = originalBg;
                element.className = originalClass;
            });
        }
    }

    // طباعة جدول غير المدفوع
    const printUnpaidBtn = document.getElementById('printUnpaidCameras');
    if (printUnpaidBtn) {
        printUnpaidBtn.onclick = function () {
            let element = document.getElementById('unpaidCamerasDiv');
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
                pdf.save("سجل_الوحدات_غير_المسددة_الكاميرات.pdf");
                element.style.backgroundColor = originalBg;
                element.className = originalClass;
            });
        }
    }
}
// =======================
// نهاية كود صفحة الكاميرات منفصلة (يقرأ من cameras.json مباشر)
// =======================

/*
طريقة الاستدعاء في صفحة العرض:
else if (page === 'cameras') {
    loadCamerasData(function() {
        document.getElementById('pageContent').innerHTML = getCamerasPageHtml();
        activateCamerasPrintButtons();
    });
}
*/