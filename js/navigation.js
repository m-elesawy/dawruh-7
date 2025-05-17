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
    if (page === 'home') {
        html = getHomePageHtml();
        document.getElementById('pageContent').innerHTML = html;
        activateHomePrintButton();

    } else if (page === 'violations') {
    loadViolationsData(function() {
        document.getElementById('pageContent').innerHTML = getViolationsPageHtml();
        activateViolationsPrintButtons();
    });
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
	// استدعاء صفحة المصعد من elevator.json مباشرة
	// ===============
	else if (page === 'elevator') {
		loadElevatorData(function() {
			document.getElementById('pageContent').innerHTML = getElevatorPageHtml();
			activateElevatorPrintButtons();
		});
	}
	
	
	// ===============
	// استدعاء صفحة الكاميرات المباشرة من cameras.json
	// ===============
	else if (page === 'cameras') {
		loadCamerasData(function() {
			document.getElementById('pageContent').innerHTML = getCamerasPageHtml();
			activateCamerasPrintButtons();
		});
	}

	// ===============
	// استدعاء صفحة الخزانات من tanks.json مباشرة
	// ===============
	else if (page === 'tanks') {
		loadTanksData(function() {
			document.getElementById('pageContent').innerHTML = getTanksPageHtml();
			activateTanksPrintButtons();
		});
	}



}
// =======================
// نهاية كود عرض الصفحة المختارة
// =======================





