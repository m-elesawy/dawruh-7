// =======================
// بداية كود صفحة مساهمات أخرى منفصلة (يقرأ من other.json مباشر)
// =======================

// مصفوفة لتخزين بيانات مساهمات أخرى بعد تحميلها من ملف other.json
let otherData = [];

/**
 * دالة تحميل بيانات مساهمات أخرى من ملف other.json
 * @param {function} callback - دالة يتم تنفيذها بعد تحميل البيانات بنجاح أو فشل
 */
function loadOtherData(callback) {
    fetch('other.json')
        .then(res => res.json())
        .then(data => {
            otherData = data;
            if (callback) callback(); // استدعاء الدالة بعد التحميل
        })
        .catch(err => {
            alert('فشل تحميل بيانات مساهمات أخرى. تأكد من وجود الملف other.json');
            otherData = [];
            if (callback) callback(); // استدعاء الدالة حتى في حال الفشل
            console.error(err);
        });
}

/**
 * دالة توليد HTML صفحة مساهمات أخرى
 */
function getOtherPageHtml() {
    let paidRows = '';
    let unpaidRows = '';
    let totalPaid = 0;
    let totalRemain = 0;

    (otherData || []).forEach(rec => {
        let unit = rec["رقم الوحده"];
        let type = rec["نوع المساهمة"] || "";
        let value = Number(rec["قيمة المساهمة"]) || 0;
        let paid = Number(rec["المدفوع"]) || 0;
        let remain = Math.max(0, value - paid);

        if (paid >= value && value > 0) {
            totalPaid += paid;
            paidRows += `<tr>
                <td>${unit}</td>
                <td>${type}</td>
                <td>${value}</td>
                <td>${paid}</td>
            </tr>`;
        } else if (value > 0) {
            unpaidRows += `<tr>
                <td>${unit}</td>
                <td>${type}</td>
                <td>${value}</td>
                <td>${paid}</td>
                <td>${remain}</td>
            </tr>`;
            totalRemain += remain;
        }
    });

    return `
        <div class="mt-4 mb-4 p-3 bg-white rounded shadow-sm">

         <div class="p-3 d-flex justify-content-between align-items-center">
            <div><h4 class="mb-0 text-primary">تقرير المساهمات الأخرى</h4></div>        
            <div><button onclick="navigate('home',event)" class="btn btn-outline-primary">عودة <i class="fas fa-arrow-left me-2"></i></button></div>
        </div>

            <!-- بداية جدول الوحدات المسددة للمساهمات الأخرى -->
            <h5 class="mt-4 mb-2 text-success">الوحدات المسددة لكامل مستحقات المساهمات الأخرى</h5>
            <div class="d-flex justify-content-end mb-2">
                <button id="printPaidOther" class="btn btn-outline-success">طباعة بيانات الوحدات المسددة</button>
            </div>
            <div id="paidOtherDiv" class="table-responsive mb-4">
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th colspan="4" class="text-center bg-success text-white">سجل الوحدات المسددة للمساهمات الأخرى</th>
                        </tr>
                        <tr>
                            <th>رقم الوحدة</th>
                            <th>نوع المساهمة</th>
                            <th>قيمة المساهمة المطلوبة</th>
                            <th>إجمالي المدفوع</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${paidRows || `<tr><td colspan="4" class="text-center">لا توجد وحدات قامت بالسداد الكامل بعد</td></tr>`}
                        <tr class="bg-info text-white font-weight-bold">
                            <td colspan="3">إجمالي السداد</td>
                            <td>${totalPaid}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <!-- نهاية جدول الوحدات المسددة للمساهمات الأخرى -->

            <br><br><br><br>

            <!-- بداية جدول الوحدات غير المسددة أو المسددة جزئياً للمساهمات الأخرى -->
            <h5 class="mt-4 mb-2 text-danger">الوحدات غير المسددة أو المسددة جزئياً لمستحقات المساهمات الأخرى</h5>
            <div class="d-flex justify-content-end mb-2">
                <button id="printUnpaidOther" class="btn btn-outline-danger">طباعة بيانات الوحدات غير المسددة</button>
            </div>
            <div id="unpaidOtherDiv" class="table-responsive">
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th colspan="5" class="text-center bg-danger text-white">سجل الوحدات غير المسددة للمساهمات الأخرى</th>
                        </tr>
                        <tr>
                            <th>رقم الوحدة</th>
                            <th>نوع المساهمة</th>
                            <th>قيمة المساهمة المطلوبة</th>
                            <th>إجمالي المدفوع</th>
                            <th>المتبقي</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${unpaidRows || `<tr><td colspan="5" class="text-center">كل الوحدات ملتزمة بالسداد الكامل</td></tr>`}
                        <tr class="bg-danger text-white font-weight-bold">
                            <td colspan="4">إجمالي المتبقي على الوحدات</td>
                            <td>${totalRemain}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <!-- نهاية جدول الوحدات غير المسددة أو المسددة جزئياً للمساهمات الأخرى -->

        </div>
    `;
}

/**
 * دالة تفعيل أزرار الطباعة الخاصة بصفحة المساهمات الأخرى
 */
function activateOtherPrintButtons() {
    // طباعة جدول المدفوع
    const printPaidBtn = document.getElementById('printPaidOther');
    if (printPaidBtn) {
        printPaidBtn.onclick = function () {
            let element = document.getElementById('paidOtherDiv');
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
                pdf.save("سجل_الوحدات_المسددة_مساهمات_اخرى.pdf");
                element.style.backgroundColor = originalBg;
                element.className = originalClass;
            });
        }
    }

    // طباعة جدول غير المدفوع
    const printUnpaidBtn = document.getElementById('printUnpaidOther');
    if (printUnpaidBtn) {
        printUnpaidBtn.onclick = function () {
            let element = document.getElementById('unpaidOtherDiv');
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
                pdf.save("سجل_الوحدات_غير_المسددة_مساهمات_اخرى.pdf");
                element.style.backgroundColor = originalBg;
                element.className = originalClass;
            });
        }
    }
}
// =======================
// نهاية كود صفحة مساهمات أخرى منفصلة (يقرأ من other.json مباشر)
// =======================

/*
طريقة الاستدعاء في صفحة العرض:
else if (page === 'other') {
    loadOtherData(function() {
        document.getElementById('pageContent').innerHTML = getOtherPageHtml();
        activateOtherPrintButtons();
    });
}
*/