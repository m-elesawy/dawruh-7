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
