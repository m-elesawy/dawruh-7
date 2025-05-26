// =======================
// كود صفحة المصروفات العمومية (masrufat) مع التعليقات والتوضيحات بالعربية
// =======================

// مصفوفة لتخزين بيانات المصروفات بعد تحميلها من ملف masrufat.json
let masrufatData = [];

/**
 * دالة تحميل بيانات المصروفات من ملف masrufat.json
 * @param {function} callback - دالة يتم تنفيذها بعد تحميل البيانات بنجاح أو فشل
 */
function loadMasrufatData(callback) {
	fetch(`masrufat.json?v=${new Date().getTime()}`)
        .then(res => res.json())
        .then(data => {
            masrufatData = data;
            if (callback) callback(); // استدعاء الدالة بعد التحميل
        })
        .catch(err => {
            alert('فشل تحميل بيانات المصروفات. تأكد من وجود الملف masrufat.json');
            masrufatData = [];
            if (callback) callback(); // استدعاء الدالة حتى في حال الفشل
            console.error(err);
        });
}

/**
 * دالة توليد كود HTML لصفحة المصروفات.
 * تعرض جميع المصروفات مع الإجمالي في الأسفل.
 * @returns {string} كود HTML للصفحة
 */
function getMasrufatPageHtml() {
    let rows = '';      // صفوف المصروفات
    let total = 0;      // إجمالي المصروفات

    // المرور على كل سجل في بيانات المصروفات
    (masrufatData || []).forEach(rec => {
        let bayan = rec["البيان"] || '';
        let amount = Number(rec["المبلغ"]) || 0;
        let notes = rec["ملاحظات"] || '';
        total += amount;
        rows += `<tr>
            <td>${bayan}</td>
            <td>EGP ${amount.toLocaleString('en-EG')}</td>
            <td>${notes}</td>
        </tr>`;
    });

    // إرجاع كود HTML مع الجدول والإجمالي
    return `
        
		<div class="p-3 d-flex justify-content-between align-items-center">
			<button id="printMasrufat" class="btn btn-primary text-white shadow-sm px-4"><i class="fas fa-file-pdf me-2"></i> حفظ كـ PDF</button>
			<div><button onclick="navigate('home',event)" class="btn btn-outline-primary">عودة <i class="fas fa-arrow-left me-2"></i></button></div>
			</div>
			
<div class="p-3 bg-white rounded shadow-sm">

    <!-- عنوان التقرير -->
    <div class="text-center mb-4">
        <h4 class="text-center text-primary fw-bold mb-4 border-bottom pb-4">تقرير المصروفات العمومية</h4>
    </div>

    <!-- جدول المصروفات -->
    <div id="masrufatDiv" class="table-responsive">
        <table class="table table-striped table-hover table-bordered align-middle text-center">
            <thead class="table-success">
                <tr>
                    <th>البيان</th>
                    <th>المبلغ</th>
                    <th>ملاحظات</th>
                </tr>
            </thead>
            <tbody>
                ${rows || `<tr><td colspan="3" class="text-center text-muted">لا توجد مصروفات مُسجلة</td></tr>`}
                <tr class="bg-info text-white fw-bold fs-6">
                    <td>إجمالي المصروفات</td>
                    <td>EGP ${total.toLocaleString('en-EG')}</td>
                    <td></td>
                </tr>
            </tbody>
        </table>
    </div>
</div>


    `;
}

/**
 * دالة تفعيل زر طباعة تقرير المصروفات.
 * تستخدم html2canvas و jsPDF لأخذ صورة من الجدول وتحويلها إلى PDF.
 */
function activateMasrufatPrintButton() {
    const printBtn = document.getElementById('printMasrufat');
    if (printBtn) {
        printBtn.onclick = function () {
            let element = document.getElementById('masrufatDiv');
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
                pdf.save("تقرير_المصروفات.pdf");
                // استرجاع المظهر الأصلي بعد الطباعة
                element.style.backgroundColor = originalBg;
                element.className = originalClass;
            });
        }
    }
}
// =======================
// نهاية كود صفحة المصروفات العمومية (masrufat)
// =======================
