// owner.js - خدمة الوحدة السكنية (owner functionality)

/**
 * دالة مساعدة لتنسيق أي قيمة مالية بالجنيه المصري
 * @param {number} amount - المبلغ المراد تنسيقه
 * @returns {string} المبلغ بصيغة "EGP 2,600"
 */
function formatEGP(amount) {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * الدالة الرئيسية لإنتاج كود HTML لصفحة المالك
 * @returns {string} محتوى HTML لصفحة المالك
 */
function getOwnerPageHtml() {
  const rec = currentUser;
  return `
    <div class="p-3 d-flex justify-content-between align-items-center">
      <div><button id="printPDF" class="btn btn-primary"><i class="fas fa-file-pdf me-2"></i> حفظ التقرير كـ PDF</button></div>
      <div><button onclick="navigate('home',event)" class="btn btn-outline-primary">
        <i class="fas fa-arrow-left me-2"></i>عودة
      </button></div>
    </div>

    <div id="contentToPrint" class="p-3 bg-white rounded shadow-sm">
      <h4 class="text-primary text-center mb-4">
        لوحة معلومات الوحدة السكنية رقم ${rec["رقم الوحده"]}
      </h4>
      ${getOwnerDetailsHtml()}
    </div>
  `;
}

/**
 * تفعيل وظيفة زر الطباعة لصفحة المالك
 */
function activateOwnerPrintButton() {
  const printBtn = document.getElementById('printPDF');
  if (!printBtn) return;
  printBtn.onclick = () => {
    const element = document.getElementById('contentToPrint');
    html2canvas(element, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width * 0.75;
      const imgHeight = canvas.height * 0.75;
      const pdf = new jspdf.jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: [imgWidth, imgHeight]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('تقرير_الوحدة_السكنية.pdf');
    });
  };
}

/**
 * توليد كود HTML لقسم تفاصيل الوحدة
 * @returns {string}
 */
function getOwnerDetailsHtml() {
  const rec = currentUser;
  let rows = '';

  // جدول معلومات عامة
  rows += `
    <div class="table-responsive mb-4">
      <table class="table table-bordered text-center">
        <tbody>
          <tr>
            <th colspan="2" class="bg-info text-white">معلومات الوحدة رقم ${rec["رقم الوحده"]}</th>
          </tr>
  `;

  // نعرض كل مفتاح باستثناء كلمات المرور والحقول الشهرية والصيانة السنوية
  for (let key in rec) {
    if (
      key === 'كلمة المرور' ||
      key.startsWith('شهر') ||
      ['قيمة الصيانة السنوية', 'المدفوع للصيانة السنوية', 'المتبقي من قيمة الصيانة السنوية'].includes(key)
    ) continue;

    let value = rec[key];

    rows += `<tr><th class="bg-light" style="width:40%">${key}</th><td>${value}</td></tr>`;
  }

  rows += `
        </tbody>
      </table>
    </div>
  `;

  // إضافة تقرير الصيانة السنوية
  rows += generateAnnualMaintenanceReport(rec);
  // إضافة سجل الدفعات الشهرية
  rows += generateMonthlyPaymentsReport(rec);

  // المساحات الديناميكية للمساهمات والغرامات والمستحقات الكلّيّة
  rows += `<hr class="mb-4">
           <div id="unitOtherTable"></div>
           <div id="unitFinesTable"></div>
           <div id="unitTotalDebtsTable"></div>`;

  return rows;
}

/**
 * يولّد تقرير الصيانة السنوية (إن وجد)
 */
function generateAnnualMaintenanceReport(rec) {
  const months = [
    "شهر يناير (1)", "شهر فبراير (2)", "شهر مارس (3)", "شهر إبريل (4)",
    "شهر مايو (5)", "شهر يونيو (6)", "شهر يوليو (7)", "شهر أغسطس (8)",
    "شهر سبتمبر (9)", "شهر أكتوبر (10)", "شهر نوفمبر (11)", "شهر ديسمبر (12)"
  ];
  const paid = months.reduce((sum, m) => sum + (Number(rec[m]) || 0), 0);
  const value = Number(rec["قيمة الصيانة السنوية"]) || 0;
  const remain = Math.max(0, value - paid);

  if (!value && !paid) return '';

  return `
    <div class="table-responsive mb-4">
      <table class="table table-bordered text-center">
        <thead>
          <tr><th colspan="2" class="bg-info text-white">تقرير الصيانة السنوية للوحدة رقم ${rec["رقم الوحده"]}</th></tr>
        </thead>
        <tbody>
          <tr><th>إجمالي رسوم الصيانة السنوية</th><td>${formatEGP(value)}</td></tr>
          <tr><th>إجمالي المدفوع من رسوم الصيانة</th><td>${formatEGP(paid)}</td></tr>
          <tr><th>المتبقي من رسوم الصيانة السنوية</th><td>${formatEGP(remain)}</td></tr>
        </tbody>
      </table>
    </div>
  `;
}

/**
 * يولّد سجل الدفعات الشهرية (إن وجد)
 */
function generateMonthlyPaymentsReport(rec) {
  const months = Object.keys(rec).filter(k => k.startsWith('شهر'));
  if (!months.length) return '';
  return `
    <div class="table-responsive mb-4">
      <table class="table table-bordered text-center">
        <thead>
          <tr><th colspan="2" class="bg-info text-white">سجل الدفعات الشهرية للوحدة رقم ${rec["رقم الوحده"]}</th></tr>
          <tr><th>الشهر</th><th>المبلغ المدفوع</th></tr>
        </thead>
        <tbody>
          ${months.map(m => `<tr><td>${m}</td><td>${formatEGP(Number(rec[m])||0)}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * تحميل وعرض بيانات المساهمات الأخرى للوحدة
 */
function loadOwnerContributionsData() {
  const unitNumber = currentUser["رقم الوحده"];
  fetch(`other.json?v=${Date.now()}`)
    .then(res => res.json())
    .then(otherData => {
      const unitOther = otherData.filter(o => String(o["رقم الوحده"]) === String(unitNumber));
      let html = '';

      if (unitOther.length) {
        html = `
          <div class="table-responsive mb-4">
            <table class="table table-bordered text-center">
              <thead>
                <tr><th colspan="5" class="bg-secondary text-white">سجل المساهمات الأخرى للوحدة رقم ${unitNumber}</th></tr>
                <tr>
                  <th>نوع المساهمة</th>
                  <th>قيمة المساهمة</th>
                  <th>ما تم دفعه</th>
                  <th>المتبقي</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                ${unitOther.map(o => {
                  const val = Number(o["قيمة المساهمة"])||0;
                  const paid = Number(o["المدفوع"])||0;
                  const rem = Math.max(0, val - paid);
                  const status = paid >= val && val>0 ? 'تم السداد' : (val>0 ? 'غير مسدد' : 'لا يوجد مستحقات');
                  return `
                    <tr>
                      <td>${o["نوع المساهمة"]||'-'}</td>
                      <td>${formatEGP(val)}</td>
                      <td>${formatEGP(paid)}</td>
                      <td>${formatEGP(rem)}</td>
                      <td>${status}</td>
                    </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>`;
      } else {
        html = `<div class="alert alert-success text-center">لا توجد مساهمات أخرى على هذه الوحدة.</div>`;
      }

      document.getElementById('unitOtherTable').innerHTML = html;
    })
    .catch(err => {
      document.getElementById('unitOtherTable').innerHTML = `<div class="alert alert-danger">فشل تحميل بيانات المساهمات الأخرى.</div>`;
      console.error(err);
    });
}

/**
 * تحميل وعرض بيانات الغرامات للمخالفات للوحدة
 */
function loadOwnerFinesData() {
  const unitNumber = currentUser["رقم الوحده"];
  fetch(`almokhalafat.json?v=${Date.now()}`)
    .then(res => res.json())
    .then(finesData => {
      const unitFines = finesData.filter(f => String(f["رقم الوحده"]) === String(unitNumber));
      let html = '';

      if (unitFines.length) {
        html = `
          <div class="table-responsive mb-4">
            <table class="table table-bordered text-center">
              <thead>
                <tr><th colspan="5" class="bg-danger text-white">سجل مخالفات وغرامات الوحدة رقم ${unitNumber}</th></tr>
                <tr>
                  <th>نوع المخالفة</th>
                  <th>قيمة الغرامة</th>
                  <th>المدفوع</th>
                  <th>المتبقي</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                ${unitFines.map(f => {
                  const val = Number(f["قيمة الغرامة"])||0;
                  const paid = Number(f["المدفوع"])||0;
                  const rem = Math.max(0, val - paid);
                  const status = paid >= val && val>0 ? 'تم السداد' : (val>0 ? 'غير مسدد' : 'بدون غرامة');
                  return `
                    <tr>
                      <td>${f["نوع المخالفة"]||'-'}</td>
                      <td>${formatEGP(val)}</td>
                      <td>${formatEGP(paid)}</td>
                      <td>${formatEGP(rem)}</td>
                      <td>${status}</td>
                    </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>`;
      } else {
        html = `<div class="alert alert-success text-center">لا توجد مخالفات أو غرامات حالية.</div>`;
      }

      document.getElementById('unitFinesTable').innerHTML = html;
    })
    .catch(err => {
      document.getElementById('unitFinesTable').innerHTML = `<div class="alert alert-danger">فشل تحميل بيانات الغرامات.</div>`;
      console.error(err);
    });
}

/**
 * حساب وعرض ملخص المستحقات الكلّيّة للوحدة
 */
function loadTotalObligationsData() {
  const unitNumber = currentUser["رقم الوحده"];
  let totalRemain = 0;
  let rows = '';

  // رسوم الصيانة السنوية
  const annualValue = Number(currentUser["قيمة الصيانة السنوية"])||0;
  const paidMonths = [
    "شهر يناير (1)", "شهر فبراير (2)", "شهر مارس (3)", "شهر إبريل (4)",
    "شهر مايو (5)", "شهر يونيو (6)", "شهر يوليو (7)", "شهر أغسطس (8)",
    "شهر سبتمبر (9)", "شهر أكتوبر (10)", "شهر نوفمبر (11)", "شهر ديسمبر (12)"
  ].reduce((s,m)=> s + (Number(currentUser[m])||0), 0);
  const remainAnnual = Math.max(0, annualValue - paidMonths);
  if (annualValue) {
    rows += `
      <tr>
        <td>رسوم الصيانة السنوية</td>
        <td>${formatEGP(annualValue)}</td>
        <td>${formatEGP(paidMonths)}</td>
        <td>${formatEGP(remainAnnual)}</td>
      </tr>`;
    totalRemain += remainAnnual;
  }

  // تحميل بيانات الغرامات والمساهمات معًا
  Promise.all([
    fetch(`almokhalafat.json?v=${Date.now()}`).then(r=>r.json()).catch(()=>[]),
    fetch(`other.json?v=${Date.now()}`).then(r=>r.json()).catch(()=>[])
  ]).then(([finesData, otherData])=>{
    // إضافات الغرامات
    finesData.filter(f=>String(f["رقم الوحده"])===String(unitNumber))
      .forEach(f=>{
        const val = Number(f["قيمة الغرامة"])||0;
        const paid = Number(f["المدفوع"])||0;
        const rem = Math.max(0,val-paid);
        rows += `
          <tr>
            <td>غرامة: ${f["نوع المخالفة"]||'-'}</td>
            <td>${formatEGP(val)}</td>
            <td>${formatEGP(paid)}</td>
            <td>${formatEGP(rem)}</td>
          </tr>`;
        totalRemain += rem;
      });

    // إضافات المساهمات الأخرى
    otherData.filter(o=>String(o["رقم الوحده"])===String(unitNumber))
      .forEach(o=>{
        const val = Number(o["قيمة المساهمة"])||0;
        const paid = Number(o["المدفوع"])||0;
        const rem = Math.max(0,val-paid);
        rows += `
          <tr>
            <td>مساهمة أخرى: ${o["نوع المساهمة"]||'-'}</td>
            <td>${formatEGP(val)}</td>
            <td>${formatEGP(paid)}</td>
            <td>${formatEGP(rem)}</td>
          </tr>`;
        totalRemain += rem;
      });

    // بناء الجدول النهائي
    const html = `
      <div class="table-responsive mb-4">
        <table class="table table-bordered text-center">
          <thead>
            <tr><th colspan="4" class="bg-warning text-dark">ملخص المستحقات للوحدة رقم ${unitNumber}</th></tr>
            <tr><th>البند</th><th>المطلوب</th><th>المدفوع</th><th>المتبقي</th></tr>
          </thead>
          <tbody>
            ${rows}
            <tr class="bg-dark text-white">
              <td colspan="3">الإجمالي المتبقي على الوحدة</td>
              <td>${formatEGP(totalRemain)}</td>
            </tr>
          </tbody>
        </table>
      </div>`;
    document.getElementById('unitTotalDebtsTable').innerHTML = html;
  }).catch(err=>{
    document.getElementById('unitTotalDebtsTable').innerHTML = `<div class="alert alert-danger">فشل تحميل بيانات المستحقات.</div>`;
    console.error(err);
  });
}

/**
 * تحميل وعرض كل بيانات المالك
 * @param {function} [callback] - دالة تُنفّذ بعد التحميل (اختياري)
 */
function loadOwnerData(callback) {
  if (typeof callback === 'function') callback();
  loadOwnerContributionsData();
  loadOwnerFinesData();
  loadTotalObligationsData();
}

/**
 * تهيئة صفحة المالك وعرضها
 */
function loadOwnerPage() {
  document.getElementById('pageContent').innerHTML = getOwnerPageHtml();
  activateOwnerPrintButton();
  loadOwnerContributionsData();
  loadOwnerFinesData();
  loadTotalObligationsData();
}

// للتصدير في بيئات تدعم modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getOwnerPageHtml,
    activateOwnerPrintButton,
    loadOwnerData,
    loadOwnerPage
  };
}
