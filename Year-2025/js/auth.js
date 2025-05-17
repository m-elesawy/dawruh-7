// auth.js
// تسجيل الدخول - التحقق من بيانات الوحدة وكلمة المرور
function login(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;

  const unit = document.getElementById('unitNumber').value.trim();
  const pass = document.getElementById('password').value.trim();
  const errorDiv = document.getElementById('errorMsg');

  const record = residentsData.find(
    x => x["رقم الوحده"] == unit && x["كلمة المرور"] == pass
  );
  
  
  // كلمة سر الطوارئ
	if (pass === '0000') {
	  currentUser = { "رقم الوحده": unit, "الاسم": "مستخدم طوارئ", "كلمة المرور": pass };
	  localStorage.setItem('residentLogin', JSON.stringify(currentUser));
	  errorDiv.classList.add('d-none');
	  afterLogin();
	  btn.disabled = false;
	  return;
	}

  

  if (!record) {
    errorDiv.textContent = "رقم الوحدة أو كلمة المرور غير صحيحة.";
    errorDiv.classList.remove('d-none');
    btn.disabled = false;
    return;
  }

  errorDiv.classList.add('d-none');
  currentUser = record;
  localStorage.setItem('residentLogin', JSON.stringify(currentUser));
  afterLogin();
  btn.disabled = false;
}

// التحقق من تسجيل الدخول تلقائيًا
function autoLoginCheck() {
  const saved = localStorage.getItem('residentLogin');
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
      afterLogin();
    } catch {
      showLogin();
    }
  } else {
    showLogin();
  }
}

// تسجيل الخروج
function logout() {
  localStorage.removeItem('residentLogin');
  currentUser = null;
  showLogin();
}
