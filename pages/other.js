// =======================
// بداية كود صفحة مساهمات أخرى (فلتر نوع واحد فقط - مع وصف المبالغ)
// =======================

let otherData = [];
let groupedData = {};

/**
 * تحميل بيانات ملف JSON
 */
function loadOtherData(callback) {
    fetch(`other.json?v=${new Date().getTime()}`)
        .then(res => res.json())
        .then(data => {
            otherData = data || [];
            groupDataByType();
            if (callback) callback();
        })
        .catch(err => {
            alert('فشل تحميل بيانات مساهمات أخرى. تأكد من وجود الملف other.json');
            console.error(err);
            otherData = [];
            groupedData = {};
            if (callback) callback();
        });
}

/**
 * تجميع حسب نوع المساهمة
 */
function groupDataByType() {
    groupedData = {};
    otherData.forEach(rec => {
        const type = rec["نوع المساهمة"] || "غير محدد";
        const unit = rec["رقم الوحده"];
        const value = Number(rec["قيمة المساهمة"]) || 0;
        const paid = Number(rec["المدفوع"]) || 0;
        const remain = Math.max(0, value - paid);

        if (!groupedData[type]) {
            groupedData[type] = {
                totalPaid: 0,
                totalRemain: 0,
                records: []
            };
        }

        groupedData[type].totalPaid += paid;
        groupedData[type].totalRemain += remain;
        groupedData[type].records.push({ unit, value, paid, remain });
    });
}

/**
 * تنسيق المبلغ بالعملة مع وصف
 */
function formatEGP(amount, label) {
    return `EGP ${amount.toLocaleString('en-EG', { minimumFractionDigits: 0 })} <span class="text-muted small">(${label})</span>`;
}

/**
 * إنشاء HTML الصفحة
 */
function getOtherPageHtml() {
    const types = Object.keys(groupedData);
    const filterOptions = types.map(type => `<option value="${type}">${type}</option>`).join("");

    return `
        <div class="p-3 d-flex justify-content-between align-items-center">
            <div><h4 class="mb-0 text-primary">تقرير المساهمات الأخرى</h4></div>        
            <div><button onclick="navigate('home',event)" class="btn btn-outline-primary">عودة <i class="fas fa-arrow-left me-2"></i></button></div>
        </div>

        <div class="mb-4 p-3 bg-white rounded shadow-sm">
            <div class="d-flex justify-content-between mb-3">
                <div>
                    <label for="contribFilter" class="form-label fw-bold">اختر نوع المساهمة:</label>
                    <select id="contribFilter" class="form-select">
                        ${filterOptions}
                    </select>
                </div>
                <button id="printFiltered" class="btn bg-primary text-white align-self-end">
                    <i class="fas fa-file-pdf me-2"></i> طباعة التقرير الحالي
                </button>
            </div>

            <div id="contribTableContainer" class="table-responsive"></div>
        </div>
    `;
}

/**
 * تفعيل زر الطباعة والفلتر
 */
function activateOtherPrintButtons() {
    const select = document.getElementById('contribFilter');
    const printBtn = document.getElementById('printFiltered');
    const container = document.getElementById('contribTableContainer');

    select.onchange = updateTable;
    updateTable();

    printBtn.onclick = function () {
        const element = container;
        const originalClass = element.className;
        element.className += " mt-4 mb-4 p-3 bg-white rounded shadow-sm";
        html2canvas(element, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = canvas.width * 0.75;
            const imgHeight = canvas.height * 0.75;
            const pdf = new jspdf.jsPDF({
                orientation: imgWidth > imgHeight ? "landscape" : "portrait",
                unit: "pt",
                format: [imgWidth, imgHeight]
            });
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            const filename = `تقرير_${select.value}.pdf`;
            pdf.save(filename);
            element.className = originalClass;
        });
    };
}

/**
 * تحديث محتوى الجدول حسب النوع المختار
 */
function updateTable() {
    const selected = document.getElementById('contribFilter').value;
    const container = document.getElementById('contribTableContainer');
    const data = groupedData[selected];

    let html = `
        <table class="table table-bordered">
            <thead>
                <tr class="bg-secondary text-white text-center">
                    <th>رقم الوحدة</th>
                    <th>نوع المساهمة</th>
                    <th>قيمة المساهمة</th>
                    <th>المدفوع</th>
                    <th>المتبقي</th>
                </tr>
            </thead>
            <tbody>`;

    data.records.forEach(rec => {
        html += `
            <tr>
                <td>${rec.unit}</td>
                <td>${selected}</td>
                <td>${formatEGP(rec.value, "المطلوب")}</td>
                <td>${formatEGP(rec.paid, "مدفوع")}</td>
                <td>${formatEGP(rec.remain, "غير مدفوع")}</td>
            </tr>`;
    });

    html += `
        <tr class="bg-info text-white fw-bold">
            <td colspan="3">إجمالي ${selected}</td>
            <td>المدفوع: ${formatEGP(data.totalPaid)}</td>
            <td>الغير مدفوع: ${formatEGP(data.totalRemain)}</td>
        </tr>
        </tbody>
        </table>`;

    container.innerHTML = html;
}

// =======================
// نهاية كود صفحة مساهمات أخرى (فلتر نوع واحد فقط - مع وصف المبالغ)
// =======================

/*
طريقة الاستدعاء في صفحة العرض:
else if (page === 'other') {
    loadOtherData(function () {
        document.getElementById('pageContent').innerHTML = getOtherPageHtml();
        activateOtherPrintButtons();
    });
}
*/
