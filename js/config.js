// config.js
// يحتوي على القوائم الجانبية واسم الصفحة الحالية
const sidebarMenus = [
  { key: 'home', label: 'الرئيسية', img: 'icons/home.png' },
  { key: 'tanks', label: 'الخزانات', img: 'icons/tank.png' },
  { key: 'cameras', label: 'الكاميرات', img: 'icons/camera.png' },
  { key: 'elevator', label: 'المصعد', img: 'icons/elevator.png' },
  { key: 'repair', label: 'الصيانة السنوية', img: 'icons/repair.png' },
  { key: 'expenses', label: 'المصروفات', img: 'icons/expenses.png' },
  { key: 'violations', label: 'المخالفات', img: 'icons/violations.png' },
  { key: 'other', label: 'مساهمات اخري', img: 'icons/other.png' }
];

let residentsData = [];
let currentUser = null;
let currentPage = 'home';
