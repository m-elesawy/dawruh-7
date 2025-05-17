// =======================
// بداية كود صفحة الرئيسية منفصلة
// =======================

function getHomePageHtml() {
    const rec = currentUser;
    let html = `
        <div id="contentToPrint" class="mt-4 mb-4 p-3 bg-white rounded shadow-sm">
            <!-- بداية صفحة الرئيسية: بيانات الوحدة وتفاصيلها -->
            <h4 class="text-center mb-4 text-primary">لوحة معلومات الوحدة السكنية</h4>
            <div class="alert alert-info text-center mb-4">تجد هنا جميع التفاصيل المالية والإدارية الخاصة بوحدتك السكنية</div>
            ${getHomeDetailsHtml()}
        </div>
        <button id="printPDF" class="btn btn-primary mb-4 d-block mx-auto">طباعة التقرير كـ PDF</button>
    `;
    return html;
}

// زر طباعة PDF للصفحة الرئيسية
function activateHomePrintButton() {
    const printBtn = document.getElementById('printPDF');
    if (printBtn) {
        printBtn.onclick = function () {
            var element = document.getElementById('contentToPrint');
            html2canvas(element, { scale: 2 }).then(function (canvas) {
                var imgData = canvas.toDataURL('image/png');
                var imgWidth = canvas.width * 0.75;
                var imgHeight = canvas.height * 0.75;
                var pdf = new jspdf.jsPDF({
                    orientation: "portrait",
                    unit: "pt",
                    format: [imgWidth, imgHeight]
                });
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                pdf.save("تقرير_الوحدة_السكنية.pdf");
            });
        };
    }
}
// =======================
// نهاية كود صفحة الرئيسية منفصلة
// =======================


// =======================
// بداية كود تفاصيل الوحدة الرئيسية
// =======================
function getHomeDetailsHtml() {
    const rec = currentUser;
    let html = `
        <h5 class="mb-3 text-center text-primary">تفاصيل الوحدة رقم ${rec["رقم الوحده"]}</h5>
        <div class="table-responsive mb-4">
            <table class="table table-bordered">
                <tbody>
    `;
    for (let key in rec) {
        if (key === "كلمة المرور" || key.startsWith("شهر")) continue;
        if (["قيمة الصيانة السنوية", "المدفوع للصيانة السنوية", "المتبقي من قيمة الصيانة السنوية"].includes(key)) continue;
        if (["قيمة مساهمة نظام الكاميرات", "المدفوع لنظام الكاميرات"].includes(key)) continue;
        if (["قيمة مساهمة خزانات المياه", "المدفوع لخزانات المياه"].includes(key)) continue;
        if (["قيمة مساهمة صيانة المصعد الطارئة", "المدفوع لصيانة المصعد الطارئة"].includes(key)) continue;
        html += `<tr><th class="bg-light" style="width:40%">${key}</th><td>${rec[key]}</td></tr>`;
    }
    html += `
                </tbody>
            </table>
        </div>
    `;



    // =======================
    // بداية تقرير الصيانة السنوية
    // =======================
    const monthNames = [
        "شهر يناير (1)", "شهر فبراير (2)", "شهر مارس (3)", "شهر إبريل (4)",
        "شهر مايو (5)", "شهر يونيو (6)", "شهر يوليو (7)", "شهر أغسطس (8)",
        "شهر سبتمبر (9)", "شهر أكتوبر (10)", "شهر نوفمبر (11)", "شهر ديسمبر (12)"
    ];

    let paid = monthNames.reduce((sum, m) => sum + (Number(rec[m]) || 0), 0);
    let value = Number(rec["قيمة الصيانة السنوية"]) || 0;
    let remain = value - paid;

    if (value || paid) {
        html += `
            <div class="table-responsive mb-4">
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th colspan="2" class="text-center bg-info text-white">تقرير الصيانة السنوية للوحدة</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><th>إجمالي رسوم الصيانة السنوية</th><td>${value}</td></tr>
                        <tr><th>إجمالي المدفوع من رسوم الصيانة</th><td>${paid}</td></tr>
                        <tr><th>المتبقي من رسوم الصيانة السنوية</th><td>${remain}</td></tr>
                    </tbody>
                </table>
            </div>
        `;
    }
    // =======================
    // نهاية تقرير الصيانة السنوية
    // =======================

    // =======================
    // بداية تقرير الدفعات الشهرية
    // =======================
    const months = Object.keys(rec).filter(k => k.startsWith("شهر"));
    if (months.length) {
        html += `
            <div class="table-responsive mb-4">
                <table class="table table-bordered months-table">
                    <thead>
                        <tr>
                            <th colspan="2" class="text-center bg-info text-white">سجل الدفعات الشهرية للصيانة</th>
                        </tr>
                        <tr>
                            <th>الشهر</th>
                            <th>المبلغ المدفوع</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${months.map(m => `<tr><td>${m}</td><td>${rec[m]}</td></tr>`).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    // =======================
    // نهاية تقرير الدفعات الشهرية
    // =======================

    html += `<hr class="mb-4">
        <h5 class="mb-3 text-center text-secondary">تقارير المساهمات الخاصة بالوحدة</h5>
    `;

 



// =======================
// بداية كود جدول بيانات صيانة المصعد الطارئة للوحدة أفقي من ملف elevator.json
// =======================

// ضع مكان ظهور جدول المصعد
html += `<div id="unitElevatorTable"></div>`;

// بعد عرض الصفحة (مثلاً بعد set innerHTML)، نادِ هذا الكود:
fetch('elevator.json')
    .then(res => res.json())
    .then((elevatorData) => {
        const unitNumber = rec["رقم الوحده"]; // تأكد أن rec معرف للوحدة الحالية
        const unitElevator = elevatorData.filter(e => String(e["رقم الوحده"]) === String(unitNumber));
        let elevatorHtml = '';
        if (unitElevator.length) {
            elevatorHtml = `
                <div class="table-responsive mb-4">
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th colspan="4" class="text-center bg-warning text-dark">سجل مساهمة صيانة المصعد الطارئة للوحدة</th>
                            </tr>
                            <tr>
                                <th>قيمة المساهمة المطلوبة</th>
                                <th>ما تم دفعه</th>
                                <th>المتبقي</th>
                                <th>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${
                                unitElevator.map(e => {
                                    const value = Number(e["قيمة مساهمة صيانة المصعد الطارئة"]) || 0;
                                    const paid = Number(e["المدفوع لصيانة المصعد الطارئة"]) || 0;
                                    const remain = value - paid;
                                    const status = (paid >= value && value > 0)
                                        ? "تم السداد"
                                        : (value > 0 ? "غير مسدد" : "لا يوجد مستحقات");
                                    return `
                                        <tr>
                                            <td>${value}</td>
                                            <td>${paid}</td>
                                            <td>${remain > 0 ? remain : 0}</td>
                                            <td>${status}</td>
                                        </tr>
                                    `;
                                }).join("")
                            }
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            elevatorHtml = `
                <div class="alert alert-success text-center mb-4">
                    لا توجد مستحقات أو بيانات خاصة بالمصعد على هذه الوحدة.
                </div>
            `;
        }
        document.getElementById('unitElevatorTable').innerHTML = elevatorHtml;
    })
    .catch(err => {
        document.getElementById('unitElevatorTable').innerHTML = `<div class="alert alert-danger">فشل تحميل بيانات صيانة المصعد. تأكد من وجود الملف elevator.json</div>`;
        console.error(err);
    });

// =======================
// نهاية كود جدول بيانات صيانة المصعد الطارئة للوحدة أفقي من ملف elevator.json
// =======================






// =======================
// بداية كود جدول بيانات خزانات الوحدة أفقي من ملف tanks.json
// =======================

// ضع مكان ظهور جدول الخزانات
html += `<div id="unitTanksTable"></div>`;

// بعد عرض الصفحة (مثلاً بعد set innerHTML)، نادِ هذا الكود:
fetch('tanks.json')
    .then(res => res.json())
    .then((tanksData) => {
        const unitNumber = rec["رقم الوحده"]; // تأكد أن rec معرف للوحدة الحالية
        const unitTanks = tanksData.filter(t => String(t["رقم الوحده"]) === String(unitNumber));
        let tanksHtml = '';
        if (unitTanks.length) {
            tanksHtml = `
                <div class="table-responsive mb-4">
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th colspan="4" class="text-center bg-info text-white">سجل مساهمة خزانات المياه للوحدة</th>
                            </tr>
                            <tr>
                                <th>قيمة المساهمة المطلوبة</th>
                                <th>ما تم دفعه</th>
                                <th>المتبقي</th>
                                <th>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${
                                unitTanks.map(t => {
                                    const value = Number(t["قيمة مساهمة خزانات المياه"]) || 0;
                                    const paid = Number(t["المدفوع لخزانات المياه"]) || 0;
                                    const remain = value - paid;
                                    const status = (paid >= value && value > 0)
                                        ? "تم السداد"
                                        : (value > 0 ? "غير مسدد" : "لا يوجد مستحقات");
                                    return `
                                        <tr>
                                            <td>${value}</td>
                                            <td>${paid}</td>
                                            <td>${remain > 0 ? remain : 0}</td>
                                            <td>${status}</td>
                                        </tr>
                                    `;
                                }).join("")
                            }
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            tanksHtml = `
                <div class="alert alert-success text-center mb-4">
                    لا توجد مستحقات أو بيانات خاصة بالخزانات على هذه الوحدة.
                </div>
            `;
        }
        document.getElementById('unitTanksTable').innerHTML = tanksHtml;
    })
    .catch(err => {
        document.getElementById('unitTanksTable').innerHTML = `<div class="alert alert-danger">فشل تحميل بيانات الخزانات. تأكد من وجود الملف tanks.json</div>`;
        console.error(err);
    });

// =======================
// نهاية كود جدول بيانات خزانات الوحدة أفقي من ملف tanks.json
// =======================





// =======================
// بداية كود جدول بيانات كاميرات الوحدة أفقي من ملف cameras.json
// =======================

// ضع مكان ظهور جدول الكاميرات
html += `<div id="unitCamerasTable"></div>`;

// بعد عرض الصفحة (مثلاً بعد set innerHTML)، نادِ هذا الكود:
fetch('cameras.json')
    .then(res => res.json())
    .then((camerasData) => {
        const unitNumber = rec["رقم الوحده"]; // تأكد أن rec معرف للوحدة الحالية
        const unitCameras = camerasData.filter(c => String(c["رقم الوحده"]) === String(unitNumber));
        let camerasHtml = '';
        if (unitCameras.length) {
            camerasHtml = `
                <div class="table-responsive mb-4">
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th colspan="4" class="text-center bg-primary text-white">سجل مساهمة نظام الكاميرات للوحدة</th>
                            </tr>
                            <tr>
                                <th>قيمة المساهمة المطلوبة</th>
                                <th>ما تم دفعه</th>
                                <th>المتبقي</th>
                                <th>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${
                                unitCameras.map(c => {
                                    const value = Number(c["قيمة مساهمة نظام الكاميرات"]) || 0;
                                    const paid = Number(c["المدفوع لنظام الكاميرات"]) || 0;
                                    const remain = value - paid;
                                    const status = (paid >= value && value > 0)
                                        ? "تم السداد"
                                        : (value > 0 ? "غير مسدد" : "لا يوجد مستحقات");
                                    return `
                                        <tr>
                                            <td>${value}</td>
                                            <td>${paid}</td>
                                            <td>${remain > 0 ? remain : 0}</td>
                                            <td>${status}</td>
                                        </tr>
                                    `;
                                }).join("")
                            }
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            camerasHtml = `
                <div class="alert alert-success text-center mb-4">
                    لا توجد مستحقات أو بيانات لنظام الكاميرات على هذه الوحدة.
                </div>
            `;
        }
        document.getElementById('unitCamerasTable').innerHTML = camerasHtml;
    })
    .catch(err => {
        document.getElementById('unitCamerasTable').innerHTML = `<div class="alert alert-danger">فشل تحميل بيانات الكاميرات. تأكد من وجود الملف cameras.json</div>`;
        console.error(err);
    });

// =======================
// نهاية كود جدول بيانات كاميرات الوحدة أفقي من ملف cameras.json
// =======================




// =======================
// بداية كود جدول بيانات المساهمات الأخرى للوحدة أفقي من ملف other.json
// =======================

// ضع مكان ظهور جدول المساهمات الأخرى
html += `<div id="unitOtherTable"></div>`;

// بعد عرض الصفحة (مثلاً بعد set innerHTML)، نادِ هذا الكود:
fetch('other.json')
    .then(res => res.json())
    .then((otherData) => {
        const unitNumber = rec["رقم الوحده"]; // تأكد أن rec معرف للوحدة الحالية
        const unitOther = otherData.filter(o => String(o["رقم الوحده"]) === String(unitNumber));
        let otherHtml = '';
        if (unitOther.length) {
            otherHtml = `
                <div class="table-responsive mb-4">
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th colspan="5" class="text-center bg-secondary text-white">سجل المساهمات الأخرى للوحدة</th>
                            </tr>
                            <tr>
                                <th>نوع المساهمة</th>
                                <th>قيمة المساهمة</th>
                                <th>ما تم دفعه</th>
                                <th>المتبقي</th>
                                <th>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${
                                unitOther.map(o => {
                                    const type = o["نوع المساهمة"] || "";
                                    const value = Number(o["قيمة المساهمة"]) || 0;
                                    const paid = Number(o["المدفوع"]) || 0;
                                    const remain = value - paid;
                                    const status = (paid >= value && value > 0)
                                        ? "تم السداد"
                                        : (value > 0 ? "غير مسدد" : "لا يوجد مستحقات");
                                    return `
                                        <tr>
                                            <td>${type}</td>
                                            <td>${value}</td>
                                            <td>${paid}</td>
                                            <td>${remain > 0 ? remain : 0}</td>
                                            <td>${status}</td>
                                        </tr>
                                    `;
                                }).join("")
                            }
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            otherHtml = `
                <div class="alert alert-success text-center mb-4">
                    لا توجد مستحقات أو بيانات مساهمات أخرى على هذه الوحدة.
                </div>
            `;
        }
        document.getElementById('unitOtherTable').innerHTML = otherHtml;
    })
    .catch(err => {
        document.getElementById('unitOtherTable').innerHTML = `<div class="alert alert-danger">فشل تحميل بيانات المساهمات الأخرى. تأكد من وجود الملف other.json</div>`;
        console.error(err);
    });

// =======================
// نهاية كود جدول بيانات المساهمات الأخرى للوحدة أفقي من ملف other.json
// =======================




// =======================
// بداية كود جدول غرامات الوحدة أفقي من ملف almokhalafat.json
// =======================

// بداية جدول غرامات الوحدة من ملف JSON مباشر
html += `<div id="unitFinesTable"></div>`; // مكان ظهور الجدول

// بعد عرض الصفحة (مثلاً بعد set innerHTML)، نادِ هذا الكود:
fetch('almokhalafat.json')
    .then(res => res.json())
    .then((finesData) => {
        const unitNumber = rec["رقم الوحده"];
        const unitFines = finesData.filter(f => String(f["رقم الوحده"]) === String(unitNumber));
        let finesHtml = '';
        if (unitFines.length) {
            finesHtml = `
                <div class="table-responsive mb-4">
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th colspan="5" class="text-center bg-danger text-white">سجل مخالفات وغرامات الوحدة</th>
                            </tr>
                            <tr>
                                <th>نوع المخالفة</th>
                                <th>قيمة الغرامة</th>
                                <th>المدفوع</th>
                                <th>المتبقي</th>
                                <th>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${
                                unitFines.map(f => {
                                    const value = Number(f["قيمة الغرامة"]) || 0;
                                    const paid = Number(f["المدفوع"]) || 0;
                                    const remain = value - paid;
                                    const status = (paid >= value && value > 0)
                                        ? "تم السداد"
                                        : (value > 0 ? "غير مسدد" : "بدون غرامة");
                                    return `
                                        <tr>
                                            <td>${f["نوع المخالفة"] || ""}</td>
                                            <td>${value}</td>
                                            <td>${paid}</td>
                                            <td>${remain > 0 ? remain : 0}</td>
                                            <td>${status}</td>
                                        </tr>
                                    `;
                                }).join("")
                            }
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            finesHtml = `
                <div class="alert alert-success text-center mb-4">
                    لا توجد مخالفات أو غرامات حالية على هذه الوحدة.
                </div>
            `;
        }
        document.getElementById('unitFinesTable').innerHTML = finesHtml;
    })
    .catch(err => {
        document.getElementById('unitFinesTable').innerHTML = `<div class="alert alert-danger">فشل تحميل بيانات الغرامات. تأكد من وجود الملف almokhalafat.json</div>`;
        console.error(err);
    });


// =======================
// نهاية كود جدول غرامات الوحدة أفقي من ملف almokhalafat.json
// =======================


// =======================
// بداية كود جمع كل المبلغ المستحق على الوحدة (جدول إجمالي الالتزامات) - يشمل المساهمات الأخرى
// =======================

// أضف هذا الكود مباشرة قبل return html; في دالة getHomeDetailsHtml
html += `<div id="unitTotalDebtsTable"></div>`;

// بعد عرض الصفحة (بعد set innerHTML)، نادِ هذا الكود:
(function() {
    const unitNumber = rec["رقم الوحده"];
    let totalRemain = 0;
    let tableRows = "";

    // --- 1. الصيانة السنوية (من rec مباشرة)
    const value = Number(rec["قيمة الصيانة السنوية"]) || 0;
    const paid = [
        "شهر يناير (1)", "شهر فبراير (2)", "شهر مارس (3)", "شهر إبريل (4)",
        "شهر مايو (5)", "شهر يونيو (6)", "شهر يوليو (7)", "شهر أغسطس (8)",
        "شهر سبتمبر (9)", "شهر أكتوبر (10)", "شهر نوفمبر (11)", "شهر ديسمبر (12)"
    ].reduce((sum, m) => sum + (Number(rec[m]) || 0), 0);
    const remainMaintenance = Math.max(0, value - paid);
    if (value) {
        tableRows += `<tr>
            <td>رسوم الصيانة السنوية</td>
            <td>${value}</td>
            <td>${paid}</td>
            <td>${remainMaintenance}</td>
        </tr>`;
        totalRemain += remainMaintenance;
    }

    // --- استدعاء بيانات الأنظمة الإضافية من ملفات JSON منفصلة
    // الكاميرات
    const camPromise = fetch('cameras.json').then(res => res.json()).catch(() => []);
    // الخزانات
    const tankPromise = fetch('tanks.json').then(res => res.json()).catch(() => []);
    // المصعد
    const elevatorPromise = fetch('elevator.json').then(res => res.json()).catch(() => []);
    // الغرامات
    const finesPromise = fetch('almokhalafat.json').then(res => res.json()).catch(() => []);
    // المساهمات الأخرى
    const otherPromise = fetch('other.json').then(res => res.json()).catch(() => []);

    // انتظر كل البيانات
    Promise.all([camPromise, tankPromise, elevatorPromise, finesPromise, otherPromise]).then(([camerasData, tanksData, elevatorData, finesData, otherData]) => {
        // --- 2. نظام الكاميرات
        const cam = (camerasData || []).find(c => String(c["رقم الوحده"]) === String(unitNumber));
        if (cam) {
            const camValue = Number(cam["قيمة مساهمة نظام الكاميرات"]) || 0;
            const camPaid = Number(cam["المدفوع لنظام الكاميرات"]) || 0;
            const camRemain = Math.max(0, camValue - camPaid);
            if (camValue) {
                tableRows += `<tr>
                    <td>مساهمة كاميرات المراقبة</td>
                    <td>${camValue}</td>
                    <td>${camPaid}</td>
                    <td>${camRemain}</td>
                </tr>`;
                totalRemain += camRemain;
            }
        }

        // --- 3. خزانات المياه
        const tank = (tanksData || []).find(t => String(t["رقم الوحده"]) === String(unitNumber));
        if (tank) {
            const tankValue = Number(tank["قيمة مساهمة خزانات المياه"]) || 0;
            const tankPaid = Number(tank["المدفوع لخزانات المياه"]) || 0;
            const tankRemain = Math.max(0, tankValue - tankPaid);
            if (tankValue) {
                tableRows += `<tr>
                    <td>مساهمة خزانات المياه</td>
                    <td>${tankValue}</td>
                    <td>${tankPaid}</td>
                    <td>${tankRemain}</td>
                </tr>`;
                totalRemain += tankRemain;
            }
        }

        // --- 4. صيانة المصعد الطارئة
        const elevator = (elevatorData || []).find(e => String(e["رقم الوحده"]) === String(unitNumber));
        if (elevator) {
            const liftValue = Number(elevator["قيمة مساهمة صيانة المصعد الطارئة"]) || 0;
            const liftPaid = Number(elevator["المدفوع لصيانة المصعد الطارئة"]) || 0;
            const liftRemain = Math.max(0, liftValue - liftPaid);
            if (liftValue) {
                tableRows += `<tr>
                    <td>مساهمة صيانة المصعد الطارئة</td>
                    <td>${liftValue}</td>
                    <td>${liftPaid}</td>
                    <td>${liftRemain}</td>
                </tr>`;
                totalRemain += liftRemain;
            }
        }

        // --- 5. الغرامات من ملف JSON
        const unitFines = (finesData || []).filter(f => String(f["رقم الوحده"]) === String(unitNumber));
        let totalFinesRemain = 0;
        unitFines.forEach(f => {
            const fineValue = Number(f["قيمة الغرامة"]) || 0;
            const finePaid = Number(f["المدفوع"]) || 0;
            const fineRemain = Math.max(0, fineValue - finePaid);
            if (fineValue) {
                tableRows += `<tr>
                    <td>غرامة: ${f["نوع المخالفة"] || ""}</td>
                    <td>${fineValue}</td>
                    <td>${finePaid}</td>
                    <td>${fineRemain}</td>
                </tr>`;
                totalFinesRemain += fineRemain;
            }
        });
        totalRemain += totalFinesRemain;

        // --- 6. المساهمات الأخرى من ملف JSON
        const unitOthers = (otherData || []).filter(o => String(o["رقم الوحده"]) === String(unitNumber));
        let totalOtherRemain = 0;
        unitOthers.forEach(o => {
            const otherType = o["نوع المساهمة"] || "";
            const otherValue = Number(o["قيمة المساهمة"]) || 0;
            const otherPaid = Number(o["المدفوع"]) || 0;
            const otherRemain = Math.max(0, otherValue - otherPaid);
            if (otherValue) {
                tableRows += `<tr>
                    <td>${otherType ? `مساهمة أخرى: ${otherType}` : "مساهمة أخرى"}</td>
                    <td>${otherValue}</td>
                    <td>${otherPaid}</td>
                    <td>${otherRemain}</td>
                </tr>`;
                totalOtherRemain += otherRemain;
            }
        });
        totalRemain += totalOtherRemain;

        // بناء الجدول النهائي بعنوان مختصر مع رقم الوحدة
        let htmlTable = `
            <div class="table-responsive mb-4">
                <table class="table table-bordered text-center">
                    <thead>
                        <tr>
                            <th colspan="4" class="bg-warning text-dark text-center">
                                ملخص المستحقات للوحدة رقم ${unitNumber}
                            </th>
                        </tr>
                        <tr>
                            <th>البند</th>
                            <th>المطلوب</th>
                            <th>المدفوع</th>
                            <th>المتبقي</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                        <tr class="bg-dark text-white font-weight-bold">
                            <td colspan="3">الإجمالي المتبقي على الوحدة</td>
                            <td>${totalRemain}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
        document.getElementById('unitTotalDebtsTable').innerHTML = htmlTable;
    }).catch(err => {
        document.getElementById('unitTotalDebtsTable').innerHTML = `<div class="alert alert-danger">فشل تحميل بيانات المستحقات. تأكد من وجود جميع الملفات المطلوبة</div>`;
        console.error(err);
    });
})();

// =======================
// نهاية كود جمع كل المبلغ المستحق على الوحدة (جدول إجمالي الالتزامات)
// =======================


    return html;
}
// =======================
// نهاية كود تفاصيل الوحدة الرئيسية
// =======================


