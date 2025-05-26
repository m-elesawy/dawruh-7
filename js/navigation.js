// main.js
// بدء تشغيل التطبيق تلقائيًا بعد تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  loadResidentsData();
});




// ui.js
// عرض واجهة تسجيل الدخول
function showLogin() {
  document.getElementById('loginBox').style.display = '';
  document.getElementById('logoutBtn').classList.add('d-none');
  document.getElementById('welcomeMsg').innerHTML = '';
  document.getElementById('pageContent').innerHTML = '';
}

// ما بعد تسجيل الدخول
function afterLogin() {
  document.getElementById('loginBox').style.display = 'none';
  document.getElementById('logoutBtn').classList.remove('d-none');
  document.getElementById('welcomeMsg').innerHTML = `مرحباً ${currentUser["اسم المالك"]}`;
  renderSidebarGrid();
  showPage('home');
}

// رسم القوائم الجانبية
function renderSidebarGrid() {
  const grid = document.getElementById('sidebarGrid');
  grid.innerHTML = '';
  sidebarMenus.forEach(menu => {
    const colDiv = document.createElement('div');
    colDiv.className = 'col-6 col-md-4 col-lg-3';
    colDiv.innerHTML = `
      <button class="sidebar-btn shadow-sm" onclick="navigate('${menu.key}',event)" data-bs-dismiss="offcanvas">
        <span class="icon-circle mb-2">
          <img src="${menu.img}" class="sidebar-icon" alt="${menu.label}">
        </span>
        <div class="sidebar-label">${menu.label}</div>
      </button>
    `;
    grid.appendChild(colDiv);
  });
}




// data.js
// تحميل بيانات السكان من ملف JSON
function loadResidentsData() {
	fetch(`seyanah.json?v=${new Date().getTime()}`)
    .then(res => res.json())
    .then(data => {
      residentsData = data;
      autoLoginCheck();
    })
    .catch(err => {
      alert('فشل تحميل بيانات السكان. تأكد من وجود الملف seyanah.json');
      console.error(err);
    });
}


 






// config.js
// يحتوي على القوائم الجانبية واسم الصفحة الحالية
const sidebarMenus = [
  { key: 'home', label: 'الرئيسية', img: 'icons/home.png' },
  { key: 'repair', label: 'الصيانة السنوية', img: 'icons/repair.png' },
  { key: 'expenses', label: 'المصروفات', img: 'icons/expenses.png' },
  { key: 'violations', label: 'المخالفات', img: 'icons/violations.png' },
    { key: 'summary', label: 'الكاميرات', img: 'icons/camera.png' },
    { key: 'owner', label: 'owner', img: 'icons/camera.png' },

  { key: 'other', label: 'مساهمات اخري', img: 'icons/other.png' }
];

let residentsData = [];
let currentUser = null;
let currentPage = 'home';













// =======================
// بداية كود التنقل بين الصفحات
// =======================
function navigate(page, e) {
    e.preventDefault();
    if (!currentUser) return logout();
    showPage(page);
}
// =======================
// نهاية كود التنقل بين الصفحات
// =======================




// =======================
// بداية كود عرض الصفحة المختارة
// =======================
function showPage(page) {
    currentPage = page;
    let sidebar = bootstrap.Offcanvas.getOrCreateInstance(document.getElementById('sidebarOffcanvas'));
    sidebar.hide();

    let html = "";
    // Home page handling (existing code)
    if (page === 'home') {
        html = getHomePageHtml();
        document.getElementById('pageContent').innerHTML = html;
        activateHomePrintButton();
    }
	
	
	
	else if (page === 'violations') {
    loadViolationsData(function() {
        document.getElementById('pageContent').innerHTML = getViolationsPageHtml();
        activateViolationsPrintButtons();
    });
	}
	

	// عند اختيار صفحة الصيانة السنوية:
// In your existing page switching code
else if (page === 'owner') {
    html = getOwnerPageHtml();
    document.getElementById('pageContent').innerHTML = html;
    activateOwnerPrintButton();
    
    // Load dynamic data components after setting the HTML
    loadOwnerContributionsData();
    loadOwnerFinesData();
    loadTotalObligationsData();
}
	

	// عند اختيار صفحة الصيانة السنوية:
	else if (page === 'repair') {
    loadRepairData(function() {
        document.getElementById('pageContent').innerHTML = getRepairPageHtml();
        activateRepairPrintButtons();
    });
	}
	
	else if (page === 'expenses') {
    loadMasrufatData(function() {
        document.getElementById('pageContent').innerHTML = getMasrufatPageHtml();
        activateMasrufatPrintButton();
    });
	}
	
	// ===============
	// استدعاء صفحة المساهمات الأخرى من other.json مباشرة
	// ===============
	else if (page === 'other') {
		loadOtherData(function() {
			document.getElementById('pageContent').innerHTML = getOtherPageHtml();
			activateOtherPrintButtons();
		});
	}
	
// ===============
    // استدعاء صفحة الصندوق (تقرير إجمالي الإيرادات والمصروفات)
    // ===============
else if (page === 'summary') {
    loadAllFinancialData(function() {
        document.getElementById('pageContent').innerHTML = getFinancialSummaryHtml();
        activateFinancialSummaryPrintButton();
    });
}
	
	
	

}
// =======================
// نهاية كود عرض الصفحة المختارة
// =======================





